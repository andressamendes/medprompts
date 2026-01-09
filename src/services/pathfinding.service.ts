import PF from 'pathfinding';
import { Position } from '../types/movement.types';
import { CollisionDetector } from './collision.service';

/**
 * Serviço de pathfinding usando algoritmo A*
 */
export class Pathfinder {
  private finder: PF.AStarFinder;
  private collisionDetector: CollisionDetector;

  constructor(collisionDetector: CollisionDetector) {
    this.collisionDetector = collisionDetector;

    // Configurar A* finder
    // allowDiagonal: permite movimento diagonal
    // dontCrossCorners: evita cortar cantos
    this.finder = new PF.AStarFinder({
      allowDiagonal: true,
      dontCrossCorners: true
    });
  }

  /**
   * Encontra o caminho entre duas posições usando A*
   */
  findPath(startX: number, startY: number, endX: number, endY: number): Position[] | null {
    // Obter grid de colisões
    const gridData = this.collisionDetector.getCollisionGridCopy();

    // Criar novo grid para cada busca (pathfinding library modifica o grid)
    const grid = new PF.Grid(gridData);

    // Verificar se posições são válidas
    if (!this.collisionDetector.isWalkable(startX, startY)) {
      console.warn('Start position is not walkable:', startX, startY);
      return null;
    }

    if (!this.collisionDetector.isWalkable(endX, endY)) {
      // Tentar encontrar posição caminhável próxima
      const nearestPos = this.collisionDetector.findNearestWalkablePosition(endX, endY);
      if (nearestPos) {
        endX = nearestPos.x;
        endY = nearestPos.y;
      } else {
        console.warn('End position is not walkable and no nearby position found');
        return null;
      }
    }

    // Executar A*
    const path = this.finder.findPath(startX, startY, endX, endY, grid);

    // Converter para array de Position
    if (path.length === 0) {
      return null;
    }

    const positions: Position[] = path.map(([x, y]) => ({ x, y }));

    // Suavizar caminho
    return this.smoothPath(positions);
  }

  /**
   * Suaviza o caminho removendo waypoints desnecessários
   * Usa line-of-sight para pular pontos intermediários quando possível
   */
  smoothPath(path: Position[]): Position[] {
    if (path.length <= 2) {
      return path;
    }

    const smoothed: Position[] = [path[0]];
    let currentIndex = 0;

    while (currentIndex < path.length - 1) {
      let farthestVisible = currentIndex + 1;

      // Encontrar o ponto mais distante visível do ponto atual
      for (let i = currentIndex + 2; i < path.length; i++) {
        if (this.hasLineOfSight(path[currentIndex], path[i])) {
          farthestVisible = i;
        } else {
          break;
        }
      }

      smoothed.push(path[farthestVisible]);
      currentIndex = farthestVisible;
    }

    return smoothed;
  }

  /**
   * Verifica se há linha de visão direta entre dois pontos
   * Usa algoritmo de Bresenham
   */
  private hasLineOfSight(from: Position, to: Position): boolean {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const sx = from.x < to.x ? 1 : -1;
    const sy = from.y < to.y ? 1 : -1;

    let err = dx - dy;
    let x = from.x;
    let y = from.y;

    while (true) {
      // Verificar se posição atual é caminhável
      if (!this.collisionDetector.isWalkable(x, y)) {
        return false;
      }

      // Chegou ao destino
      if (x === to.x && y === to.y) {
        break;
      }

      const e2 = 2 * err;

      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }

      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }

    return true;
  }

  /**
   * Calcula a distância Manhattan entre dois pontos
   */
  getManhattanDistance(from: Position, to: Position): number {
    return Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
  }

  /**
   * Calcula a distância Euclidiana entre dois pontos
   */
  getEuclideanDistance(from: Position, to: Position): number {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Verifica se duas posições são adjacentes (incluindo diagonal)
   */
  areAdjacent(pos1: Position, pos2: Position): boolean {
    const dx = Math.abs(pos1.x - pos2.x);
    const dy = Math.abs(pos1.y - pos2.y);
    return dx <= 1 && dy <= 1 && (dx + dy) > 0;
  }

  /**
   * Obtém o próximo passo em direção a um alvo (sem pathfinding completo)
   * Útil para movimentos simples e rápidos
   */
  getNextStep(from: Position, to: Position): Position | null {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    // Normalizar direção
    const stepX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
    const stepY = dy === 0 ? 0 : dy > 0 ? 1 : -1;

    const nextPos: Position = {
      x: from.x + stepX,
      y: from.y + stepY
    };

    // Verificar se pode mover diretamente
    if (this.collisionDetector.canMoveTo(from.x, from.y, nextPos.x, nextPos.y)) {
      return nextPos;
    }

    // Tentar movimento apenas horizontal
    if (stepX !== 0) {
      const horizontalPos: Position = { x: from.x + stepX, y: from.y };
      if (this.collisionDetector.canMoveTo(from.x, from.y, horizontalPos.x, horizontalPos.y)) {
        return horizontalPos;
      }
    }

    // Tentar movimento apenas vertical
    if (stepY !== 0) {
      const verticalPos: Position = { x: from.x, y: from.y + stepY };
      if (this.collisionDetector.canMoveTo(from.x, from.y, verticalPos.x, verticalPos.y)) {
        return verticalPos;
      }
    }

    // Não há movimento direto possível, precisa de pathfinding completo
    return null;
  }

  /**
   * Atualiza o collision detector
   */
  updateCollisionDetector(collisionDetector: CollisionDetector): void {
    this.collisionDetector = collisionDetector;
  }
}

import { HospitalMap, Furniture } from '../types/tile.types';
import { Position } from '../types/movement.types';

/**
 * Serviço de detecção de colisões para o hospital
 */
export class CollisionDetector {
  private collisionGrid: boolean[][] = [];
  private map: HospitalMap;

  constructor(map: HospitalMap) {
    this.map = map;
    this.generateCollisionGrid();
  }

  /**
   * Gera a matriz de colisões baseada no mapa
   */
  private generateCollisionGrid(): void {
    this.collisionGrid = [];

    // Inicializar com walkability dos tiles
    for (let y = 0; y < this.map.height; y++) {
      this.collisionGrid[y] = [];
      for (let x = 0; x < this.map.width; x++) {
        this.collisionGrid[y][x] = this.map.tiles[y][x].isWalkable;
      }
    }

    // Marcar áreas ocupadas por móveis como não caminháveis
    this.map.furniture.forEach(furniture => {
      this.markFurnitureCollision(furniture);
    });
  }

  /**
   * Marca os tiles ocupados por um móvel como não caminháveis
   */
  private markFurnitureCollision(furniture: Furniture): void {
    for (let y = furniture.y; y < furniture.y + furniture.height; y++) {
      for (let x = furniture.x; x < furniture.x + furniture.width; x++) {
        if (y >= 0 && y < this.map.height && x >= 0 && x < this.map.width) {
          this.collisionGrid[y][x] = false;
        }
      }
    }
  }

  /**
   * Verifica se um tile específico é caminhável
   */
  isWalkable(x: number, y: number): boolean {
    // Verificar limites do mapa
    if (x < 0 || x >= this.map.width || y < 0 || y >= this.map.height) {
      return false;
    }

    return this.collisionGrid[y][x];
  }

  /**
   * Verifica colisão com móveis em uma posição
   */
  checkFurnitureCollision(x: number, y: number): Furniture | null {
    for (const furniture of this.map.furniture) {
      if (
        x >= furniture.x &&
        x < furniture.x + furniture.width &&
        y >= furniture.y &&
        y < furniture.y + furniture.height
      ) {
        return furniture;
      }
    }
    return null;
  }

  /**
   * Verifica se pode mover de uma posição para outra
   */
  canMoveTo(fromX: number, fromY: number, toX: number, toY: number): boolean {
    // Verificar se destino é válido
    if (!this.isWalkable(toX, toY)) {
      return false;
    }

    // Verificar movimento diagonal
    if (fromX !== toX && fromY !== toY) {
      // Para movimento diagonal, verificar se os tiles adjacentes também são caminháveis
      // Isso evita "cortar cantos"
      const horizontalWalkable = this.isWalkable(toX, fromY);
      const verticalWalkable = this.isWalkable(fromX, toY);

      // Precisa de pelo menos um caminho livre
      if (!horizontalWalkable && !verticalWalkable) {
        return false;
      }
    }

    return true;
  }

  /**
   * Retorna a matriz de colisões para uso no pathfinding
   */
  getCollisionGrid(): boolean[][] {
    return this.collisionGrid;
  }

  /**
   * Retorna uma cópia do grid de colisões (para pathfinding)
   */
  getCollisionGridCopy(): number[][] {
    // Pathfinding library usa 0 para caminhável, 1 para bloqueado
    return this.collisionGrid.map(row =>
      row.map(walkable => walkable ? 0 : 1)
    );
  }

  /**
   * Verifica se uma posição está próxima de um móvel interativo
   */
  getNearbyInteractiveFurniture(x: number, y: number, range: number = 1): Furniture | null {
    for (const furniture of this.map.furniture) {
      if (!furniture.isInteractive) continue;

      // Calcular distância ao móvel
      const minX = furniture.x - range;
      const maxX = furniture.x + furniture.width + range;
      const minY = furniture.y - range;
      const maxY = furniture.y + furniture.height + range;

      if (x >= minX && x < maxX && y >= minY && y < maxY) {
        return furniture;
      }
    }
    return null;
  }

  /**
   * Encontra a posição mais próxima caminhável perto de um móvel
   */
  findNearestWalkablePosition(targetX: number, targetY: number): Position | null {
    const maxSearchRadius = 5;

    // Buscar em espiral ao redor do target
    for (let radius = 1; radius <= maxSearchRadius; radius++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          // Apenas checar a borda do quadrado atual
          if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) {
            continue;
          }

          const checkX = targetX + dx;
          const checkY = targetY + dy;

          if (this.isWalkable(checkX, checkY)) {
            return { x: checkX, y: checkY };
          }
        }
      }
    }

    return null;
  }

  /**
   * Atualiza o mapa e regenera o grid de colisões
   */
  updateMap(map: HospitalMap): void {
    this.map = map;
    this.generateCollisionGrid();
  }

  /**
   * Marca temporariamente uma posição como ocupada (para outros jogadores)
   */
  markOccupied(x: number, y: number): void {
    if (x >= 0 && x < this.map.width && y >= 0 && y < this.map.height) {
      this.collisionGrid[y][x] = false;
    }
  }

  /**
   * Libera uma posição previamente marcada como ocupada
   */
  clearOccupied(x: number, y: number): void {
    if (x >= 0 && x < this.map.width && y >= 0 && y < this.map.height) {
      // Verificar se o tile original era caminhável
      if (this.map.tiles[y][x].isWalkable) {
        // Verificar se não há móvel nesta posição
        if (!this.checkFurnitureCollision(x, y)) {
          this.collisionGrid[y][x] = true;
        }
      }
    }
  }

  /**
   * Obtém todas as posições válidas de spawn (caminháveis e sem móveis)
   */
  getValidSpawnPositions(): Position[] {
    const positions: Position[] = [];

    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        if (this.isWalkable(x, y)) {
          positions.push({ x, y });
        }
      }
    }

    return positions;
  }

  /**
   * Encontra uma posição de spawn aleatória válida
   */
  getRandomSpawnPosition(): Position | null {
    const validPositions = this.getValidSpawnPositions();

    if (validPositions.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * validPositions.length);
    return validPositions[randomIndex];
  }
}

import { User } from '../types/studyRoom.types';
import { Position, Direction, MovementCommand } from '../types/movement.types';
import { HospitalMap } from '../types/tile.types';
import { CollisionDetector } from './collision.service';

/**
 * Controlador de movimento simplificado para avatares (sem pathfinding)
 */
export class MovementController {
  private collisionDetector: CollisionDetector;
  private map: HospitalMap;

  // Configurações de movimento
  private readonly MOVE_SPEED = 3; // tiles por segundo
  private readonly TILE_SIZE = 16;

  constructor(map: HospitalMap, collisionDetector: CollisionDetector) {
    this.map = map;
    this.collisionDetector = collisionDetector;
  }

  /**
   * Lida com clique no canvas para movimento
   */
  handleClick(canvasX: number, canvasY: number, user: User, scale: number = 2): MovementCommand | null {
    // Converter coordenadas do canvas para coordenadas tile
    const tileX = Math.floor(canvasX / (this.TILE_SIZE * scale));
    const tileY = Math.floor(canvasY / (this.TILE_SIZE * scale));

    // Verificar se clicou em si mesmo
    if (tileX === Math.floor(user.position.x) && tileY === Math.floor(user.position.y)) {
      return null;
    }

    // Verificar se clicou em móvel interativo
    const furniture = this.collisionDetector.getNearbyInteractiveFurniture(tileX, tileY, 0);
    if (furniture && furniture.isInteractive) {
      // Encontrar posição próxima ao móvel para interagir
      const nearestPos = this.collisionDetector.findNearestWalkablePosition(tileX, tileY);
      if (nearestPos) {
        return {
          type: 'interact',
          targetPosition: nearestPos,
          targetId: furniture.id,
          timestamp: Date.now()
        };
      }
    }

    // Movimento normal
    return {
      type: 'move',
      targetPosition: { x: tileX, y: tileY },
      timestamp: Date.now()
    };
  }

  /**
   * Lida com entrada de teclado (WASD ou setas)
   */
  handleKeyboard(key: string, user: User): MovementCommand | null {
    let targetX = Math.floor(user.position.x);
    let targetY = Math.floor(user.position.y);

    switch (key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        targetY -= 1;
        break;
      case 's':
      case 'arrowdown':
        targetY += 1;
        break;
      case 'a':
      case 'arrowleft':
        targetX -= 1;
        break;
      case 'd':
      case 'arrowright':
        targetX += 1;
        break;
      default:
        return null;
    }

    // Verificar se pode mover
    if (!this.collisionDetector.isWalkable(targetX, targetY)) {
      return null;
    }

    return {
      type: 'move',
      targetPosition: { x: targetX, y: targetY },
      timestamp: Date.now()
    };
  }

  /**
   * Processa comando de movimento (versão simplificada sem pathfinding)
   */
  processMovementCommand(command: MovementCommand, user: User): void {
    if (!command.targetPosition) return;

    // Movimento direto sem pathfinding complexo
    // Apenas define a posição alvo
    user.targetPosition = command.targetPosition;
    user.movementState = 'walking';

    // Se é comando de interação, guardar ID do móvel
    if (command.type === 'interact' && command.targetId) {
      user.interactingWith = command.targetId;
    } else {
      user.interactingWith = undefined;
    }
  }

  /**
   * Atualiza a posição do usuário em direção ao alvo
   */
  updatePosition(user: User, deltaTime: number): void {
    // Se não está se movendo, não faz nada
    if (user.movementState !== 'walking' || !user.targetPosition) {
      if (user.movementState === 'walking') {
        user.movementState = 'idle';
      }
      return;
    }

    const targetX = user.targetPosition.x;
    const targetY = user.targetPosition.y;
    const distanceToMove = (this.MOVE_SPEED * deltaTime) / 1000; // tiles por frame

    // Calcular direção
    const dx = targetX - user.position.x;
    const dy = targetY - user.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Atualizar direção do sprite
    user.direction = this.calculateDirection(user.position, user.targetPosition);

    if (distance <= distanceToMove) {
      // Chegou ao destino
      user.position.x = targetX;
      user.position.y = targetY;
      user.movementState = 'idle';
      user.targetPosition = undefined;

      // Se estava indo interagir com algo
      if (user.interactingWith) {
        this.handleInteraction(user);
      }
    } else {
      // Move em direção ao destino
      const ratio = distanceToMove / distance;
      user.position.x += dx * ratio;
      user.position.y += dy * ratio;
    }
  }

  /**
   * Calcula a direção baseada no movimento
   */
  calculateDirection(from: Position, to: Position): Direction {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    // Priorizar direção com maior movimento
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  }

  /**
   * Lida com interação com móveis
   */
  private handleInteraction(user: User): void {
    if (!user.interactingWith) return;

    const furniture = this.map.furniture.find(f => f.id === user.interactingWith);
    if (!furniture) return;

    // Virar para o móvel
    const dx = furniture.x + furniture.width / 2 - user.position.x;
    const dy = furniture.y + furniture.height / 2 - user.position.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      user.direction = dx > 0 ? 'right' : 'left';
    } else {
      user.direction = dy > 0 ? 'down' : 'up';
    }

    // Executar ação baseada no tipo de interação
    switch (furniture.interactionType) {
      case 'sit':
        user.movementState = 'sitting';
        break;
      case 'sleep':
        user.movementState = 'lying';
        break;
      case 'use':
      case 'examine':
      case 'open':
        user.movementState = 'using';
        // Voltar ao idle depois de um tempo
        setTimeout(() => {
          if (user.interactingWith === furniture.id) {
            user.movementState = 'idle';
            user.interactingWith = undefined;
          }
        }, 2000);
        break;
    }
  }

  /**
   * Para o movimento do usuário
   */
  stopMovement(user: User): void {
    user.targetPosition = undefined;
    user.movementState = 'idle';
  }

  /**
   * Teleporta o usuário para uma posição
   */
  teleport(user: User, x: number, y: number): boolean {
    if (!this.collisionDetector.isWalkable(x, y)) {
      return false;
    }

    this.stopMovement(user);
    user.position.x = x;
    user.position.y = y;
    return true;
  }

  /**
   * Encontra posição válida mais próxima
   */
  findValidPosition(x: number, y: number): Position | null {
    if (this.collisionDetector.isWalkable(x, y)) {
      return { x, y };
    }

    return this.collisionDetector.findNearestWalkablePosition(x, y);
  }

  /**
   * Atualiza o mapa
   */
  updateMap(map: HospitalMap): void {
    this.map = map;
  }

  /**
   * Verifica se usuário está próximo a outro usuário
   */
  isNearUser(user1: User, user2: User, maxDistance: number = 2): boolean {
    const dx = user1.position.x - user2.position.x;
    const dy = user1.position.y - user2.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= maxDistance;
  }

  /**
   * Move usuário automaticamente para uma posição aleatória
   */
  moveToRandomPosition(user: User): void {
    const randomPos = this.collisionDetector.getRandomSpawnPosition();
    if (randomPos) {
      const command: MovementCommand = {
        type: 'move',
        targetPosition: randomPos,
        timestamp: Date.now()
      };
      this.processMovementCommand(command, user);
    }
  }

  /**
   * Obtem velocidade de movimento atual
   */
  getMoveSpeed(): number {
    return this.MOVE_SPEED;
  }

  /**
   * Define velocidade de movimento
   */
  setMoveSpeed(speed: number): void {
    if (speed > 0 && speed <= 10) {
      (this as any).MOVE_SPEED = speed;
    }
  }

  /**
   * Calcula distância euclidiana entre duas posições
   */
  getEuclideanDistance(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
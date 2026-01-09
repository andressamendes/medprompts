import { User, UserStatus } from '../types/studyRoom.types';
import { Position } from '../types/movement.types';
import { HospitalMap, Furniture, FurnitureType } from '../types/tile.types';

export interface InteractionResult {
  success: boolean;
  message?: string;
  newPosition?: Position;
  newState?: string;
}

export interface InteractionSuggestion {
  furniture: Furniture;
  reason: string;
  priority: number;
}

/**
 * Sistema de interações com móveis e objetos do hospital
 */
export class InteractionSystem {
  private map: HospitalMap;

  constructor(map: HospitalMap) {
    this.map = map;
  }

  /**
   * Obtém móveis interativos próximos a uma posição
   */
  getInteractablesNearby(x: number, y: number, range: number = 2): Furniture[] {
    return this.map.furniture.filter(furniture => {
      if (!furniture.isInteractive) return false;

      // Calcular distância ao móvel (considerar centro)
      const centerX = furniture.x + furniture.width / 2;
      const centerY = furniture.y + furniture.height / 2;
      const distance = Math.sqrt(
        Math.pow(centerX - x, 2) + Math.pow(centerY - y, 2)
      );

      return distance <= range;
    });
  }

  /**
   * Executa interação com um móvel
   */
  interact(user: User, furniture: Furniture): InteractionResult {
    if (!furniture.isInteractive) {
      return {
        success: false,
        message: 'Este objeto não é interativo'
      };
    }

    // Verificar se móvel já está ocupado
    if (furniture.occupiedBy && furniture.occupiedBy !== user.id) {
      return {
        success: false,
        message: 'Este móvel já está sendo usado'
      };
    }

    // Executar interação baseada no tipo
    switch (furniture.interactionType) {
      case 'sit':
        return this.interactSit(user, furniture);
      case 'sleep':
        return this.interactSleep(user, furniture);
      case 'use':
        return this.interactUse(user, furniture);
      case 'examine':
        return this.interactExamine(user, furniture);
      case 'open':
        return this.interactOpen(user, furniture);
      default:
        return {
          success: false,
          message: 'Tipo de interação desconhecido'
        };
    }
  }

  /**
   * Interação: Sentar
   */
  private interactSit(user: User, furniture: Furniture): InteractionResult {
    // Posicionar usuário no centro da cadeira
    const newPosition: Position = {
      x: furniture.x + furniture.width / 2,
      y: furniture.y + furniture.height / 2
    };

    user.position = newPosition;
    user.movementState = 'sitting';
    user.interactingWith = furniture.id;
    furniture.occupiedBy = user.id;

    return {
      success: true,
      message: '💺 Sentou-se confortavelmente',
      newPosition,
      newState: 'sitting'
    };
  }

  /**
   * Interação: Deitar (dormir/descansar)
   */
  private interactSleep(user: User, furniture: Furniture): InteractionResult {
    // Posicionar usuário no centro da maca/cama
    const newPosition: Position = {
      x: furniture.x + furniture.width / 2,
      y: furniture.y + furniture.height / 2
    };

    user.position = newPosition;
    user.movementState = 'lying';
    user.interactingWith = furniture.id;
    furniture.occupiedBy = user.id;

    return {
      success: true,
      message: '🛏️ Deitou-se para descansar',
      newPosition,
      newState: 'lying'
    };
  }

  /**
   * Interação: Usar (computador, equipamento, etc)
   */
  private interactUse(user: User, furniture: Furniture): InteractionResult {
    user.movementState = 'using';
    user.interactingWith = furniture.id;
    furniture.occupiedBy = user.id;

    // Mensagem baseada no tipo de móvel
    let message = '🖥️ Usando o equipamento';
    if (furniture.type === 'computer') {
      message = '💻 Usando o computador';
    } else if (furniture.type === 'desk') {
      message = '📝 Estudando na mesa';
    } else if (furniture.type === 'counter') {
      message = '🏥 Atendendo no balcão';
    }

    // Liberar após um tempo
    setTimeout(() => {
      if (user.interactingWith === furniture.id) {
        this.stopInteraction(user, furniture);
      }
    }, 3000);

    return {
      success: true,
      message,
      newState: 'using'
    };
  }

  /**
   * Interação: Examinar
   */
  private interactExamine(user: User, furniture: Furniture): InteractionResult {
    user.movementState = 'using';
    user.interactingWith = furniture.id;

    let message = '🔍 Examinando...';
    if (furniture.type === 'equipment') {
      message = '🏥 Verificando equipamento médico';
    } else if (furniture.type === 'bed') {
      message = '🛏️ Verificando leito';
    }

    // Liberar após um tempo
    setTimeout(() => {
      if (user.interactingWith === furniture.id) {
        this.stopInteraction(user, furniture);
      }
    }, 2000);

    return {
      success: true,
      message,
      newState: 'using'
    };
  }

  /**
   * Interação: Abrir (armário, gaveta)
   */
  private interactOpen(user: User, furniture: Furniture): InteractionResult {
    user.movementState = 'using';
    user.interactingWith = furniture.id;

    const message = '🗄️ Abrindo ' + (furniture.type === 'cabinet' ? 'armário' : 'móvel');

    // Liberar após um tempo
    setTimeout(() => {
      if (user.interactingWith === furniture.id) {
        this.stopInteraction(user, furniture);
      }
    }, 2000);

    return {
      success: true,
      message,
      newState: 'using'
    };
  }

  /**
   * Para a interação atual do usuário
   */
  stopInteraction(user: User, furniture?: Furniture): void {
    if (user.interactingWith) {
      // Liberar móvel
      const furnitureObj = furniture || this.map.furniture.find(f => f.id === user.interactingWith);
      if (furnitureObj && furnitureObj.occupiedBy === user.id) {
        furnitureObj.occupiedBy = undefined;
      }
    }

    user.interactingWith = undefined;
    user.movementState = 'idle';
  }

  /**
   * Sugere móveis baseado no status Pomodoro
   */
  getSuggestionsForStatus(status: UserStatus, userPosition: Position): InteractionSuggestion[] {
    const suggestions: InteractionSuggestion[] = [];

    switch (status) {
      case 'FOCUS':
        // Sugerir computadores e mesas
        this.map.furniture
          .filter(f => (f.type === 'computer' || f.type === 'desk') && !f.occupiedBy)
          .forEach(furniture => {
            const distance = this.calculateDistance(userPosition, {
              x: furniture.x + furniture.width / 2,
              y: furniture.y + furniture.height / 2
            });

            suggestions.push({
              furniture,
              reason: furniture.type === 'computer'
                ? '💻 Computador disponível para estudo focado'
                : '📝 Mesa disponível para estudar',
              priority: 10 - distance
            });
          });
        break;

      case 'SHORT_BREAK':
        // Sugerir cadeiras
        this.map.furniture
          .filter(f => f.type === 'chair' && !f.occupiedBy)
          .forEach(furniture => {
            const distance = this.calculateDistance(userPosition, {
              x: furniture.x + furniture.width / 2,
              y: furniture.y + furniture.height / 2
            });

            suggestions.push({
              furniture,
              reason: '💺 Cadeira disponível para relaxar',
              priority: 10 - distance
            });
          });
        break;

      case 'LONG_BREAK':
        // Sugerir macas
        this.map.furniture
          .filter(f => f.type === 'bed' && !f.occupiedBy)
          .forEach(furniture => {
            const distance = this.calculateDistance(userPosition, {
              x: furniture.x + furniture.width / 2,
              y: furniture.y + furniture.height / 2
            });

            suggestions.push({
              furniture,
              reason: '🛏️ Leito disponível para descanso profundo',
              priority: 10 - distance
            });
          });
        break;

      case 'OFFLINE':
        // Sem sugestões
        break;
    }

    // Ordenar por prioridade (maior primeiro)
    return suggestions.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Calcula distância entre duas posições
   */
  private calculateDistance(pos1: Position, pos2: Position): number {
    return Math.sqrt(
      Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2)
    );
  }

  /**
   * Obtém móvel por ID
   */
  getFurnitureById(id: string): Furniture | undefined {
    return this.map.furniture.find(f => f.id === id);
  }

  /**
   * Verifica se um móvel está ocupado
   */
  isFurnitureOccupied(furnitureId: string): boolean {
    const furniture = this.getFurnitureById(furnitureId);
    return furniture ? !!furniture.occupiedBy : false;
  }

  /**
   * Libera todos os móveis ocupados por um usuário
   */
  releaseAllUserFurniture(userId: string): void {
    this.map.furniture.forEach(furniture => {
      if (furniture.occupiedBy === userId) {
        furniture.occupiedBy = undefined;
      }
    });
  }

  /**
   * Obtém estatísticas de uso dos móveis
   */
  getFurnitureStats(): Record<FurnitureType, { total: number; occupied: number }> {
    const stats: Record<string, { total: number; occupied: number }> = {};

    this.map.furniture.forEach(furniture => {
      if (!stats[furniture.type]) {
        stats[furniture.type] = { total: 0, occupied: 0 };
      }

      stats[furniture.type].total++;
      if (furniture.occupiedBy) {
        stats[furniture.type].occupied++;
      }
    });

    return stats as Record<FurnitureType, { total: number; occupied: number }>;
  }

  /**
   * Atualiza o mapa
   */
  updateMap(map: HospitalMap): void {
    this.map = map;
  }

  /**
   * Obtém mensagem amigável para tipo de móvel
   */
  getFurnitureName(furniture: Furniture): string {
    const names: Record<FurnitureType, string> = {
      bed: 'Leito',
      chair: 'Cadeira',
      desk: 'Mesa',
      counter: 'Balcão',
      cabinet: 'Armário',
      computer: 'Computador',
      equipment: 'Equipamento'
    };

    return names[furniture.type] || 'Móvel';
  }

  /**
   * Obtém emoji para tipo de móvel
   */
  getFurnitureEmoji(furniture: Furniture): string {
    const emojis: Record<FurnitureType, string> = {
      bed: '🛏️',
      chair: '💺',
      desk: '📝',
      counter: '🏥',
      cabinet: '🗄️',
      computer: '💻',
      equipment: '⚕️'
    };

    return emojis[furniture.type] || '📦';
  }
}

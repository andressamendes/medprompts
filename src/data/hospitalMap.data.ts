import { HospitalMap, Tile, Furniture, Decoration } from '../types/tile.types';

export const TILE_SIZE = 16;
export const MAP_WIDTH = 50;
export const MAP_HEIGHT = 30;

/**
 * Cria o grid de tiles do hospital com paredes e divisórias
 */
export function createTileGrid(): Tile[][] {
  const grid: Tile[][] = [];

  for (let y = 0; y < MAP_HEIGHT; y++) {
    grid[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      let isWall = false;
      let isDoor = false;

      // Paredes externas
      if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
        isWall = true;
      }

      // Divisória horizontal superior (separa linha superior)
      if (y === 10 && x > 0 && x < MAP_WIDTH - 1) {
        isWall = true;
        // Portas na divisória superior
        if (x === 12 || x === 25 || x === 37) {
          isDoor = true;
          isWall = false;
        }
      }

      // Divisória horizontal inferior (separa linha inferior)
      if (y === 20 && x > 0 && x < MAP_WIDTH - 1) {
        isWall = true;
        // Portas na divisória inferior
        if (x === 12 || x === 37) {
          isDoor = true;
          isWall = false;
        }
      }

      // Divisória vertical 1 (separa recepção de consultório 1)
      if (x === 16 && y > 0 && y < 10) {
        isWall = true;
        // Porta
        if (y === 5) {
          isDoor = true;
          isWall = false;
        }
      }

      // Divisória vertical 2 (separa consultórios)
      if (x === 32 && y > 0 && y < 10) {
        isWall = true;
        // Porta
        if (y === 5) {
          isDoor = true;
          isWall = false;
        }
      }

      // Divisória vertical 3 (separa salas inferiores)
      if (x === 25 && y > 20 && y < MAP_HEIGHT - 1) {
        isWall = true;
        // Porta
        if (y === 25) {
          isDoor = true;
          isWall = false;
        }
      }

      const tile: Tile = {
        x,
        y,
        type: isDoor ? 'door' : (isWall ? 'wall' : 'floor'),
        isWalkable: !isWall,
        variant: Math.floor(Math.random() * 3)
      };

      grid[y][x] = tile;
    }
  }

  return grid;
}

/**
 * Lista de móveis do hospital
 */
export const furnitureList: Furniture[] = [
  // RECEPÇÃO (área superior esquerda: x: 1-15, y: 1-9)
  {
    id: 'reception-counter',
    type: 'counter',
    x: 3,
    y: 3,
    width: 5,
    height: 2,
    isInteractive: true,
    interactionType: 'use'
  },
  {
    id: 'reception-computer',
    type: 'computer',
    x: 5,
    y: 3,
    width: 1,
    height: 1,
    isInteractive: true,
    interactionType: 'use'
  },
  {
    id: 'reception-chair-1',
    type: 'chair',
    x: 11,
    y: 3,
    width: 1,
    height: 1,
    isInteractive: true,
    interactionType: 'sit'
  },
  {
    id: 'reception-chair-2',
    type: 'chair',
    x: 13,
    y: 3,
    width: 1,
    height: 1,
    isInteractive: true,
    interactionType: 'sit'
  },
  {
    id: 'reception-chair-3',
    type: 'chair',
    x: 11,
    y: 6,
    width: 1,
    height: 1,
    isInteractive: true,
    interactionType: 'sit'
  },
  {
    id: 'reception-chair-4',
    type: 'chair',
    x: 13,
    y: 6,
    width: 1,
    height: 1,
    isInteractive: true,
    interactionType: 'sit'
  },

  // CONSULTÓRIO 1 (área superior centro: x: 17-31, y: 1-9)
  {
    id: 'office1-desk',
    type: 'desk',
    x: 19,
    y: 3,
    width: 3,
    height: 2,
    isInteractive: true,
    interactionType: 'use'
  },
  {
    id: 'office1-computer',
    type: 'computer',
    x: 20,
    y: 3,
    width: 1,
    height: 1,
    isInteractive: true,
    interactionType: 'use'
  },
  {
    id: 'office1-chair',
    type: 'chair',
    x: 20,
    y: 5,
    width: 1,
    height: 1,
    isInteractive: true,
    interactionType: 'sit'
  },
  {
    id: 'office1-bed',
    type: 'bed',
    x: 26,
    y: 2,
    width: 3,
    height: 2,
    isInteractive: true,
    interactionType: 'examine'
  },
  {
    id: 'office1-cabinet',
    type: 'cabinet',
    x: 26,
    y: 7,
    width: 2,
    height: 2,
    isInteractive: true,
    interactionType: 'open'
  },

  // CONSULTÓRIO 2 (área superior direita: x: 33-48, y: 1-9)
  {
    id: 'office2-desk',
    type: 'desk',
    x: 35,
    y: 3,
    width: 3,
    height: 2,
    isInteractive: true,
    interactionType: 'use'
  },
  {
    id: 'office2-computer',
    type: 'computer',
    x: 36,
    y: 3,
    width: 1,
    height: 1,
    isInteractive: true,
    interactionType: 'use'
  },
  {
    id: 'office2-chair',
    type: 'chair',
    x: 36,
    y: 5,
    width: 1,
    height: 1,
    isInteractive: true,
    interactionType: 'sit'
  },
  {
    id: 'office2-bed',
    type: 'bed',
    x: 42,
    y: 2,
    width: 3,
    height: 2,
    isInteractive: true,
    interactionType: 'examine'
  },
  {
    id: 'office2-cabinet',
    type: 'cabinet',
    x: 42,
    y: 7,
    width: 2,
    height: 2,
    isInteractive: true,
    interactionType: 'open'
  },

  // ENFERMARIA (área central: x: 1-48, y: 11-19) - 8 leitos
  {
    id: 'ward-bed-1',
    type: 'bed',
    x: 3,
    y: 12,
    width: 3,
    height: 2,
    isInteractive: true,
    interactionType: 'sleep'
  },
  {
    id: 'ward-bed-2',
    type: 'bed',
    x: 9,
    y: 12,
    width: 3,
    height: 2,
    isInteractive: true,
    interactionType: 'sleep'
  },
  {
    id: 'ward-bed-3',
    type: 'bed',
    x: 15,
    y: 12,
    width: 3,
    height: 2,
    isInteractive: true,
    interactionType: 'sleep'
  },
  {
    id: 'ward-bed-4',
    type: 'bed',
    x: 21,
    y: 12,
    width: 3,
    height: 2,
    isInteractive: true,
    interactionType: 'sleep'
  },
  {
    id: 'ward-bed-5',
    type: 'bed',
    x: 27,
    y: 12,
    width: 3,
    height: 2,
    isInteractive: true,
    interactionType: 'sleep'
  },
  {
    id: 'ward-bed-6',
    type: 'bed',
    x: 33,
    y: 12,
    width: 3,
    height: 2,
    isInteractive: true,
    interactionType: 'sleep'
  },
  {
    id: 'ward-bed-7',
    type: 'bed',
    x: 39,
    y: 12,
    width: 3,
    height: 2,
    isInteractive: true,
    interactionType: 'sleep'
  },
  {
    id: 'ward-bed-8',
    type: 'bed',
    x: 45,
    y: 12,
    width: 3,
    height: 2,
    isInteractive: true,
    interactionType: 'sleep'
  },
  {
    id: 'ward-equipment-1',
    type: 'equipment',
    x: 3,
    y: 15,
    width: 1,
    height: 1,
    isInteractive: true,
    interactionType: 'examine'
  },
  {
    id: 'ward-equipment-2',
    type: 'equipment',
    x: 15,
    y: 15,
    width: 1,
    height: 1,
    isInteractive: true,
    interactionType: 'examine'
  },
  {
    id: 'ward-equipment-3',
    type: 'equipment',
    x: 27,
    y: 15,
    width: 1,
    height: 1,
    isInteractive: true,
    interactionType: 'examine'
  },
  {
    id: 'ward-equipment-4',
    type: 'equipment',
    x: 39,
    y: 15,
    width: 1,
    height: 1,
    isInteractive: true,
    interactionType: 'examine'
  },

  // SALA DE MEDICAÇÃO (área inferior esquerda: x: 1-24, y: 21-28)
  {
    id: 'medication-cabinet',
    type: 'cabinet',
    x: 3,
    y: 22,
    width: 4,
    height: 3,
    isInteractive: true,
    interactionType: 'open'
  },
  {
    id: 'medication-counter',
    type: 'counter',
    x: 10,
    y: 23,
    width: 4,
    height: 2,
    isInteractive: true,
    interactionType: 'use'
  },
  {
    id: 'medication-chair',
    type: 'chair',
    x: 18,
    y: 24,
    width: 1,
    height: 1,
    isInteractive: true,
    interactionType: 'sit'
  },

  // SALA DE PROCEDIMENTOS (área inferior direita: x: 26-48, y: 21-28)
  {
    id: 'procedure-table',
    type: 'equipment',
    x: 30,
    y: 23,
    width: 4,
    height: 2,
    isInteractive: true,
    interactionType: 'use'
  },
  {
    id: 'procedure-cart',
    type: 'equipment',
    x: 38,
    y: 22,
    width: 3,
    height: 3,
    isInteractive: true,
    interactionType: 'use'
  },
  {
    id: 'procedure-cabinet',
    type: 'cabinet',
    x: 43,
    y: 23,
    width: 2,
    height: 2,
    isInteractive: true,
    interactionType: 'open'
  }
];

/**
 * Lista de decorações do hospital
 */
export const decorationList: Decoration[] = [
  // Plantas em vasos (animadas)
  {
    id: 'plant-1',
    type: 'plant',
    x: 8,
    y: 2,
    layer: 'foreground',
    isAnimated: true,
    animationFrames: 4
  },
  {
    id: 'plant-2',
    type: 'plant',
    x: 24,
    y: 2,
    layer: 'foreground',
    isAnimated: true,
    animationFrames: 4
  },
  {
    id: 'plant-3',
    type: 'plant',
    x: 40,
    y: 2,
    layer: 'foreground',
    isAnimated: true,
    animationFrames: 4
  },
  {
    id: 'plant-4',
    type: 'plant',
    x: 2,
    y: 16,
    layer: 'foreground',
    isAnimated: true,
    animationFrames: 4
  },
  {
    id: 'plant-5',
    type: 'plant',
    x: 47,
    y: 16,
    layer: 'foreground',
    isAnimated: true,
    animationFrames: 4
  },
  {
    id: 'plant-6',
    type: 'plant',
    x: 12,
    y: 27,
    layer: 'foreground',
    isAnimated: true,
    animationFrames: 4
  },

  // Quadros nas paredes
  {
    id: 'painting-1',
    type: 'painting',
    x: 10,
    y: 1,
    layer: 'background',
    isAnimated: false
  },
  {
    id: 'painting-2',
    type: 'painting',
    x: 23,
    y: 1,
    layer: 'background',
    isAnimated: false
  },
  {
    id: 'painting-3',
    type: 'painting',
    x: 39,
    y: 1,
    layer: 'background',
    isAnimated: false
  },

  // Relógio de parede (animado)
  {
    id: 'clock-1',
    type: 'clock',
    x: 25,
    y: 11,
    layer: 'background',
    isAnimated: true,
    animationFrames: 60
  },

  // Lixeiras
  {
    id: 'trash-1',
    type: 'trash',
    x: 15,
    y: 8,
    layer: 'foreground',
    isAnimated: false
  },
  {
    id: 'trash-2',
    type: 'trash',
    x: 31,
    y: 8,
    layer: 'foreground',
    isAnimated: false
  },
  {
    id: 'trash-3',
    type: 'trash',
    x: 6,
    y: 18,
    layer: 'foreground',
    isAnimated: false
  },
  {
    id: 'trash-4',
    type: 'trash',
    x: 15,
    y: 27,
    layer: 'foreground',
    isAnimated: false
  },
  {
    id: 'trash-5',
    type: 'trash',
    x: 35,
    y: 27,
    layer: 'foreground',
    isAnimated: false
  },

  // Extintores
  {
    id: 'extinguisher-1',
    type: 'extinguisher',
    x: 1,
    y: 5,
    layer: 'foreground',
    isAnimated: false
  },
  {
    id: 'extinguisher-2',
    type: 'extinguisher',
    x: 48,
    y: 5,
    layer: 'foreground',
    isAnimated: false
  },
  {
    id: 'extinguisher-3',
    type: 'extinguisher',
    x: 1,
    y: 25,
    layer: 'foreground',
    isAnimated: false
  },

  // Monitores médicos (animados)
  {
    id: 'monitor-1',
    type: 'monitor',
    x: 6,
    y: 12,
    layer: 'foreground',
    isAnimated: true,
    animationFrames: 2
  },
  {
    id: 'monitor-2',
    type: 'monitor',
    x: 24,
    y: 12,
    layer: 'foreground',
    isAnimated: true,
    animationFrames: 2
  },
  {
    id: 'monitor-3',
    type: 'monitor',
    x: 42,
    y: 12,
    layer: 'foreground',
    isAnimated: true,
    animationFrames: 2
  }
];

/**
 * Mapa completo do hospital
 */
export const HOSPITAL_MAP: HospitalMap = {
  width: MAP_WIDTH,
  height: MAP_HEIGHT,
  tileSize: TILE_SIZE,
  tiles: createTileGrid(),
  furniture: furnitureList,
  decorations: decorationList
};

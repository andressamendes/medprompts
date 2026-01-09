export type TileType = 'floor' | 'wall' | 'door' | 'window' | 'void';

export type FurnitureType =
  | 'bed'
  | 'chair'
  | 'desk'
  | 'counter'
  | 'cabinet'
  | 'computer'
  | 'equipment';

export type DecoType =
  | 'plant'
  | 'painting'
  | 'clock'
  | 'trash'
  | 'extinguisher'
  | 'monitor';

export type InteractionType =
  | 'sit'
  | 'use'
  | 'examine'
  | 'open'
  | 'sleep';

export interface Tile {
  x: number;
  y: number;
  type: TileType;
  isWalkable: boolean;
  variant?: number;
}

export interface Furniture {
  id: string;
  type: FurnitureType;
  x: number;
  y: number;
  width: number;
  height: number;
  isInteractive: boolean;
  interactionType?: InteractionType;
  occupiedBy?: string;
}

export interface Decoration {
  id: string;
  type: DecoType;
  x: number;
  y: number;
  layer: 'background' | 'foreground';
  isAnimated: boolean;
  animationFrames?: number;
}

export interface HospitalMap {
  width: number;
  height: number;
  tileSize: number;
  tiles: Tile[][];
  furniture: Furniture[];
  decorations: Decoration[];
}

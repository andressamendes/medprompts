export type Direction = 'up' | 'down' | 'left' | 'right';

export type MovementState = 'idle' | 'walking' | 'sitting' | 'lying' | 'using';

export interface Position {
  x: number;
  y: number;
}

export interface PathNode {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent?: PathNode;
}

export type MovementCommandType = 'move' | 'interact' | 'stop';

export interface MovementCommand {
  type: MovementCommandType;
  targetPosition?: Position;
  targetId?: string;
  timestamp: number;
}

export interface AnimationFrame {
  currentFrame: number;
  totalFrames: number;
  frameDelay: number;
  lastUpdate: number;
}

export interface MovementConfig {
  speed: number;
  tileSize: number;
  animationSpeed: number;
}

import { Schema, type } from '@colyseus/schema';

export class PlayerState extends Schema {
  @type('string') userId!: string;
  @type('string') name!: string;
  @type('number') level!: number;
  @type('number') x!: number; // Position X
  @type('number') y!: number; // Position Y
  @type('string') direction!: string; // 'left', 'right', 'up', 'down'
  @type('boolean') isMoving!: boolean;
  @type('string') status!: string; // 'active', 'idle', 'away'
  @type('string') avatar!: string; // Avatar identifier
  @type('number') lastUpdate!: number; // Timestamp

  constructor(
    userId: string,
    name: string,
    level: number,
    x: number,
    y: number,
    avatar: string = 'default'
  ) {
    super();
    this.userId = userId;
    this.name = name;
    this.level = level;
    this.x = x;
    this.y = y;
    this.direction = 'down';
    this.isMoving = false;
    this.status = 'active';
    this.avatar = avatar;
    this.lastUpdate = Date.now();
  }

  updatePosition(x: number, y: number, direction?: string) {
    this.x = x;
    this.y = y;
    if (direction) {
      this.direction = direction;
    }
    this.lastUpdate = Date.now();
  }

  updateStatus(status: 'active' | 'idle' | 'away') {
    this.status = status;
    this.lastUpdate = Date.now();
  }
}

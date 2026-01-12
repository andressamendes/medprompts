import { Schema, MapSchema, type } from '@colyseus/schema';
import { PlayerState } from './PlayerState';

export class RoomState extends Schema {
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type('string') roomType!: string;
  @type('number') maxPlayers!: number;
  @type('number') createdAt!: number;
  @type('string') mapName!: string; // Phaser map identifier

  constructor(roomType: string, maxPlayers: number = 50, mapName: string = 'default') {
    super();
    this.roomType = roomType;
    this.maxPlayers = maxPlayers;
    this.mapName = mapName;
    this.createdAt = Date.now();
  }

  addPlayer(player: PlayerState): boolean {
    if (this.players.size >= this.maxPlayers) {
      return false;
    }

    this.players.set(player.userId, player);
    return true;
  }

  removePlayer(userId: string): void {
    this.players.delete(userId);
  }

  getPlayer(userId: string): PlayerState | undefined {
    return this.players.get(userId);
  }

  getPlayerCount(): number {
    return this.players.size;
  }

  getAllPlayers(): PlayerState[] {
    return Array.from(this.players.values());
  }
}

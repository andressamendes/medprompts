import { Client, Room } from 'colyseus.js';
import { GAME_CONFIG } from '../config';

export interface PlayerData {
  userId: string;
  name: string;
  level: number;
  x: number;
  y: number;
  direction: string;
  isMoving: boolean;
  status: string;
  avatar: string;
}

export interface RoomStateData {
  players: Map<string, PlayerData>;
  roomType: string;
  maxPlayers: number;
}

export type NetworkEventCallback = (data: any) => void;

export class NetworkManager {
  private client: Client;
  private room: Room | null = null;
  private eventListeners: Map<string, NetworkEventCallback[]> = new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.client = new Client(GAME_CONFIG.network.serverUrl);
  }

  async joinRoom(roomType: string, token: string, x: number = 400, y: number = 300): Promise<Room> {
    try {
      console.log(`[NetworkManager] Connecting to server: ${GAME_CONFIG.network.serverUrl}`);
      console.log(`[NetworkManager] Joining room: ${roomType}`);

      // Add timeout to prevent infinite waiting
      const joinPromise = this.client.joinOrCreate(roomType, {
        token,
        x,
        y,
        avatar: 'default',
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Connection timeout - Server is not responding. Make sure the Colyseus server is running.'));
        }, 10000); // 10 second timeout
      });

      this.room = await Promise.race([joinPromise, timeoutPromise]);

      this.setupRoomListeners();
      this.startHeartbeat();

      console.log(`[NetworkManager] Successfully joined room: ${roomType} (${this.room.sessionId})`);
      return this.room;
    } catch (error) {
      console.error('[NetworkManager] Failed to join room:', error);
      throw error;
    }
  }

  private setupRoomListeners(): void {
    if (!this.room) return;

    // State change listener
    this.room.onStateChange((state: any) => {
      this.emit('stateChange', state);
    });

    // Player joined
    this.room.onMessage('player_joined', (data: any) => {
      this.emit('playerJoined', data);
    });

    // Player left
    this.room.onMessage('player_left', (data: any) => {
      this.emit('playerLeft', data);
    });

    // Chat message
    this.room.onMessage('chat', (data: any) => {
      this.emit('chat', data);
    });

    // Interaction
    this.room.onMessage('interaction', (data: any) => {
      this.emit('interaction', data);
    });

    // Room-specific messages
    this.room.onMessage('case_discussion_invite', (data: any) => {
      this.emit('caseDiscussionInvite', data);
    });

    this.room.onMessage('critical_alert', (data: any) => {
      this.emit('criticalAlert', data);
    });

    this.room.onMessage('procedure_started', (data: any) => {
      this.emit('procedureStarted', data);
    });

    this.room.onMessage('rounds_started', (data: any) => {
      this.emit('roundsStarted', data);
    });

    // Error handling
    this.room.onError((code: number, message?: string) => {
      console.error(`Room error (${code}):`, message || 'Unknown error');
      this.emit('error', { code, message: message || 'Unknown error' });
    });

    // Leave handling
    this.room.onLeave((code: number) => {
      console.log(`Left room with code: ${code}`);
      this.emit('leave', { code });

      // Attempt reconnection if unexpected
      if (code !== 1000 && code !== 1001) {
        this.scheduleReconnect();
      }
    });
  }

  private startHeartbeat(): void {
    // Send heartbeat to keep connection alive
    this.heartbeatInterval = setInterval(() => {
      if (this.room) {
        this.room.send('status', { status: 'active' });
      }
    }, GAME_CONFIG.network.heartbeatInterval);
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) return;

    console.log(`Scheduling reconnection in ${GAME_CONFIG.network.reconnectDelay}ms`);

    this.reconnectTimeout = setTimeout(() => {
      this.emit('reconnecting', {});
      this.reconnectTimeout = null;
    }, GAME_CONFIG.network.reconnectDelay);
  }

  // Send player movement
  sendMove(x: number, y: number, direction?: string): void {
    if (!this.room) return;
    this.room.send('move', { x, y, direction });
  }

  // Send stop moving
  sendStop(): void {
    if (!this.room) return;
    this.room.send('stop', {});
  }

  // Send interaction
  sendInteraction(targetId?: string, type: string = 'greet', data?: any): void {
    if (!this.room) return;
    this.room.send('interact', { targetId, type, data });
  }

  // Send chat message
  sendChat(text: string): void {
    if (!this.room) return;
    if (text.length > 500) {
      text = text.substring(0, 500);
    }
    this.room.send('chat', { text });
  }

  // Send status update
  sendStatus(status: 'active' | 'idle' | 'away'): void {
    if (!this.room) return;
    this.room.send('status', { status });
  }

  // Get current room state
  getState(): any {
    return this.room?.state;
  }

  // Get session ID
  getSessionId(): string | null {
    return this.room?.sessionId || null;
  }

  // Event system
  on(event: string, callback: NetworkEventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: NetworkEventCallback): void {
    const listeners = this.eventListeners.get(event);
    if (!listeners) return;

    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (!listeners) return;

    listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  // Leave room
  async leave(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.room) {
      await this.room.leave();
      this.room = null;
    }

    this.eventListeners.clear();
  }

  // Get connected players count
  getPlayerCount(): number {
    if (!this.room?.state?.players) return 0;
    return this.room.state.players.size;
  }

  // Check if connected
  isConnected(): boolean {
    return this.room !== null;
  }
}

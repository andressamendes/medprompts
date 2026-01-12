import { Room, Client } from 'colyseus';
import { RoomState } from '../schemas/RoomState';
import { PlayerState } from '../schemas/PlayerState';
import { logger } from '../utils/logger';
import { verifyToken, extractTokenFromAuth } from '../middleware/auth';
import {
  RoomSessionRepository,
  UserPresenceRepository,
  CollaborationEventRepository,
  UserRepository,
} from '../db/repositories';

export interface JoinOptions {
  token?: string;
  x?: number;
  y?: number;
  avatar?: string;
}

export abstract class BaseRoom extends Room<RoomState> {
  protected roomType: string;
  protected maxClients: number;
  private sessionStartTimes = new Map<string, number>(); // Track session start times
  private playerInteractions = new Map<string, number>(); // Track interactions per player

  constructor(roomType: string, maxClients: number = 50) {
    super();
    this.roomType = roomType;
    this.maxClients = maxClients;
  }

  onCreate(options: any) {
    logger.info(`Room ${this.roomId} (${this.roomType}) created`);

    // Initialize room state
    this.setState(new RoomState(this.roomType, this.maxClients));

    // Set max clients
    this.maxClients = this.maxClients;

    // Register message handlers
    this.registerMessageHandlers();

    // Setup periodic tasks
    this.setupPeriodicTasks();
  }

  async onAuth(client: Client, options: JoinOptions): Promise<any> {
    // Extract and verify JWT token
    const token = options.token || extractTokenFromAuth(client.auth?.token);

    if (!token) {
      logger.warn(`Client ${client.sessionId} attempted to join without token`);
      throw new Error('Authentication required');
    }

    const payload = verifyToken(token);

    if (!payload) {
      logger.warn(`Client ${client.sessionId} provided invalid token`);
      throw new Error('Invalid token');
    }

    // Get user info from database
    const user = await UserRepository.getUserById(payload.userId);

    if (!user) {
      logger.warn(`User ${payload.userId} not found in database`);
      throw new Error('User not found');
    }

    logger.info(`User ${user.name} (${user.id}) authenticated for room ${this.roomId}`);

    return { ...user, options };
  }

  async onJoin(client: Client, options: JoinOptions, auth: any) {
    const user = auth;
    const startX = options.x || 400; // Default spawn position
    const startY = options.y || 300;

    logger.info(`User ${user.name} joined room ${this.roomId} (${this.roomType})`);

    // Create player state
    const player = new PlayerState(
      user.id,
      user.name,
      user.level,
      startX,
      startY,
      options.avatar
    );

    // Add player to room state
    const added = this.state.addPlayer(player);

    if (!added) {
      throw new Error('Room is full');
    }

    // Store session start time
    this.sessionStartTimes.set(client.sessionId, Date.now());
    this.playerInteractions.set(client.sessionId, 0);

    // Create room session in database
    try {
      await RoomSessionRepository.create(user.id, this.roomType, client.sessionId);

      // Update user presence
      await UserPresenceRepository.upsert(user.id, this.roomType, startX, startY, 'active');

      // Create join event
      await CollaborationEventRepository.create(
        this.roomType,
        'player_interaction',
        user.id,
        null,
        { action: 'join' },
        10 // 10 XP for joining
      );

      // Add XP for joining
      await UserRepository.addXP(user.id, 10);
    } catch (error) {
      logger.error(`Failed to create session for user ${user.id}:`, error);
    }

    // Notify other players
    this.broadcast('player_joined', {
      userId: user.id,
      name: user.name,
      level: user.level,
    }, { except: client });
  }

  async onLeave(client: Client, consented: boolean) {
    const player = this.state.players.get(client.auth.id);

    if (!player) return;

    logger.info(`User ${player.name} left room ${this.roomId} (${this.roomType})`);

    // Calculate session duration and XP
    const startTime = this.sessionStartTimes.get(client.sessionId) || Date.now();
    const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
    const interactions = this.playerInteractions.get(client.sessionId) || 0;

    // XP calculation: 1 XP per minute + interaction bonuses
    const timeXP = Math.floor(durationSeconds / 60);
    const interactionXP = interactions * 5;
    const totalXP = timeXP + interactionXP;

    // Update database
    try {
      await RoomSessionRepository.endSession(
        client.sessionId,
        totalXP,
        durationSeconds,
        interactions
      );

      await UserPresenceRepository.remove(client.auth.id, this.roomType);

      // Create leave event
      await CollaborationEventRepository.create(
        this.roomType,
        'player_interaction',
        client.auth.id,
        null,
        { action: 'leave', duration: durationSeconds },
        totalXP
      );

      // Add XP to user
      if (totalXP > 0) {
        await UserRepository.addXP(client.auth.id, totalXP);
      }
    } catch (error) {
      logger.error(`Failed to end session for user ${client.auth.id}:`, error);
    }

    // Remove player from state
    this.state.removePlayer(client.auth.id);

    // Clean up tracking maps
    this.sessionStartTimes.delete(client.sessionId);
    this.playerInteractions.delete(client.sessionId);

    // Notify other players
    this.broadcast('player_left', {
      userId: client.auth.id,
      name: player.name,
    });
  }

  onDispose() {
    logger.info(`Room ${this.roomId} (${this.roomType}) disposed`);
  }

  protected registerMessageHandlers() {
    // Handle player movement
    this.onMessage('move', (client, message: { x: number; y: number; direction?: string }) => {
      const player = this.state.getPlayer(client.auth.id);

      if (player) {
        player.updatePosition(message.x, message.y, message.direction);
        player.isMoving = true;

        // Update presence in database (throttled by client)
        UserPresenceRepository.upsert(
          client.auth.id,
          this.roomType,
          message.x,
          message.y,
          'active'
        ).catch((error) => {
          logger.error('Failed to update presence:', error);
        });
      }
    });

    // Handle player stop moving
    this.onMessage('stop', (client) => {
      const player = this.state.getPlayer(client.auth.id);

      if (player) {
        player.isMoving = false;
      }
    });

    // Handle player interaction
    this.onMessage('interact', async (client, message: { targetId?: string; type: string; data?: any }) => {
      const interactions = this.playerInteractions.get(client.sessionId) || 0;
      this.playerInteractions.set(client.sessionId, interactions + 1);

      // Increment session interactions
      try {
        await RoomSessionRepository.incrementInteractions(client.sessionId);

        // Log interaction event
        await CollaborationEventRepository.create(
          this.roomType,
          'player_interaction',
          client.auth.id,
          message.targetId || null,
          { type: message.type, ...message.data },
          5 // 5 XP per interaction
        );

        // Add interaction XP
        await UserRepository.addXP(client.auth.id, 5);
      } catch (error) {
        logger.error('Failed to log interaction:', error);
      }

      // Broadcast interaction to relevant players
      if (message.targetId) {
        const targetClient = Array.from(this.clients).find(
          (c) => c.auth.id === message.targetId
        );

        if (targetClient) {
          targetClient.send('interaction', {
            from: client.auth.id,
            type: message.type,
            data: message.data,
          });
        }
      }
    });

    // Handle status update
    this.onMessage('status', (client, message: { status: 'active' | 'idle' | 'away' }) => {
      const player = this.state.getPlayer(client.auth.id);

      if (player) {
        player.updateStatus(message.status);

        UserPresenceRepository.updateStatus(
          client.auth.id,
          this.roomType,
          message.status
        ).catch((error) => {
          logger.error('Failed to update status:', error);
        });
      }
    });

    // Handle chat message
    this.onMessage('chat', (client, message: { text: string }) => {
      const player = this.state.getPlayer(client.auth.id);

      if (player && message.text && message.text.length <= 500) {
        this.broadcast('chat', {
          userId: client.auth.id,
          name: player.name,
          text: message.text,
          timestamp: Date.now(),
        });
      }
    });
  }

  protected setupPeriodicTasks() {
    // Cleanup stale presence every 5 minutes
    this.clock.setInterval(() => {
      UserPresenceRepository.cleanupStale().catch((error) => {
        logger.error('Failed to cleanup stale presence:', error);
      });
    }, 5 * 60 * 1000);

    // Update player activity status every 30 seconds
    this.clock.setInterval(() => {
      this.state.getAllPlayers().forEach((player) => {
        const now = Date.now();
        const timeSinceUpdate = now - player.lastUpdate;

        // If no update in 2 minutes, mark as idle
        if (timeSinceUpdate > 2 * 60 * 1000 && player.status !== 'idle') {
          player.updateStatus('idle');
        }

        // If no update in 5 minutes, mark as away
        if (timeSinceUpdate > 5 * 60 * 1000 && player.status !== 'away') {
          player.updateStatus('away');
        }
      });
    }, 30 * 1000);
  }
}

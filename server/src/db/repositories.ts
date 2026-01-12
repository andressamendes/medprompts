import { query, queryOne, withTransaction } from './connection';
import { PoolClient } from 'pg';

// Types
export interface RoomSession {
  id: string;
  user_id: string;
  room_type: string;
  session_id: string;
  xp_earned: number;
  duration_seconds: number;
  interactions_count: number;
  joined_at: Date;
  left_at: Date | null;
}

export interface UserPresence {
  id: string;
  user_id: string;
  room_type: string;
  position_x: number;
  position_y: number;
  status: 'active' | 'idle' | 'away';
  last_heartbeat: Date;
}

export interface CollaborationEvent {
  id: string;
  room_type: string;
  event_type: 'case_discussion' | 'resource_share' | 'quiz_challenge' | 'achievement_unlock' | 'player_interaction';
  user_id: string;
  target_user_id: string | null;
  metadata: Record<string, any>;
  xp_reward: number;
}

// Room Sessions Repository
export const RoomSessionRepository = {
  async create(
    userId: string,
    roomType: string,
    sessionId: string
  ): Promise<RoomSession> {
    const result = await queryOne<RoomSession>(
      `INSERT INTO room_sessions (user_id, room_type, session_id, joined_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING *`,
      [userId, roomType, sessionId]
    );
    return result!;
  },

  async endSession(
    sessionId: string,
    xpEarned: number,
    durationSeconds: number,
    interactionsCount: number
  ): Promise<void> {
    await query(
      `UPDATE room_sessions
       SET left_at = CURRENT_TIMESTAMP,
           xp_earned = $2,
           duration_seconds = $3,
           interactions_count = $4
       WHERE session_id = $1 AND left_at IS NULL`,
      [sessionId, xpEarned, durationSeconds, interactionsCount]
    );
  },

  async findActiveSession(userId: string, roomType: string): Promise<RoomSession | null> {
    return queryOne<RoomSession>(
      `SELECT * FROM room_sessions
       WHERE user_id = $1 AND room_type = $2 AND left_at IS NULL
       ORDER BY joined_at DESC
       LIMIT 1`,
      [userId, roomType]
    );
  },

  async incrementInteractions(sessionId: string): Promise<void> {
    await query(
      `UPDATE room_sessions
       SET interactions_count = interactions_count + 1
       WHERE session_id = $1`,
      [sessionId]
    );
  },
};

// User Presence Repository
export const UserPresenceRepository = {
  async upsert(
    userId: string,
    roomType: string,
    positionX: number,
    positionY: number,
    status: 'active' | 'idle' | 'away' = 'active'
  ): Promise<UserPresence> {
    const result = await queryOne<UserPresence>(
      `INSERT INTO user_presence (user_id, room_type, position_x, position_y, status, last_heartbeat)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, room_type)
       DO UPDATE SET
         position_x = EXCLUDED.position_x,
         position_y = EXCLUDED.position_y,
         status = EXCLUDED.status,
         last_heartbeat = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, roomType, positionX, positionY, status]
    );
    return result!;
  },

  async remove(userId: string, roomType: string): Promise<void> {
    await query(
      `DELETE FROM user_presence
       WHERE user_id = $1 AND room_type = $2`,
      [userId, roomType]
    );
  },

  async getActiveUsers(roomType: string): Promise<UserPresence[]> {
    return query<UserPresence>(
      `SELECT * FROM user_presence
       WHERE room_type = $1
         AND last_heartbeat > NOW() - INTERVAL '2 minutes'
       ORDER BY last_heartbeat DESC`,
      [roomType]
    );
  },

  async cleanupStale(): Promise<number> {
    const result = await query<{ deleted_count: number }>(
      `SELECT cleanup_stale_presence() as deleted_count`
    );
    return result[0]?.deleted_count || 0;
  },

  async updateStatus(
    userId: string,
    roomType: string,
    status: 'active' | 'idle' | 'away'
  ): Promise<void> {
    await query(
      `UPDATE user_presence
       SET status = $3, last_heartbeat = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND room_type = $2`,
      [userId, roomType, status]
    );
  },
};

// Collaboration Events Repository
export const CollaborationEventRepository = {
  async create(
    roomType: string,
    eventType: CollaborationEvent['event_type'],
    userId: string,
    targetUserId: string | null = null,
    metadata: Record<string, any> = {},
    xpReward: number = 0
  ): Promise<CollaborationEvent> {
    const result = await queryOne<CollaborationEvent>(
      `INSERT INTO collaboration_events (room_type, event_type, user_id, target_user_id, metadata, xp_reward)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [roomType, eventType, userId, targetUserId, JSON.stringify(metadata), xpReward]
    );
    return result!;
  },

  async getRecentEvents(roomType: string, limit: number = 20): Promise<CollaborationEvent[]> {
    return query<CollaborationEvent>(
      `SELECT * FROM collaboration_events
       WHERE room_type = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [roomType, limit]
    );
  },

  async getUserEvents(userId: string, limit: number = 50): Promise<CollaborationEvent[]> {
    return query<CollaborationEvent>(
      `SELECT * FROM collaboration_events
       WHERE user_id = $1 OR target_user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
  },
};

// Helper: Get user info
export interface UserInfo {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
}

export const UserRepository = {
  async getUserById(userId: string): Promise<UserInfo | null> {
    return queryOne<UserInfo>(
      `SELECT id, name, email, level, xp FROM users WHERE id = $1`,
      [userId]
    );
  },

  async addXP(userId: string, xpAmount: number): Promise<void> {
    await withTransaction(async (client: PoolClient) => {
      // Add XP
      await client.query(
        `UPDATE users SET xp = xp + $2 WHERE id = $1`,
        [userId, xpAmount]
      );

      // Check if level up
      const user = await client.query<UserInfo>(
        `SELECT id, level, xp FROM users WHERE id = $1`,
        [userId]
      );

      if (user.rows.length > 0) {
        const currentUser = user.rows[0];
        const xpForNextLevel = currentUser.level * 1000; // Simple formula: 1000 XP per level

        if (currentUser.xp >= xpForNextLevel) {
          await client.query(
            `UPDATE users SET level = level + 1, xp = xp - $2 WHERE id = $1`,
            [userId, xpForNextLevel]
          );
        }
      }
    });
  },
};

-- =====================================================
-- Migration: 006_create_virtual_space_tables
-- Description: Tables for Phaser 3 + Colyseus multiplayer
-- Date: 2026-01-12
-- Author: MedPrompts Team
-- =====================================================

-- ===================
-- room_sessions: Track user sessions in game rooms
-- ===================
CREATE TABLE IF NOT EXISTS room_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('emergency', 'ward', 'icu', 'surgical', 'lobby')),
  session_id VARCHAR(100) NOT NULL,
  xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
  duration_seconds INTEGER DEFAULT 0 CHECK (duration_seconds >= 0),
  interactions_count INTEGER DEFAULT 0 CHECK (interactions_count >= 0),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for room_sessions
CREATE INDEX idx_room_sessions_user_id ON room_sessions(user_id);
CREATE INDEX idx_room_sessions_room_type ON room_sessions(room_type);
CREATE INDEX idx_room_sessions_session_id ON room_sessions(session_id);
CREATE INDEX idx_room_sessions_joined_at ON room_sessions(joined_at DESC);
CREATE INDEX idx_room_sessions_active ON room_sessions(left_at) WHERE left_at IS NULL;

-- ===================
-- user_presence: Real-time user positions in rooms
-- ===================
CREATE TABLE IF NOT EXISTS user_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('emergency', 'ward', 'icu', 'surgical', 'lobby')),
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'idle', 'away')),
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, room_type)
);

-- Indexes for user_presence
CREATE INDEX idx_user_presence_user_id ON user_presence(user_id);
CREATE INDEX idx_user_presence_room_type ON user_presence(room_type);
CREATE INDEX idx_user_presence_last_heartbeat ON user_presence(last_heartbeat DESC);
CREATE INDEX idx_user_presence_active ON user_presence(last_heartbeat)
  WHERE last_heartbeat > NOW() - INTERVAL '5 minutes';

-- ===================
-- collaboration_events: Track interactions between players
-- ===================
CREATE TABLE IF NOT EXISTS collaboration_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('emergency', 'ward', 'icu', 'surgical', 'lobby')),
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('case_discussion', 'resource_share', 'quiz_challenge', 'achievement_unlock', 'player_interaction')),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  xp_reward INTEGER DEFAULT 0 CHECK (xp_reward >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for collaboration_events
CREATE INDEX idx_collaboration_events_user_id ON collaboration_events(user_id);
CREATE INDEX idx_collaboration_events_target_user_id ON collaboration_events(target_user_id)
  WHERE target_user_id IS NOT NULL;
CREATE INDEX idx_collaboration_events_room_type ON collaboration_events(room_type);
CREATE INDEX idx_collaboration_events_event_type ON collaboration_events(event_type);
CREATE INDEX idx_collaboration_events_created_at ON collaboration_events(created_at DESC);

-- ===================
-- Triggers for updated_at
-- ===================
CREATE OR REPLACE FUNCTION update_virtual_space_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_room_sessions_updated_at
  BEFORE UPDATE ON room_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_virtual_space_updated_at();

CREATE TRIGGER trigger_update_user_presence_updated_at
  BEFORE UPDATE ON user_presence
  FOR EACH ROW
  EXECUTE FUNCTION update_virtual_space_updated_at();

-- ===================
-- Helper Functions
-- ===================

-- Clean stale presence records (older than 5 minutes)
CREATE OR REPLACE FUNCTION cleanup_stale_presence()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_presence
  WHERE last_heartbeat < NOW() - INTERVAL '5 minutes';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Get active users in a room
CREATE OR REPLACE FUNCTION get_active_users_in_room(p_room_type VARCHAR(50))
RETURNS TABLE (
  user_id UUID,
  position_x FLOAT,
  position_y FLOAT,
  status VARCHAR(20),
  last_seen TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.user_id,
    up.position_x,
    up.position_y,
    up.status,
    up.last_heartbeat as last_seen
  FROM user_presence up
  WHERE up.room_type = p_room_type
    AND up.last_heartbeat > NOW() - INTERVAL '2 minutes'
  ORDER BY up.last_heartbeat DESC;
END;
$$ LANGUAGE plpgsql;

-- ===================
-- Views for Analytics
-- ===================

-- Daily room statistics
CREATE OR REPLACE VIEW daily_room_stats AS
SELECT
  room_type,
  DATE(joined_at) as date,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_sessions,
  AVG(duration_seconds)::INTEGER as avg_duration_seconds,
  SUM(xp_earned) as total_xp_earned,
  AVG(interactions_count)::NUMERIC(10,2) as avg_interactions
FROM room_sessions
WHERE left_at IS NOT NULL
GROUP BY room_type, DATE(joined_at)
ORDER BY date DESC, room_type;

-- User engagement leaderboard
CREATE OR REPLACE VIEW virtual_space_leaderboard AS
SELECT
  u.id as user_id,
  u.name,
  u.level,
  COUNT(DISTINCT rs.id) as total_sessions,
  SUM(rs.duration_seconds) as total_time_seconds,
  SUM(rs.xp_earned) as total_xp_earned,
  COUNT(DISTINCT ce.id) as total_interactions,
  MAX(rs.joined_at) as last_active
FROM users u
LEFT JOIN room_sessions rs ON u.id = rs.user_id
LEFT JOIN collaboration_events ce ON u.id = ce.user_id
GROUP BY u.id, u.name, u.level
HAVING COUNT(DISTINCT rs.id) > 0
ORDER BY total_xp_earned DESC, total_sessions DESC
LIMIT 100;

-- ===================
-- Comments
-- ===================
COMMENT ON TABLE room_sessions IS 'Tracks user sessions in Phaser game rooms with XP and duration';
COMMENT ON TABLE user_presence IS 'Real-time player positions and status in game rooms (hot data)';
COMMENT ON TABLE collaboration_events IS 'Multiplayer interaction events for analytics and rewards';

COMMENT ON COLUMN room_sessions.duration_seconds IS 'Total time spent in session (calculated on leave)';
COMMENT ON COLUMN room_sessions.interactions_count IS 'Number of interactions during session';
COMMENT ON COLUMN user_presence.last_heartbeat IS 'Last position update timestamp (used for stale cleanup)';
COMMENT ON COLUMN collaboration_events.metadata IS 'JSONB field for flexible event data';

-- ===================
-- Grant Permissions (adjust as needed)
-- ===================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON room_sessions TO medprompts_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON user_presence TO medprompts_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON collaboration_events TO medprompts_app;

-- ===================
-- Migration Complete
-- ===================
-- Run this migration:
-- psql $DATABASE_URL -f backend/src/migrations/006_create_virtual_space_tables.sql

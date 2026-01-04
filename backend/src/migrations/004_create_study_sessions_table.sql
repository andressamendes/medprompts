-- =====================================================
-- Migration: 004_create_study_sessions_table
-- Descrição: Cria tabela de sessões de estudo com sistema de revisão espaçada
-- Data: 2026-01-04
-- =====================================================

-- ===================
-- UP: Criar tabela
-- ===================

CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  topic VARCHAR(255) NOT NULL CHECK (LENGTH(topic) >= 3),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 1 AND duration_minutes <= 480),
  notes TEXT DEFAULT '' CHECK (LENGTH(notes) <= 5000),
  prompts_used TEXT[] DEFAULT ARRAY[]::TEXT[] CHECK (array_length(prompts_used, 1) IS NULL OR array_length(prompts_used, 1) <= 50),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  next_review_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===================
-- Índices para performance
-- ===================

CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_status ON study_sessions(status);
CREATE INDEX idx_study_sessions_next_review_date ON study_sessions(next_review_date);
CREATE INDEX idx_study_sessions_created_at ON study_sessions(created_at DESC);

-- Índice composto para buscar sessões de revisão de um usuário
CREATE INDEX idx_study_sessions_user_review ON study_sessions(user_id, status, next_review_date);

-- ===================
-- Trigger para atualizar updated_at automaticamente
-- ===================

CREATE OR REPLACE FUNCTION update_study_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_study_sessions_updated_at
  BEFORE UPDATE ON study_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_study_sessions_updated_at();

-- ===================
-- Comentários de documentação
-- ===================

COMMENT ON TABLE study_sessions IS 'Sessões de estudo dos usuários com sistema de revisão espaçada';
COMMENT ON COLUMN study_sessions.id IS 'Identificador único da sessão';
COMMENT ON COLUMN study_sessions.user_id IS 'Referência ao usuário que criou a sessão';
COMMENT ON COLUMN study_sessions.topic IS 'Tópico estudado (3-255 caracteres)';
COMMENT ON COLUMN study_sessions.duration_minutes IS 'Duração da sessão em minutos (1-480)';
COMMENT ON COLUMN study_sessions.notes IS 'Anotações do usuário (máximo 5000 caracteres)';
COMMENT ON COLUMN study_sessions.prompts_used IS 'Array de IDs dos prompts utilizados (máximo 50)';
COMMENT ON COLUMN study_sessions.status IS 'Status da sessão: pending ou completed';
COMMENT ON COLUMN study_sessions.review_count IS 'Número de revisões realizadas';
COMMENT ON COLUMN study_sessions.next_review_date IS 'Data da próxima revisão (algoritmo de espaçamento)';
COMMENT ON COLUMN study_sessions.created_at IS 'Data de criação da sessão';
COMMENT ON COLUMN study_sessions.updated_at IS 'Data da última atualização';

-- ===================
-- DOWN: Remover tabela (rollback)
-- ===================

-- Para executar o rollback:
-- DROP TRIGGER IF EXISTS trigger_update_study_sessions_updated_at ON study_sessions;
-- DROP FUNCTION IF EXISTS update_study_sessions_updated_at();
-- DROP TABLE IF EXISTS study_sessions CASCADE;

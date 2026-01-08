-- =====================================================
-- Migration: 005_update_prompts_table
-- Descrição: Adiciona campos para sistema de prompts com variáveis e prompts do sistema
-- Data: 2026-01-08
-- =====================================================

-- ===================
-- UP: Adicionar novos campos
-- ===================

-- Adiciona campo description
ALTER TABLE prompts
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '' CHECK (LENGTH(description) <= 500);

-- Adiciona campo variables (armazena JSON com campos de preenchimento)
ALTER TABLE prompts
ADD COLUMN IF NOT EXISTS variables JSONB DEFAULT '[]'::jsonb;

-- Adiciona campo is_system_prompt (indica se é prompt do sistema)
ALTER TABLE prompts
ADD COLUMN IF NOT EXISTS is_system_prompt BOOLEAN DEFAULT false NOT NULL;

-- Adiciona campo recommended_ai
ALTER TABLE prompts
ADD COLUMN IF NOT EXISTS recommended_ai VARCHAR(50) CHECK (
  recommended_ai IS NULL OR 
  recommended_ai IN ('ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'NotebookLM')
);

-- Permite que userId seja NULL para prompts do sistema
ALTER TABLE prompts
ALTER COLUMN user_id DROP NOT NULL;

-- ===================
-- Índices para performance
-- ===================

-- Índice para buscar prompts do sistema
CREATE INDEX IF NOT EXISTS idx_prompts_is_system_prompt ON prompts(is_system_prompt);

-- Índice para buscar por IA recomendada
CREATE INDEX IF NOT EXISTS idx_prompts_recommended_ai ON prompts(recommended_ai) WHERE recommended_ai IS NOT NULL;

-- Índice GIN para buscar em variáveis JSON
CREATE INDEX IF NOT EXISTS idx_prompts_variables ON prompts USING GIN (variables);

-- ===================
-- Comentários de documentação
-- ===================

COMMENT ON COLUMN prompts.description IS 'Descrição do prompt (máximo 500 caracteres)';
COMMENT ON COLUMN prompts.variables IS 'Array JSON com variáveis de preenchimento do prompt';
COMMENT ON COLUMN prompts.is_system_prompt IS 'Indica se é um prompt do sistema (não pode ser excluído)';
COMMENT ON COLUMN prompts.recommended_ai IS 'IA recomendada para usar este prompt';

-- ===================
-- Constraint para proteger prompts do sistema
-- ===================

-- Cria função para impedir exclusão de prompts do sistema
CREATE OR REPLACE FUNCTION prevent_system_prompt_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_system_prompt = true THEN
    RAISE EXCEPTION 'Prompts do sistema não podem ser excluídos. ID: %', OLD.id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Cria trigger para proteger prompts do sistema
DROP TRIGGER IF EXISTS trigger_prevent_system_prompt_deletion ON prompts;
CREATE TRIGGER trigger_prevent_system_prompt_deletion
  BEFORE DELETE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION prevent_system_prompt_deletion();

-- ===================
-- Validação de dados
-- ===================

-- Atualiza prompts existentes com valores padrão
UPDATE prompts
SET 
  description = COALESCE(description, ''),
  variables = COALESCE(variables, '[]'::jsonb),
  is_system_prompt = COALESCE(is_system_prompt, false)
WHERE description IS NULL OR variables IS NULL OR is_system_prompt IS NULL;

-- ===================
-- DOWN: Remover alterações (rollback)
-- ===================

-- Para executar o rollback:
-- DROP TRIGGER IF EXISTS trigger_prevent_system_prompt_deletion ON prompts;
-- DROP FUNCTION IF EXISTS prevent_system_prompt_deletion();
-- DROP INDEX IF EXISTS idx_prompts_is_system_prompt;
-- DROP INDEX IF EXISTS idx_prompts_recommended_ai;
-- DROP INDEX IF EXISTS idx_prompts_variables;
-- ALTER TABLE prompts DROP COLUMN IF EXISTS description;
-- ALTER TABLE prompts DROP COLUMN IF EXISTS variables;
-- ALTER TABLE prompts DROP COLUMN IF EXISTS is_system_prompt;
-- ALTER TABLE prompts DROP COLUMN IF EXISTS recommended_ai;
-- ALTER TABLE prompts ALTER COLUMN user_id SET NOT NULL;

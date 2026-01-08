import { Router } from 'express';
import {
  listPrompts,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
  toggleFavorite,
  usePrompt,
  fillPromptVariables,
  getCategories,
  getPopularTags,
} from '../controllers/promptController';
import { authenticate } from '../middlewares/auth';

const router = Router();

/**
 * Todas as rotas de prompts exigem autenticação
 */

// Listar categorias disponíveis
router.get('/categories', authenticate, getCategories);

// Listar tags populares do usuário
router.get('/tags', authenticate, getPopularTags);

// Listar prompts do usuário (com filtros opcionais)
// Query params: search, category, tags, isFavorite, sortBy, limit, includeSystem
router.get('/', authenticate, listPrompts);

// Buscar prompt por ID
router.get('/:promptId', authenticate, getPromptById);

// Criar novo prompt
router.post('/', authenticate, createPrompt);

// Atualizar prompt
router.put('/:promptId', authenticate, updatePrompt);

// Deletar prompt
router.delete('/:promptId', authenticate, deletePrompt);

// Favoritar/desfavoritar prompt
router.post('/:promptId/favorite', authenticate, toggleFavorite);

// Registrar uso do prompt
router.post('/:promptId/use', authenticate, usePrompt);

// Preencher variáveis do prompt (retorna conteúdo preenchido)
router.post('/:promptId/fill', authenticate, fillPromptVariables);

export default router;

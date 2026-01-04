import { Router } from 'express';
import {
  listStudySessions,
  getStudySessionById,
  createStudySession,
  updateStudySession,
  deleteStudySession,
  completeStudySession,
  getStudyStatistics,
  getSessionsForReview,
} from '../controllers/studySessionController';
import { authenticate } from '../middlewares/auth';

const router = Router();

/**
 * Todas as rotas requerem autenticação
 */
router.use(authenticate);

/**
 * @route   GET /api/study-sessions
 * @desc    Listar todas as sessões de estudo do usuário
 * @query   search - Busca por tópico ou notas
 * @query   status - Filtrar por status (pending, completed)
 * @query   startDate - Data inicial (ISO 8601)
 * @query   endDate - Data final (ISO 8601)
 * @query   sortBy - Ordenar por (duration, nextReview, topic)
 * @query   limit - Limitar número de resultados
 * @access  Private (JWT required)
 */
router.get('/', listStudySessions);

/**
 * @route   GET /api/study-sessions/statistics
 * @desc    Obter estatísticas de estudo do usuário
 * @query   period - Período (week, month, year)
 * @access  Private (JWT required)
 */
router.get('/statistics', getStudyStatistics);

/**
 * @route   GET /api/study-sessions/review
 * @desc    Obter sessões que precisam de revisão (vencidas ou hoje)
 * @access  Private (JWT required)
 */
router.get('/review', getSessionsForReview);

/**
 * @route   GET /api/study-sessions/:sessionId
 * @desc    Buscar uma sessão de estudo específica por ID
 * @params  sessionId - UUID da sessão
 * @access  Private (JWT required)
 */
router.get('/:sessionId', getStudySessionById);

/**
 * @route   POST /api/study-sessions
 * @desc    Criar nova sessão de estudo
 * @body    topic - Tópico estudado (string, 3-255 chars)
 * @body    durationMinutes - Duração em minutos (number, 1-480)
 * @body    notes - Anotações opcionais (string, max 5000 chars)
 * @body    promptsUsed - Array de IDs de prompts usados (string[], max 50)
 * @access  Private (JWT required)
 */
router.post('/', createStudySession);

/**
 * @route   PUT /api/study-sessions/:sessionId
 * @desc    Atualizar sessão de estudo existente
 * @params  sessionId - UUID da sessão
 * @body    topic - Novo tópico (opcional)
 * @body    durationMinutes - Nova duração (opcional)
 * @body    notes - Novas notas (opcional)
 * @body    promptsUsed - Novos prompts usados (opcional)
 * @body    status - Novo status (opcional: pending, completed)
 * @access  Private (JWT required)
 */
router.put('/:sessionId', updateStudySession);

/**
 * @route   POST /api/study-sessions/:sessionId/complete
 * @desc    Marcar sessão como concluída e calcular próxima revisão
 * @params  sessionId - UUID da sessão
 * @body    quality - Qualidade da revisão (opcional: 1-5)
 * @access  Private (JWT required)
 */
router.post('/:sessionId/complete', completeStudySession);

/**
 * @route   DELETE /api/study-sessions/:sessionId
 * @desc    Deletar sessão de estudo
 * @params  sessionId - UUID da sessão
 * @access  Private (JWT required)
 */
router.delete('/:sessionId', deleteStudySession);

export default router;

import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import {
  getGamificationData,
  getXPData,
  addXP,
  getXPHistory,
  getStreak,
  updateStreak,
  getBadges,
  unlockBadge,
  getDailyMissions,
  completeMission,
  getLeaderboard,
} from '../controllers/gamificationController';

const router = Router();

/**
 * Todas as rotas de gamificação requerem autenticação
 */
router.use(authenticate);

/**
 * @route   GET /api/v1/gamification
 * @desc    Obter todos os dados de gamificação (XP, badges, streak, missões)
 * @access  Private
 */
router.get('/', getGamificationData);

/**
 * @route   GET /api/v1/gamification/xp
 * @desc    Obter dados de XP e nível do usuário
 * @access  Private
 */
router.get('/xp', getXPData);

/**
 * @route   POST /api/v1/gamification/xp
 * @desc    Adicionar XP ao usuário
 * @body    { amount: number, source: string }
 * @access  Private
 */
router.post('/xp', addXP);

/**
 * @route   GET /api/v1/gamification/xp/history
 * @desc    Obter histórico de XP (para gráficos)
 * @query   days (padrão:  30)
 * @access  Private
 */
router. get('/xp/history', getXPHistory);

/**
 * @route   GET /api/v1/gamification/streak
 * @desc    Obter dados de streak do usuário
 * @access  Private
 */
router.get('/streak', getStreak);

/**
 * @route   POST /api/v1/gamification/streak
 * @desc    Atualizar streak do usuário (registrar atividade do dia)
 * @access  Private
 */
router.post('/streak', updateStreak);

/**
 * @route   GET /api/v1/gamification/badges
 * @desc    Obter todos os badges (desbloqueados e bloqueados)
 * @access  Private
 */
router.get('/badges', getBadges);

/**
 * @route   POST /api/v1/gamification/badges/:badgeId/unlock
 * @desc    Desbloquear badge específico
 * @param   badgeId - ID do badge
 * @access  Private
 */
router. post('/badges/:badgeId/unlock', unlockBadge);

/**
 * @route   GET /api/v1/gamification/daily-missions
 * @desc    Obter missões diárias ativas do usuário
 * @access  Private
 */
router.get('/daily-missions', getDailyMissions);

/**
 * @route   POST /api/v1/gamification/daily-missions/:missionId/complete
 * @desc    Completar missão e resgatar recompensa de XP
 * @param   missionId - ID da UserMission
 * @access  Private
 */
router.post('/daily-missions/:missionId/complete', completeMission);

/**
 * @route   GET /api/v1/gamification/leaderboard
 * @desc    Obter ranking de usuários (top XP e level)
 * @query   limit (padrão: 10)
 * @access  Private
 */
router.get('/leaderboard', getLeaderboard);

export default router;
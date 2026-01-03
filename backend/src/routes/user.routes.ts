import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  addXP,
  addBadge,
  getUserStats,
  deleteAccount
} from '../controllers/userController';
import {
  validateProfileUpdate,
  validatePasswordChange,
  validateXPUpdate,
  handleValidationErrors
} from '../middleware/validator';
import {
  generalLimiter,
  createResourceLimiter,
  sensitiveLimiter,
  readResourceLimiter
} from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();

// Todas as rotas de usuário requerem autenticação
router.use(authenticate);

/**
 * @route   GET /api/v1/users/profile
 * @desc    Obtém perfil do usuário autenticado
 * @access  Private
 * @rateLimit 500 tentativas / 15 minutos
 */
router.get(
  '/profile',
  readResourceLimiter,            // Rate limit permissivo para leitura
  getProfile
);

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Atualiza perfil do usuário
 * @access  Private
 * @rateLimit 20 tentativas / 15 minutos
 */
router.put(
  '/profile',
  createResourceLimiter,          // Rate limit moderado para updates
  validateProfileUpdate,          // Valida campos do perfil
  handleValidationErrors,
  updateProfile
);

/**
 * @route   PUT /api/v1/users/password
 * @desc    Altera senha do usuário
 * @access  Private
 * @rateLimit 3 tentativas / 1 hora (muito restritivo)
 */
router.put(
  '/password',
  sensitiveLimiter,               // Rate limit muito restrito (3/hora)
  validatePasswordChange,         // Valida senhas
  handleValidationErrors,
  changePassword
);

/**
 * @route   POST /api/v1/users/xp
 * @desc    Adiciona XP ao usuário
 * @access  Private
 * @rateLimit 20 tentativas / 15 minutos
 */
router.post(
  '/xp',
  createResourceLimiter,
  validateXPUpdate,               // Valida quantidade e motivo
  handleValidationErrors,
  addXP
);

/**
 * @route   POST /api/v1/users/badges
 * @desc    Adiciona badge ao usuário
 * @access  Private
 * @rateLimit 20 tentativas / 15 minutos
 */
router.post(
  '/badges',
  createResourceLimiter,
  [
    body('badgeId')
      .notEmpty()
      .withMessage('ID da badge é obrigatório')
      .isString()
      .withMessage('ID da badge deve ser uma string')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('ID da badge inválido')
  ],
  handleValidationErrors,
  addBadge
);

/**
 * @route   GET /api/v1/users/stats
 * @desc    Obtém estatísticas do usuário (XP, level, badges, etc)
 * @access  Private
 * @rateLimit 500 tentativas / 15 minutos
 */
router.get(
  '/stats',
  readResourceLimiter,
  getUserStats
);

/**
 * @route   DELETE /api/v1/users/account
 * @desc    Desativa conta do usuário
 * @access  Private
 * @rateLimit 3 tentativas / 1 hora (muito restritivo)
 */
router.delete(
  '/account',
  sensitiveLimiter,               // Rate limit muito restrito
  [
    body('password')
      .notEmpty()
      .withMessage('Senha é obrigatória para deletar conta')
  ],
  handleValidationErrors,
  deleteAccount
);

/**
 * @route   GET /api/v1/users/health
 * @desc    Health check da API de usuários
 * @access  Private
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User API está funcionando',
    user: req.user?.userId,
    timestamp: new Date().toISOString()
  });
});

export default router;

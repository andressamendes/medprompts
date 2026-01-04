import { Router } from 'express';
import { getProfile, updateProfile, getStats, addXP } from '../controllers/userController';
import { authenticate } from '../middlewares/auth';
import { validateUpdateProfile } from '../middlewares/validators';
import { apiLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Todas as rotas de usuário requerem autenticação
router.use(authenticate);

/**
 * @route   GET /api/v1/users/profile
 * @desc    Obtém perfil do usuário autenticado
 * @access  Private
 */
router.get('/profile', apiLimiter, getProfile);

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Atualiza perfil do usuário
 * @access  Private
 */
router.put('/profile', apiLimiter, validateUpdateProfile, updateProfile);

/**
 * @route   GET /api/v1/users/stats
 * @desc    Obtém estatísticas do usuário
 * @access  Private
 */
router.get('/stats', apiLimiter, getStats);

/**
 * @route   POST /api/v1/users/add-xp
 * @desc    Adiciona XP ao usuário
 * @access  Private
 */
router.post('/add-xp', apiLimiter, addXP);

export default router;

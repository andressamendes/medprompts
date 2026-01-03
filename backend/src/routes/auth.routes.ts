import { Router } from 'express';
import {
  register,
  login,
  refreshAccessToken,
  logout,
  verifyToken
} from '../controllers/authController';
import {
  validateRegister,
  validateLogin,
  handleValidationErrors
} from '../middleware/validator';
import { authLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Registra novo usuário
 * @access  Public
 * @rateLimit 5 tentativas / 15 minutos
 */
router.post(
  '/register',
  authLimiter,                    // Proteção contra spam de registros
  validateRegister,               // Valida email, senha, nome, etc
  handleValidationErrors,         // Retorna erros de validação
  register                        // Controller de registro
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Autentica usuário existente
 * @access  Public
 * @rateLimit 5 tentativas / 15 minutos
 */
router.post(
  '/login',
  authLimiter,                    // Proteção contra força bruta
  validateLogin,                  // Valida email e senha
  handleValidationErrors,
  login                           // Controller de login
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Renova access token usando refresh token
 * @access  Public
 * @rateLimit 100 tentativas / 15 minutos (rate limit geral)
 */
router.post(
  '/refresh',
  [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token é obrigatório')
      .isString()
      .withMessage('Refresh token deve ser uma string')
  ],
  handleValidationErrors,
  refreshAccessToken              // Controller de refresh
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Faz logout e invalida tokens do usuário
 * @access  Private (requer autenticação)
 */
router.post(
  '/logout',
  authenticate,                   // Requer token válido
  logout                          // Controller de logout
);

/**
 * @route   GET /api/v1/auth/verify
 * @desc    Verifica se token é válido e retorna dados do usuário
 * @access  Private (requer autenticação)
 */
router.get(
  '/verify',
  authenticate,                   // Requer token válido
  verifyToken                     // Controller de verificação
);

/**
 * @route   GET /api/v1/auth/health
 * @desc    Health check da API de autenticação
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth API está funcionando',
    timestamp: new Date().toISOString()
  });
});

export default router;

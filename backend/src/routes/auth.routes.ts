import { Router } from 'express';
import { register, login, logout, refreshToken } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';
import { validateRegister, validateLogin } from '../middlewares/validators';
import { authLimiter, strictAuthLimiter } from '../middlewares/rateLimiter';

const router = Router();

// POST /api/v1/auth/register
router.post('/register', authLimiter, validateRegister, register);

// POST /api/v1/auth/login
router.post('/login', strictAuthLimiter, validateLogin, login);

// POST /api/v1/auth/logout
router.post('/logout', authenticate, logout);

// POST /api/v1/auth/refresh
router.post('/refresh', authLimiter, refreshToken);

export default router;

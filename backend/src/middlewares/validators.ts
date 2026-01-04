import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { logger } from '../utils/logger';

/**
 * Middleware para processar erros de validação
 */
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error: any) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));

    logger.warn('Validação falhou', {
      path: req.path,
      method: req.method,
      errors: formattedErrors,
      userId: req.userId || 'anonymous',
    });

    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: formattedErrors,
    });
  }

  next();
};

/**
 * Validação para registro
 */
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 3 })
    .withMessage('Nome deve ter no mínimo 3 caracteres'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email é obrigatório')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter no mínimo 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'),

  body('university')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Nome da universidade muito longo'),

  body('graduationYear')
    .optional()
    .isInt({ min: new Date().getFullYear(), max: new Date().getFullYear() + 10 })
    .withMessage('Ano de formatura inválido'),

  handleValidationErrors,
];

/**
 * Validação para login
 */
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email é obrigatório')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),

  handleValidationErrors,
];

/**
 * Validação para atualização de perfil
 */
export const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Nome deve ter no mínimo 3 caracteres'),

  body('university')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Nome da universidade muito longo'),

  body('graduationYear')
    .optional()
    .isInt({ min: new Date().getFullYear(), max: new Date().getFullYear() + 10 })
    .withMessage('Ano de formatura inválido'),

  handleValidationErrors,
];

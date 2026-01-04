import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Middleware para processar resultados de validação
 * Retorna erros formatados se validação falhar
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? (error as any).value : undefined
    }));

    logger.warn('Validação falhou', {
      path: req.path,
      method: req.method,
      errors: formattedErrors,
      userId: (req as any).user?.userId || 'anonymous'
    });

    res.status(400).json({
      success: false,
      error: 'Dados inválidos fornecidos',
      details: formattedErrors
    });
    return;
  }
  
  next();
};

/**
 * Validações para registro de usuário
 */
export const validateRegister: ValidationChain[] = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email muito longo'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter no mínimo 8 caracteres')
    .isLength({ max: 128 })
    .withMessage('Senha muito longa')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'),
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage('Nome contém caracteres inválidos')
    .escape(), // Sanitiza contra XSS
  
  body('university')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Nome da universidade muito longo')
    .escape(),
  
  body('graduationYear')
    .optional()
    .isInt({ min: 2000, max: 2050 })
    .withMessage('Ano de formatura inválido')
];

/**
 * Validações para login
 */
export const validateLogin: ValidationChain[] = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
];

/**
 * Validações para atualização de perfil
 */
export const validateProfileUpdate: ValidationChain[] = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage('Nome contém caracteres inválidos')
    .escape(),
  
  body('university')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Nome da universidade muito longo')
    .escape(),
  
  body('graduationYear')
    .optional()
    .isInt({ min: 2000, max: 2050 })
    .withMessage('Ano de formatura inválido'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Biografia muito longa (máximo 500 caracteres)')
    .escape(),
  
  body('studyGoalHours')
    .optional()
    .isInt({ min: 1, max: 24 })
    .withMessage('Meta de horas deve ser entre 1 e 24'),
  
  body('preferredAI')
    .optional()
    .isIn(['chatgpt', 'claude', 'gemini', 'perplexity'])
    .withMessage('IA preferida inválida')
];

/**
 * Validações para alteração de senha
 */
export const validatePasswordChange: ValidationChain[] = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Nova senha deve ter no mínimo 8 caracteres')
    .isLength({ max: 128 })
    .withMessage('Nova senha muito longa')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Nova senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('Nova senha deve ser diferente da atual');
      }
      return true;
    }),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Confirmação de senha não corresponde');
      }
      return true;
    })
];

/**
 * Validações para atualização de XP
 */
export const validateXPUpdate: ValidationChain[] = [
  body('xpAmount')
    .isInt({ min: 0, max: 10000 })
    .withMessage('Quantidade de XP inválida (0-10000)'),
  
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Motivo do XP é obrigatório')
    .isLength({ max: 200 })
    .withMessage('Motivo muito longo')
    .escape()
];

/**
 * Validações para criação de cronograma de estudos
 */
export const validateStudySchedule: ValidationChain[] = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Título é obrigatório')
    .isLength({ min: 3, max: 100 })
    .withMessage('Título deve ter entre 3 e 100 caracteres')
    .escape(),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descrição muito longa')
    .escape(),
  
  body('startDate')
    .isISO8601()
    .withMessage('Data de início inválida')
    .toDate(),
  
  body('endDate')
    .isISO8601()
    .withMessage('Data de término inválida')
    .toDate()
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('Data de término deve ser posterior à data de início');
      }
      return true;
    }),
  
  body('studyDays')
    .isArray({ min: 1, max: 7 })
    .withMessage('Deve selecionar pelo menos 1 dia de estudo'),
  
  body('studyDays.*')
    .isIn([0, 1, 2, 3, 4, 5, 6])
    .withMessage('Dia da semana inválido'),
  
  body('dailyHours')
    .isFloat({ min: 0.5, max: 24 })
    .withMessage('Horas diárias devem ser entre 0.5 e 24')
];

/**
 * Validações para parâmetros de ID
 */
export const validateId: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('ID inválido')
];

/**
 * Validações para query de paginação
 */
export const validatePagination: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Número da página deve ser maior que 0')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser entre 1 e 100')
    .toInt(),
  
  query('sortBy')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .escape(),
  
  query('order')
    .optional()
    .isIn(['ASC', 'DESC', 'asc', 'desc'])
    .withMessage('Ordem deve ser ASC ou DESC')
];

/**
 * Validações para busca/filtro
 */
export const validateSearch: ValidationChain[] = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Termo de busca muito longo')
    .escape(),
  
  query('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .escape(),
  
  query('tags')
    .optional()
    .isArray()
    .withMessage('Tags devem ser um array'),
  
  query('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .escape()
];

// Log de inicialização
logger.info('✅ Middlewares de validação inicializados');

export default {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateXPUpdate,
  validateStudySchedule,
  validateId,
  validatePagination,
  validateSearch
};

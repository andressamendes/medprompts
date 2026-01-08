import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Prompt from '../models/Prompt';
import { logger } from '../utils/logger';

/**
 * Listar prompts (do sistema + do usuário) com filtros
 */
export const listPrompts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { search, category, tags, isFavorite, sortBy, limit, includeSystem } = req.query;

    // Construir filtros dinâmicos
    const where: any = {};

    // Se includeSystem=true, mostra prompts do sistema + do usuário
    // Se false ou não informado, mostra apenas do usuário
    if (includeSystem === 'true') {
      where[Op.or] = [
        { isSystemPrompt: true },
        { userId: userId || null }
      ];
    } else if (userId) {
      where.userId = userId;
    }

    // Filtro de busca (título, descrição ou conteúdo)
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Filtro de categoria
    if (category) {
      where.category = category;
    }

    // Filtro de tags
    if (tags) {
      const tagsArray = (tags as string).split(',');
      where.tags = { [Op.overlap]: tagsArray };
    }

    // Filtro de favoritos
    if (isFavorite !== undefined) {
      where.isFavorite = isFavorite === 'true';
    }

    // Ordenação
    let order: any = [
      ['isSystemPrompt', 'DESC'], // Prompts do sistema primeiro
      ['createdAt', 'DESC']
    ];
    
    if (sortBy === 'popular') {
      order = [['timesUsed', 'DESC']];
    } else if (sortBy === 'alphabetical') {
      order = [['title', 'ASC']];
    } else if (sortBy === 'recent') {
      order = [['updatedAt', 'DESC']];
    }

    // Limite de resultados
    const limitValue = limit ? parseInt(limit as string, 10) : undefined;

    // Buscar prompts
    const prompts = await Prompt.findAll({
      where,
      order,
      limit: limitValue,
    });

    logger.info('Prompts listados com sucesso', {
      userId,
      count: prompts.length,
      filters: { search, category, tags, isFavorite, sortBy, includeSystem },
    });

    res.status(200).json({
      success: true,
      prompts,
    });
  } catch (error: any) {
    logger.error('Erro ao listar prompts', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao listar prompts',
    });
  }
};

/**
 * Buscar prompt por ID
 */
export const getPromptById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { promptId } = req.params;

    const prompt = await Prompt.findByPk(promptId);

    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: 'Prompt não encontrado',
      });
    }

    // Verifica permissão: pode ver se for do sistema ou do próprio usuário
    if (!prompt.isSystemPrompt && prompt.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Você não tem permissão para acessar este prompt',
      });
    }

    logger.info('Prompt buscado com sucesso', { userId, promptId });

    res.status(200).json({
      success: true,
      prompt,
    });
  } catch (error: any) {
    logger.error('Erro ao buscar prompt', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar prompt',
    });
  }
};

/**
 * Criar novo prompt personalizado
 */
export const createPrompt = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { title, description, content, category, tags, variables, recommendedAI } = req.body;

    // Validações básicas
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        error: 'Título, conteúdo e categoria são obrigatórios',
      });
    }

    // Criar prompt
    const prompt = await Prompt.create({
      userId,
      title: title.trim(),
      description: description?.trim() || '',
      content: content.trim(),
      category,
      tags: tags || [],
      variables: variables || [],
      isSystemPrompt: false, // Usuários não podem criar prompts do sistema
      isFavorite: false,
      timesUsed: 0,
      recommendedAI: recommendedAI || null
    });

    logger.info('Prompt criado com sucesso', {
      userId,
      promptId: prompt.id,
      category,
    });

    res.status(201).json({
      success: true,
      prompt,
      message: 'Prompt criado com sucesso',
    });
  } catch (error: any) {
    logger.error('Erro ao criar prompt', { error: error.message });

    // Tratamento de erros de validação do Sequelize
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: error.errors.map((e: any) => e.message).join(', '),
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro ao criar prompt',
    });
  }
};

/**
 * Atualizar prompt
 */
export const updatePrompt = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { promptId } = req.params;
    const { title, description, content, category, tags, variables, recommendedAI } = req.body;

    // Buscar prompt
    const prompt = await Prompt.findByPk(promptId);

    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: 'Prompt não encontrado',
      });
    }

    // Prompts do sistema não podem ser editados
    if (prompt.isSystemPrompt) {
      return res.status(403).json({
        success: false,
        error: 'Prompts do sistema não podem ser editados',
      });
    }

    // Apenas o dono pode editar
    if (prompt.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Você não tem permissão para editar este prompt',
      });
    }

    // Atualizar campos fornecidos
    if (title !== undefined) prompt.title = title.trim();
    if (description !== undefined) prompt.description = description.trim();
    if (content !== undefined) prompt.content = content.trim();
    if (category !== undefined) prompt.category = category;
    if (tags !== undefined) prompt.tags = tags;
    if (variables !== undefined) prompt.variables = variables;
    if (recommendedAI !== undefined) prompt.recommendedAI = recommendedAI;

    await prompt.save();

    logger.info('Prompt atualizado com sucesso', { userId, promptId });

    res.status(200).json({
      success: true,
      prompt,
      message: 'Prompt atualizado com sucesso',
    });
  } catch (error: any) {
    logger.error('Erro ao atualizar prompt', { error: error.message });

    // Tratamento de erros de validação do Sequelize
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: error.errors.map((e: any) => e.message).join(', '),
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar prompt',
    });
  }
};

/**
 * Deletar prompt
 */
export const deletePrompt = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { promptId } = req.params;

    // Buscar prompt
    const prompt = await Prompt.findByPk(promptId);

    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: 'Prompt não encontrado',
      });
    }

    // Prompts do sistema não podem ser deletados (o trigger do banco também bloqueia)
    if (prompt.isSystemPrompt) {
      return res.status(403).json({
        success: false,
        error: 'Prompts do sistema não podem ser excluídos',
      });
    }

    // Apenas o dono pode deletar
    if (prompt.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Você não tem permissão para excluir este prompt',
      });
    }

    await prompt.destroy();

    logger.info('Prompt deletado com sucesso', { userId, promptId });

    res.status(200).json({
      success: true,
      message: 'Prompt deletado com sucesso',
    });
  } catch (error: any) {
    logger.error('Erro ao deletar prompt', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar prompt',
    });
  }
};

/**
 * Favoritar/desfavoritar prompt
 */
export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { promptId } = req.params;

    // Buscar prompt
    const prompt = await Prompt.findByPk(promptId);

    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: 'Prompt não encontrado',
      });
    }

    // Verifica permissão
    if (!prompt.isSystemPrompt && prompt.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Você não tem permissão para favoritar este prompt',
      });
    }

    // Inverter valor de isFavorite
    prompt.isFavorite = !prompt.isFavorite;
    await prompt.save();

    logger.info('Prompt favoritado/desfavoritado', {
      userId,
      promptId,
      isFavorite: prompt.isFavorite,
    });

    res.status(200).json({
      success: true,
      prompt,
      message: prompt.isFavorite
        ? 'Prompt adicionado aos favoritos'
        : 'Prompt removido dos favoritos',
    });
  } catch (error: any) {
    logger.error('Erro ao favoritar prompt', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao favoritar prompt',
    });
  }
};

/**
 * Registrar uso do prompt (incrementar timesUsed)
 */
export const usePrompt = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { promptId } = req.params;

    // Buscar prompt
    const prompt = await Prompt.findByPk(promptId);

    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: 'Prompt não encontrado',
      });
    }

    // Incrementar contador de uso
    prompt.timesUsed += 1;
    await prompt.save();

    logger.info('Uso de prompt registrado', {
      userId,
      promptId,
      timesUsed: prompt.timesUsed,
    });

    res.status(200).json({
      success: true,
      prompt,
      message: 'Uso registrado com sucesso',
    });
  } catch (error: any) {
    logger.error('Erro ao registrar uso do prompt', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao registrar uso do prompt',
    });
  }
};

/**
 * Preencher variáveis do prompt com valores fornecidos
 * POST /api/prompts/:promptId/fill
 */
export const fillPromptVariables = async (req: Request, res: Response) => {
  try {
    const { promptId } = req.params;
    const { values } = req.body; // { "{{PACIENTE}}": "João Silva", "{{IDADE}}": "45" }

    const prompt = await Prompt.findByPk(promptId);

    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: 'Prompt não encontrado',
      });
    }

    if (!values || typeof values !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Valores inválidos. Envie um objeto com as variáveis',
      });
    }

    // Usa o método do model para preencher
    const filledContent = prompt.fillVariables(values);

    res.status(200).json({
      success: true,
      data: {
        original: prompt.content,
        filled: filledContent,
        variables: prompt.variables
      }
    });
  } catch (error: any) {
    logger.error('Erro ao preencher variáveis', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao preencher variáveis',
    });
  }
};

/**
 * Buscar categorias disponíveis
 */
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = [
      'estudos',
      'clinica',
      'anamnese',
      'diagnostico',
      'tratamento',
      'pediatria',
      'ginecologia',
      'cardiologia',
      'neurologia',
      'ortopedia',
      'emergencia',
      'cirurgia',
      'clinica-medica',
      'estudos-caso',
      'revisao',
      'outros',
    ];

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error: any) {
    logger.error('Erro ao buscar categorias', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar categorias',
    });
  }
};

/**
 * Buscar tags populares
 */
export const getPopularTags = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // Buscar todos os prompts do usuário
    const prompts = await Prompt.findAll({
      where: { userId },
      attributes: ['tags'],
    });

    // Extrair e contar tags
    const tagsCount: { [key: string]: number } = {};
    prompts.forEach((prompt) => {
      prompt.tags.forEach((tag) => {
        tagsCount[tag] = (tagsCount[tag] || 0) + 1;
      });
    });

    // Ordenar por popularidade e retornar top 20
    const popularTags = Object.entries(tagsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map((entry) => entry[0]);

    res.status(200).json({
      success: true,
      tags: popularTags,
    });
  } catch (error: any) {
    logger.error('Erro ao buscar tags populares', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar tags populares',
    });
  }
};

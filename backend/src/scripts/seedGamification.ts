import { sequelize } from '../config/database';
import Badge from '../models/Badge';
import DailyMission from '../models/DailyMission';
import { logger } from '../utils/logger';

/**
 * Script para popular banco com badges e missões iniciais
 */

const badges = [
  // Bronze Badges
  {
    name: 'Primeiro Passo',
    description: 'Complete seu primeiro cadastro e configure seu perfil',
    icon: '🎯',
    category: 'bronze' as const,
    requirement: { type: 'xp' as const, target: 10 },
  },
  {
    name:  'Estudante Iniciante',
    description: 'Ganhe 100 XP',
    icon: '📚',
    category: 'bronze' as const,
    requirement: { type: 'xp' as const, target: 100 },
  },
  {
    name: 'Criador de Prompts',
    description: 'Crie 5 prompts personalizados',
    icon: '✍️',
    category: 'bronze' as const,
    requirement: { type: 'prompts' as const, target: 5 },
  },
  {
    name: 'Estudioso',
    description: 'Complete 5 sessões de estudo',
    icon: '📖',
    category: 'bronze' as const,
    requirement: { type: 'sessions' as const, target: 5 },
  },
  {
    name: 'Dedicado',
    description: 'Mantenha um streak de 3 dias',
    icon: '🔥',
    category:  'bronze' as const,
    requirement: { type: 'streak' as const, target: 3 },
  },

  // Silver Badges
  {
    name: 'Explorador do Conhecimento',
    description: 'Ganhe 500 XP',
    icon:  '🌟',
    category: 'silver' as const,
    requirement: { type: 'xp' as const, target: 500 },
  },
  {
    name: 'Mestre dos Prompts',
    description: 'Crie 20 prompts personalizados',
    icon: '🎨',
    category:  'silver' as const,
    requirement: { type: 'prompts' as const, target:  20 },
  },
  {
    name: 'Estudante Dedicado',
    description: 'Complete 20 sessões de estudo',
    icon: '📝',
    category: 'silver' as const,
    requirement:  { type: 'sessions' as const, target: 20 },
  },
  {
    name: 'Consistente',
    description: 'Mantenha um streak de 7 dias',
    icon:  '💪',
    category: 'silver' as const,
    requirement: { type: 'streak' as const, target: 7 },
  },
  {
    name: 'Nível Intermediário',
    description: 'Alcance o nível 5',
    icon: '⭐',
    category: 'silver' as const,
    requirement: { type: 'level' as const, target: 5 },
  },

  // Gold Badges
  {
    name: 'Mestre do Conhecimento',
    description: 'Ganhe 1500 XP',
    icon:  '🏆',
    category: 'gold' as const,
    requirement: { type: 'xp' as const, target: 1500 },
  },
  {
    name:  'Bibliotecário',
    description: 'Crie 50 prompts personalizados',
    icon: '📚',
    category: 'gold' as const,
    requirement: { type: 'prompts' as const, target: 50 },
  },
  {
    name: 'Estudante Exemplar',
    description: 'Complete 50 sessões de estudo',
    icon: '🎓',
    category: 'gold' as const,
    requirement: { type: 'sessions' as const, target: 50 },
  },
  {
    name: 'Imparável',
    description: 'Mantenha um streak de 30 dias',
    icon:  '🚀',
    category: 'gold' as const,
    requirement:  { type: 'streak' as const, target: 30 },
  },
  {
    name: 'Expert',
    description: 'Alcance o nível 10',
    icon: '👑',
    category: 'gold' as const,
    requirement: { type: 'level' as const, target: 10 },
  },

  // Platinum Badges
  {
    name: 'Lenda do Conhecimento',
    description: 'Ganhe 5000 XP',
    icon: '💎',
    category: 'platinum' as const,
    requirement: { type: 'xp' as const, target: 5000 },
  },
  {
    name: 'Arquivista Supremo',
    description: 'Crie 100 prompts personalizados',
    icon:  '📜',
    category: 'platinum' as const,
    requirement:  { type: 'prompts' as const, target: 100 },
  },
  {
    name: 'Mestre dos Estudos',
    description: 'Complete 100 sessões de estudo',
    icon: '🎖️',
    category: 'platinum' as const,
    requirement: { type: 'sessions' as const, target: 100 },
  },
  {
    name: 'Inquebrantável',
    description: 'Mantenha um streak de 100 dias',
    icon: '⚡',
    category: 'platinum' as const,
    requirement: { type: 'streak' as const, target: 100 },
  },
  {
    name: 'Grande Mestre',
    description: 'Alcance o nível 20',
    icon: '🌌',
    category: 'platinum' as const,
    requirement:  { type: 'level' as const, target: 20 },
  },
];

const dailyMissions = [
  {
    title: 'Criar um Prompt',
    description: 'Crie 1 novo prompt personalizado hoje',
    xpReward: 25,
    type: 'daily' as const,
    requirement: { action: 'create_prompt' as const, target: 1 },
  },
  {
    title: 'Sessão de Estudo',
    description: 'Complete 1 sessão de estudo hoje',
    xpReward: 50,
    type: 'daily' as const,
    requirement: { action: 'study_session' as const, target: 1 },
  },
  {
    title: 'Usar Prompts',
    description: 'Use 3 prompts hoje',
    xpReward: 30,
    type: 'daily' as const,
    requirement:  { action: 'use_prompt' as const, target: 3 },
  },
  {
    title: 'Estudante Dedicado',
    description:  'Complete 3 sessões de estudo hoje',
    xpReward: 100,
    type: 'daily' as const,
    requirement: { action: 'study_session' as const, target: 3 },
  },
  {
    title: 'Criador Prolífico',
    description: 'Crie 5 prompts hoje',
    xpReward:  100,
    type: 'daily' as const,
    requirement:  { action: 'create_prompt' as const, target: 5 },
  },

  // Weekly Missions
  {
    title: 'Semana Produtiva',
    description: 'Complete 10 sessões de estudo esta semana',
    xpReward: 300,
    type: 'weekly' as const,
    requirement:  { action: 'study_session' as const, target: 10 },
  },
  {
    title: 'Biblioteca Expandida',
    description: 'Crie 15 prompts esta semana',
    xpReward: 250,
    type: 'weekly' as const,
    requirement:  { action: 'create_prompt' as const, target: 15 },
  },
  {
    title: 'Revisões Completas',
    description: 'Complete 5 revisões esta semana',
    xpReward: 200,
    type: 'weekly' as const,
    requirement:  { action: 'complete_review' as const, target:  5 },
  },
  {
    title: 'Streak Semanal',
    description: 'Mantenha um streak de 7 dias',
    xpReward: 500,
    type: 'weekly' as const,
    requirement: { action: 'login_streak' as const, target: 7 },
  },
];

async function seedGamification() {
  try {
    logger.info('🌱 Iniciando seed de gamificação...');

    // Conectar ao banco
    await sequelize.authenticate();
    logger.info('✅ Conexão com banco estabelecida');

    // Limpar dados existentes
    logger.info('🗑️  Limpando dados existentes.. .');
    await Badge.destroy({ where: {}, truncate: true, cascade: true });
    await DailyMission.destroy({ where: {}, truncate: true, cascade: true });

    // Criar badges
    logger.info('🏅 Criando badges...');
    const createdBadges = await Badge.bulkCreate(badges);
    logger.info(`✅ ${createdBadges. length} badges criados`);

    // Criar missões
    logger.info('🎯 Criando missões diárias e semanais...');
    const createdMissions = await DailyMission.bulkCreate(dailyMissions);
    logger.info(`✅ ${createdMissions.length} missões criadas`);

    logger.info('');
    logger.info('🎉 Seed de gamificação concluído com sucesso!');
    logger.info('');
    logger.info('📊 Resumo: ');
    logger.info(`   - Badges Bronze: ${badges.filter(b => b.category === 'bronze').length}`);
    logger.info(`   - Badges Silver: ${badges.filter(b => b.category === 'silver').length}`);
    logger.info(`   - Badges Gold: ${badges.filter(b => b.category === 'gold').length}`);
    logger.info(`   - Badges Platinum: ${badges.filter(b => b. category === 'platinum').length}`);
    logger.info(`   - Missões Diárias: ${dailyMissions.filter(m => m.type === 'daily').length}`);
    logger.info(`   - Missões Semanais: ${dailyMissions.filter(m => m.type === 'weekly').length}`);

    process.exit(0);
  } catch (error:  any) {
    logger.error('❌ Erro ao fazer seed de gamificação', { error: error.message });
    process.exit(1);
  }
}

// Executar seed
seedGamification();
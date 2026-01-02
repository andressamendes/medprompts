// Sistema de Badges (Conquistas)

export type BadgeTier = 'bronze' | 'silver' | 'gold';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: BadgeTier;
  requirement: {
    type: 'xp' | 'prompts_used' | 'streak' | 'daily_missions' | 'level';
    value: number;
  };
  xpReward: number;
}

export interface UserBadges {
  earned: string[]; // IDs dos badges conquistados
  lastChecked: string;
}

export const BADGES: Badge[] = [
  // Badges de XP
  {
    id: 'xp_100',
    name: 'Primeiro Passo',
    description: 'Alcance 100 XP',
    icon: '🎯',
    tier: 'bronze',
    requirement: { type: 'xp', value: 100 },
    xpReward: 20,
  },
  {
    id: 'xp_500',
    name: 'Dedicado',
    description: 'Alcance 500 XP',
    icon: '💪',
    tier: 'silver',
    requirement: { type: 'xp', value: 500 },
    xpReward: 50,
  },
  {
    id: 'xp_1000',
    name: 'Mestre do Conhecimento',
    description: 'Alcance 1000 XP',
    icon: '👨‍⚕️',
    tier: 'gold',
    requirement: { type: 'xp', value: 1000 },
    xpReward: 100,
  },
  
  // Badges de Uso de Prompts
  {
    id: 'prompts_10',
    name: 'Explorador',
    description: 'Use 10 prompts diferentes',
    icon: '🔍',
    tier: 'bronze',
    requirement: { type: 'prompts_used', value: 10 },
    xpReward: 15,
  },
  {
    id: 'prompts_50',
    name: 'Pesquisador',
    description: 'Use 50 prompts diferentes',
    icon: '📚',
    tier: 'silver',
    requirement: { type: 'prompts_used', value: 50 },
    xpReward: 40,
  },
  {
    id: 'prompts_100',
    name: 'Cientista',
    description: 'Use 100 prompts diferentes',
    icon: '🔬',
    tier: 'gold',
    requirement: { type: 'prompts_used', value: 100 },
    xpReward: 80,
  },
  
  // Badges de Streak
  {
    id: 'streak_3',
    name: 'Consistente',
    description: 'Mantenha 3 dias de streak',
    icon: '🔥',
    tier: 'bronze',
    requirement: { type: 'streak', value: 3 },
    xpReward: 25,
  },
  {
    id: 'streak_7',
    name: 'Maratonista',
    description: 'Mantenha 7 dias de streak',
    icon: '⚡',
    tier: 'silver',
    requirement: { type: 'streak', value: 7 },
    xpReward: 50,
  },
  {
    id: 'streak_30',
    name: 'Inabalável',
    description: 'Mantenha 30 dias de streak',
    icon: '💎',
    tier: 'gold',
    requirement: { type: 'streak', value: 30 },
    xpReward: 150,
  },
  
  // Badges de Nível
  {
    id: 'level_2',
    name: 'Estudante',
    description: 'Alcance o nível 2',
    icon: '📖',
    tier: 'bronze',
    requirement: { type: 'level', value: 2 },
    xpReward: 10,
  },
  {
    id: 'level_4',
    name: 'Especialista em Formação',
    description: 'Alcance o nível 4',
    icon: '⚕️',
    tier: 'silver',
    requirement: { type: 'level', value: 4 },
    xpReward: 30,
  },
  {
    id: 'level_5',
    name: 'Mestre Completo',
    description: 'Alcance o nível máximo',
    icon: '👑',
    tier: 'gold',
    requirement: { type: 'level', value: 5 },
    xpReward: 100,
  },
];

const STORAGE_KEY = 'medprompts_user_badges';

export function loadUserBadges(): UserBadges {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as UserBadges;
    }
  } catch (error) {
    console.error('Erro ao carregar badges:', error);
  }
  
  return {
    earned: [],
    lastChecked: new Date().toISOString(),
  };
}

export function saveUserBadges(badges: UserBadges): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(badges));
    window.dispatchEvent(new Event('badgesUpdated'));
  } catch (error) {
    console.error('Erro ao salvar badges:', error);
  }
}

export function checkNewBadges(userProgress: {
  xp: number;
  totalPromptsUsed: number;
  streak: number;
  level: number;
}): Badge[] {
  const userBadges = loadUserBadges();
  const newBadges: Badge[] = [];
  
  for (const badge of BADGES) {
    // Já tem esse badge
    if (userBadges.earned.includes(badge.id)) {
      continue;
    }
    
    // Verificar requisito
    let earned = false;
    
    switch (badge.requirement.type) {
      case 'xp':
        earned = userProgress.xp >= badge.requirement.value;
        break;
      case 'prompts_used':
        earned = userProgress.totalPromptsUsed >= badge.requirement.value;
        break;
      case 'streak':
        earned = userProgress.streak >= badge.requirement.value;
        break;
      case 'level':
        earned = userProgress.level >= badge.requirement.value;
        break;
    }
    
    if (earned) {
      newBadges.push(badge);
      userBadges.earned.push(badge.id);
    }
  }
  
  if (newBadges.length > 0) {
    userBadges.lastChecked = new Date().toISOString();
    saveUserBadges(userBadges);
  }
  
  return newBadges;
}

export function getBadgesByTier(tier: BadgeTier): Badge[] {
  return BADGES.filter(b => b.tier === tier);
}

export function getUserBadgeProgress(userProgress: {
  xp: number;
  totalPromptsUsed: number;
  streak: number;
  level: number;
}): Array<{ badge: Badge; earned: boolean; progress: number }> {
  const userBadges = loadUserBadges();
  
  return BADGES.map(badge => {
    const earned = userBadges.earned.includes(badge.id);
    
    let currentValue = 0;
    switch (badge.requirement.type) {
      case 'xp':
        currentValue = userProgress.xp;
        break;
      case 'prompts_used':
        currentValue = userProgress.totalPromptsUsed;
        break;
      case 'streak':
        currentValue = userProgress.streak;
        break;
      case 'level':
        currentValue = userProgress.level;
        break;
    }
    
    const progress = Math.min((currentValue / badge.requirement.value) * 100, 100);
    
    return { badge, earned, progress };
  });
}

export function getTierColor(tier: BadgeTier): string {
  switch (tier) {
    case 'bronze':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'silver':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'gold':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  }
}

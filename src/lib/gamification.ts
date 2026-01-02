// Sistema de Gamificação - XP, Níveis e Streak

export interface UserProgress {
  xp: number;
  level: number;
  streak: number;
  lastUsedDate: string | null;
  totalPromptsUsed: number;
  history: PromptHistoryItem[];
}

export interface PromptHistoryItem {
  promptId: string;
  promptTitle: string;
  timestamp: string;
  xpEarned: number;
}

export interface Level {
  level: number;
  name: string;
  minXP: number;
  maxXP: number;
  color: string;
  icon: string;
}

// Definição dos níveis
export const LEVELS: Level[] = [
  { level: 1, name: 'Iniciante', minXP: 0, maxXP: 100, color: 'text-gray-600', icon: '🎓' },
  { level: 2, name: 'Estudante', minXP: 101, maxXP: 300, color: 'text-blue-600', icon: '📚' },
  { level: 3, name: 'Residente', minXP: 301, maxXP: 600, color: 'text-purple-600', icon: '🔬' },
  { level: 4, name: 'Especialista', minXP: 601, maxXP: 1000, color: 'text-green-600', icon: '⚕️' },
  { level: 5, name: 'Mestre', minXP: 1001, maxXP: Infinity, color: 'text-yellow-600', icon: '👨‍⚕️' },
];

// Constantes de XP
export const XP_PER_PROMPT_USE = 10;
export const XP_STREAK_BONUS = 5;
export const MAX_HISTORY_ITEMS = 10;

// Chave do LocalStorage
const STORAGE_KEY = 'medprompts_user_progress';

// Inicializar progresso do usuário
export function initializeProgress(): UserProgress {
  return {
    xp: 0,
    level: 1,
    streak: 0,
    lastUsedDate: null,
    totalPromptsUsed: 0,
    history: [],
  };
}

// Carregar progresso do LocalStorage
export function loadProgress(): UserProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const progress = JSON.parse(stored) as UserProgress;
      
      // Verificar e atualizar streak
      const updatedProgress = updateStreak(progress);
      
      return updatedProgress;
    }
  } catch (error) {
    console.error('Erro ao carregar progresso:', error);
  }
  
  return initializeProgress();
}

// Salvar progresso no LocalStorage
export function saveProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Erro ao salvar progresso:', error);
  }
}

// Calcular nível baseado em XP
export function calculateLevel(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

// Calcular progresso dentro do nível atual (0-100%)
export function calculateLevelProgress(xp: number): number {
  const level = calculateLevel(xp);
  
  if (level.maxXP === Infinity) {
    return 100; // Nível máximo
  }
  
  const xpInLevel = xp - level.minXP;
  const xpNeededForLevel = level.maxXP - level.minXP;
  
  return Math.round((xpInLevel / xpNeededForLevel) * 100);
}

// Atualizar streak baseado na última data de uso
export function updateStreak(progress: UserProgress): UserProgress {
  if (!progress.lastUsedDate) {
    return progress;
  }
  
  const today = new Date().toDateString();
  const lastUsed = new Date(progress.lastUsedDate).toDateString();
  
  if (today === lastUsed) {
    // Mesmo dia, mantém streak
    return progress;
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  
  if (lastUsed === yesterdayStr) {
    // Usou ontem, mantém streak
    return progress;
  }
  
  // Quebrou o streak
  return {
    ...progress,
    streak: 0,
  };
}

// Registrar uso de prompt
export function registerPromptUse(
  promptId: string,
  promptTitle: string
): { progress: UserProgress; xpEarned: number; leveledUp: boolean } {
  const progress = loadProgress();
  
  const today = new Date().toDateString();
  const lastUsed = progress.lastUsedDate ? new Date(progress.lastUsedDate).toDateString() : null;
  
  // Calcular XP ganho
  let xpEarned = XP_PER_PROMPT_USE;
  let newStreak = progress.streak;
  
  // Atualizar streak
  if (!lastUsed) {
    // Primeiro uso
    newStreak = 1;
  } else if (today !== lastUsed) {
    // Dia diferente
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    if (lastUsed === yesterdayStr) {
      // Usou ontem, incrementa streak
      newStreak = progress.streak + 1;
      xpEarned += XP_STREAK_BONUS * newStreak; // Bônus de streak
    } else {
      // Quebrou o streak
      newStreak = 1;
    }
  }
  // Se é o mesmo dia, mantém streak mas não ganha bônus extra
  
  const newXP = progress.xp + xpEarned;
  const oldLevel = calculateLevel(progress.xp);
  const newLevel = calculateLevel(newXP);
  const leveledUp = newLevel.level > oldLevel.level;
  
  // Adicionar ao histórico
  const historyItem: PromptHistoryItem = {
    promptId,
    promptTitle,
    timestamp: new Date().toISOString(),
    xpEarned,
  };
  
  const newHistory = [historyItem, ...progress.history].slice(0, MAX_HISTORY_ITEMS);
  
  const newProgress: UserProgress = {
    xp: newXP,
    level: newLevel.level,
    streak: newStreak,
    lastUsedDate: new Date().toISOString(),
    totalPromptsUsed: progress.totalPromptsUsed + 1,
    history: newHistory,
  };
  
  saveProgress(newProgress);
  
  return { progress: newProgress, xpEarned, leveledUp };
}

// Obter próximo nível
export function getNextLevel(currentXP: number): Level | null {
  const currentLevel = calculateLevel(currentXP);
  const nextLevelIndex = LEVELS.findIndex(l => l.level === currentLevel.level) + 1;
  
  if (nextLevelIndex < LEVELS.length) {
    return LEVELS[nextLevelIndex];
  }
  
  return null; // Já está no nível máximo
}

// Calcular XP necessário para próximo nível
export function getXPToNextLevel(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP);
  
  if (currentLevel.maxXP === Infinity) {
    return 0; // Nível máximo
  }
  
  return currentLevel.maxXP - currentXP;
}

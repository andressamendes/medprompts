// Sistema de Desafios Semanais

export interface WeeklyChallengeTask {
  id: string;
  type: 'clinical-case' | 'anatomy' | 'mnemonic' | 'prompt-usage';
  title: string;
  description: string;
  target: number;
  current: number;
  xpReward: number;
}

export interface WeeklyChallenge {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  title: string;
  description: string;
  tasks: WeeklyChallengeTask[];
  totalXP: number;
  badgeReward: {
    id: string;
    name: string;
    icon: string;
  };
  completed: boolean;
}

export interface WeeklyChallengeState {
  currentChallenge: WeeklyChallenge | null;
  completedChallenges: string[];
  totalChallengesCompleted: number;
}

const STORAGE_KEY = 'medprompts_weekly_challenge';

// Inicializar estado
export function initializeWeeklyChallengeState(): WeeklyChallengeState {
  return {
    currentChallenge: null,
    completedChallenges: [],
    totalChallengesCompleted: 0,
  };
}

// Carregar estado
export function loadWeeklyChallengeState(): WeeklyChallengeState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const state = JSON.parse(stored) as WeeklyChallengeState;
      
      // Verificar se precisa gerar novo desafio
      if (state.currentChallenge) {
        const endDate = new Date(state.currentChallenge.endDate);
        const now = new Date();
        
        if (now > endDate) {
          // Desafio expirou, gerar novo
          return generateNewChallenge(state);
        }
      } else {
        // Não há desafio, gerar
        return generateNewChallenge(state);
      }
      
      return state;
    }
  } catch (error) {
    console.error('Erro ao carregar desafio semanal:', error);
  }
  
  return generateNewChallenge(initializeWeeklyChallengeState());
}

// Salvar estado
export function saveWeeklyChallengeState(state: WeeklyChallengeState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('weeklyChallengeUpdated'));
  } catch (error) {
    console.error('Erro ao salvar desafio semanal:', error);
  }
}

// Gerar novo desafio semanal
function generateNewChallenge(currentState: WeeklyChallengeState): WeeklyChallengeState {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 7);
  
  const weekNumber = getWeekNumber(now);
  
  const newChallenge: WeeklyChallenge = {
    id: `challenge-w${weekNumber}`,
    weekNumber,
    startDate: now.toISOString(),
    endDate: endDate.toISOString(),
    title: 'Mestre dos Casos Clínicos',
    description: 'Resolva casos clínicos e memorize estruturas anatômicas!',
    tasks: [
      {
        id: 'task-1',
        type: 'clinical-case',
        title: 'Resolver 3 casos clínicos',
        description: 'Complete 3 casos clínicos validados diferentes',
        target: 3,
        current: 0,
        xpReward: 50,
      },
      {
        id: 'task-2',
        type: 'mnemonic',
        title: 'Memorizar 10 mnemônicos',
        description: 'Visualize e copie 10 mnemônicos anatômicos',
        target: 10,
        current: 0,
        xpReward: 30,
      },
      {
        id: 'task-3',
        type: 'prompt-usage',
        title: 'Usar 15 prompts',
        description: 'Utilize 15 prompts de qualquer categoria',
        target: 15,
        current: 0,
        xpReward: 20,
      },
    ],
    totalXP: 100,
    badgeReward: {
      id: `badge-week-${weekNumber}`,
      name: `Desafiante Semanal #${weekNumber}`,
      icon: '🏆',
    },
    completed: false,
  };
  
  return {
    ...currentState,
    currentChallenge: newChallenge,
  };
}

// Atualizar progresso de tarefa
export function updateChallengeProgress(
  taskType: WeeklyChallengeTask['type'],
  increment: number = 1
): { updated: boolean; tasksCompleted: WeeklyChallengeTask[]; challengeCompleted: boolean } {
  const state = loadWeeklyChallengeState();
  
  if (!state.currentChallenge) {
    return { updated: false, tasksCompleted: [], challengeCompleted: false };
  }
  
  const tasksCompleted: WeeklyChallengeTask[] = [];
  let challengeCompleted = false;
  
  state.currentChallenge.tasks.forEach(task => {
    if (task.type === taskType && task.current < task.target) {
      const wasIncomplete = task.current < task.target;
      task.current = Math.min(task.current + increment, task.target);
      
      if (wasIncomplete && task.current >= task.target) {
        tasksCompleted.push(task);
      }
    }
  });
  
  // Verificar se todas as tarefas foram completadas
  const allTasksComplete = state.currentChallenge.tasks.every(t => t.current >= t.target);
  
  if (allTasksComplete && !state.currentChallenge.completed) {
    state.currentChallenge.completed = true;
    state.completedChallenges.push(state.currentChallenge.id);
    state.totalChallengesCompleted++;
    challengeCompleted = true;
  }
  
  saveWeeklyChallengeState(state);
  
  return { updated: true, tasksCompleted, challengeCompleted };
}

// Obter número da semana no ano
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Calcular tempo restante
export function getTimeRemaining(endDate: string): string {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) {
    return 'Expirado';
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h restantes`;
  }
  return `${hours}h restantes`;
}

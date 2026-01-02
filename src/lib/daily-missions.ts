// Sistema de Missões Diárias

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: {
    type: 'use_prompts' | 'use_category' | 'maintain_streak';
    value: number;
    category?: string;
  };
  xpReward: number;
  progress: number;
  completed: boolean;
}

export interface DailyMissionsState {
  date: string; // YYYY-MM-DD
  missions: DailyMission[];
  completedCount: number;
}

const STORAGE_KEY = 'medprompts_daily_missions';

// Pool de missões possíveis
const MISSION_POOL: Omit<DailyMission, 'progress' | 'completed'>[] = [
  {
    id: 'use_3_prompts',
    title: 'Aprendiz do Dia',
    description: 'Use 3 prompts hoje',
    icon: '📝',
    requirement: { type: 'use_prompts', value: 3 },
    xpReward: 30,
  },
  {
    id: 'use_5_prompts',
    title: 'Estudante Dedicado',
    description: 'Use 5 prompts hoje',
    icon: '📚',
    requirement: { type: 'use_prompts', value: 5 },
    xpReward: 50,
  },
  {
    id: 'use_estudos',
    title: 'Foco nos Estudos',
    description: 'Use 2 prompts de Estudos',
    icon: '🎓',
    requirement: { type: 'use_category', value: 2, category: 'estudos' },
    xpReward: 25,
  },
  {
    id: 'use_clinica',
    title: 'Prática Clínica',
    description: 'Use 2 prompts de Clínica',
    icon: '⚕️',
    requirement: { type: 'use_category', value: 2, category: 'clinica' },
    xpReward: 25,
  },
  {
    id: 'use_pesquisa',
    title: 'Pesquisador',
    description: 'Use 2 prompts de Pesquisa',
    icon: '🔬',
    requirement: { type: 'use_category', value: 2, category: 'pesquisa' },
    xpReward: 25,
  },
  {
    id: 'maintain_streak',
    title: 'Consistência',
    description: 'Mantenha seu streak ativo',
    icon: '🔥',
    requirement: { type: 'maintain_streak', value: 1 },
    xpReward: 20,
  },
];

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function generateDailyMissions(): DailyMission[] {
  // Selecionar 3 missões aleatórias
  const shuffled = [...MISSION_POOL].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);
  
  return selected.map(mission => ({
    ...mission,
    progress: 0,
    completed: false,
  }));
}

export function loadDailyMissions(): DailyMissionsState {
  const today = getTodayDateString();
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const state = JSON.parse(stored) as DailyMissionsState;
      
      // Se é um novo dia, gerar novas missões
      if (state.date !== today) {
        return {
          date: today,
          missions: generateDailyMissions(),
          completedCount: 0,
        };
      }
      
      return state;
    }
  } catch (error) {
    console.error('Erro ao carregar missões:', error);
  }
  
  // Primeira vez ou erro: gerar novas missões
  return {
    date: today,
    missions: generateDailyMissions(),
    completedCount: 0,
  };
}

export function saveDailyMissions(state: DailyMissionsState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('missionsUpdated'));
  } catch (error) {
    console.error('Erro ao salvar missões:', error);
  }
}

export function updateMissionProgress(
  promptCategory: string,
  currentStreak: number
): { completedMissions: DailyMission[]; totalXP: number } {
  const state = loadDailyMissions();
  const completedMissions: DailyMission[] = [];
  let totalXP = 0;
  
  state.missions.forEach(mission => {
    if (mission.completed) return;
    
    // Atualizar progresso baseado no tipo de missão
    switch (mission.requirement.type) {
      case 'use_prompts':
        mission.progress++;
        break;
        
      case 'use_category':
        if (mission.requirement.category === promptCategory) {
          mission.progress++;
        }
        break;
        
      case 'maintain_streak':
        if (currentStreak >= mission.requirement.value) {
          mission.progress = mission.requirement.value;
        }
        break;
    }
    
    // Verificar se completou
    if (mission.progress >= mission.requirement.value && !mission.completed) {
      mission.completed = true;
      state.completedCount++;
      completedMissions.push(mission);
      totalXP += mission.xpReward;
    }
  });
  
  saveDailyMissions(state);
  
  return { completedMissions, totalXP };
}

export function getMissionsCompletionRate(): number {
  const state = loadDailyMissions();
  if (state.missions.length === 0) return 0;
  return (state.completedCount / state.missions.length) * 100;
}

export function getAllMissionsCompleted(): boolean {
  const state = loadDailyMissions();
  return state.missions.every(m => m.completed);
}

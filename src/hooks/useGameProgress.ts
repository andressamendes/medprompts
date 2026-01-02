import { useCallback, useMemo } from 'react';
import { useSecureStorage } from './useSecureStorage';
import { validateNumber } from '@/lib/validation';

/**
 * Estrutura de dados de progresso de gamificação
 */
export interface GameProgress {
  xp: number;
  level: number;
  streak: number;
  lastLoginDate: string | null;
  totalPromptsUsed: number;
  totalStudyTime: number; // em minutos
  completedMissions: string[];
  badges: string[];
  history: StudySession[];
}

/**
 * Sessão de estudo individual
 */
export interface StudySession {
  id: string;
  date: string;
  promptId: string;
  duration: number; // em minutos
  xpEarned: number;
}

/**
 * Valores padrão para novo usuário
 */
const DEFAULT_PROGRESS: GameProgress = {
  xp: 0,
  level: 1,
  streak: 0,
  lastLoginDate: null,
  totalPromptsUsed: 0,
  totalStudyTime: 0,
  completedMissions: [],
  badges: [],
  history: [],
};

const PROGRESS_KEY = 'medprompts-progress';

/**
 * Constantes de gamificação
 */
const XP_PER_LEVEL = 1000;
const XP_PER_PROMPT = 50;
const XP_PER_STUDY_MINUTE = 5;
const MAX_LEVEL = 100;
const MAX_XP = MAX_LEVEL * XP_PER_LEVEL;

/**
 * Hook customizado para gerenciar progresso de gamificação
 * Todos os dados são criptografados com AES-256
 */
export function useGameProgress() {
  const [progress, setProgress, clearProgress, isLoading, error] = useSecureStorage<GameProgress>(
    PROGRESS_KEY,
    DEFAULT_PROGRESS
  );

  /**
   * Calcula nível baseado no XP atual
   */
  const calculateLevel = useCallback((xp: number): number => {
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    return Math.min(level, MAX_LEVEL);
  }, []);

  /**
   * Calcula XP necessário para próximo nível
   */
  const xpForNextLevel = useMemo(() => {
    if (progress.level >= MAX_LEVEL) return 0;
    return progress.level * XP_PER_LEVEL;
  }, [progress.level]);

  /**
   * Calcula progresso percentual para próximo nível
   */
  const levelProgress = useMemo(() => {
    if (progress.level >= MAX_LEVEL) return 100;
    const currentLevelXp = (progress.level - 1) * XP_PER_LEVEL;
    const xpInCurrentLevel = progress.xp - currentLevelXp;
    return (xpInCurrentLevel / XP_PER_LEVEL) * 100;
  }, [progress.xp, progress.level]);

  /**
   * Adiciona XP e recalcula nível
   */
  const addXP = useCallback(
    async (amount: number, reason?: string) => {
      // Valida quantidade de XP
      const validation = validateNumber(amount, { min: 0, max: 1000, integer: true });
      if (!validation.valid) {
        console.warn('XP inválido:', validation.error);
        return;
      }

      try {
        await setProgress((prev) => {
          const newXp = Math.min(prev.xp + validation.value, MAX_XP);
          const newLevel = calculateLevel(newXp);

          console.info(`✨ +${validation.value} XP${reason ? ` (${reason})` : ''}`);

          return {
            ...prev,
            xp: newXp,
            level: newLevel,
          };
        });
      } catch (err) {
        console.error('Erro ao adicionar XP:', err);
      }
    },
    [setProgress, calculateLevel]
  );

  /**
   * Atualiza streak de dias consecutivos
   */
  const updateStreak = useCallback(async () => {
    try {
      await setProgress((prev) => {
        const today = new Date().toISOString().split('T')[0];
        const lastLogin = prev.lastLoginDate;

        // Primeiro login
        if (!lastLogin) {
          return {
            ...prev,
            streak: 1,
            lastLoginDate: today,
          };
        }

        // Já logou hoje
        if (lastLogin === today) {
          return prev;
        }

        // Verifica se é dia consecutivo
        const lastDate = new Date(lastLogin);
        const todayDate = new Date(today);
        const diffTime = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        let newStreak = prev.streak;

        if (diffDays === 1) {
          // Dia consecutivo - incrementa streak
          newStreak = prev.streak + 1;
          console.info(`🔥 Streak mantido: ${newStreak} dias!`);
        } else if (diffDays > 1) {
          // Quebrou o streak
          newStreak = 1;
          console.warn('💔 Streak quebrado. Começando novo streak!');
        }

        return {
          ...prev,
          streak: newStreak,
          lastLoginDate: today,
        };
      });
    } catch (err) {
      console.error('Erro ao atualizar streak:', err);
    }
  }, [setProgress]);

  /**
   * Registra uso de prompt
   */
  const recordPromptUsage = useCallback(
    async (promptId: string) => {
      try {
        await setProgress((prev) => ({
          ...prev,
          totalPromptsUsed: prev.totalPromptsUsed + 1,
        }));

        // Adiciona XP por usar prompt
        await addXP(XP_PER_PROMPT, 'Prompt usado');
      } catch (err) {
        console.error('Erro ao registrar uso de prompt:', err);
      }
    },
    [setProgress, addXP]
  );

  /**
   * Registra sessão de estudo
   */
  const recordStudySession = useCallback(
    async (promptId: string, durationMinutes: number) => {
      // Valida duração
      const validation = validateNumber(durationMinutes, { min: 1, max: 480, integer: true });
      if (!validation.valid) {
        console.warn('Duração inválida:', validation.error);
        return;
      }

      try {
        const session: StudySession = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date: new Date().toISOString(),
          promptId,
          duration: validation.value,
          xpEarned: validation.value * XP_PER_STUDY_MINUTE,
        };

        await setProgress((prev) => ({
          ...prev,
          totalStudyTime: prev.totalStudyTime + validation.value,
          history: [...prev.history.slice(-99), session], // Mantém últimas 100 sessões
        }));

        // Adiciona XP por tempo de estudo
        await addXP(session.xpEarned, `${validation.value} min de estudo`);
      } catch (err) {
        console.error('Erro ao registrar sessão de estudo:', err);
      }
    },
    [setProgress, addXP]
  );

  /**
   * Completa missão diária
   */
  const completeMission = useCallback(
    async (missionId: string, xpReward: number) => {
      try {
        await setProgress((prev) => {
          // Verifica se já completou
          if (prev.completedMissions.includes(missionId)) {
            return prev;
          }

          return {
            ...prev,
            completedMissions: [...prev.completedMissions, missionId],
          };
        });

        // Adiciona XP da recompensa
        await addXP(xpReward, `Missão completada: ${missionId}`);
      } catch (err) {
        console.error('Erro ao completar missão:', err);
      }
    },
    [setProgress, addXP]
  );

  /**
   * Desbloqueia badge
   */
  const unlockBadge = useCallback(
    async (badgeId: string) => {
      try {
        await setProgress((prev) => {
          // Verifica se já tem
          if (prev.badges.includes(badgeId)) {
            return prev;
          }

          console.info(`🏆 Badge desbloqueado: ${badgeId}`);

          return {
            ...prev,
            badges: [...prev.badges, badgeId],
          };
        });
      } catch (err) {
        console.error('Erro ao desbloquear badge:', err);
      }
    },
    [setProgress]
  );

  /**
   * Reseta progresso (cuidado!)
   */
  const resetProgress = useCallback(() => {
    if (confirm('⚠️ Tem certeza que deseja resetar todo o progresso? Esta ação não pode ser desfeita!')) {
      clearProgress();
      console.warn('🔄 Progresso resetado');
    }
  }, [clearProgress]);

  return {
    // Estados
    progress,
    isLoading,
    error,

    // Dados calculados
    xpForNextLevel,
    levelProgress,

    // Ações
    addXP,
    updateStreak,
    recordPromptUsage,
    recordStudySession,
    completeMission,
    unlockBadge,
    resetProgress,
  };
}

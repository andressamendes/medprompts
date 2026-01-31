import { useState, useEffect, useCallback } from 'react';
import studyRoomService from '@/services/studyRoom.service';
import { User, UserStatus, StudyRoom, RoomStats } from '@/types/studyRoom.types';
import { AvatarCustomization, AvatarType, ClassYear } from '@/types/avatar.types';
import { InteractionSuggestion } from '@/services/interaction.service';

export interface PomodoroSuggestion {
  status: UserStatus;
  suggestions: InteractionSuggestion[];
  message: string;
}

/**
 * Hook customizado para gerenciar estado da Study Room
 */
export const useStudyRoom = (
  currentUserName: string = 'Você',
  initialStatus: UserStatus = 'FOCUS',
  initialAvatar?: AvatarCustomization
) => {
  const [room, setRoom] = useState<StudyRoom | null>(null);
  const [stats, setStats] = useState<RoomStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pomodoroSuggestion, setPomodoroSuggestion] = useState<PomodoroSuggestion | null>(null);

  // Inicializar sala
  useEffect(() => {
    const initRoom = async () => {
      try {
        setIsLoading(true);
        const initializedRoom = await studyRoomService.initialize(
          currentUserName, 
          initialStatus,
          initialAvatar
        );
        setRoom(initializedRoom);
        setStats(studyRoomService.getRoomStats());
      } catch (error) {
        console.error('Erro ao inicializar sala:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initRoom();

    // Cleanup ao desmontar
    return () => {
      studyRoomService.cleanup();
    };
  }, [currentUserName, initialStatus, initialAvatar]);

  // Atualizar stats periodicamente
  useEffect(() => {
    if (!room) return;

    const interval = setInterval(() => {
      const updatedRoom = studyRoomService.getRoom();
      setRoom({ ...updatedRoom });
      setStats(studyRoomService.getRoomStats());
    }, 1000);

    return () => clearInterval(interval);
  }, [room]);

  // Atualizar status do usuário atual
  // generatePomodoroSuggestion é definido após este useCallback mas é estável
   
  const updateUserStatus = useCallback((newStatus: UserStatus) => {
    studyRoomService.updateCurrentUserStatus(newStatus);
    const updatedRoom = studyRoomService.getRoom();
    setRoom({ ...updatedRoom });
    setStats(studyRoomService.getRoomStats());

    // Gerar sugestões de móveis baseadas no novo status
    const currentUser = updatedRoom.users.find(u => u.id === 'current-user');
    if (currentUser) {
      generatePomodoroSuggestion(newStatus, currentUser);
    }
  }, []);

  // Atualizar avatar do usuário atual
  const updateUserAvatar = useCallback((avatarType: AvatarType, classYear: ClassYear) => {
    studyRoomService.updateCurrentUserAvatar(avatarType, classYear);
    const updatedRoom = studyRoomService.getRoom();
    setRoom({ ...updatedRoom });
  }, []);

  // Incrementar pomodoros do usuário atual
  const incrementPomodoros = useCallback(() => {
    studyRoomService.incrementCurrentUserPomodoros();
    const updatedRoom = studyRoomService.getRoom();
    setRoom({ ...updatedRoom });
  }, []);

  // Obter usuário atual
  const getCurrentUser = useCallback((): User | undefined => {
    return room?.users.find(u => u.id === 'current-user');
  }, [room]);

  // Obter outros usuários
  const getOtherUsers = useCallback((): User[] => {
    return room?.users.filter(u => u.id !== 'current-user') || [];
  }, [room]);

  // Gerar sugestões de móveis baseado no status Pomodoro
  const generatePomodoroSuggestion = useCallback((status: UserStatus, _user: User) => {
    let message = '';

    switch (status) {
      case 'FOCUS':
        message = '💻 Modo FOCO ativado! Que tal ir para um computador ou mesa de estudo?';
        break;
      case 'SHORT_BREAK':
        message = '☕ Pausa curta! Relaxe em uma cadeira confortável.';
        break;
      case 'LONG_BREAK':
        message = '😴 Pausa longa! Descanse em um leito da enfermaria.';
        break;
      case 'OFFLINE':
        message = '';
        break;
    }

    if (message) {
      setPomodoroSuggestion({
        status,
        suggestions: [], // Será preenchido pelo InteractionSystem no componente
        message
      });
    } else {
      setPomodoroSuggestion(null);
    }
  }, []);

  // Limpar sugestão Pomodoro
  const clearPomodoroSuggestion = useCallback(() => {
    setPomodoroSuggestion(null);
  }, []);

  return {
    stats,
    isLoading,
    currentUser: getCurrentUser(),
    otherUsers: getOtherUsers(),
    updateUserStatus,
    updateUserAvatar,
    incrementPomodoros,
    pomodoroSuggestion,
    clearPomodoroSuggestion,
  };
};

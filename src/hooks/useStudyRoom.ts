import { useState, useEffect, useCallback } from 'react';
import studyRoomService from '@/services/studyRoom.service';
import { User, UserStatus, StudyRoom, RoomStats } from '@/types/studyRoom.types';
import { AvatarCustomization, AvatarType, ClassYear } from '@/types/avatar.types';

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
  const updateUserStatus = useCallback((newStatus: UserStatus) => {
    studyRoomService.updateCurrentUserStatus(newStatus);
    const updatedRoom = studyRoomService.getRoom();
    setRoom({ ...updatedRoom });
    setStats(studyRoomService.getRoomStats());
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

  return {
    stats,
    isLoading,
    currentUser: getCurrentUser(),
    otherUsers: getOtherUsers(),
    updateUserStatus,
    updateUserAvatar,
    incrementPomodoros,
  };
};

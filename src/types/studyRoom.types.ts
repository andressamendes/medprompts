import { AvatarCustomization } from './avatar.types';

/**
 * Tipos TypeScript para o sistema de Study Room
 */

export type UserStatus = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK' | 'OFFLINE';

export interface Position {
  x: number;
  y: number;
}

export interface User {
  id: string;
  username: string;
  status: UserStatus;
  position: Position;
  pomodorosCompleted: number;
  joinedAt: Date;
  lastActivity: Date;
  avatar: AvatarCustomization;
}

export interface StudyRoom {
  id: string;
  name: string;
  capacity: number;
  users: User[];
  createdAt: Date;
}

export interface RoomStats {
  totalUsers: number;
  focusing: number;
  shortBreak: number;
  longBreak: number;
  offline: number;
  availableSeats: number;
}

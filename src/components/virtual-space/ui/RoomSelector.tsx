import React, { useState } from 'react';
import { GAME_CONFIG } from '../game/config';

interface RoomSelectorProps {
  currentRoom: string;
  onRoomChange: (room: string) => void;
}

export const RoomSelector: React.FC<RoomSelectorProps> = ({ currentRoom, onRoomChange }) => {
  const [isChanging, setIsChanging] = useState(false);

  const rooms = [
    { key: 'lobby', name: 'Lobby', icon: '🏥', color: 'bg-blue-600' },
    { key: 'emergency', name: 'Emergency', icon: '🚑', color: 'bg-red-600' },
    { key: 'ward', name: 'Ward', icon: '🏨', color: 'bg-green-600' },
    { key: 'icu', name: 'ICU', icon: '💉', color: 'bg-yellow-600' },
    { key: 'surgical', name: 'Surgical', icon: '⚕️', color: 'bg-purple-600' },
  ];

  const handleRoomChange = async (roomKey: string) => {
    if (roomKey === currentRoom || isChanging) return;

    setIsChanging(true);
    try {
      await onRoomChange(roomKey);
    } catch (error) {
      console.error('Failed to change room:', error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900/95 rounded-lg shadow-2xl border border-slate-700 overflow-hidden">
      <div className="flex items-center gap-2 p-2">
        {rooms.map((room) => (
          <button
            key={room.key}
            onClick={() => handleRoomChange(room.key)}
            disabled={isChanging}
            className={`
              flex flex-col items-center gap-1 px-4 py-2 rounded transition-all
              ${currentRoom === room.key ? room.color + ' text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}
              ${isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className="text-2xl">{room.icon}</span>
            <span className="text-xs font-medium">{room.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

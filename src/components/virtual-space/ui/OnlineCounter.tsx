import React, { useEffect, useState } from 'react';
import { NetworkManager } from '../game/managers/NetworkManager';
import { Users } from 'lucide-react';

interface OnlineCounterProps {
  networkManager: NetworkManager;
}

export const OnlineCounter: React.FC<OnlineCounterProps> = ({ networkManager }) => {
  const [playerCount, setPlayerCount] = useState(0);
  const [roomName, setRoomName] = useState('Lobby');

  useEffect(() => {
    const updateCount = (state: any) => {
      if (state?.players) {
        setPlayerCount(state.players.size);
      }

      if (state?.roomType) {
        const roomNames: Record<string, string> = {
          lobby: 'Lobby',
          emergency: 'Emergência',
          ward: 'Enfermaria',
          icu: 'UTI',
          surgical: 'Centro Cirúrgico',
        };
        setRoomName(roomNames[state.roomType] || state.roomType);
      }
    };

    networkManager.on('stateChange', updateCount);

    return () => {
      networkManager.off('stateChange', updateCount);
    };
  }, [networkManager]);

  return (
    <div className="fixed top-20 left-4 bg-slate-900/90 rounded-lg shadow-xl border border-slate-700 px-4 py-3 min-w-[180px]">
      <div className="flex items-center gap-3">
        {/* Icon with pulse animation */}
        <div className="relative">
          <Users className="w-5 h-5 text-green-400" />
          {playerCount > 0 && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          )}
        </div>

        {/* Content */}
        <div>
          <div className="text-white font-semibold text-sm">
            {playerCount} {playerCount === 1 ? 'jogador' : 'jogadores'}
          </div>
          <div className="text-slate-400 text-xs">{roomName}</div>
        </div>
      </div>
    </div>
  );
};

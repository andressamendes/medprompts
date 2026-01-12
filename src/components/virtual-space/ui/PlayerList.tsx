import React, { useState, useEffect } from 'react';
import { NetworkManager } from '../game/managers/NetworkManager';

interface Player {
  userId: string;
  name: string;
  level: number;
  status: string;
}

interface PlayerListProps {
  networkManager: NetworkManager;
}

export const PlayerList: React.FC<PlayerListProps> = ({ networkManager }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const updatePlayers = (state: any) => {
      const playerList: Player[] = [];

      state.players.forEach((playerData: any) => {
        playerList.push({
          userId: playerData.userId,
          name: playerData.name,
          level: playerData.level,
          status: playerData.status,
        });
      });

      // Sort by level descending
      playerList.sort((a, b) => b.level - a.level);

      setPlayers(playerList);
    };

    networkManager.on('stateChange', updatePlayers);

    return () => {
      networkManager.off('stateChange', updatePlayers);
    };
  }, [networkManager]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'away':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'idle':
        return 'Idle';
      case 'away':
        return 'Away';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="fixed top-4 right-4 w-72 bg-slate-900/95 rounded-lg shadow-2xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <h3 className="text-white font-semibold">
          Players ({players.length})
        </h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          {isOpen ? '−' : '+'}
        </button>
      </div>

      {isOpen && (
        <div className="max-h-96 overflow-y-auto p-3 space-y-2">
          {players.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">
              No players in room
            </p>
          ) : (
            players.map((player) => (
              <div
                key={player.userId}
                className="flex items-center justify-between p-2 bg-slate-800 rounded hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Status indicator */}
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusColor(player.status)}`}
                    title={getStatusLabel(player.status)}
                  />

                  {/* Name and level */}
                  <div>
                    <p className="text-white text-sm font-medium">{player.name}</p>
                    <p className="text-slate-400 text-xs">Level {player.level}</p>
                  </div>
                </div>

                {/* Level badge */}
                <div className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                  Lv.{player.level}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

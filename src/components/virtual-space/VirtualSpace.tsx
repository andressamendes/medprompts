import React, { useEffect, useRef, useState } from 'react';
import { PhaserGame } from './game/PhaserGame';
import { ChatOverlay } from './ui/ChatOverlay';
import { PlayerList } from './ui/PlayerList';
import { RoomSelector } from './ui/RoomSelector';
import { XPNotification } from './ui/XPNotification';
import { OnlineCounter } from './ui/OnlineCounter';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const VirtualSpace: React.FC = () => {
  const gameRef = useRef<PhaserGame | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentRoom, setCurrentRoom] = useState('lobby');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user, getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    if (!user) {
      navigate('/login');
      return;
    }

    const initializeGame = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get JWT token
        const token = await getToken();

        if (!token) {
          throw new Error('No authentication token available');
        }

        // Create and initialize game
        const game = new PhaserGame();
        await game.initialize('phaser-game', token, {
          userId: user.id,
          name: user.name,
          level: user.level || 1,
        });

        gameRef.current = game;
        setIsInitialized(true);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize game:', err);
        
        // Mensagem de erro mais detalhada
        let errorMessage = 'Failed to connect to game server';
        if (err instanceof Error) {
          if (err.message.includes('timeout')) {
            errorMessage = 'Game server is not responding. Please check if the Colyseus server is running on port 2567.';
          } else if (err.message.includes('WebSocket')) {
            errorMessage = 'Cannot connect to game server. Make sure the Colyseus server is running.';
          } else if (err.message.includes('Phaser')) {
            errorMessage = 'Game engine failed to initialize. Please try refreshing the page.';
          } else {
            errorMessage = err.message;
          }
        }
        
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    initializeGame();

    // Cleanup on unmount
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
    };
  }, [user, navigate, getToken]);

  const handleRoomChange = async (roomKey: string) => {
    if (!gameRef.current || !user) return;

    try {
      const token = await getToken();

      if (!token) {
        throw new Error('No authentication token');
      }

      await gameRef.current.joinRoom(roomKey, token, {
        userId: user.id,
        name: user.name,
        level: user.level || 1,
      });

      setCurrentRoom(roomKey);
    } catch (err) {
      console.error('Failed to change room:', err);
      setError('Failed to change room');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Connecting to Virtual Space...</p>
          <p className="text-slate-400 text-sm mt-2">Loading game assets</p>
          <p className="text-slate-500 text-xs mt-1">Make sure the Colyseus server is running on port 2567</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="max-w-md w-full bg-slate-900 rounded-lg p-8 border border-red-600">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Connection Error</h2>
          <p className="text-white mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Retry Connection
            </button>
            <button
              onClick={handleBack}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
            >
              Go Back to Hub
            </button>
          </div>
          <div className="mt-6 text-sm text-slate-400">
            <p className="font-semibold mb-1">Troubleshooting:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Make sure the Colyseus server is running</li>
              <li>Check if port 2567 is accessible</li>
              <li>Verify your internet connection</li>
              <li>Try refreshing the page</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="fixed top-4 left-4 z-50 px-4 py-2 bg-slate-800/80 text-white rounded hover:bg-slate-700 transition-colors flex items-center gap-2"
      >
        <span>←</span>
        <span>Back to Hub</span>
      </button>

      {/* Phaser game container */}
      <div
        id="phaser-game"
        ref={containerRef}
        className="w-full h-full flex items-center justify-center"
      />

      {/* UI Overlays */}
      {isInitialized && gameRef.current && (
        <>
          <RoomSelector currentRoom={currentRoom} onRoomChange={handleRoomChange} />
          <OnlineCounter networkManager={gameRef.current.getNetworkManager()} />
          <PlayerList networkManager={gameRef.current.getNetworkManager()} />
          <ChatOverlay networkManager={gameRef.current.getNetworkManager()} />
          <XPNotification networkManager={gameRef.current.getNetworkManager()} />
        </>
      )}

      {/* Controls hint */}
      {isInitialized && (
        <div className="fixed bottom-4 right-4 bg-slate-900/80 rounded-lg p-3 text-sm text-slate-300">
          <p className="font-semibold mb-1">Controls:</p>
          <p>WASD or Arrow Keys - Move</p>
          <p>Click players - Interact</p>
        </div>
      )}
    </div>
  );
};

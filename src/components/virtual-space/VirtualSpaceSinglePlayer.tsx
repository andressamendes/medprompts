import React, { useEffect, useRef, useState } from 'react';
import { PhaserGameSinglePlayer } from './game/PhaserGameSinglePlayer';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const VirtualSpaceSinglePlayer: React.FC = () => {
  const gameRef = useRef<PhaserGameSinglePlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentRoom, setCurrentRoom] = useState('lobby');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initializationStep, setInitializationStep] = useState('Starting game engine...');

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    if (!user) {
      navigate('/login');
      return;
    }

    const initializeGame = () => {
      try {
        setIsLoading(true);
        setError(null);
        setInitializationStep('Checking container...');

        // Check if container exists
        if (!containerRef.current) {
          throw new Error('Game container not found');
        }

        setInitializationStep('Creating game instance...');
        
        // Create and initialize game
        const game = new PhaserGameSinglePlayer();
        
        setInitializationStep('Initializing Phaser engine...');
        game.initialize('phaser-game', {
          userId: user.id,
          name: user.name,
          level: user.level || 1,
        });

        gameRef.current = game;
        
        // Check if game initialized successfully after a delay
        setTimeout(() => {
          if (game.isGameInitialized && !game.isGameInitialized()) {
            console.warn('Game initialization may have failed');
            setInitializationStep('Game initialization may be stuck...');
          }
        }, 3000);
        
        setIsLoading(false);
        setInitializationStep('Game ready!');
        
      } catch (err) {
        console.error('Failed to initialize game:', err);
        
        // Mensagem de erro mais detalhada
        let errorMessage = 'Failed to initialize game';
        if (err instanceof Error) {
          if (err.message.includes('Phaser')) {
            errorMessage = 'Game engine failed to initialize. Please try refreshing the page.';
          } else if (err.message.includes('container')) {
            errorMessage = 'Game container not found. Please refresh the page.';
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
  }, [user, navigate]);

  const handleRoomChange = (roomKey: string) => {
    if (!gameRef.current || !user) return;

    try {
      gameRef.current.joinRoom(roomKey, {
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

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setInitializationStep('Retrying initialization...');
    
    // Force re-initialization
    if (gameRef.current) {
      gameRef.current.destroy();
      gameRef.current = null;
    }
    
    // Small delay before retry
    setTimeout(() => {
      if (user) {
        try {
          const game = new PhaserGameSinglePlayer();
          game.initialize('phaser-game', {
            userId: user.id,
            name: user.name,
            level: user.level || 1,
          });
          gameRef.current = game;
          setIsLoading(false);
        } catch (err) {
          console.error('Retry failed:', err);
          setError('Retry failed. Please refresh the page.');
          setIsLoading(false);
        }
      }
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg mb-2">Loading Virtual Space...</p>
          <p className="text-slate-400 text-sm mb-4">{initializationStep}</p>
          <div className="text-slate-500 text-xs space-y-1">
            <p>• Make sure JavaScript is enabled</p>
            <p>• Check your browser console for errors</p>
            <p>• Try refreshing if this takes too long</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="max-w-md w-full bg-slate-900 rounded-lg p-8 border border-red-600">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Game Error</h2>
          <p className="text-white mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
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
              <li>Refresh the page (F5 or Ctrl+R)</li>
              <li>Check browser console for errors</li>
              <li>Try a different browser</li>
              <li>Disable browser extensions</li>
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

      {/* Room selector */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {['lobby', 'emergency', 'ward', 'icu', 'surgical'].map((room) => (
          <button
            key={room}
            onClick={() => handleRoomChange(room)}
            className={`px-3 py-2 rounded transition-colors ${
              currentRoom === room
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {room.charAt(0).toUpperCase() + room.slice(1)}
          </button>
        ))}
      </div>

      {/* Phaser game container */}
      <div
        id="phaser-game"
        ref={containerRef}
        className="w-full h-full flex items-center justify-center"
      />

      {/* Debug info */}
      <div className="fixed top-16 left-4 bg-slate-900/80 rounded-lg p-3 text-sm text-slate-300">
        <p className="font-semibold mb-1">Debug Info:</p>
        <p>Status: <span className="text-green-400">Running</span></p>
        <p>Room: <span className="text-blue-400">{currentRoom}</span></p>
        <p>Engine: <span className="text-yellow-400">Phaser 3</span></p>
      </div>

      {/* Controls hint */}
      <div className="fixed bottom-4 right-4 bg-slate-900/80 rounded-lg p-3 text-sm text-slate-300">
        <p className="font-semibold mb-1">Controls:</p>
        <p>WASD or Arrow Keys - Move</p>
        <p>Space - Interact with objects</p>
      </div>

      {/* Game info */}
      <div className="fixed bottom-4 left-4 bg-slate-900/80 rounded-lg p-3 text-sm text-slate-300">
        <p className="font-semibold mb-1">Virtual Space (Single Player)</p>
        <p>Current Room: <span className="text-blue-400">{currentRoom}</span></p>
        <p>Player: <span className="text-green-400">{user?.name}</span></p>
        <p>Level: <span className="text-yellow-400">{user?.level || 1}</span></p>
      </div>
    </div>
  );
};
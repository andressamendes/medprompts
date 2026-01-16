import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    Phaser: any;
    VirtualSpaceGame: any;
  }
}

export const VirtualSpaceFinal: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [phaserVersion, setPhaserVersion] = useState<string>('');
  const navigate = useNavigate();

  // Clean up game on unmount
  useEffect(() => {
    return () => {
      if (window.VirtualSpaceGame) {
        try {
          window.VirtualSpaceGame.destroy(true);
          window.VirtualSpaceGame = null;
        } catch (error) {
          console.error('Error destroying game:', error);
        }
      }
    };
  }, []);

  // Load Phaser and initialize game
  useEffect(() => {
    async function initializeGame() {
      try {
        setStatus('loading');
        setErrorMessage('');
        
        // Step 1: Load Phaser if not already loaded
        if (!window.Phaser) {
          setErrorMessage('Loading game engine...');
          await loadPhaser();
        }
        
        // Step 2: Wait for container to be ready
        if (!containerRef.current) {
          throw new Error('Game container not found');
        }
        
        // Step 3: Initialize game
        setErrorMessage('Initializing game...');
        initializePhaserGame();
        
        // Step 4: Mark as ready
        setStatus('ready');
        setErrorMessage('');
        
      } catch (error) {
        console.error('Failed to initialize game:', error);
        setStatus('error');
        setErrorMessage(
          error instanceof Error 
            ? error.message 
            : 'Failed to initialize game. Please try again.'
        );
      }
    }

    initializeGame();
  }, []);

  const loadPhaser = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.Phaser) {
        setPhaserVersion(window.Phaser.VERSION);
        resolve();
        return;
      }

      // Try multiple CDN sources
      const cdnSources = [
        'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js',
        'https://unpkg.com/phaser@3.60.0/dist/phaser.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/phaser/3.60.0/phaser.min.js'
      ];

      let currentSourceIndex = 0;
      
      function tryNextSource() {
        if (currentSourceIndex >= cdnSources.length) {
          reject(new Error('Failed to load Phaser from all CDN sources'));
          return;
        }

        const source = cdnSources[currentSourceIndex];
        currentSourceIndex++;
        
        console.log(`Loading Phaser from: ${source}`);
        setErrorMessage(`Loading game engine from CDN (${currentSourceIndex}/${cdnSources.length})...`);
        
        const script = document.createElement('script');
        script.src = source;
        script.async = true;
        
        script.onload = () => {
          console.log(`✅ Phaser loaded from: ${source}`);
          setPhaserVersion(window.Phaser.VERSION);
          resolve();
        };
        
        script.onerror = () => {
          console.warn(`❌ Failed to load from: ${source}`);
          tryNextSource();
        };
        
        document.head.appendChild(script);
      }
      
      tryNextSource();
    });
  };

  const initializePhaserGame = () => {
    if (!window.Phaser || !containerRef.current) {
      throw new Error('Phaser not loaded or container not found');
    }

    // Destroy existing game
    if (window.VirtualSpaceGame) {
      window.VirtualSpaceGame.destroy(true);
    }

    // Ultra-simple game configuration
    const config = {
      type: window.Phaser.AUTO,
      parent: containerRef.current,
      width: 1280,
      height: 720,
      backgroundColor: '#1a1a2e',
      scale: {
        mode: window.Phaser.Scale.FIT,
        autoCenter: window.Phaser.Scale.CENTER_BOTH
      },
      scene: {
        create: function(this: any) {
          console.log('🎮 Game scene created');
          
          // Add title
          this.add.text(640, 100, 'Virtual Space', {
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold'
          }).setOrigin(0.5);
          
          // Add player
          const player = this.add.circle(640, 360, 30, 0x10b981);
          
          // Add player label
          this.add.text(640, 300, 'You', {
            fontSize: '24px',
            color: '#10b981'
          }).setOrigin(0.5);
          
          // Add controls info
          this.add.text(640, 500, 'Use WASD or Arrow Keys to move', {
            fontSize: '20px',
            color: '#93c5fd'
          }).setOrigin(0.5);
          
          // Add some NPCs
          const npcPositions = [
            { x: 400, y: 200, color: 0x3b82f6, name: 'Dr. Smith' },
            { x: 880, y: 200, color: 0x8b5cf6, name: 'Nurse Johnson' },
            { x: 400, y: 520, color: 0xef4444, name: 'Patient' },
            { x: 880, y: 520, color: 0xf59e0b, name: 'Resident' }
          ];
          
          npcPositions.forEach(({ x, y, color, name }) => {
            this.add.circle(x, y, 20, color);
            this.add.text(x, y - 40, name, {
              fontSize: '16px',
              color: '#ffffff'
            }).setOrigin(0.5);
          });
          
          // Setup keyboard input
          this.cursors = this.input.keyboard.createCursorKeys();
          this.wasd = {
            up: this.input.keyboard.addKey(window.Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(window.Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(window.Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(window.Phaser.Input.Keyboard.KeyCodes.D)
          };
          
          this.player = player;
          this.playerSpeed = 200;
          
          console.log('✅ Game initialized successfully');
        },
        
        update: function(this: any) {
          if (!this.player) return;
          
          // Reset velocity
          this.player.x += 0;
          this.player.y += 0;
          
          // Handle movement
          if (this.cursors.left.isDown || this.wasd.left.isDown) {
            this.player.x -= this.playerSpeed * (this.game.loop.delta / 1000);
          }
          if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.player.x += this.playerSpeed * (this.game.loop.delta / 1000);
          }
          if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.player.y -= this.playerSpeed * (this.game.loop.delta / 1000);
          }
          if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.player.y += this.playerSpeed * (this.game.loop.delta / 1000);
          }
          
          // Keep player within bounds
          this.player.x = Phaser.Math.Clamp(this.player.x, 30, 1250);
          this.player.y = Phaser.Math.Clamp(this.player.y, 30, 690);
        }
      }
    };

    try {
      window.VirtualSpaceGame = new window.Phaser.Game(config);
      
      // Handle game errors
      window.VirtualSpaceGame.events.on('error', (error: any) => {
        console.error('🎮 Game error:', error);
        setStatus('error');
        setErrorMessage(`Game error: ${error.message}`);
      });
      
    } catch (error) {
      console.error('Failed to create Phaser game:', error);
      throw new Error(`Failed to create game: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleRetry = async () => {
    setStatus('loading');
    setErrorMessage('');
    
    // Clean up
    if (window.VirtualSpaceGame) {
      window.VirtualSpaceGame.destroy(true);
      window.VirtualSpaceGame = null;
    }
    
    // Reinitialize
    try {
      await loadPhaser();
      initializePhaserGame();
      setStatus('ready');
    } catch (error) {
      setStatus('error');
      setErrorMessage('Failed to retry. Please refresh the page.');
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg mb-2">Loading Virtual Space...</p>
          <p className="text-slate-400 text-sm">
            {errorMessage || 'Initializing game engine...'}
          </p>
          {phaserVersion && (
            <p className="text-slate-500 text-xs mt-2">
              Phaser v{phaserVersion}
            </p>
          )}
          <button
            onClick={handleBack}
            className="mt-6 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="max-w-md w-full bg-slate-900 rounded-lg p-8 border border-red-600">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Game Error</h2>
          <p className="text-white mb-4">{errorMessage}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleRefresh}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
            >
              Refresh Page
            </button>
            <button
              onClick={handleBack}
              className="w-full px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors"
            >
              Go Back to Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950">
      <button
        onClick={handleBack}
        className="fixed top-4 left-4 z-50 px-4 py-2 bg-slate-800/80 text-white rounded hover:bg-slate-700 transition-colors flex items-center gap-2"
      >
        <span>←</span>
        <span>Back to Hub</span>
      </button>

      <div className="fixed top-4 right-4 z-50 bg-slate-900/80 rounded-lg p-3 text-sm text-slate-300">
        <p className="font-semibold mb-1">Virtual Space</p>
        <p>Status: <span className="text-green-400">Ready</span></p>
        {phaserVersion && (
          <p>Engine: <span className="text-yellow-400">Phaser v{phaserVersion}</span></p>
        )}
      </div>

      <div
        ref={containerRef}
        className="w-full h-full"
      />

      <div className="fixed bottom-4 left-4 bg-slate-900/80 rounded-lg p-3 text-sm text-slate-300">
        <p className="font-semibold mb-1">Controls:</p>
        <p>WASD or Arrow Keys - Move</p>
      </div>

      <div className="fixed bottom-4 right-4 bg-slate-900/80 rounded-lg p-3 text-sm text-slate-300">
        <p className="font-semibold mb-1">Tips:</p>
        <p>• Move around to explore</p>
        <p>• Talk to NPCs (coming soon)</p>
      </div>
    </div>
  );
};
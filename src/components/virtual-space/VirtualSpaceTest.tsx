import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    Phaser: any;
    VirtualSpaceGame: any;
  }
}

export const VirtualSpaceTest: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phaserLoaded, setPhaserLoaded] = useState(false);
  const navigate = useNavigate();

  // Load Phaser from CDN
  useEffect(() => {
    if (window.Phaser) {
      setPhaserLoaded(true);
      return;
    }

    console.log('🔄 Loading Phaser from CDN...');
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js';
    script.async = true;
    
    script.onload = () => {
      console.log('✅ Phaser loaded from CDN');
      setPhaserLoaded(true);
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load Phaser from CDN');
      setError('Failed to load game engine. Please check your internet connection.');
      setIsLoading(false);
    };
    
    document.head.appendChild(script);
    
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize game when Phaser is loaded
  useEffect(() => {
    if (!phaserLoaded || !containerRef.current) return;

    try {
      console.log('🔄 Initializing game...');
      
      // Simple game configuration
      const config = {
        type: window.Phaser.AUTO,
        parent: 'phaser-game',
        width: 1280,
        height: 720,
        backgroundColor: '#1a1a2e',
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0, x: 0 },
            debug: false
          }
        },
        scale: {
          mode: window.Phaser.Scale.FIT,
          autoCenter: window.Phaser.Scale.CENTER_BOTH
        },
        scene: {
          preload: function(this: any) {
            console.log('🎮 Game scene preload');
            // No external assets needed for simple version
          },
          create: function(this: any) {
            console.log('🎮 Game scene create');
            
            // Create player
            const player = this.add.circle(400, 300, 20, 0x10b981);
            this.physics.add.existing(player);
            player.body.setCollideWorldBounds(true);
            
            // Player name
            this.add.text(400, 250, 'Test Player', {
              fontSize: '16px',
              color: '#FFD700',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              padding: { x: 8, y: 4 }
            }).setOrigin(0.5);
            
            // Level badge
            this.add.text(400, 270, 'Level 1', {
              fontSize: '12px',
              color: '#FFD700',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              padding: { x: 6, y: 3 }
            }).setOrigin(0.5);
            
            // Room label
            this.add.text(20, 20, 'Virtual Space (Test Version)', {
              fontSize: '20px',
              color: '#ffffff',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              padding: { x: 10, y: 5 }
            }).setScrollFactor(0);
            
            // Instructions
            this.add.text(20, 60, 'WASD/Arrows: Move', {
              fontSize: '14px',
              color: '#ffffff',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              padding: { x: 8, y: 4 }
            }).setScrollFactor(0);
            
            // Create some NPCs
            for (let i = 0; i < 3; i++) {
              const npc = this.add.circle(100 + i * 200, 500, 15, 0x3b82f6);
              this.physics.add.existing(npc);
              npc.body.setVelocity(Math.random() * 100 - 50, Math.random() * 100 - 50);
              npc.body.setBounce(1, 1);
              npc.body.setCollideWorldBounds(true);
              
              this.add.text(npc.x, npc.y - 30, ['Dr. Smith', 'Nurse Johnson', 'Patient'][i], {
                fontSize: '12px',
                color: '#FFFFFF',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                padding: { x: 4, y: 2 }
              }).setOrigin(0.5);
            }
            
            // Setup keyboard input
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasd = {
              up: this.input.keyboard.addKey(window.Phaser.Input.Keyboard.KeyCodes.W),
              down: this.input.keyboard.addKey(window.Phaser.Input.Keyboard.KeyCodes.S),
              left: this.input.keyboard.addKey(window.Phaser.Input.Keyboard.KeyCodes.A),
              right: this.input.keyboard.addKey(window.Phaser.Input.Keyboard.KeyCodes.D)
            };
            
            // Store references
            this.player = player;
            
            console.log('✅ Game initialized successfully');
            setIsLoading(false);
          },
          update: function(this: any) {
            if (!this.player) return;
            
            // Handle movement
            const speed = 150;
            this.player.body.setVelocity(0);
            
            if (this.cursors.left.isDown || this.wasd.left.isDown) {
              this.player.body.setVelocityX(-speed);
            } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
              this.player.body.setVelocityX(speed);
            }
            
            if (this.cursors.up.isDown || this.wasd.up.isDown) {
              this.player.body.setVelocityY(-speed);
            } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
              this.player.body.setVelocityY(speed);
            }
            
            // Normalize diagonal movement
            if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
              this.player.body.velocity.x *= 0.707;
              this.player.body.velocity.y *= 0.707;
            }
          }
        }
      };
      
      // Create game
      const game = new window.Phaser.Game(config);
      window.VirtualSpaceGame = game;
      
      // Handle errors
      game.events.on('error', (error: any) => {
        console.error('🎮 Game error:', error);
        setError(`Game error: ${error.message}`);
        setIsLoading(false);
      });
      
    } catch (err) {
      console.error('❌ Failed to initialize game:', err);
      setError(`Failed to initialize game: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [phaserLoaded]);

  const handleBack = () => {
    // Clean up game
    if (window.VirtualSpaceGame) {
      window.VirtualSpaceGame.destroy(true);
      window.VirtualSpaceGame = null;
    }
    navigate('/');
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    
    // Clean up and reload
    if (window.VirtualSpaceGame) {
      window.VirtualSpaceGame.destroy(true);
      window.VirtualSpaceGame = null;
    }
    
    // Reload page
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading Virtual Space (Test)...</p>
          <p className="text-slate-400 text-sm mt-2">
            {phaserLoaded ? 'Initializing game...' : 'Loading game engine...'}
          </p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
          >
            Go Back
          </button>
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
              Retry
            </button>
            <button
              onClick={handleBack}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
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
        <p className="font-semibold mb-1">Virtual Space (Test Version)</p>
        <p>Player: <span className="text-green-400">Test Player</span></p>
        <p>Level: <span className="text-yellow-400">1</span></p>
      </div>

      <div
        id="phaser-game"
        ref={containerRef}
        className="w-full h-full flex items-center justify-center"
      />

      <div className="fixed bottom-4 right-4 bg-slate-900/80 rounded-lg p-3 text-sm text-slate-300">
        <p className="font-semibold mb-1">Controls:</p>
        <p>WASD or Arrow Keys - Move</p>
      </div>
    </div>
  );
};
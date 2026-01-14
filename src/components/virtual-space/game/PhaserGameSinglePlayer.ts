import Phaser from 'phaser';
import { PHASER_CONFIG } from './config';
import { LobbySceneSinglePlayer } from './scenes/LobbySceneSinglePlayer';
import { EmergencySceneSinglePlayer } from './scenes/EmergencySceneSinglePlayer';
import { WardSceneSinglePlayer } from './scenes/WardSceneSinglePlayer';
import { ICUSceneSinglePlayer } from './scenes/ICUSceneSinglePlayer';
import { SurgicalSceneSinglePlayer } from './scenes/SurgicalSceneSinglePlayer';

export class PhaserGameSinglePlayer {
  private game: Phaser.Game | null = null;
  private currentScene: string = 'LobbySceneSinglePlayer';
  private isInitialized: boolean = false;

  constructor() {
    // No network manager needed
  }

  initialize(containerId: string, userData: any): void {
    try {
      console.log('🔄 Initializing Phaser game...');
      
      // Check if container exists
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Container with id '${containerId}' not found`);
      }
      console.log(`✅ Container found: ${containerId}`);

      // Configure Phaser
      const config: Phaser.Types.Core.GameConfig = {
        ...PHASER_CONFIG,
        parent: containerId,
        scene: [], // Empty scene array - we'll add them manually
        callbacks: {
          postBoot: () => {
            console.log('✅ Phaser booted successfully');
          }
        }
      };

      console.log('🔄 Creating Phaser game instance...');
      
      // Create game instance
      this.game = new Phaser.Game(config);

      // Add error handling
      this.game.events.on('error', (error: any) => {
        console.error('❌ Phaser error:', error);
      });

      // Wait for game to be ready
      this.game.events.once('ready', () => {
        console.log('✅ Phaser game ready (Single Player)');

        try {
          // Add scenes manually
          this.game!.scene.add('LobbySceneSinglePlayer', LobbySceneSinglePlayer, false);
          this.game!.scene.add('EmergencySceneSinglePlayer', EmergencySceneSinglePlayer, false);
          this.game!.scene.add('WardSceneSinglePlayer', WardSceneSinglePlayer, false);
          this.game!.scene.add('ICUSceneSinglePlayer', ICUSceneSinglePlayer, false);
          this.game!.scene.add('SurgicalSceneSinglePlayer', SurgicalSceneSinglePlayer, false);

        console.log('✅ Scenes added to Phaser');
          this.isInitialized = true;

          // Connect to lobby by default
          this.joinRoom('lobby', userData);
        } catch (sceneError) {
          console.error('❌ Failed to add scenes:', sceneError);
          throw sceneError;
        }
      });
      
      // Add timeout for initialization
      setTimeout(() => {
        if (!this.isInitialized) {
          console.warn('⚠️ Phaser initialization taking longer than expected...');
        }
      }, 5000);
      
    } catch (error) {
      console.error('❌ Failed to initialize Phaser game:', error);
      throw error;
    }
  }

  joinRoom(roomType: string, userData: any): void {
    try {
      if (!this.game) {
        throw new Error('Game not initialized');
      }

      console.log(`🔄 Switching to room: ${roomType}`);
      
      // Switch to appropriate scene
      const sceneKey = this.getSceneKey(roomType);

      // Stop current scene
      if (this.game.scene.isActive(this.currentScene)) {
        console.log(`🔄 Stopping current scene: ${this.currentScene}`);
        this.game.scene.stop(this.currentScene);
      }

      // Start new scene
      console.log(`🔄 Starting scene: ${sceneKey}`);
      this.game.scene.start(sceneKey, {
        userData,
      });

      this.currentScene = sceneKey;
      console.log(`✅ Switched to room: ${roomType}`);
      
    } catch (error) {
      console.error('❌ Failed to join room:', error);
      throw error;
    }
  }

  private getSceneKey(roomType: string): string {
    const sceneMap: Record<string, string> = {
      lobby: 'LobbySceneSinglePlayer',
      emergency: 'EmergencySceneSinglePlayer',
      ward: 'WardSceneSinglePlayer',
      icu: 'ICUSceneSinglePlayer',
      surgical: 'SurgicalSceneSinglePlayer',
    };

    return sceneMap[roomType] || 'LobbySceneSinglePlayer';
  }

  getCurrentRoom(): string {
    return this.currentScene.replace('SceneSinglePlayer', '').toLowerCase();
  }

  destroy(): void {
    console.log('🔄 Destroying Phaser game...');
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
    this.isInitialized = false;
  }

  isGameInitialized(): boolean {
    return this.isInitialized;
  }
}
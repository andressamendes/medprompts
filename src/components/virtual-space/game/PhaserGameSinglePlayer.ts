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

  constructor() {
    // No network manager needed
  }

  initialize(containerId: string, userData: any): void {
    try {
      // Configure Phaser without auto-starting scenes
      const config: Phaser.Types.Core.GameConfig = {
        ...PHASER_CONFIG,
        parent: containerId,
        scene: [], // Empty scene array - we'll add them manually
      };

      // Create game instance
      this.game = new Phaser.Game(config);

      // Wait for game to be ready
      this.game.events.once('ready', () => {
        console.log('✅ Phaser game ready (Single Player)');

        // Add scenes manually
        this.game!.scene.add('LobbySceneSinglePlayer', LobbySceneSinglePlayer, false);
        this.game!.scene.add('EmergencySceneSinglePlayer', EmergencySceneSinglePlayer, false);
        this.game!.scene.add('WardSceneSinglePlayer', WardSceneSinglePlayer, false);
        this.game!.scene.add('ICUSceneSinglePlayer', ICUSceneSinglePlayer, false);
        this.game!.scene.add('SurgicalSceneSinglePlayer', SurgicalSceneSinglePlayer, false);

        console.log('✅ Scenes added to Phaser');

        // Connect to lobby by default
        this.joinRoom('lobby', userData);
      });
      
    } catch (error) {
      console.error('Failed to initialize Phaser game:', error);
      throw error;
    }
  }

  joinRoom(roomType: string, userData: any): void {
    try {
      // Switch to appropriate scene
      const sceneKey = this.getSceneKey(roomType);

      if (this.game) {
        // Stop current scene
        if (this.game.scene.isActive(this.currentScene)) {
          this.game.scene.stop(this.currentScene);
        }

        // Start new scene
        this.game.scene.start(sceneKey, {
          userData,
        });

        this.currentScene = sceneKey;
      }
    } catch (error) {
      console.error('Failed to join room:', error);
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
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }
}
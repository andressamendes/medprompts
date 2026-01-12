import Phaser from 'phaser';
import { PHASER_CONFIG } from './config';
import { NetworkManager } from './managers/NetworkManager';
import { LobbyScene } from './scenes/LobbyScene';
import { EmergencyScene } from './scenes/EmergencyScene';
import { WardScene } from './scenes/WardScene';
import { ICUScene } from './scenes/ICUScene';
import { SurgicalScene } from './scenes/SurgicalScene';

export class PhaserGame {
  private game: Phaser.Game | null = null;
  private networkManager: NetworkManager;
  private currentScene: string = 'LobbyScene';

  constructor() {
    this.networkManager = new NetworkManager();
  }

  async initialize(containerId: string, token: string, userData: any): Promise<void> {
    // Configure Phaser without auto-starting scenes
    const config: Phaser.Types.Core.GameConfig = {
      ...PHASER_CONFIG,
      parent: containerId,
      scene: [], // Empty scene array - we'll add them manually
    };

    // Create game instance
    this.game = new Phaser.Game(config);

    // Wait for game to be ready
    await new Promise((resolve) => {
      this.game!.events.once('ready', resolve);
    });

    // Add scenes manually
    this.game.scene.add('LobbyScene', LobbyScene, false);
    this.game.scene.add('EmergencyScene', EmergencyScene, false);
    this.game.scene.add('WardScene', WardScene, false);
    this.game.scene.add('ICUScene', ICUScene, false);
    this.game.scene.add('SurgicalScene', SurgicalScene, false);

    // Connect to lobby by default
    await this.joinRoom('lobby', token, userData);
  }

  async joinRoom(roomType: string, token: string, userData: any): Promise<void> {
    try {
      // Leave current room if connected
      if (this.networkManager.isConnected()) {
        await this.networkManager.leave();
      }

      // Join new room
      await this.networkManager.joinRoom(roomType, token);

      // Switch to appropriate scene
      const sceneKey = this.getSceneKey(roomType);

      if (this.game) {
        // Stop current scene
        if (this.game.scene.isActive(this.currentScene)) {
          this.game.scene.stop(this.currentScene);
        }

        // Start new scene
        this.game.scene.start(sceneKey, {
          networkManager: this.networkManager,
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
      lobby: 'LobbyScene',
      emergency: 'EmergencyScene',
      ward: 'WardScene',
      icu: 'ICUScene',
      surgical: 'SurgicalScene',
    };

    return sceneMap[roomType] || 'LobbyScene';
  }

  getNetworkManager(): NetworkManager {
    return this.networkManager;
  }

  getCurrentRoom(): string {
    const state = this.networkManager.getState();
    return state?.roomType || 'lobby';
  }

  getPlayerCount(): number {
    return this.networkManager.getPlayerCount();
  }

  destroy(): void {
    if (this.networkManager.isConnected()) {
      this.networkManager.leave();
    }

    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }
}

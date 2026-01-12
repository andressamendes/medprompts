import Phaser from 'phaser';
import { NetworkManager } from '../managers/NetworkManager';
import { Player } from '../entities/Player';
import { RemotePlayer } from '../entities/RemotePlayer';
import { GAME_CONFIG } from '../config';

export abstract class BaseScene extends Phaser.Scene {
  protected networkManager!: NetworkManager;
  protected localPlayer!: Player;
  protected remotePlayers: Map<string, RemotePlayer> = new Map();
  protected roomType!: string;
  protected map!: Phaser.Tilemaps.Tilemap;
  protected initialized: boolean = false;

  constructor(key: string, roomType: string) {
    super({ key });
    this.roomType = roomType;
  }

  init(data: { networkManager: NetworkManager; userData: any }): void {
    this.networkManager = data.networkManager;
    this.initialized = false;
  }

  create(): void {
    // Create simple background
    this.createBackground();

    // Create world bounds
    this.physics.world.setBounds(0, 0, 1600, 1200);

    // Setup camera
    this.cameras.main.setBounds(0, 0, 1600, 1200);
    this.cameras.main.setZoom(GAME_CONFIG.camera.zoom);

    // Create collision zones (walls)
    this.createCollisionZones();

    // Setup network listeners
    this.setupNetworkListeners();

    // Create UI text
    this.createUI();

    this.initialized = true;
  }

  protected createCollisionZones(): void {
    // Create invisible walls around the room
    const wallThickness = 10;
    const walls = this.physics.add.staticGroup();

    // Top wall
    walls.create(800, -wallThickness / 2, undefined).setSize(1600, wallThickness).setVisible(false);

    // Bottom wall
    walls.create(800, 1200 + wallThickness / 2, undefined).setSize(1600, wallThickness).setVisible(false);

    // Left wall
    walls.create(-wallThickness / 2, 600, undefined).setSize(wallThickness, 1200).setVisible(false);

    // Right wall
    walls.create(1600 + wallThickness / 2, 600, undefined).setSize(wallThickness, 1200).setVisible(false);

    // Store walls for collision with players
    (this as any).walls = walls;
  }

  protected createBackground(): void {
    // Create a simple grid pattern as placeholder
    const graphics = this.add.graphics();

    // Background
    graphics.fillStyle(0x2c3e50, 1);
    graphics.fillRect(0, 0, 1600, 1200);

    // Grid
    graphics.lineStyle(1, 0x34495e, 0.5);
    for (let x = 0; x < 1600; x += 50) {
      graphics.lineBetween(x, 0, x, 1200);
    }
    for (let y = 0; y < 1200; y += 50) {
      graphics.lineBetween(0, y, 1600, y);
    }

    // Room-specific decorations (override in child classes)
    this.decorateRoom(graphics);
  }

  protected abstract decorateRoom(graphics: Phaser.GameObjects.Graphics): void;

  protected createUI(): void {
    const roomInfo = GAME_CONFIG.rooms[this.roomType as keyof typeof GAME_CONFIG.rooms];

    // Room name
    this.add
      .text(20, 20, `${roomInfo.name}`, {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: { x: 10, y: 5 },
      })
      .setScrollFactor(0)
      .setDepth(1000);

    // Instructions
    this.add
      .text(20, 60, 'WASD or Arrow Keys to move', {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: { x: 8, y: 4 },
      })
      .setScrollFactor(0)
      .setDepth(1000);
  }

  protected setupNetworkListeners(): void {
    if (!this.networkManager) {
      console.error('NetworkManager not initialized in scene');
      return;
    }

    // State change - update all players
    this.networkManager.on('stateChange', (state: any) => {
      if (!this.initialized) {
        // Initial state - create all players
        this.createInitialPlayers(state);
      } else {
        // Update existing players
        this.updatePlayersFromState(state);
      }
    });

    // Player joined
    this.networkManager.on('playerJoined', (data: any) => {
      console.log(`Player joined: ${data.name}`);
      this.showNotification(`${data.name} joined`, 0x00ff00);
    });

    // Player left
    this.networkManager.on('playerLeft', (data: any) => {
      console.log(`Player left: ${data.name}`);
      this.removeRemotePlayer(data.userId);
      this.showNotification(`${data.name} left`, 0xff0000);
    });

    // Chat messages (handled by React overlay)
    this.networkManager.on('chat', (data: any) => {
      console.log(`Chat from ${data.name}: ${data.text}`);
    });
  }

  protected createInitialPlayers(state: any): void {
    const sessionId = this.networkManager.getSessionId();

    state.players.forEach((playerData: any, userId: string) => {
      if (userId === sessionId) {
        // Create local player
        this.createLocalPlayer(playerData);
      } else {
        // Create remote player
        this.createRemotePlayer(playerData);
      }
    });
  }

  protected createLocalPlayer(playerData: any): void {
    this.localPlayer = new Player(
      this,
      playerData.x,
      playerData.y,
      playerData.userId,
      playerData.name,
      playerData.level,
      true
    );

    // Add collision with walls
    if ((this as any).walls) {
      this.physics.add.collider(this.localPlayer, (this as any).walls);
    }

    // Camera follows local player
    this.cameras.main.startFollow(this.localPlayer, true, GAME_CONFIG.camera.smoothing, GAME_CONFIG.camera.smoothing);
  }

  protected createRemotePlayer(playerData: any): void {
    const remotePlayer = new RemotePlayer(
      this,
      playerData.x,
      playerData.y,
      playerData.userId,
      playerData.name,
      playerData.level
    );

    this.remotePlayers.set(playerData.userId, remotePlayer);
  }

  protected updatePlayersFromState(state: any): void {
    const currentPlayerIds = new Set<string>();

    state.players.forEach((playerData: any, userId: string) => {
      currentPlayerIds.add(userId);

      // Skip local player (updated by input)
      if (userId === this.networkManager.getSessionId()) return;

      const remotePlayer = this.remotePlayers.get(userId);

      if (remotePlayer) {
        // Update existing player
        remotePlayer.updatePosition(playerData.x, playerData.y, playerData.direction);
        remotePlayer.updateStatus(playerData.status);
      } else {
        // Create new player
        this.createRemotePlayer(playerData);
      }
    });

    // Remove players no longer in state
    this.remotePlayers.forEach((_player, userId) => {
      if (!currentPlayerIds.has(userId)) {
        this.removeRemotePlayer(userId);
      }
    });
  }

  protected removeRemotePlayer(userId: string): void {
    const remotePlayer = this.remotePlayers.get(userId);
    if (remotePlayer) {
      remotePlayer.destroy();
      this.remotePlayers.delete(userId);
    }
  }

  protected showNotification(text: string, color: number = 0xffffff): void {
    const notification = this.add
      .text(GAME_CONFIG.width / 2, 100, text, {
        fontSize: '18px',
        color: `#${color.toString(16).padStart(6, '0')}`,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: { x: 15, y: 8 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2000);

    // Fade out and destroy
    this.tweens.add({
      targets: notification,
      alpha: 0,
      y: 80,
      duration: 3000,
      ease: 'Power2',
      onComplete: () => notification.destroy(),
    });
  }

  update(): void {
    if (!this.initialized || !this.localPlayer) return;

    // Update local player
    this.localPlayer.update();

    // Send position to server (throttled)
    const now = Date.now();
    if (!this.lastNetworkUpdate || now - this.lastNetworkUpdate > 50) {
      this.networkManager.sendMove(
        this.localPlayer.x,
        this.localPlayer.y,
        this.localPlayer.getDirection()
      );
      this.lastNetworkUpdate = now;
    }
  }

  private lastNetworkUpdate: number = 0;

  shutdown(): void {
    this.remotePlayers.forEach((player) => player.destroy());
    this.remotePlayers.clear();
  }
}

import Phaser from 'phaser';
import { PlayerSinglePlayer } from '../entities/PlayerSinglePlayer';
import { GAME_CONFIG } from '../config';

export abstract class BaseSceneSinglePlayer extends Phaser.Scene {
  protected localPlayer!: PlayerSinglePlayer;
  protected roomType!: string;
  protected initialized: boolean = false;
  protected npcs: Phaser.Physics.Arcade.Sprite[] = [];
  protected interactiveObjects: Phaser.GameObjects.Rectangle[] = [];

  constructor(key: string, roomType: string) {
    super({ key });
    this.roomType = roomType;
  }

  init(_data: { userData: any }): void {
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

    // Create NPCs and interactive objects
    this.createNPCs();
    this.createInteractiveObjects();

    // Create local player
    this.createLocalPlayer();

    // Create UI text
    this.createUI();

    // Setup input for interactions
    this.setupInteractionInput();

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

  protected createNPCs(): void {
    // Create some NPCs for the room
    const npcCount = 3 + Math.floor(Math.random() * 4); // 3-6 NPCs
    
    for (let i = 0; i < npcCount; i++) {
      const x = 100 + Math.random() * 1400;
      const y = 100 + Math.random() * 1000;
      
      const npc = this.physics.add.sprite(x, y, 'npc');
      npc.setCollideWorldBounds(true);
      npc.setBounce(0.2);
      npc.setVelocity(Math.random() * 100 - 50, Math.random() * 100 - 50);
      
      // Add NPC name
      const npcNames = ['Dr. Smith', 'Nurse Johnson', 'Patient Miller', 'Resident Davis', 'Technician Wilson'];
      const name = npcNames[Math.floor(Math.random() * npcNames.length)];
      
      const nameText = this.add.text(x, y - 40, name, {
        fontSize: '12px',
        color: '#FFFFFF',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: { x: 4, y: 2 },
      });
      nameText.setOrigin(0.5);
      
      // Store reference
      npc.setData('nameText', nameText);
      this.npcs.push(npc);
    }
  }

  protected createInteractiveObjects(): void {
    // Create some interactive objects in the room
    const objects = [
      { x: 300, y: 300, width: 60, height: 40, label: 'Computer', color: 0x0088ff },
      { x: 800, y: 400, width: 80, height: 60, label: 'Desk', color: 0x8b4513 },
      { x: 1200, y: 500, width: 100, height: 80, label: 'Equipment', color: 0x666666 },
    ];
    
    objects.forEach(obj => {
      const interactiveObj = this.add.rectangle(obj.x, obj.y, obj.width, obj.height, obj.color, 0.7);
      interactiveObj.setStrokeStyle(2, 0xffffff, 0.8);
      
      // Add label
      this.add.text(obj.x, obj.y, obj.label, {
        fontSize: '12px',
        color: '#FFFFFF',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: { x: 6, y: 3 },
      }).setOrigin(0.5);
      
      // Make it interactive
      interactiveObj.setInteractive();
      interactiveObj.on('pointerdown', () => {
        this.showNotification(`Interacted with ${obj.label}`, 0x00ff00);
      });
      
      this.interactiveObjects.push(interactiveObj);
    });
  }

  protected createLocalPlayer(): void {
    // Create local player at center
    this.localPlayer = new PlayerSinglePlayer(
      this,
      800, // Center X
      600, // Center Y
      'player-1',
      'You',
      1,
      true
    );

    // Add collision with walls
    if ((this as any).walls) {
      this.physics.add.collider(this.localPlayer, (this as any).walls);
    }

    // Add collision with NPCs
    this.npcs.forEach(npc => {
      this.physics.add.collider(this.localPlayer, npc);
    });

    // Camera follows local player
    this.cameras.main.startFollow(this.localPlayer, true, GAME_CONFIG.camera.smoothing, GAME_CONFIG.camera.smoothing);
  }

  protected setupInteractionInput(): void {
    // Space bar for interaction
    this.input.keyboard?.addKey('SPACE').on('down', () => {
      this.handleInteraction();
    });
  }

  protected handleInteraction(): void {
    // Check if player is near any interactive object
    const playerX = this.localPlayer.x;
    const playerY = this.localPlayer.y;
    
    this.interactiveObjects.forEach(obj => {
      const distance = Phaser.Math.Distance.Between(playerX, playerY, obj.x, obj.y);
      if (distance < 100) { // Within interaction range
        this.showNotification(`You interacted with an object nearby`, 0xffff00);
      }
    });
    
    // Check if player is near any NPC
    this.npcs.forEach(npc => {
      const distance = Phaser.Math.Distance.Between(playerX, playerY, npc.x, npc.y);
      if (distance < 80) { // Within talking range
        const npcName = npc.getData('nameText')?.text || 'NPC';
        this.showNotification(`You talked to ${npcName}`, 0x00ffff);
      }
    });
  }

  protected createUI(): void {
    const roomInfo = GAME_CONFIG.rooms[this.roomType as keyof typeof GAME_CONFIG.rooms];

    // Room name
    this.add
      .text(20, 20, `${roomInfo.name} (Single Player)`, {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: { x: 10, y: 5 },
      })
      .setScrollFactor(0)
      .setDepth(1000);

    // Instructions
    this.add
      .text(20, 60, 'WASD/Arrows: Move | Space: Interact', {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: { x: 8, y: 4 },
      })
      .setScrollFactor(0)
      .setDepth(1000);
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

    // Update NPC name positions
    this.npcs.forEach(npc => {
      const nameText = npc.getData('nameText');
      if (nameText) {
        nameText.setPosition(npc.x, npc.y - 40);
      }
    });
  }

  shutdown(): void {
    // Clean up NPCs
    this.npcs.forEach(npc => {
      const nameText = npc.getData('nameText');
      nameText?.destroy();
      npc.destroy();
    });
    this.npcs = [];
    
    // Clean up interactive objects
    this.interactiveObjects.forEach(obj => obj.destroy());
    this.interactiveObjects = [];
  }
}
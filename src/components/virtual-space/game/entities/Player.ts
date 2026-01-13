import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';
import { SpriteGenerator } from '../utils/SpriteGenerator';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public userId: string;
  public playerName: string;
  public level: number;
  public nameText: Phaser.GameObjects.Text;
  public levelBadge: Phaser.GameObjects.Text;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private wasd: any = null;
  private lastDirection: string = 'down';
  private isLocalPlayer: boolean;
  private fallbackGraphics: Phaser.GameObjects.Graphics | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    userId: string,
    name: string,
    level: number,
    isLocal: boolean = false
  ) {
    super(scene, x, y, 'player');

    this.userId = userId;
    this.playerName = name;
    this.level = level;
    this.isLocalPlayer = isLocal;

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configure physics
    this.setCollideWorldBounds(true);
    this.setSize(GAME_CONFIG.player.size * 0.7, GAME_CONFIG.player.size * 0.7);
    this.setOffset(
      (GAME_CONFIG.player.size - GAME_CONFIG.player.size * 0.7) / 2,
      (GAME_CONFIG.player.size - GAME_CONFIG.player.size * 0.7) / 2
    );

    // Create name text
    this.nameText = scene.add.text(x, y - 40, name, {
      fontSize: '14px',
      color: isLocal ? '#FFD700' : '#FFFFFF',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      padding: { x: 6, y: 3 },
    });
    this.nameText.setOrigin(0.5);

    // Create level badge
    this.levelBadge = scene.add.text(x, y - 55, `Lv.${level}`, {
      fontSize: '12px',
      color: '#FFD700',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: { x: 4, y: 2 },
    });
    this.levelBadge.setOrigin(0.5);

    // Setup input for local player
    if (isLocal && scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd = {
        up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    // Create improved doctor sprite
    this.createImprovedSprite();
  }

  private createImprovedSprite(): void {
    const textureName = this.isLocalPlayer ? 'player-local' : 'player-remote';
    
    // Verificar se textura existe
    if (!this.scene.textures.exists(textureName)) {
      try {
        SpriteGenerator.createDoctorSprite(this.scene, this.isLocalPlayer);
      } catch (error) {
        console.error('Failed to create sprite, using fallback:', error);
        // Usar círculo como fallback
        this.createFallbackSprite();
        return;
      }
    }
    
    this.setTexture(textureName);
  }

  private createFallbackSprite(): void {
    // Criar um círculo simples como fallback
    const color = this.isLocalPlayer ? 0x10b981 : 0x3b82f6;
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillCircle(0, 0, 16);
    
    // Gerar textura temporária
    const textureName = `player-fallback-${this.isLocalPlayer ? 'local' : 'remote'}`;
    graphics.generateTexture(textureName, 32, 32);
    graphics.destroy();
    
    this.setTexture(textureName);
  }

  update(): void {
    if (!this.isLocalPlayer) return;

    // Handle movement input
    const velocity = { x: 0, y: 0 };
    let moving = false;
    let newDirection = this.lastDirection;

    if (this.cursors?.left.isDown || this.wasd?.left.isDown) {
      velocity.x = -GAME_CONFIG.player.speed;
      newDirection = 'left';
      moving = true;
    } else if (this.cursors?.right.isDown || this.wasd?.right.isDown) {
      velocity.x = GAME_CONFIG.player.speed;
      newDirection = 'right';
      moving = true;
    }

    if (this.cursors?.up.isDown || this.wasd?.up.isDown) {
      velocity.y = -GAME_CONFIG.player.speed;
      newDirection = 'up';
      moving = true;
    } else if (this.cursors?.down.isDown || this.wasd?.down.isDown) {
      velocity.y = GAME_CONFIG.player.speed;
      newDirection = 'down';
      moving = true;
    }

    // Normalize diagonal movement
    if (velocity.x !== 0 && velocity.y !== 0) {
      velocity.x *= 0.707;
      velocity.y *= 0.707;
    }

    // Apply velocity
    this.setVelocity(velocity.x, velocity.y);

    // Update direction
    if (moving) {
      this.lastDirection = newDirection;
      this.updateRotation(newDirection);
    }

    // Update name and level badge positions
    this.updateLabels();
  }

  private updateRotation(direction: string): void {
    switch (direction) {
      case 'up':
        this.setAngle(-90);
        break;
      case 'down':
        this.setAngle(90);
        break;
      case 'left':
        this.setAngle(180);
        break;
      case 'right':
        this.setAngle(0);
        break;
    }
  }

  updatePosition(x: number, y: number, direction?: string): void {
    if (this.isLocalPlayer) return; // Don't update local player from network

    // Smooth movement for remote players
    this.scene.tweens.add({
      targets: this,
      x,
      y,
      duration: 100,
      ease: 'Linear',
    });

    if (direction) {
      this.lastDirection = direction;
      this.updateRotation(direction);
    }
  }

  private updateLabels(): void {
    this.nameText.setPosition(this.x, this.y - 40);
    this.levelBadge.setPosition(this.x, this.y - 55);
  }

  getDirection(): string {
    return this.lastDirection;
  }

  destroy(fromScene?: boolean): void {
    this.nameText?.destroy();
    this.levelBadge?.destroy();
    this.fallbackGraphics?.destroy();
    super.destroy(fromScene);
  }
}

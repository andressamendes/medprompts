import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';

export class RemotePlayer extends Phaser.Physics.Arcade.Sprite {
  public userId: string;
  public playerName: string;
  public level: number;
  public nameText: Phaser.GameObjects.Text;
  public levelBadge: Phaser.GameObjects.Text;
  private statusIndicator: Phaser.GameObjects.Arc;
  private currentStatus: string = 'active';

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    userId: string,
    name: string,
    level: number
  ) {
    super(scene, x, y, 'player');

    this.userId = userId;
    this.playerName = name;
    this.level = level;

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configure physics
    this.setCollideWorldBounds(true);
    this.setSize(GAME_CONFIG.player.size * 0.7, GAME_CONFIG.player.size * 0.7);

    // Create name text
    this.nameText = scene.add.text(x, y - 40, name, {
      fontSize: '14px',
      color: '#FFFFFF',
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

    // Create status indicator (small circle)
    this.statusIndicator = scene.add.circle(x + 15, y - 15, 4, 0x00ff00);

    this.setTexture('player');
  }

  updatePosition(x: number, y: number, direction?: string): void {
    // Smooth interpolation for remote players
    this.scene.tweens.add({
      targets: this,
      x,
      y,
      duration: 100,
      ease: 'Linear',
      onUpdate: () => {
        this.updateLabels();
      },
    });

    if (direction) {
      this.updateRotation(direction);
    }
  }

  updateStatus(status: 'active' | 'idle' | 'away'): void {
    this.currentStatus = status;

    // Update status indicator color
    const color = status === 'active' ? 0x00ff00 : status === 'idle' ? 0xffff00 : 0xff0000;
    this.statusIndicator.setFillStyle(color);
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

  private updateLabels(): void {
    this.nameText.setPosition(this.x, this.y - 40);
    this.levelBadge.setPosition(this.x, this.y - 55);
    this.statusIndicator.setPosition(this.x + 15, this.y - 15);
  }

  destroy(fromScene?: boolean): void {
    this.nameText?.destroy();
    this.levelBadge?.destroy();
    this.statusIndicator?.destroy();
    super.destroy(fromScene);
  }
}

import { BaseSceneSinglePlayer } from './BaseSceneSinglePlayer';

export class LobbySceneSinglePlayer extends BaseSceneSinglePlayer {
  constructor() {
    super('LobbySceneSinglePlayer', 'lobby');
  }

  protected decorateRoom(graphics: Phaser.GameObjects.Graphics): void {
    // Reception desk
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect(750, 200, 100, 80);

    // Waiting area chairs
    graphics.fillStyle(0x4169e1, 1);
    for (let i = 0; i < 5; i++) {
      graphics.fillRect(200 + i * 80, 400, 40, 40);
    }

    // Information board
    graphics.fillStyle(0x2f4f4f, 1);
    graphics.fillRect(1200, 300, 150, 100);

    // Labels
    this.add.text(775, 250, 'Reception', {
      fontSize: '16px',
      color: '#ffffff',
    });

    this.add.text(1230, 360, 'Info Board', {
      fontSize: '14px',
      color: '#ffffff',
    });

    // Portal zones (for navigating to other rooms)
    this.createPortal(400, 1000, 'Emergency', 0xff0000);
    this.createPortal(700, 1000, 'Ward', 0x00ff00);
    this.createPortal(1000, 1000, 'ICU', 0xffff00);
    this.createPortal(1300, 1000, 'Surgical', 0xff00ff);
  }

  private createPortal(x: number, y: number, label: string, color: number): void {
    // Portal circle
    const portal = this.add.circle(x, y, 50, color, 0.6);

    // Portal label
    this.add.text(x, y, label, {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5);

    // Add pulsing animation
    this.tweens.add({
      targets: portal,
      alpha: 0.3,
      scale: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });
  }
}
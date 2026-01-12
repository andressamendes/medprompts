import { BaseScene } from './BaseScene';

export class ICUScene extends BaseScene {
  constructor() {
    super('ICUScene', 'icu');
  }

  protected decorateRoom(graphics: Phaser.GameObjects.Graphics): void {
    // ICU beds with monitoring equipment
    graphics.fillStyle(0xe0e0e0, 1);

    for (let i = 0; i < 6; i++) {
      const x = 200 + (i % 3) * 350;
      const y = 300 + Math.floor(i / 3) * 350;

      // Bed
      graphics.fillRect(x, y, 140, 90);

      // Monitor
      graphics.fillStyle(0x000000, 1);
      graphics.fillRect(x + 150, y, 80, 60);

      // Monitor screen (green)
      graphics.fillStyle(0x00ff00, 1);
      graphics.fillRect(x + 160, y + 10, 60, 40);

      graphics.fillStyle(0xe0e0e0, 1);
    }

    // Central monitoring station
    graphics.fillStyle(0x2f4f4f, 1);
    graphics.fillRect(700, 150, 250, 120);

    // Crash cart
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(1300, 400, 80, 100);

    // Labels
    this.add.text(780, 195, 'Central Monitor', {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    this.add.text(1310, 510, 'Crash Cart', {
      fontSize: '12px',
      color: '#ffffff',
    });

    // Back to lobby
    this.createBackPortal(100, 100);
  }

  private createBackPortal(x: number, y: number): void {
    const portal = this.add.circle(x, y, 40, 0x4169e1, 0.6);

    this.add.text(x, y, '← Lobby', {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: { x: 6, y: 3 },
    }).setOrigin(0.5);

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

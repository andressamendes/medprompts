import { BaseScene } from './BaseScene';

export class WardScene extends BaseScene {
  constructor() {
    super('WardScene', 'ward');
  }

  protected decorateRoom(graphics: Phaser.GameObjects.Graphics): void {
    // Patient beds in rows
    graphics.fillStyle(0xe0e0e0, 1);

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const x = 200 + col * 250;
        const y = 300 + row * 200;
        graphics.fillRect(x, y, 120, 80);
      }
    }

    // Nurse station
    graphics.fillStyle(0x4169e1, 1);
    graphics.fillRect(700, 150, 200, 100);

    // Medicine cabinet
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(1300, 300, 100, 150);

    // Labels
    this.add.text(750, 185, 'Nurse Station', {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    this.add.text(1315, 460, 'Meds', {
      fontSize: '14px',
      color: '#000000',
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

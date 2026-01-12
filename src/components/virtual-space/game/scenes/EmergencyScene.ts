import { BaseScene } from './BaseScene';

export class EmergencyScene extends BaseScene {
  constructor() {
    super('EmergencyScene', 'emergency');
  }

  protected decorateRoom(graphics: Phaser.GameObjects.Graphics): void {
    // Triage area
    graphics.fillStyle(0xff6b6b, 1);
    graphics.fillRect(200, 200, 200, 150);

    // Emergency beds
    graphics.fillStyle(0xffffff, 1);
    for (let i = 0; i < 4; i++) {
      graphics.fillRect(600 + i * 150, 300, 100, 60);
    }

    // Trauma bay
    graphics.fillStyle(0xff0000, 0.3);
    graphics.fillRect(200, 600, 300, 250);

    // Medical equipment
    graphics.fillStyle(0x888888, 1);
    graphics.fillRect(1200, 400, 60, 80);
    graphics.fillRect(1300, 400, 60, 80);

    // Labels
    this.add.text(250, 260, 'Triage', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    this.add.text(280, 700, 'Trauma Bay', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    // Back to lobby portal
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

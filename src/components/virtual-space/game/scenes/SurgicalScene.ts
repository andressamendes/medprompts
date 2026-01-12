import { BaseScene } from './BaseScene';

export class SurgicalScene extends BaseScene {
  constructor() {
    super('SurgicalScene', 'surgical');
  }

  protected decorateRoom(graphics: Phaser.GameObjects.Graphics): void {
    // Operating table
    graphics.fillStyle(0xc0c0c0, 1);
    graphics.fillRect(700, 450, 200, 100);

    // Surgical lights
    graphics.fillStyle(0xffff00, 0.6);
    graphics.fillCircle(800, 350, 80);

    // Instrument table
    graphics.fillStyle(0x808080, 1);
    graphics.fillRect(500, 400, 120, 60);

    // Anesthesia station
    graphics.fillStyle(0x4169e1, 1);
    graphics.fillRect(950, 400, 100, 120);

    // Scrub station
    graphics.fillStyle(0x87ceeb, 1);
    graphics.fillRect(200, 300, 150, 80);

    // Medical equipment
    graphics.fillStyle(0x2f4f4f, 1);
    graphics.fillRect(1200, 500, 80, 100);
    graphics.fillRect(1300, 500, 80, 100);

    // Labels
    this.add.text(755, 560, 'Operating Table', {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    this.add.text(520, 465, 'Instruments', {
      fontSize: '12px',
      color: '#ffffff',
    });

    this.add.text(965, 530, 'Anesthesia', {
      fontSize: '12px',
      color: '#ffffff',
    });

    this.add.text(230, 345, 'Scrub Station', {
      fontSize: '12px',
      color: '#ffffff',
    });

    // Sterile field indicator
    graphics.lineStyle(3, 0xff0000, 1);
    graphics.strokeRect(450, 350, 550, 300);

    this.add.text(680, 660, 'STERILE FIELD', {
      fontSize: '14px',
      color: '#ff0000',
      fontStyle: 'bold',
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

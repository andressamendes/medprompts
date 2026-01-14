import { BaseSceneSinglePlayer } from './BaseSceneSinglePlayer';

export class WardSceneSinglePlayer extends BaseSceneSinglePlayer {
  constructor() {
    super('WardSceneSinglePlayer', 'ward');
  }

  protected decorateRoom(graphics: Phaser.GameObjects.Graphics): void {
    // Patient beds in rows
    graphics.fillStyle(0x4169e1, 0.8);
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        graphics.fillRect(200 + col * 300, 200 + row * 200, 80, 120);
      }
    }

    // Nurse station
    graphics.fillStyle(0x2e8b57, 1);
    graphics.fillRect(1000, 500, 120, 80);

    // Medicine cart
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect(1200, 300, 60, 40);

    // Labels
    this.add.text(1060, 540, 'Nurse Station', {
      fontSize: '14px',
      color: '#ffffff',
    });

    this.add.text(1210, 320, 'Med Cart', {
      fontSize: '12px',
      color: '#ffffff',
    });

    // Ward sign
    this.add.text(800, 100, 'GENERAL WARD', {
      fontSize: '24px',
      color: '#4169e1',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: { x: 15, y: 8 },
    }).setOrigin(0.5);
  }
}
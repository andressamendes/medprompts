import { BaseSceneSinglePlayer } from './BaseSceneSinglePlayer';

export class ICUSceneSinglePlayer extends BaseSceneSinglePlayer {
  constructor() {
    super('ICUSceneSinglePlayer', 'icu');
  }

  protected decorateRoom(graphics: Phaser.GameObjects.Graphics): void {
    // ICU beds with more space
    graphics.fillStyle(0xff4500, 0.7);
    for (let i = 0; i < 2; i++) {
      graphics.fillRect(400 + i * 400, 400, 100, 150);
    }

    // Life support equipment
    graphics.fillStyle(0x4b0082, 1);
    graphics.fillRect(300, 300, 60, 80);
    graphics.fillRect(1100, 300, 80, 100);

    // Monitoring station
    graphics.fillStyle(0x008080, 1);
    graphics.fillRect(800, 200, 120, 60);

    // Labels
    this.add.text(450, 475, 'ICU Bed 1', {
      fontSize: '14px',
      color: '#ffffff',
    });

    this.add.text(850, 475, 'ICU Bed 2', {
      fontSize: '14px',
      color: '#ffffff',
    });

    this.add.text(310, 340, 'Ventilator', {
      fontSize: '12px',
      color: '#ffffff',
    });

    this.add.text(1120, 350, 'Dialysis', {
      fontSize: '12px',
      color: '#ffffff',
    });

    this.add.text(860, 230, 'Monitor Wall', {
      fontSize: '14px',
      color: '#ffffff',
    });

    // ICU sign
    this.add.text(800, 100, 'INTENSIVE CARE UNIT', {
      fontSize: '24px',
      color: '#ff4500',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: { x: 15, y: 8 },
    }).setOrigin(0.5);
  }
}
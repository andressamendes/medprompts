import { BaseSceneSinglePlayer } from './BaseSceneSinglePlayer';

export class SurgicalSceneSinglePlayer extends BaseSceneSinglePlayer {
  constructor() {
    super('SurgicalSceneSinglePlayer', 'surgical');
  }

  protected decorateRoom(graphics: Phaser.GameObjects.Graphics): void {
    // Operating table
    graphics.fillStyle(0xffffff, 0.9);
    graphics.fillRect(800, 500, 120, 60);

    // Surgical lights
    graphics.fillStyle(0xffff00, 0.8);
    graphics.fillCircle(800, 400, 40);
    graphics.fillCircle(750, 420, 30);
    graphics.fillCircle(850, 420, 30);

    // Instrument tables
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect(600, 500, 80, 50);
    graphics.fillRect(1000, 500, 80, 50);

    // Anesthesia machine
    graphics.fillStyle(0x4682b4, 1);
    graphics.fillRect(700, 300, 60, 80);

    // Labels
    this.add.text(860, 530, 'OR Table', {
      fontSize: '14px',
      color: '#000000',
    });

    this.add.text(620, 525, 'Instruments', {
      fontSize: '12px',
      color: '#ffffff',
    });

    this.add.text(1020, 525, 'Instruments', {
      fontSize: '12px',
      color: '#ffffff',
    });

    this.add.text(710, 340, 'Anesthesia', {
      fontSize: '12px',
      color: '#ffffff',
    });

    // Surgical sign
    this.add.text(800, 100, 'SURGICAL ROOM', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: { x: 15, y: 8 },
    }).setOrigin(0.5);
  }
}
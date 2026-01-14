import { BaseSceneSinglePlayer } from './BaseSceneSinglePlayer';

export class EmergencySceneSinglePlayer extends BaseSceneSinglePlayer {
  constructor() {
    super('EmergencySceneSinglePlayer', 'emergency');
  }

  protected decorateRoom(graphics: Phaser.GameObjects.Graphics): void {
    // Emergency beds
    graphics.fillStyle(0xff0000, 0.7);
    for (let i = 0; i < 3; i++) {
      graphics.fillRect(300 + i * 200, 300, 80, 120);
    }

    // Medical equipment
    graphics.fillStyle(0x666666, 1);
    graphics.fillRect(800, 200, 60, 100);
    graphics.fillRect(1000, 200, 80, 60);

    // Labels
    this.add.text(340, 370, 'Bed 1', {
      fontSize: '14px',
      color: '#ffffff',
    });

    this.add.text(540, 370, 'Bed 2', {
      fontSize: '14px',
      color: '#ffffff',
    });

    this.add.text(740, 370, 'Bed 3', {
      fontSize: '14px',
      color: '#ffffff',
    });

    this.add.text(820, 250, 'Monitor', {
      fontSize: '12px',
      color: '#ffffff',
    });

    this.add.text(1020, 230, 'Defibrillator', {
      fontSize: '12px',
      color: '#ffffff',
    });

    // Emergency sign
    this.add.text(800, 100, 'EMERGENCY ROOM', {
      fontSize: '24px',
      color: '#ff0000',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: { x: 15, y: 8 },
    }).setOrigin(0.5);
  }
}
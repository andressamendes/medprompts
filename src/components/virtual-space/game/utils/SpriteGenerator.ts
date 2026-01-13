import Phaser from 'phaser';

/**
 * Gerador de sprites procedurais para players
 * Cria sprites visuais melhores que círculos simples
 */
export class SpriteGenerator {
  /**
   * Cria sprite de médico/estudante com jaleco
   */
  static createDoctorSprite(scene: Phaser.Scene, isLocal: boolean = false): void {
    // Verificar se a cena está pronta
    if (!scene || !scene.make || !scene.make.graphics) {
      console.error('Scene not ready for sprite generation');
      return;
    }
    
    const size = 32;
    const graphics = scene.make.graphics({ x: 0, y: 0 });

    // Cor base (verde para local, azul para remoto)
    const baseColor = isLocal ? 0x10b981 : 0x3b82f6;
    const darkColor = isLocal ? 0x059669 : 0x2563eb;

    // Corpo (jaleco branco)
    graphics.fillStyle(0xffffff, 1);
    graphics.fillEllipse(size / 2, size / 2 + 4, 12, 16);

    // Cabeça
    graphics.fillStyle(0xfdb462, 1);
    graphics.fillCircle(size / 2, size / 2 - 6, 7);

    // Cabelo
    graphics.fillStyle(0x4a3f35, 1);
    graphics.fillEllipse(size / 2, size / 2 - 10, 8, 5);

    // Olhos
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(size / 2 - 2, size / 2 - 7, 1);
    graphics.fillCircle(size / 2 + 2, size / 2 - 7, 1);

    // Sorriso
    graphics.lineStyle(1, 0x000000, 1);
    graphics.beginPath();
    graphics.arc(size / 2, size / 2 - 5, 3, 0, Math.PI, false);
    graphics.strokePath();

    // Estetoscópio
    graphics.lineStyle(2, darkColor, 1);
    graphics.beginPath();
    graphics.moveTo(size / 2 - 4, size / 2 + 2);
    graphics.lineTo(size / 2 - 4, size / 2 + 8);
    graphics.strokePath();

    graphics.fillStyle(darkColor, 1);
    graphics.fillCircle(size / 2 - 4, size / 2 + 10, 2);

    // Indicador de direção (marca no peito)
    graphics.fillStyle(baseColor, 1);
    graphics.fillCircle(size / 2, size / 2 + 2, 2);

    // Gera textura
    const textureName = isLocal ? 'player-local' : 'player-remote';
    try {
      graphics.generateTexture(textureName, size, size);
    } catch (error) {
      console.error('Failed to generate texture:', error);
    } finally {
      graphics.destroy();
    }
  }

  /**
   * Cria sprite de enfermeiro com cores diferentes
   */
  static createNurseSprite(scene: Phaser.Scene): void {
    if (!scene || !scene.make || !scene.make.graphics) {
      console.error('Scene not ready for sprite generation');
      return;
    }
    
    const size = 32;
    const graphics = scene.make.graphics({ x: 0, y: 0 });

    // Corpo (uniforme verde claro)
    graphics.fillStyle(0x86efac, 1);
    graphics.fillEllipse(size / 2, size / 2 + 4, 12, 16);

    // Cabeça
    graphics.fillStyle(0xfdb462, 1);
    graphics.fillCircle(size / 2, size / 2 - 6, 7);

    // Cabelo
    graphics.fillStyle(0x92400e, 1);
    graphics.fillEllipse(size / 2, size / 2 - 10, 8, 5);

    // Olhos
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(size / 2 - 2, size / 2 - 7, 1);
    graphics.fillCircle(size / 2 + 2, size / 2 - 7, 1);

    // Cruz no uniforme
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(size / 2 - 1, size / 2, 2, 6);
    graphics.fillRect(size / 2 - 3, size / 2 + 2, 6, 2);

    try {
      graphics.generateTexture('player-nurse', size, size);
    } catch (error) {
      console.error('Failed to generate texture:', error);
    } finally {
      graphics.destroy();
    }
  }

  /**
   * Cria sprite com acessório de especialidade
   */
  static createSpecialtySprite(
    scene: Phaser.Scene,
    specialty: 'surgeon' | 'emergency' | 'icu'
  ): void {
    if (!scene || !scene.make || !scene.make.graphics) {
      console.error('Scene not ready for sprite generation');
      return;
    }
    
    const size = 32;
    const graphics = scene.make.graphics({ x: 0, y: 0 });

    // Cores por especialidade
    const colors = {
      surgeon: { body: 0x059669, dark: 0x047857 },
      emergency: { body: 0xef4444, dark: 0xdc2626 },
      icu: { body: 0x8b5cf6, dark: 0x7c3aed },
    };

    const color = colors[specialty];

    // Corpo com cor da especialidade
    graphics.fillStyle(0xffffff, 1);
    graphics.fillEllipse(size / 2, size / 2 + 4, 12, 16);

    // Cabeça
    graphics.fillStyle(0xfdb462, 1);
    graphics.fillCircle(size / 2, size / 2 - 6, 7);

    // Cabelo
    graphics.fillStyle(0x6b5b4f, 1);
    graphics.fillEllipse(size / 2, size / 2 - 10, 8, 5);

    // Máscara cirúrgica (para cirurgião)
    if (specialty === 'surgeon') {
      graphics.fillStyle(color.body, 1);
      graphics.fillRect(size / 2 - 4, size / 2 - 6, 8, 4);
    } else {
      // Olhos normais
      graphics.fillStyle(0x000000, 1);
      graphics.fillCircle(size / 2 - 2, size / 2 - 7, 1);
      graphics.fillCircle(size / 2 + 2, size / 2 - 7, 1);
    }

    // Badge de especialidade
    graphics.fillStyle(color.body, 1);
    graphics.fillRect(size / 2 - 3, size / 2 + 1, 6, 4);

    // Símbolo no badge
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(size / 2, size / 2 + 3, 1.5);

    try {
      graphics.generateTexture(`player-${specialty}`, size, size);
    } catch (error) {
      console.error('Failed to generate texture:', error);
    } finally {
      graphics.destroy();
    }
  }

  /**
   * Cria indicador de atividade (halo ao redor do player)
   */
  static createActivityIndicator(
    scene: Phaser.Scene,
    status: 'active' | 'idle' | 'away'
  ): Phaser.GameObjects.Graphics {
    const graphics = scene.add.graphics();

    const colors = {
      active: 0x10b981,
      idle: 0xfbbf24,
      away: 0xef4444,
    };

    const color = colors[status];
    graphics.lineStyle(2, color, 0.6);
    graphics.strokeCircle(0, 0, 20);

    return graphics;
  }

  /**
   * Cria partículas de XP quando ganha pontos
   */
  static createXPParticles(scene: Phaser.Scene, x: number, y: number, xp: number): void {
    const particles = scene.add.particles(x, y, 'particle-xp', {
      speed: { min: 50, max: 100 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      angle: { min: -120, max: -60 },
      lifespan: 1000,
      quantity: Math.min(xp / 5, 10),
      blendMode: 'ADD',
    });

    scene.time.delayedCall(1000, () => {
      particles.destroy();
    });
  }

  /**
   * Cria textura de partícula de XP
   */
  static createXPParticleTexture(scene: Phaser.Scene): void {
    if (!scene || !scene.make || !scene.make.graphics) {
      console.error('Scene not ready for sprite generation');
      return;
    }
    
    const graphics = scene.make.graphics({ x: 0, y: 0 });

    // Partícula dourada
    graphics.fillStyle(0xfbbf24, 1);
    graphics.fillCircle(4, 4, 4);

    // Brilho
    graphics.fillStyle(0xfde047, 1);
    graphics.fillCircle(4, 4, 2);

    try {
      graphics.generateTexture('particle-xp', 8, 8);
    } catch (error) {
      console.error('Failed to generate texture:', error);
    } finally {
      graphics.destroy();
    }
  }

  /**
   * Cria marcador de chat (balão de diálogo)
   */
  static createChatBubble(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Graphics {
    const graphics = scene.add.graphics({ x, y });

    // Bolha branca
    graphics.fillStyle(0xffffff, 0.95);
    graphics.fillRoundedRect(-20, -30, 40, 20, 5);

    // Triângulo apontando para baixo
    graphics.beginPath();
    graphics.moveTo(0, -10);
    graphics.lineTo(-5, -10);
    graphics.lineTo(0, -5);
    graphics.closePath();
    graphics.fillPath();

    // Pontos de reticências
    graphics.fillStyle(0x000000, 0.7);
    graphics.fillCircle(-8, -20, 2);
    graphics.fillCircle(0, -20, 2);
    graphics.fillCircle(8, -20, 2);

    return graphics;
  }

  /**
   * Cria sprite de objeto interativo (computador, cama, etc)
   */
  static createInteractiveObject(
    scene: Phaser.Scene,
    type: 'computer' | 'bed' | 'equipment' | 'desk'
  ): void {
    if (!scene || !scene.make || !scene.make.graphics) {
      console.error('Scene not ready for sprite generation');
      return;
    }
    
    const size = 48;
    const graphics = scene.make.graphics({ x: 0, y: 0 });

    switch (type) {
      case 'computer':
        // Monitor
        graphics.fillStyle(0x1f2937, 1);
        graphics.fillRect(10, 15, 28, 20);
        graphics.fillStyle(0x60a5fa, 1);
        graphics.fillRect(12, 17, 24, 16);
        // Base
        graphics.fillStyle(0x6b7280, 1);
        graphics.fillRect(20, 35, 8, 5);
        break;

      case 'bed':
        // Cama
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(8, 20, 32, 20);
        graphics.fillStyle(0x93c5fd, 1);
        graphics.fillRect(8, 20, 32, 8);
        // Pés
        graphics.fillStyle(0x6b7280, 1);
        graphics.fillRect(8, 40, 4, 6);
        graphics.fillRect(36, 40, 4, 6);
        break;

      case 'equipment':
        // Equipamento médico
        graphics.fillStyle(0x6b7280, 1);
        graphics.fillRect(15, 10, 18, 30);
        graphics.fillStyle(0x10b981, 1);
        graphics.fillRect(17, 15, 14, 10);
        // Tela
        graphics.fillStyle(0x000000, 1);
        graphics.fillRect(18, 16, 12, 8);
        break;

      case 'desk':
        // Mesa
        graphics.fillStyle(0x92400e, 1);
        graphics.fillRect(5, 20, 38, 15);
        // Pernas
        graphics.fillRect(8, 35, 4, 10);
        graphics.fillRect(36, 35, 4, 10);
        break;
    }

    try {
      graphics.generateTexture(`object-${type}`, size, size);
    } catch (error) {
      console.error('Failed to generate texture:', error);
    } finally {
      graphics.destroy();
    }
  }
}

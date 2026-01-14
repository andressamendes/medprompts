import Phaser from 'phaser';

export const GAME_CONFIG = {
  // Canvas size
  width: 1280,
  height: 720,

  // Tile size
  tileSize: 32,

  // Player settings
  player: {
    speed: 150,
    size: 32,
    collisionRadius: 16,
  },

  // Camera settings
  camera: {
    zoom: 1,
    smoothing: 0.1,
  },

  // Room capacities (not used in single player, but kept for UI)
  rooms: {
    lobby: { max: 1, name: 'Lobby' },
    emergency: { max: 1, name: 'Emergency Room' },
    ward: { max: 1, name: 'General Ward' },
    icu: { max: 1, name: 'ICU' },
    surgical: { max: 1, name: 'Surgical Room' },
  },

  // Colors
  colors: {
    background: 0x1a1a2e,
    primary: 0x0f3460,
    secondary: 0x16213e,
    accent: 0xe94560,
    text: 0xffffff,
  },
};

export const PHASER_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-game',
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  backgroundColor: GAME_CONFIG.colors.background,
  pixelArt: true, // For crisp pixel graphics
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 }, // Top-down game, no gravity
      debug: import.meta.env.DEV, // Show debug in development
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

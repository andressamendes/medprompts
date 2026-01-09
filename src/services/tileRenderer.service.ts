import { Tile, Furniture, Decoration, HospitalMap } from '../types/tile.types';

/**
 * Paleta de cores estilo Stardew Valley - tons pastéis e acolhedores
 */
interface ColorPalette {
  floor: string[];
  wall: string;
  door: string;
  window: string;
  void: string;
  furniture: {
    wood: string;
    woodDark: string;
    metal: string;
    fabric: string;
    screen: string;
  };
  decoration: {
    plant: string;
    plantDark: string;
    pot: string;
    frame: string;
    red: string;
    grey: string;
    white: string;
    green: string;
  };
  shadow: string;
}

export class TileRenderer {
  private context: CanvasRenderingContext2D;
  private tileSize: number;
  private scale: number;
  private colors: ColorPalette;

  constructor(context: CanvasRenderingContext2D, tileSize: number = 16, scale: number = 2) {
    this.context = context;
    this.tileSize = tileSize;
    this.scale = scale;

    // Paleta Stardew Valley - tons pastéis premium
    this.colors = {
      floor: ['#E8D4F8', '#E0CCF0', '#D8C4E8'],
      wall: '#B8A0D0',
      door: '#8B7355',
      window: '#A8D8EA',
      void: '#000000',
      furniture: {
        wood: '#8B7355',
        woodDark: '#6B5545',
        metal: '#BDC3C7',
        fabric: '#ECF0F1',
        screen: '#3498DB'
      },
      decoration: {
        plant: '#82E0AA',
        plantDark: '#52B788',
        pot: '#8B6F47',
        frame: '#A0826D',
        red: '#E74C3C',
        grey: '#7F8C8D',
        white: '#ECF0F1',
        green: '#2ECC71'
      },
      shadow: 'rgba(0, 0, 0, 0.15)'
    };
  }

  /**
   * Renderiza um tile individual
   */
  renderTile(tile: Tile): void {
    const x = tile.x * this.tileSize * this.scale;
    const y = tile.y * this.tileSize * this.scale;
    const size = this.tileSize * this.scale;

    this.context.save();

    switch (tile.type) {
      case 'floor':
        this.renderFloorTile(x, y, size, tile.variant || 0);
        break;
      case 'wall':
        this.renderWallTile(x, y, size);
        break;
      case 'door':
        this.renderDoorTile(x, y, size);
        break;
      case 'window':
        this.renderWindowTile(x, y, size);
        break;
      case 'void':
        this.renderVoidTile(x, y, size);
        break;
    }

    this.context.restore();
  }

  private renderFloorTile(x: number, y: number, size: number, variant: number): void {
    const colorIndex = variant % this.colors.floor.length;
    const color = this.colors.floor[colorIndex];

    // Piso com textura sutil
    this.context.fillStyle = color;
    this.context.fillRect(x, y, size, size);

    // Borda sutil para definição
    this.context.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    this.context.lineWidth = 1;
    this.context.strokeRect(x, y, size, size);

    // Pequenos detalhes de textura
    if (variant % 2 === 0) {
      this.context.fillStyle = 'rgba(255, 255, 255, 0.1)';
      this.context.fillRect(x + 2, y + 2, 2, 2);
    }
  }

  private renderWallTile(x: number, y: number, size: number): void {
    // Parede com efeito 3D
    this.context.fillStyle = this.colors.wall;
    this.context.fillRect(x, y, size, size);

    // Gradiente para efeito 3D
    const gradient = this.context.createLinearGradient(x, y, x, y + size);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
    this.context.fillStyle = gradient;
    this.context.fillRect(x, y, size, size);

    // Borda mais escura
    this.context.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    this.context.lineWidth = 1;
    this.context.strokeRect(x, y, size, size);
  }

  private renderDoorTile(x: number, y: number, size: number): void {
    // Porta de madeira
    this.context.fillStyle = this.colors.door;
    this.context.fillRect(x, y, size, size);

    // Detalhes da porta
    this.context.fillStyle = this.colors.furniture.woodDark;
    this.context.fillRect(x + size * 0.1, y + size * 0.1, size * 0.8, size * 0.8);

    // Maçaneta
    this.context.fillStyle = this.colors.furniture.metal;
    this.context.beginPath();
    this.context.arc(x + size * 0.7, y + size * 0.5, size * 0.08, 0, Math.PI * 2);
    this.context.fill();
  }

  private renderWindowTile(x: number, y: number, size: number): void {
    // Moldura
    this.context.fillStyle = this.colors.furniture.wood;
    this.context.fillRect(x, y, size, size);

    // Vidro
    this.context.fillStyle = this.colors.window;
    this.context.fillRect(x + size * 0.15, y + size * 0.15, size * 0.7, size * 0.7);

    // Reflexo
    this.context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.context.fillRect(x + size * 0.15, y + size * 0.15, size * 0.3, size * 0.3);
  }

  private renderVoidTile(x: number, y: number, size: number): void {
    this.context.fillStyle = this.colors.void;
    this.context.fillRect(x, y, size, size);
  }

  /**
   * Renderiza um móvel
   */
  renderFurniture(furniture: Furniture): void {
    const x = furniture.x * this.tileSize * this.scale;
    const y = furniture.y * this.tileSize * this.scale;
    const width = furniture.width * this.tileSize * this.scale;
    const height = furniture.height * this.tileSize * this.scale;

    this.context.save();

    // Sombra embaixo do móvel
    this.context.fillStyle = this.colors.shadow;
    this.context.fillRect(x + 2, y + height - 2, width, 4);

    switch (furniture.type) {
      case 'bed':
        this.renderBed(x, y, width, height);
        break;
      case 'chair':
        this.renderChair(x, y, width, height);
        break;
      case 'desk':
        this.renderDesk(x, y, width, height);
        break;
      case 'counter':
        this.renderCounter(x, y, width, height);
        break;
      case 'cabinet':
        this.renderCabinet(x, y, width, height);
        break;
      case 'computer':
        this.renderComputer(x, y, width, height);
        break;
      case 'equipment':
        this.renderEquipment(x, y, width, height);
        break;
    }

    this.context.restore();
  }

  private renderBed(x: number, y: number, width: number, height: number): void {
    // Estrutura metálica
    this.context.fillStyle = this.colors.furniture.metal;
    this.context.fillRect(x, y, width, height);

    // Colchão
    this.context.fillStyle = this.colors.furniture.fabric;
    this.context.fillRect(x + 4, y + 4, width - 8, height - 8);

    // Travesseiro
    this.context.fillStyle = '#FFFFFF';
    this.context.fillRect(x + width * 0.1, y + 8, width * 0.3, height * 0.25);

    // Lençol com padrão
    this.context.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    this.context.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      this.context.beginPath();
      this.context.moveTo(x + 4, y + 12 + i * 8);
      this.context.lineTo(x + width - 4, y + 12 + i * 8);
      this.context.stroke();
    }
  }

  private renderChair(x: number, y: number, width: number, height: number): void {
    // Assento
    this.context.fillStyle = this.colors.furniture.wood;
    this.context.fillRect(x + 4, y + height * 0.5, width - 8, height * 0.3);

    // Encosto
    this.context.fillStyle = this.colors.furniture.wood;
    this.context.fillRect(x + 6, y, width - 12, height * 0.6);

    // Pernas (pequenos retângulos)
    this.context.fillStyle = this.colors.furniture.woodDark;
    const legWidth = 3;
    this.context.fillRect(x + 6, y + height * 0.7, legWidth, height * 0.3);
    this.context.fillRect(x + width - 9, y + height * 0.7, legWidth, height * 0.3);
  }

  private renderDesk(x: number, y: number, width: number, height: number): void {
    // Tampo da mesa
    this.context.fillStyle = this.colors.furniture.wood;
    this.context.fillRect(x, y, width, height * 0.4);

    // Gradiente 3D no tampo
    const gradient = this.context.createLinearGradient(x, y, x, y + height * 0.4);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
    this.context.fillStyle = gradient;
    this.context.fillRect(x, y, width, height * 0.4);

    // Gavetas
    this.context.fillStyle = this.colors.furniture.woodDark;
    this.context.fillRect(x + 4, y + height * 0.5, width * 0.4, height * 0.35);

    // Puxadores
    this.context.fillStyle = this.colors.furniture.metal;
    this.context.fillRect(x + width * 0.15, y + height * 0.65, width * 0.1, 3);
  }

  private renderCounter(x: number, y: number, width: number, height: number): void {
    // Base do balcão
    this.context.fillStyle = this.colors.furniture.wood;
    this.context.fillRect(x, y + height * 0.3, width, height * 0.7);

    // Topo do balcão
    this.context.fillStyle = this.colors.furniture.metal;
    this.context.fillRect(x, y, width, height * 0.35);

    // Brilho no topo
    this.context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.context.fillRect(x + 4, y + 2, width - 8, 4);
  }

  private renderCabinet(x: number, y: number, width: number, height: number): void {
    // Corpo do armário
    this.context.fillStyle = this.colors.furniture.wood;
    this.context.fillRect(x, y, width, height);

    // Portas
    this.context.strokeStyle = this.colors.furniture.woodDark;
    this.context.lineWidth = 2;
    this.context.strokeRect(x + 4, y + 4, width / 2 - 6, height - 8);
    this.context.strokeRect(x + width / 2 + 2, y + 4, width / 2 - 6, height - 8);

    // Maçanetas
    this.context.fillStyle = this.colors.furniture.metal;
    const handleSize = 4;
    this.context.fillRect(x + width / 4 - handleSize / 2, y + height / 2, handleSize, handleSize);
    this.context.fillRect(x + (3 * width) / 4 - handleSize / 2, y + height / 2, handleSize, handleSize);
  }

  private renderComputer(x: number, y: number, width: number, height: number): void {
    // Monitor
    this.context.fillStyle = '#2C3E50';
    this.context.fillRect(x + 4, y, width - 8, height * 0.7);

    // Tela azul
    this.context.fillStyle = this.colors.furniture.screen;
    this.context.fillRect(x + 8, y + 4, width - 16, height * 0.6);

    // Base do monitor
    this.context.fillStyle = this.colors.furniture.metal;
    this.context.fillRect(x + width * 0.3, y + height * 0.7, width * 0.4, height * 0.15);

    // Teclado
    this.context.fillStyle = '#34495E';
    this.context.fillRect(x + 2, y + height * 0.85, width - 4, height * 0.15);
  }

  private renderEquipment(x: number, y: number, width: number, height: number): void {
    // Corpo do equipamento
    this.context.fillStyle = this.colors.furniture.metal;
    this.context.fillRect(x, y, width, height);

    // Painel frontal
    this.context.fillStyle = '#95A5A6';
    this.context.fillRect(x + 4, y + 4, width - 8, height * 0.4);

    // Detalhes coloridos (LEDs)
    this.context.fillStyle = this.colors.decoration.green;
    this.context.beginPath();
    this.context.arc(x + width * 0.2, y + height * 0.2, 3, 0, Math.PI * 2);
    this.context.fill();

    this.context.fillStyle = this.colors.furniture.screen;
    this.context.beginPath();
    this.context.arc(x + width * 0.4, y + height * 0.2, 3, 0, Math.PI * 2);
    this.context.fill();

    // Rodas se for carrinho (verificar tamanho)
    if (width >= this.tileSize * this.scale * 2) {
      this.context.fillStyle = '#2C3E50';
      const wheelRadius = 4;
      this.context.beginPath();
      this.context.arc(x + 8, y + height - 4, wheelRadius, 0, Math.PI * 2);
      this.context.fill();
      this.context.beginPath();
      this.context.arc(x + width - 8, y + height - 4, wheelRadius, 0, Math.PI * 2);
      this.context.fill();
    }
  }

  /**
   * Renderiza uma decoração
   */
  renderDecoration(decoration: Decoration, currentFrame: number = 0): void {
    const x = decoration.x * this.tileSize * this.scale;
    const y = decoration.y * this.tileSize * this.scale;
    const size = this.tileSize * this.scale;

    this.context.save();

    switch (decoration.type) {
      case 'plant':
        this.renderPlant(x, y, size, currentFrame);
        break;
      case 'painting':
        this.renderPainting(x, y, size);
        break;
      case 'clock':
        this.renderClock(x, y, size, currentFrame);
        break;
      case 'trash':
        this.renderTrash(x, y, size);
        break;
      case 'extinguisher':
        this.renderExtinguisher(x, y, size);
        break;
      case 'monitor':
        this.renderMonitor(x, y, size, currentFrame);
        break;
    }

    this.context.restore();
  }

  private renderPlant(x: number, y: number, size: number, frame: number): void {
    // Vaso
    this.context.fillStyle = this.colors.decoration.pot;
    this.context.beginPath();
    this.context.moveTo(x + size * 0.3, y + size * 0.6);
    this.context.lineTo(x + size * 0.7, y + size * 0.6);
    this.context.lineTo(x + size * 0.65, y + size);
    this.context.lineTo(x + size * 0.35, y + size);
    this.context.closePath();
    this.context.fill();

    // Folhas (animadas com leve movimento)
    const sway = Math.sin(frame * 0.1) * 2;
    this.context.fillStyle = this.colors.decoration.plant;

    // Folha esquerda
    this.context.beginPath();
    this.context.arc(x + size * 0.3 + sway, y + size * 0.4, size * 0.15, 0, Math.PI * 2);
    this.context.fill();

    // Folha direita
    this.context.beginPath();
    this.context.arc(x + size * 0.7 - sway, y + size * 0.4, size * 0.15, 0, Math.PI * 2);
    this.context.fill();

    // Folha central
    this.context.fillStyle = this.colors.decoration.plantDark;
    this.context.beginPath();
    this.context.arc(x + size * 0.5, y + size * 0.3, size * 0.2, 0, Math.PI * 2);
    this.context.fill();
  }

  private renderPainting(x: number, y: number, size: number): void {
    // Moldura
    this.context.fillStyle = this.colors.decoration.frame;
    this.context.fillRect(x, y, size, size);

    // Interior do quadro (paisagem abstrata)
    const colors = ['#3498DB', '#2ECC71', '#F39C12', '#E74C3C'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    this.context.fillStyle = randomColor;
    this.context.fillRect(x + 4, y + 4, size - 8, size - 8);

    // Detalhes
    this.context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.context.fillRect(x + 6, y + 6, size * 0.3, size * 0.3);
  }

  private renderClock(x: number, y: number, size: number, frame: number): void {
    // Fundo do relógio
    this.context.fillStyle = this.colors.decoration.white;
    this.context.beginPath();
    this.context.arc(x + size / 2, y + size / 2, size * 0.4, 0, Math.PI * 2);
    this.context.fill();

    // Borda
    this.context.strokeStyle = this.colors.decoration.frame;
    this.context.lineWidth = 2;
    this.context.stroke();

    // Ponteiros (baseado no frame)
    const centerX = x + size / 2;
    const centerY = y + size / 2;

    // Ponteiro dos minutos
    const minuteAngle = (frame / 60) * Math.PI * 2 - Math.PI / 2;
    this.context.strokeStyle = '#2C3E50';
    this.context.lineWidth = 2;
    this.context.beginPath();
    this.context.moveTo(centerX, centerY);
    this.context.lineTo(
      centerX + Math.cos(minuteAngle) * size * 0.3,
      centerY + Math.sin(minuteAngle) * size * 0.3
    );
    this.context.stroke();

    // Ponteiro das horas
    const hourAngle = (frame / 720) * Math.PI * 2 - Math.PI / 2;
    this.context.lineWidth = 3;
    this.context.beginPath();
    this.context.moveTo(centerX, centerY);
    this.context.lineTo(
      centerX + Math.cos(hourAngle) * size * 0.2,
      centerY + Math.sin(hourAngle) * size * 0.2
    );
    this.context.stroke();

    // Centro
    this.context.fillStyle = '#2C3E50';
    this.context.beginPath();
    this.context.arc(centerX, centerY, 3, 0, Math.PI * 2);
    this.context.fill();
  }

  private renderTrash(x: number, y: number, size: number): void {
    // Lixeira cilíndrica
    this.context.fillStyle = this.colors.decoration.grey;
    this.context.fillRect(x + size * 0.2, y + size * 0.3, size * 0.6, size * 0.7);

    // Tampa
    this.context.fillStyle = '#95A5A6';
    this.context.fillRect(x + size * 0.15, y + size * 0.2, size * 0.7, size * 0.15);

    // Detalhes
    this.context.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    this.context.lineWidth = 1;
    this.context.strokeRect(x + size * 0.2, y + size * 0.3, size * 0.6, size * 0.7);
  }

  private renderExtinguisher(x: number, y: number, size: number): void {
    // Corpo do extintor
    this.context.fillStyle = this.colors.decoration.red;
    this.context.fillRect(x + size * 0.3, y + size * 0.2, size * 0.4, size * 0.7);

    // Topo
    this.context.fillStyle = '#2C3E50';
    this.context.fillRect(x + size * 0.35, y + size * 0.1, size * 0.3, size * 0.15);

    // Mangueira
    this.context.strokeStyle = '#2C3E50';
    this.context.lineWidth = 2;
    this.context.beginPath();
    this.context.moveTo(x + size * 0.4, y + size * 0.3);
    this.context.lineTo(x + size * 0.2, y + size * 0.5);
    this.context.stroke();

    // Label branco
    this.context.fillStyle = this.colors.decoration.white;
    this.context.fillRect(x + size * 0.35, y + size * 0.5, size * 0.3, size * 0.15);
  }

  private renderMonitor(x: number, y: number, size: number, frame: number): void {
    // Base do monitor médico
    this.context.fillStyle = '#2C3E50';
    this.context.fillRect(x, y, size, size * 0.8);

    // Tela
    this.context.fillStyle = '#1E272E';
    this.context.fillRect(x + 4, y + 4, size - 8, size * 0.6);

    // Linha ECG animada
    this.context.strokeStyle = this.colors.decoration.green;
    this.context.lineWidth = 2;
    this.context.beginPath();

    const segments = 8;
    for (let i = 0; i < segments; i++) {
      const xPos = x + 4 + ((size - 8) / segments) * i;
      const offset = i === Math.floor(frame % segments) ? -8 : 0;
      const yPos = y + size * 0.35 + offset;

      if (i === 0) {
        this.context.moveTo(xPos, yPos);
      } else {
        this.context.lineTo(xPos, yPos);
      }
    }
    this.context.stroke();
  }

  /**
   * Renderiza o mapa completo em layers
   */
  renderMap(map: HospitalMap, animationFrame: number = 0): void {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

    // Layer 1: Todos os tiles de piso
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        this.renderTile(map.tiles[y][x]);
      }
    }

    // Layer 2: Decorações floor
    const floorDecorations = map.decorations.filter(d => d.layer === 'background');
    floorDecorations.forEach(deco => {
      this.renderDecoration(deco, animationFrame);
    });

    // Layer 3: Móveis (parte inferior - sombras já são renderizadas aqui)
    map.furniture.forEach(furniture => {
      this.renderFurniture(furniture);
    });

    // Layer 4: Sombras dos avatares (será implementado depois)
    // ...

    // Layer 5: Avatares (será implementado depois)
    // ...

    // Layer 6: Móveis altos (parte superior) - por enquanto não temos móveis de duas partes
    // ...

    // Layer 7: Decorações wall e ceiling
    const wallDecorations = map.decorations.filter(d => d.layer === 'foreground');
    wallDecorations.forEach(deco => {
      this.renderDecoration(deco, animationFrame);
    });
  }

  /**
   * Limpa o canvas
   */
  clear(): void {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
  }

  /**
   * Atualiza o contexto de renderização
   */
  setContext(context: CanvasRenderingContext2D): void {
    this.context = context;
  }

  /**
   * Atualiza a escala de renderização
   */
  setScale(scale: number): void {
    this.scale = scale;
  }
}

import { User } from '../types/studyRoom.types';
import { Direction } from '../types/movement.types';
import { AVATAR_CATALOG, CLASS_YEARS } from '../types/avatar.types';

/**
 * Serviço de renderização de sprites pixel art estilo Stardew Valley
 */
export class SpriteRenderer {
  private context: CanvasRenderingContext2D;
  private tileSize: number;
  private scale: number;

  // Dimensões do sprite
  private readonly SPRITE_WIDTH = 16;
  private readonly SPRITE_HEIGHT = 24;

  // Timing de animação
  private readonly WALK_ANIMATION_SPEED = 200; // ms por frame

  constructor(context: CanvasRenderingContext2D, tileSize: number = 16, scale: number = 2) {
    this.context = context;
    this.tileSize = tileSize;
    this.scale = scale;
  }

  /**
   * Desenha um avatar completo com sombra e tag
   */
  drawAvatar(
    user: User,
    x: number,
    y: number,
    isCurrentUser: boolean = false
  ): void {
    this.context.save();

    const scaledX = x * this.tileSize * this.scale;
    const scaledY = y * this.tileSize * this.scale;

    // Desenhar sombra
    this.drawShadow(scaledX, scaledY);

    // Desenhar sprite
    this.drawAvatarSprite(user, scaledX, scaledY);

    // Desenhar tag de identificação
    this.drawNameTag(user, scaledX, scaledY, isCurrentUser);

    this.context.restore();
  }

  /**
   * Desenha a sombra do avatar
   */
  private drawShadow(x: number, y: number): void {
    const shadowWidth = this.SPRITE_WIDTH * this.scale * 0.6;
    const shadowHeight = 4 * this.scale;
    const shadowX = x + (this.SPRITE_WIDTH * this.scale - shadowWidth) / 2;
    const shadowY = y + this.SPRITE_HEIGHT * this.scale - shadowHeight;

    this.context.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.context.beginPath();
    this.context.ellipse(
      shadowX + shadowWidth / 2,
      shadowY + shadowHeight / 2,
      shadowWidth / 2,
      shadowHeight / 2,
      0,
      0,
      Math.PI * 2
    );
    this.context.fill();
  }

  /**
   * Desenha o sprite do avatar baseado em direção e estado
   */
  private drawAvatarSprite(user: User, x: number, y: number): void {
    const avatarInfo = AVATAR_CATALOG[user.avatar.avatarType];
    const colors = avatarInfo.colors;

    // Calcular frame de animação
    const walkFrame = user.animationFrame % 4;

    switch (user.movementState) {
      case 'walking':
        this.drawWalkingSprite(x, y, user.direction, walkFrame, colors);
        break;
      case 'sitting':
        this.drawSittingSprite(x, y, colors);
        break;
      case 'lying':
        this.drawLyingSprite(x, y, colors);
        break;
      case 'using':
        this.drawUsingSprite(x, y, user.direction, colors);
        break;
      case 'idle':
      default:
        this.drawIdleSprite(x, y, user.direction, user.animationFrame, colors);
        break;
    }

    // Desenhar indicador de status (aura)
    this.drawStatusAura(x, y, user.status);
  }

  /**
   * Desenha sprite caminhando
   */
  private drawWalkingSprite(
    x: number,
    y: number,
    direction: Direction,
    frame: number,
    colors: any
  ): void {
    const s = this.scale;

    // Offset de pernas para animação de caminhada
    const legOffset = frame % 2 === 0 ? 2 * s : -2 * s;

    switch (direction) {
      case 'down':
        this.drawFrontSprite(x, y, colors, legOffset);
        break;
      case 'up':
        this.drawBackSprite(x, y, colors, legOffset);
        break;
      case 'left':
        this.drawSideSprite(x, y, colors, legOffset, true);
        break;
      case 'right':
        this.drawSideSprite(x, y, colors, legOffset, false);
        break;
    }
  }

  /**
   * Desenha sprite parado (idle)
   */
  private drawIdleSprite(
    x: number,
    y: number,
    direction: Direction,
    frame: number,
    colors: any
  ): void {
    // Animação sutil de respiração
    const breathOffset = Math.sin(frame * 0.05) * this.scale * 0.5;

    switch (direction) {
      case 'down':
        this.drawFrontSprite(x, y + breathOffset, colors, 0);
        break;
      case 'up':
        this.drawBackSprite(x, y + breathOffset, colors, 0);
        break;
      case 'left':
        this.drawSideSprite(x, y + breathOffset, colors, 0, true);
        break;
      case 'right':
        this.drawSideSprite(x, y + breathOffset, colors, 0, false);
        break;
    }
  }

  /**
   * Desenha sprite de frente
   */
  private drawFrontSprite(x: number, y: number, colors: any, legOffset: number): void {
    const s = this.scale;

    // Cabeça
    this.context.fillStyle = colors.skin;
    this.context.fillRect(x + 4 * s, y + 2 * s, 8 * s, 8 * s);

    // Cabelo
    this.context.fillStyle = colors.hair;
    this.context.fillRect(x + 3 * s, y + 1 * s, 10 * s, 5 * s);

    // Corpo (uniforme)
    this.context.fillStyle = colors.uniform;
    this.context.fillRect(x + 3 * s, y + 10 * s, 10 * s, 8 * s);

    // Braços
    this.context.fillStyle = colors.accent;
    this.context.fillRect(x + 2 * s, y + 11 * s, 2 * s, 6 * s);
    this.context.fillRect(x + 12 * s, y + 11 * s, 2 * s, 6 * s);

    // Pernas (animadas)
    this.context.fillStyle = colors.uniform;
    this.context.fillRect(x + 4 * s + legOffset, y + 18 * s, 3 * s, 6 * s);
    this.context.fillRect(x + 9 * s - legOffset, y + 18 * s, 3 * s, 6 * s);

    // Detalhes faciais
    this.drawFace(x + 4 * s, y + 2 * s, 8 * s);
  }

  /**
   * Desenha sprite de costas
   */
  private drawBackSprite(x: number, y: number, colors: any, legOffset: number): void {
    const s = this.scale;

    // Cabeça
    this.context.fillStyle = colors.skin;
    this.context.fillRect(x + 4 * s, y + 2 * s, 8 * s, 8 * s);

    // Cabelo (parte de trás)
    this.context.fillStyle = colors.hair;
    this.context.fillRect(x + 3 * s, y + 1 * s, 10 * s, 6 * s);

    // Corpo
    this.context.fillStyle = colors.uniform;
    this.context.fillRect(x + 3 * s, y + 10 * s, 10 * s, 8 * s);

    // Braços
    this.context.fillStyle = colors.accent;
    this.context.fillRect(x + 2 * s, y + 11 * s, 2 * s, 6 * s);
    this.context.fillRect(x + 12 * s, y + 11 * s, 2 * s, 6 * s);

    // Pernas (animadas)
    this.context.fillStyle = colors.uniform;
    this.context.fillRect(x + 4 * s + legOffset, y + 18 * s, 3 * s, 6 * s);
    this.context.fillRect(x + 9 * s - legOffset, y + 18 * s, 3 * s, 6 * s);
  }

  /**
   * Desenha sprite de lado
   */
  private drawSideSprite(
    x: number,
    y: number,
    colors: any,
    legOffset: number,
    facingLeft: boolean
  ): void {
    const s = this.scale;
    const flip = facingLeft ? 1 : -1;
    const baseX = facingLeft ? x : x + this.SPRITE_WIDTH * s;

    this.context.save();
    if (!facingLeft) {
      this.context.scale(-1, 1);
    }

    // Cabeça
    this.context.fillStyle = colors.skin;
    this.context.fillRect(baseX + flip * 5 * s, y + 2 * s, 8 * s, 8 * s);

    // Cabelo
    this.context.fillStyle = colors.hair;
    this.context.fillRect(baseX + flip * 4 * s, y + 1 * s, 9 * s, 6 * s);

    // Corpo
    this.context.fillStyle = colors.uniform;
    this.context.fillRect(baseX + flip * 4 * s, y + 10 * s, 9 * s, 8 * s);

    // Braço visível
    this.context.fillStyle = colors.accent;
    this.context.fillRect(baseX + flip * 11 * s, y + 11 * s, 2 * s, 6 * s);

    // Pernas (animadas) - uma na frente, uma atrás
    this.context.fillStyle = colors.uniform;
    this.context.fillRect(baseX + flip * (5 * s + legOffset), y + 18 * s, 3 * s, 6 * s);
    this.context.fillRect(baseX + flip * (8 * s - legOffset), y + 18 * s, 3 * s, 6 * s);

    // Perfil do rosto
    this.drawSideProfile(baseX + flip * 5 * s, y + 2 * s, facingLeft);

    this.context.restore();
  }

  /**
   * Desenha sprite sentado
   */
  private drawSittingSprite(x: number, y: number, colors: any): void {
    const s = this.scale;
    const offsetY = 6 * s; // Offset para simular sentado

    // Cabeça
    this.context.fillStyle = colors.skin;
    this.context.fillRect(x + 4 * s, y + 2 * s + offsetY, 8 * s, 8 * s);

    // Cabelo
    this.context.fillStyle = colors.hair;
    this.context.fillRect(x + 3 * s, y + 1 * s + offsetY, 10 * s, 5 * s);

    // Corpo (mais comprimido)
    this.context.fillStyle = colors.uniform;
    this.context.fillRect(x + 3 * s, y + 10 * s + offsetY, 10 * s, 6 * s);

    // Braços descansando
    this.context.fillStyle = colors.accent;
    this.context.fillRect(x + 2 * s, y + 11 * s + offsetY, 2 * s, 4 * s);
    this.context.fillRect(x + 12 * s, y + 11 * s + offsetY, 2 * s, 4 * s);

    // Pernas dobradas
    this.context.fillStyle = colors.uniform;
    this.context.fillRect(x + 4 * s, y + 16 * s + offsetY, 3 * s, 4 * s);
    this.context.fillRect(x + 9 * s, y + 16 * s + offsetY, 3 * s, 4 * s);

    // Detalhes faciais
    this.drawFace(x + 4 * s, y + 2 * s + offsetY, 8 * s);
  }

  /**
   * Desenha sprite deitado
   */
  private drawLyingSprite(x: number, y: number, colors: any): void {
    const s = this.scale;

    // Corpo deitado (rotacionado visualmente)
    this.context.fillStyle = colors.uniform;
    this.context.fillRect(x + 2 * s, y + 10 * s, 12 * s, 8 * s);

    // Cabeça deitada
    this.context.fillStyle = colors.skin;
    this.context.fillRect(x + 2 * s, y + 6 * s, 6 * s, 6 * s);

    // Cabelo
    this.context.fillStyle = colors.hair;
    this.context.fillRect(x + 2 * s, y + 5 * s, 7 * s, 4 * s);

    // Braços ao lado do corpo
    this.context.fillStyle = colors.accent;
    this.context.fillRect(x + 2 * s, y + 11 * s, 12 * s, 2 * s);

    // Pernas estendidas
    this.context.fillStyle = colors.uniform;
    this.context.fillRect(x + 8 * s, y + 14 * s, 6 * s, 8 * s);
  }

  /**
   * Desenha sprite usando algo
   */
  private drawUsingSprite(x: number, y: number, direction: Direction, colors: any): void {
    // Similar ao idle, mas com braço estendido
    const s = this.scale;

    this.drawIdleSprite(x, y, direction, 0, colors);

    // Desenhar braço estendido (dependendo da direção)
    this.context.fillStyle = colors.accent;
    if (direction === 'right') {
      this.context.fillRect(x + 12 * s, y + 12 * s, 4 * s, 2 * s);
    } else if (direction === 'left') {
      this.context.fillRect(x, y + 12 * s, 4 * s, 2 * s);
    }
  }

  /**
   * Desenha rosto (olhos e boca)
   */
  private drawFace(x: number, y: number, _size: number): void {
    const s = this.scale;

    // Olhos
    this.context.fillStyle = '#2C3E50';
    this.context.fillRect(x + 2 * s, y + 3 * s, s, s);
    this.context.fillRect(x + 5 * s, y + 3 * s, s, s);

    // Boca (pequeno sorriso)
    this.context.fillStyle = '#E74C3C';
    this.context.fillRect(x + 3 * s, y + 6 * s, 2 * s, s);
  }

  /**
   * Desenha perfil lateral do rosto
   */
  private drawSideProfile(x: number, y: number, facingLeft: boolean): void {
    const s = this.scale;
    const flip = facingLeft ? 1 : -1;

    // Olho
    this.context.fillStyle = '#2C3E50';
    this.context.fillRect(x + flip * 2 * s, y + 3 * s, s, s);

    // Nariz (pequeno ponto)
    this.context.fillStyle = '#2C3E50';
    this.context.fillRect(x + flip * 6 * s, y + 4 * s, s, s);
  }

  /**
   * Desenha aura de status ao redor do avatar
   */
  private drawStatusAura(x: number, y: number, status: string): void {
    let auraColor: string;

    switch (status) {
      case 'FOCUS':
        auraColor = 'rgba(231, 76, 60, 0.3)'; // Vermelho
        break;
      case 'SHORT_BREAK':
        auraColor = 'rgba(52, 152, 219, 0.3)'; // Azul
        break;
      case 'LONG_BREAK':
        auraColor = 'rgba(46, 204, 113, 0.3)'; // Verde
        break;
      case 'OFFLINE':
        auraColor = 'rgba(149, 165, 166, 0.2)'; // Cinza
        break;
      default:
        return;
    }

    const s = this.scale;
    const centerX = x + (this.SPRITE_WIDTH * s) / 2;
    const centerY = y + (this.SPRITE_HEIGHT * s) / 2;
    const radius = (this.SPRITE_WIDTH * s) / 2 + 2 * s;

    this.context.fillStyle = auraColor;
    this.context.beginPath();
    this.context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.context.fill();
  }

  /**
   * Desenha tag de identificação acima do avatar
   */
  private drawNameTag(
    user: User,
    x: number,
    y: number,
    isCurrentUser: boolean
  ): void {
    const s = this.scale;
    const tagY = y - 10 * s;

    // Preparar texto
    const text = isCurrentUser ? '✨ VOCÊ' : user.avatar.classYear;
    const classYearColor = CLASS_YEARS[user.avatar.classYear].color;

    // Medir texto
    this.context.font = `bold ${8 * s}px monospace`;
    const metrics = this.context.measureText(text);
    const textWidth = metrics.width;

    // Retângulo arredondado
    const padding = 4 * s;
    const tagWidth = textWidth + padding * 2;
    const tagHeight = 12 * s;
    const tagX = x + (this.SPRITE_WIDTH * s - tagWidth) / 2;

    // Fundo da tag
    this.context.fillStyle = isCurrentUser ? '#F39C12' : classYearColor;
    this.roundRect(tagX, tagY, tagWidth, tagHeight, 4 * s);
    this.context.fill();

    // Borda
    this.context.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    this.context.lineWidth = 1;
    this.context.stroke();

    // Texto
    this.context.fillStyle = '#FFFFFF';
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.context.fillText(text, tagX + tagWidth / 2, tagY + tagHeight / 2);

    // Indicador de status pulsante
    this.drawStatusIndicator(tagX + tagWidth - 6 * s, tagY + 6 * s, user.status);
  }

  /**
   * Desenha indicador de status pulsante
   */
  private drawStatusIndicator(x: number, y: number, status: string): void {
    let indicatorColor: string;

    switch (status) {
      case 'FOCUS':
        indicatorColor = '#E74C3C'; // Vermelho
        break;
      case 'SHORT_BREAK':
        indicatorColor = '#3498DB'; // Azul
        break;
      case 'LONG_BREAK':
        indicatorColor = '#2ECC71'; // Verde
        break;
      case 'OFFLINE':
        indicatorColor = '#95A5A6'; // Cinza
        break;
      default:
        indicatorColor = '#FFFFFF';
    }

    const s = this.scale;
    const radius = 2 * s;

    // Círculo pulsante
    this.context.fillStyle = indicatorColor;
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, Math.PI * 2);
    this.context.fill();

    // Borda branca
    this.context.strokeStyle = '#FFFFFF';
    this.context.lineWidth = 1;
    this.context.stroke();
  }

  /**
   * Utilitário para desenhar retângulo arredondado
   */
  private roundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    this.context.beginPath();
    this.context.moveTo(x + radius, y);
    this.context.lineTo(x + width - radius, y);
    this.context.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.context.lineTo(x + width, y + height - radius);
    this.context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.context.lineTo(x + radius, y + height);
    this.context.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.context.lineTo(x, y + radius);
    this.context.quadraticCurveTo(x, y, x + radius, y);
    this.context.closePath();
  }

  /**
   * Atualiza a animação do usuário
   */
  updateAnimation(user: User, deltaTime: number): void {
    switch (user.movementState) {
      case 'walking':
        // Animação de caminhada (4 frames, ~200ms cada)
        if (deltaTime % this.WALK_ANIMATION_SPEED < 50) {
          user.animationFrame = (user.animationFrame + 1) % 4;
        }
        break;

      case 'idle':
        // Animação de respiração (suave)
        user.animationFrame = (user.animationFrame + 1) % 60;
        break;

      case 'sitting':
      case 'lying':
      case 'using':
        // Frame fixo
        user.animationFrame = 0;
        break;
    }
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

import { Position } from '../types/movement.types';
import { Furniture } from '../types/tile.types';

export interface TooltipData {
  text: string;
  x: number;
  y: number;
}

/**
 * Serviço para renderizar indicadores visuais no canvas
 */
export class VisualIndicators {
  private context: CanvasRenderingContext2D;
  private tileSize: number;
  private scale: number;

  constructor(context: CanvasRenderingContext2D, tileSize: number = 16, scale: number = 2) {
    this.context = context;
    this.tileSize = tileSize;
    this.scale = scale;
  }

  /**
   * Desenha highlight verde sobre móvel interativo
   */
  drawFurnitureHighlight(furniture: Furniture, alpha: number = 0.3): void {
    const x = furniture.x * this.tileSize * this.scale;
    const y = furniture.y * this.tileSize * this.scale;
    const width = furniture.width * this.tileSize * this.scale;
    const height = furniture.height * this.tileSize * this.scale;

    this.context.save();

    // Highlight verde brilhante
    this.context.fillStyle = `rgba(46, 204, 113, ${alpha})`;
    this.context.fillRect(x, y, width, height);

    // Borda verde mais intensa
    this.context.strokeStyle = `rgba(46, 204, 113, ${alpha + 0.3})`;
    this.context.lineWidth = 2 * this.scale;
    this.context.strokeRect(x, y, width, height);

    // Efeito de pulso (cantos)
    this.context.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
    const cornerSize = 4 * this.scale;

    // Canto superior esquerdo
    this.context.fillRect(x, y, cornerSize, cornerSize);
    // Canto superior direito
    this.context.fillRect(x + width - cornerSize, y, cornerSize, cornerSize);
    // Canto inferior esquerdo
    this.context.fillRect(x, y + height - cornerSize, cornerSize, cornerSize);
    // Canto inferior direito
    this.context.fillRect(x + width - cornerSize, y + height - cornerSize, cornerSize, cornerSize);

    this.context.restore();
  }

  /**
   * Desenha highlight vermelho para móvel ocupado
   */
  drawOccupiedHighlight(furniture: Furniture): void {
    const x = furniture.x * this.tileSize * this.scale;
    const y = furniture.y * this.tileSize * this.scale;
    const width = furniture.width * this.tileSize * this.scale;
    const height = furniture.height * this.tileSize * this.scale;

    this.context.save();

    // Highlight vermelho suave
    this.context.fillStyle = 'rgba(231, 76, 60, 0.2)';
    this.context.fillRect(x, y, width, height);

    // Borda vermelha
    this.context.strokeStyle = 'rgba(231, 76, 60, 0.5)';
    this.context.lineWidth = 2 * this.scale;
    this.context.setLineDash([4 * this.scale, 4 * this.scale]);
    this.context.strokeRect(x, y, width, height);

    this.context.restore();
  }

  /**
   * Desenha seta no chão mostrando destino
   */
  drawDestinationMarker(position: Position, pulse: number = 0): void {
    const x = position.x * this.tileSize * this.scale;
    const y = position.y * this.tileSize * this.scale;
    const size = this.tileSize * this.scale;

    this.context.save();

    // Círculo pulsante
    const pulseSize = size / 2 + Math.sin(pulse * 0.1) * (size / 6);
    const pulseAlpha = 0.5 + Math.sin(pulse * 0.1) * 0.2;

    this.context.fillStyle = `rgba(52, 152, 219, ${pulseAlpha * 0.3})`;
    this.context.beginPath();
    this.context.arc(
      x + size / 2,
      y + size / 2,
      pulseSize,
      0,
      Math.PI * 2
    );
    this.context.fill();

    // Círculo central
    this.context.fillStyle = `rgba(52, 152, 219, ${pulseAlpha})`;
    this.context.beginPath();
    this.context.arc(
      x + size / 2,
      y + size / 2,
      size / 4,
      0,
      Math.PI * 2
    );
    this.context.fill();

    // Borda branca
    this.context.strokeStyle = `rgba(255, 255, 255, ${pulseAlpha})`;
    this.context.lineWidth = 2;
    this.context.stroke();

    // X no centro
    this.context.strokeStyle = `rgba(255, 255, 255, ${pulseAlpha + 0.3})`;
    this.context.lineWidth = 2 * this.scale;
    const crossSize = size / 6;
    this.context.beginPath();
    this.context.moveTo(x + size / 2 - crossSize, y + size / 2 - crossSize);
    this.context.lineTo(x + size / 2 + crossSize, y + size / 2 + crossSize);
    this.context.moveTo(x + size / 2 + crossSize, y + size / 2 - crossSize);
    this.context.lineTo(x + size / 2 - crossSize, y + size / 2 + crossSize);
    this.context.stroke();

    this.context.restore();
  }

  /**
   * Desenha tooltip com nome do móvel
   */
  drawTooltip(tooltip: TooltipData): void {
    this.context.save();

    // Configurar fonte
    const fontSize = 12 * this.scale;
    this.context.font = `bold ${fontSize}px monospace`;
    this.context.textAlign = 'center';
    this.context.textBaseline = 'bottom';

    // Medir texto
    const metrics = this.context.measureText(tooltip.text);
    const textWidth = metrics.width;
    const textHeight = fontSize;

    // Dimensões do tooltip
    const padding = 6 * this.scale;
    const tooltipWidth = textWidth + padding * 2;
    const tooltipHeight = textHeight + padding * 2;
    const tooltipX = tooltip.x - tooltipWidth / 2;
    const tooltipY = tooltip.y - tooltipHeight - 10 * this.scale;

    // Sombra
    this.context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.roundRect(
      tooltipX + 2,
      tooltipY + 2,
      tooltipWidth,
      tooltipHeight,
      4 * this.scale
    );
    this.context.fill();

    // Fundo do tooltip
    this.context.fillStyle = 'rgba(44, 62, 80, 0.95)';
    this.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4 * this.scale);
    this.context.fill();

    // Borda
    this.context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    this.context.lineWidth = 1;
    this.context.stroke();

    // Texto
    this.context.fillStyle = '#FFFFFF';
    this.context.fillText(tooltip.text, tooltip.x, tooltipY + tooltipHeight - padding);

    // Pequena seta apontando para baixo
    this.context.fillStyle = 'rgba(44, 62, 80, 0.95)';
    this.context.beginPath();
    this.context.moveTo(tooltip.x - 4 * this.scale, tooltipY + tooltipHeight);
    this.context.lineTo(tooltip.x + 4 * this.scale, tooltipY + tooltipHeight);
    this.context.lineTo(tooltip.x, tooltipY + tooltipHeight + 4 * this.scale);
    this.context.closePath();
    this.context.fill();

    this.context.restore();
  }

  /**
   * Desenha trail suave atrás do avatar ao andar
   */
  drawMovementTrail(positions: Position[], alpha: number = 0.3): void {
    if (positions.length < 2) return;

    this.context.save();

    for (let i = 0; i < positions.length - 1; i++) {
      const pos = positions[i];
      const x = pos.x * this.tileSize * this.scale + (this.tileSize * this.scale) / 2;
      const y = pos.y * this.tileSize * this.scale + (this.tileSize * this.scale) / 2;

      // Alpha decrescente para criar efeito de fade
      const fadeAlpha = alpha * (1 - i / positions.length);

      this.context.fillStyle = `rgba(52, 152, 219, ${fadeAlpha})`;
      this.context.beginPath();
      this.context.arc(x, y, 3 * this.scale, 0, Math.PI * 2);
      this.context.fill();
    }

    this.context.restore();
  }

  /**
   * Desenha caminho planejado (pathfinding preview)
   */
  drawPlannedPath(path: Position[], color: string = '#3498DB'): void {
    if (path.length < 2) return;

    this.context.save();

    // Linha do caminho
    this.context.strokeStyle = color;
    this.context.lineWidth = 2 * this.scale;
    this.context.setLineDash([4 * this.scale, 4 * this.scale]);
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';

    this.context.beginPath();
    for (let i = 0; i < path.length; i++) {
      const x = path[i].x * this.tileSize * this.scale + (this.tileSize * this.scale) / 2;
      const y = path[i].y * this.tileSize * this.scale + (this.tileSize * this.scale) / 2;

      if (i === 0) {
        this.context.moveTo(x, y);
      } else {
        this.context.lineTo(x, y);
      }
    }
    this.context.stroke();

    // Pontos no caminho
    path.forEach((pos, index) => {
      if (index === 0 || index === path.length - 1) return; // Pular início e fim

      const x = pos.x * this.tileSize * this.scale + (this.tileSize * this.scale) / 2;
      const y = pos.y * this.tileSize * this.scale + (this.tileSize * this.scale) / 2;

      this.context.fillStyle = color;
      this.context.beginPath();
      this.context.arc(x, y, 2 * this.scale, 0, Math.PI * 2);
      this.context.fill();
    });

    this.context.restore();
  }

  /**
   * Desenha indicador de sugestão Pomodoro
   */
  drawSuggestionIndicator(furniture: Furniture, emoji: string = '💡'): void {
    const x = furniture.x * this.tileSize * this.scale;
    const y = furniture.y * this.tileSize * this.scale;
    const width = furniture.width * this.tileSize * this.scale;

    this.context.save();

    // Círculo amarelo acima do móvel
    const indicatorX = x + width / 2;
    const indicatorY = y - 10 * this.scale;
    const radius = 8 * this.scale;

    // Sombra
    this.context.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.context.beginPath();
    this.context.arc(indicatorX + 1, indicatorY + 1, radius, 0, Math.PI * 2);
    this.context.fill();

    // Círculo amarelo
    this.context.fillStyle = '#F39C12';
    this.context.beginPath();
    this.context.arc(indicatorX, indicatorY, radius, 0, Math.PI * 2);
    this.context.fill();

    // Borda branca
    this.context.strokeStyle = '#FFFFFF';
    this.context.lineWidth = 2;
    this.context.stroke();

    // Emoji
    this.context.font = `${12 * this.scale}px Arial`;
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.context.fillText(emoji, indicatorX, indicatorY);

    this.context.restore();
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

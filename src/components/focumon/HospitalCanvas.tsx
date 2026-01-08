import { useEffect, useRef } from 'react';

interface HospitalCanvasProps {
  mode: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';
}

export const HospitalCanvas = ({ mode }: HospitalCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar tamanho do canvas
    const width = 1200;
    const height = 700;
    canvas.width = width;
    canvas.height = height;

    // Determinar horário do dia baseado no modo
    const getTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 12) return 'morning';
      if (hour >= 12 && hour < 18) return 'afternoon';
      if (hour >= 18 && hour < 24) return 'evening';
      return 'night';
    };

    const timeOfDay = getTimeOfDay();

    // Cores baseadas no horário e modo
    const getColors = () => {
      const base = {
        morning: {
          sky: '#87CEEB',
          wall: '#B8D4C8',
          floor: '#E8E8E8',
          shadow: 'rgba(0,0,0,0.1)'
        },
        afternoon: {
          sky: '#FFD580',
          wall: '#A8C4B8',
          floor: '#E0E0E0',
          shadow: 'rgba(0,0,0,0.15)'
        },
        evening: {
          sky: '#FF9966',
          wall: '#98B4A8',
          floor: '#D8D8D8',
          shadow: 'rgba(0,0,0,0.2)'
        },
        night: {
          sky: '#1A1A2E',
          wall: '#2C5F4F',
          floor: '#C0C0C0',
          shadow: 'rgba(0,0,0,0.4)'
        }
      };

      return base[timeOfDay];
    };

    const colors = getColors();

    // Função para desenhar retângulo com sombra
    const drawRect = (x: number, y: number, w: number, h: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    };

    // Desenhar piso com azulejos
    const drawTiledFloor = () => {
      const tileSize = 50;
      for (let x = 0; x < width; x += tileSize) {
        for (let y = 500; y < height; y += tileSize) {
          const isLight = ((x / tileSize) + (y / tileSize)) % 2 === 0;
          drawRect(x, y, tileSize, tileSize, isLight ? colors.floor : '#D0D0D0');
          // Borda do azulejo
          ctx.strokeStyle = '#A0A0A0';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, tileSize, tileSize);
        }
      }
    };

    // Desenhar parede
    const drawWall = () => {
      drawRect(0, 0, width, 500, colors.wall);
      
      // Rodapé
      drawRect(0, 480, width, 20, '#8B8B8B');
    };

    // Desenhar janela com vista externa
    const drawWindow = () => {
      const x = 850, y = 80, w = 280, h = 200;
      
      // Moldura da janela
      ctx.fillStyle = '#6B5B4A';
      ctx.fillRect(x - 10, y - 10, w + 20, h + 20);
      
      // Vidro
      ctx.fillStyle = colors.sky;
      ctx.fillRect(x, y, w, h);
      
      // Vista externa - hospital
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 40, y + 120, 60, 70); // Prédio
      ctx.fillRect(x + 160, y + 140, 50, 50); // Ambulância
      
      // Cruz vermelha no prédio
      ctx.fillStyle = '#E74C3C';
      ctx.fillRect(x + 60, y + 140, 20, 8);
      ctx.fillRect(x + 66, y + 134, 8, 20);
      
      // Divisórias da janela
      ctx.strokeStyle = '#6B5B4A';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x + w / 2, y + h);
      ctx.moveTo(x, y + h / 2);
      ctx.lineTo(x + w, y + h / 2);
      ctx.stroke();
    };

    // Desenhar quadro branco com anatomia
    const drawWhiteboard = () => {
      const x = 100, y = 100, w = 250, h = 180;
      
      // Moldura
      ctx.fillStyle = '#8B7355';
      ctx.fillRect(x - 8, y - 8, w + 16, h + 16);
      
      // Quadro
      ctx.fillStyle = '#F5F5F5';
      ctx.fillRect(x, y, w, h);
      
      // Desenho de coração (anatomia simplificada)
      ctx.strokeStyle = '#E74C3C';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 125, y + 60);
      ctx.lineTo(x + 100, y + 90);
      ctx.lineTo(x + 125, y + 130);
      ctx.lineTo(x + 150, y + 90);
      ctx.closePath();
      ctx.stroke();
      
      // Texto "ANATOMIA"
      ctx.fillStyle = '#2C3E50';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('ANATOMIA', x + 80, y + 30);
      
      // Anotações
      ctx.font = '12px monospace';
      ctx.fillText('Átrio', x + 20, y + 60);
      ctx.fillText('Ventrículo', x + 20, y + 100);
      ctx.fillText('Artéria', x + 20, y + 140);
    };

    // Desenhar estante de livros
    const drawBookshelf = () => {
      const x = 50, y = 320, w = 150, h = 160;
      
      // Estrutura da estante
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x, y, w, h);
      
      // Prateleiras
      ctx.fillStyle = '#6B3410';
      ctx.fillRect(x, y + 50, w, 5);
      ctx.fillRect(x, y + 105, w, 5);
      
      // Livros (prateleira superior)
      const bookColors = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6'];
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = bookColors[i];
        ctx.fillRect(x + 10 + (i * 26), y + 10, 20, 35);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 10 + (i * 26), y + 10, 20, 35);
      }
      
      // Livros (prateleira do meio)
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = bookColors[4 - i];
        ctx.fillRect(x + 10 + (i * 26), y + 65, 20, 35);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 10 + (i * 26), y + 65, 20, 35);
      }
      
      // Livros (prateleira inferior)
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = bookColors[i];
        ctx.fillRect(x + 10 + (i * 26), y + 120, 20, 35);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 10 + (i * 26), y + 120, 20, 35);
      }
    };

    // Desenhar pôster de anatomia
    const drawAnatomyPoster = () => {
      const x = 700, y = 100, w = 120, h = 160;
      
      // Moldura
      ctx.fillStyle = '#2C3E50';
      ctx.fillRect(x - 5, y - 5, w + 10, h + 10);
      
      // Pôster
      ctx.fillStyle = '#ECF0F1';
      ctx.fillRect(x, y, w, h);
      
      // Desenho simplificado de corpo humano
      ctx.fillStyle = '#E74C3C';
      // Cabeça
      ctx.beginPath();
      ctx.arc(x + 60, y + 30, 15, 0, Math.PI * 2);
      ctx.fill();
      // Corpo
      ctx.fillRect(x + 50, y + 45, 20, 50);
      // Braços
      ctx.fillRect(x + 35, y + 50, 15, 8);
      ctx.fillRect(x + 70, y + 50, 15, 8);
      // Pernas
      ctx.fillRect(x + 50, y + 95, 8, 40);
      ctx.fillRect(x + 62, y + 95, 8, 40);
      
      // Título
      ctx.fillStyle = '#2C3E50';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('SISTEMAS', x + 35, y + 150);
    };

    // Desenhar relógio na parede
    const drawWallClock = () => {
      const x = 600, y = 150, r = 30;
      
      // Moldura
      ctx.fillStyle = '#2C3E50';
      ctx.beginPath();
      ctx.arc(x, y, r + 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Face
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      
      // Ponteiros (sempre mostrando 10:10)
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      
      // Ponteiro das horas
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 10, y - 15);
      ctx.stroke();
      
      // Ponteiro dos minutos
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 8, y - 20);
      ctx.stroke();
      
      // Centro
      ctx.fillStyle = '#E74C3C';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    // Desenhar mesas de estudo (4 posições)
    const drawStudyDesks = () => {
      const positions = [
        { x: 250, y: 520 },
        { x: 500, y: 520 },
        { x: 750, y: 520 },
        { x: 1000, y: 520 }
      ];

      positions.forEach((pos, index) => {
        // Mesa
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(pos.x, pos.y, 120, 80);
        
        // Tampo da mesa (destaque)
        ctx.fillStyle = '#A0826D';
        ctx.fillRect(pos.x, pos.y, 120, 10);
        
        // Livro aberto na mesa
        ctx.fillStyle = '#3498DB';
        ctx.fillRect(pos.x + 20, pos.y + 20, 35, 25);
        ctx.fillStyle = '#E8E8E8';
        ctx.fillRect(pos.x + 20, pos.y + 20, 17, 25);
        
        // Caneta
        ctx.fillStyle = '#E74C3C';
        ctx.fillRect(pos.x + 65, pos.y + 30, 30, 3);
        
        // Cadeira
        ctx.fillStyle = '#34495E';
        ctx.fillRect(pos.x + 30, pos.y + 90, 60, 15);
        ctx.fillRect(pos.x + 50, pos.y + 75, 20, 30);
        
        // Número da mesa
        ctx.fillStyle = '#2C3E50';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(`#${index + 1}`, pos.x + 50, pos.y + 55);
      });
    };

    // Desenhar carrinho de emergência
    const drawEmergencyCart = () => {
      const x = 1050, y = 400, w = 100, h = 90;
      
      // Corpo do carrinho
      ctx.fillStyle = '#E74C3C';
      ctx.fillRect(x, y, w, h);
      
      // Gavetas
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 5, y + 10, w - 10, 20);
      ctx.fillRect(x + 5, y + 35, w - 10, 20);
      ctx.fillRect(x + 5, y + 60, w - 10, 20);
      
      // Puxadores
      ctx.fillStyle = '#2C3E50';
      ctx.fillRect(x + 45, y + 18, 10, 4);
      ctx.fillRect(x + 45, y + 43, 10, 4);
      ctx.fillRect(x + 45, y + 68, 10, 4);
      
      // Rodas
      ctx.fillStyle = '#34495E';
      ctx.beginPath();
      ctx.arc(x + 20, y + h + 5, 8, 0, Math.PI * 2);
      ctx.arc(x + 80, y + h + 5, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Cruz
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 40, y - 15, 20, 8);
      ctx.fillRect(x + 46, y - 21, 8, 20);
    };

    // Desenhar personagem estudando (posição 1)
    const drawStudentCharacter = () => {
      const x = 280, y = 480;
      const pixelSize = 8;
      
      // Cor baseada no modo
      const charColor = mode === 'FOCUS' ? '#4169E1' : mode === 'SHORT_BREAK' ? '#F39C12' : '#9B59B6';
      
      // Cabeça
      ctx.fillStyle = '#FFD7BA';
      ctx.fillRect(x, y, pixelSize * 3, pixelSize * 3);
      
      // Cabelo
      ctx.fillStyle = '#2C1608';
      ctx.fillRect(x, y - pixelSize, pixelSize * 3, pixelSize);
      
      // Corpo (jaleco)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, y + pixelSize * 3, pixelSize * 3, pixelSize * 4);
      
      // Estetoscópio
      ctx.fillStyle = '#2C3E50';
      ctx.fillRect(x + pixelSize, y + pixelSize * 4, pixelSize, pixelSize * 2);
      
      // Braços
      ctx.fillStyle = charColor;
      ctx.fillRect(x - pixelSize, y + pixelSize * 4, pixelSize, pixelSize * 2);
      ctx.fillRect(x + pixelSize * 3, y + pixelSize * 4, pixelSize, pixelSize * 2);
      
      // Indicador de status
      const statusColor = mode === 'FOCUS' ? '#2ECC71' : mode === 'SHORT_BREAK' ? '#F39C12' : '#9B59B6';
      ctx.fillStyle = statusColor;
      ctx.beginPath();
      ctx.arc(x - 15, y, 8, 0, Math.PI * 2);
      ctx.fill();
    };

    // Função principal de renderização
    const render = () => {
      // Limpar canvas
      ctx.clearRect(0, 0, width, height);
      
      // Desenhar elementos em ordem (de trás para frente)
      drawWall();
      drawTiledFloor();
      drawWindow();
      drawWhiteboard();
      drawBookshelf();
      drawAnatomyPoster();
      drawWallClock();
      drawEmergencyCart();
      drawStudyDesks();
      drawStudentCharacter();
    };

    // Animação simples
    let animationFrame: number;
    let offset = 0;

    const animate = () => {
      offset += 0.5;
      render();
      
      // Leve movimento de respiração no personagem
      const bobbing = Math.sin(offset / 20) * 2;
      const x = 280, y = 480 + bobbing;
      const pixelSize = 8;
      
      // Redesenhar personagem com movimento
      const charColor = mode === 'FOCUS' ? '#4169E1' : mode === 'SHORT_BREAK' ? '#F39C12' : '#9B59B6';
      
      ctx.fillStyle = '#FFD7BA';
      ctx.fillRect(x, y, pixelSize * 3, pixelSize * 3);
      ctx.fillStyle = '#2C1608';
      ctx.fillRect(x, y - pixelSize, pixelSize * 3, pixelSize);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, y + pixelSize * 3, pixelSize * 3, pixelSize * 4);
      ctx.fillStyle = '#2C3E50';
      ctx.fillRect(x + pixelSize, y + pixelSize * 4, pixelSize, pixelSize * 2);
      ctx.fillStyle = charColor;
      ctx.fillRect(x - pixelSize, y + pixelSize * 4, pixelSize, pixelSize * 2);
      ctx.fillRect(x + pixelSize * 3, y + pixelSize * 4, pixelSize, pixelSize * 2);
      
      const statusColor = mode === 'FOCUS' ? '#2ECC71' : mode === 'SHORT_BREAK' ? '#F39C12' : '#9B59B6';
      ctx.fillStyle = statusColor;
      ctx.beginPath();
      ctx.arc(x - 15, y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [mode]);

  return (
    <div className="flex justify-center items-center bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden p-4">
      <canvas 
        ref={canvasRef} 
        className="max-w-full h-auto rounded-lg shadow-2xl"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};

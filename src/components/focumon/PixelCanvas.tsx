import { useEffect, useRef } from 'react';

interface PixelCanvasProps {
  mode: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';
}

export const PixelCanvas = ({ mode }: PixelCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar tamanho
    canvas.width = 800;
    canvas.height = 400;

    // Background baseado no modo
    const getBackground = () => {
      switch (mode) {
        case 'FOCUS':
          return { sky: '#87CEEB', ground: '#90EE90' }; // Dia ensolarado
        case 'SHORT_BREAK':
          return { sky: '#FFA07A', ground: '#FFD700' }; // Pôr do sol
        case 'LONG_BREAK':
          return { sky: '#191970', ground: '#4B0082' }; // Noite
      }
    };

    const colors = getBackground();

    // Desenhar céu
    ctx.fillStyle = colors.sky;
    ctx.fillRect(0, 0, 800, 300);

    // Desenhar chão
    ctx.fillStyle = colors.ground;
    ctx.fillRect(0, 300, 800, 100);

    // Desenhar sol/lua
    if (mode === 'LONG_BREAK') {
      // Lua
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(700, 80, 40, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Sol
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(700, 80, 40, 0, Math.PI * 2);
      ctx.fill();
    }

    // Desenhar personagem pixel (simples)
    const drawPixelChar = (x: number, y: number) => {
      const pixelSize = 10;
      
      // Cor baseada no modo
      const charColor = mode === 'FOCUS' ? '#4169E1' : '#FF6347';
      
      // Cabeça
      ctx.fillStyle = charColor;
      ctx.fillRect(x, y, pixelSize * 3, pixelSize * 3);
      
      // Corpo
      ctx.fillRect(x, y + pixelSize * 3, pixelSize * 3, pixelSize * 4);
      
      // Braços
      ctx.fillRect(x - pixelSize, y + pixelSize * 4, pixelSize, pixelSize * 2);
      ctx.fillRect(x + pixelSize * 3, y + pixelSize * 4, pixelSize, pixelSize * 2);
      
      // Pernas
      ctx.fillRect(x, y + pixelSize * 7, pixelSize, pixelSize * 3);
      ctx.fillRect(x + pixelSize * 2, y + pixelSize * 7, pixelSize, pixelSize * 3);
    };

    drawPixelChar(100, 200);

    // Animação simples (opcional)
    let animationFrame: number;
    let offset = 0;

    const animate = () => {
      offset += 0.5;
      
      // Redesenhar tudo
      ctx.fillStyle = colors.sky;
      ctx.fillRect(0, 0, 800, 300);
      ctx.fillStyle = colors.ground;
      ctx.fillRect(0, 300, 800, 100);
      
      // Sol/Lua
      if (mode === 'LONG_BREAK') {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(700, 80, 40, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(700, 80, 40, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Personagem com leve movimento
      const bobbing = Math.sin(offset / 10) * 3;
      drawPixelChar(100, 200 + bobbing);
      
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
        className="max-w-full h-auto rounded-lg"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};

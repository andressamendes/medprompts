import { useEffect, useRef } from 'react';
import { User } from '@/types/studyRoom.types';

interface HospitalConferenceRoomProps {
  mode: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';
  currentUser?: User;
  otherUsers?: User[];
}

export const HospitalConferenceRoom = ({ 
  mode, 
  currentUser,
  otherUsers = [] 
}: HospitalConferenceRoomProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1200;
    const height = 600;
    canvas.width = width;
    canvas.height = height;

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'FOCUS': return '#2ECC71';
        case 'SHORT_BREAK': return '#F39C12';
        case 'LONG_BREAK': return '#9B59B6';
        default: return '#95A5A6';
      }
    };

    const drawRect = (x: number, y: number, w: number, h: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    };

    const drawText = (text: string, x: number, y: number, size: number, color: string) => {
      ctx.fillStyle = color;
      ctx.font = `${size}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(text, x, y);
    };

    const drawUserAvatar = (user: User) => {
      const x = user.position.x || 100;
      const y = user.position.y || 100;
      
      const statusColor = getStatusColor(user.status);
      
      // Sombra
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.ellipse(x, y + 25, 15, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Corpo
      ctx.fillStyle = statusColor;
      ctx.beginPath();
      ctx.ellipse(x, y, 20, 25, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Cabeça
      ctx.fillStyle = '#FFD7BA';
      ctx.beginPath();
      ctx.arc(x, y - 20, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Tag do usuário
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      const tagText = user.id === 'current-user' ? 'VOCÊ' : user.username;
      const textWidth = ctx.measureText(tagText).width;
      ctx.fillRect(x - textWidth/2 - 5, y - 50, textWidth + 10, 20);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(tagText, x, y - 35);
    };

    const render = () => {
      // Background (sala de conferência)
      ctx.fillStyle = '#34495E';
      ctx.fillRect(0, 0, width, height);

      // Piso
      ctx.fillStyle = '#2C3E50';
      ctx.fillRect(0, height - 100, width, 100);

      // Mesa de conferência (oval grande no centro)
      ctx.fillStyle = '#8B7355';
      ctx.beginPath();
      ctx.ellipse(width / 2, height / 2, 300, 150, 0, 0, Math.PI * 2);
      ctx.fill();

      // Borda da mesa
      ctx.strokeStyle = '#6B5745';
      ctx.lineWidth = 8;
      ctx.stroke();

      // Projetor/tela ao fundo
      drawRect(width / 2 - 200, 50, 400, 150, '#FFFFFF');
      drawRect(width / 2 - 195, 55, 390, 140, '#E8E8E8');
      
      // Título na tela
      const modeText = mode === 'FOCUS' ? '🎯 FOCO TOTAL' : 
                       mode === 'SHORT_BREAK' ? '☕ PAUSA CURTA' : 
                       '🌙 PAUSA LONGA';
      drawText(modeText, width / 2, 130, 24, '#2C3E50');

      // Cadeiras ao redor da mesa (decorativas)
      const chairPositions = [
        { x: width / 2, y: height / 2 - 200 },
        { x: width / 2 - 250, y: height / 2 - 100 },
        { x: width / 2 + 250, y: height / 2 - 100 },
        { x: width / 2 - 250, y: height / 2 + 100 },
        { x: width / 2 + 250, y: height / 2 + 100 },
        { x: width / 2, y: height / 2 + 200 },
      ];

      chairPositions.forEach(pos => {
        ctx.fillStyle = '#7F8C8D';
        ctx.fillRect(pos.x - 15, pos.y - 10, 30, 40);
        ctx.fillRect(pos.x - 20, pos.y - 30, 40, 20);
      });

      // Plantas decorativas nos cantos
      ctx.fillStyle = '#27AE60';
      ctx.beginPath();
      ctx.arc(50, 50, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(width - 50, 50, 30, 0, Math.PI * 2);
      ctx.fill();

      // Desenhar todos os usuários
      const allUsers = currentUser ? [currentUser, ...otherUsers] : otherUsers;
      
      allUsers.forEach(user => {
        drawUserAvatar(user);
      });

      // Stats na parte inferior
      const statsY = height - 40;
      drawRect(0, statsY, width, 40, 'rgba(44, 62, 80, 0.9)');
      
      const focusing = allUsers.filter(u => u.status === 'FOCUS').length;
      const shortBreak = allUsers.filter(u => u.status === 'SHORT_BREAK').length;
      const longBreak = allUsers.filter(u => u.status === 'LONG_BREAK').length;
      
      ctx.fillStyle = '#ECF0F1';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`👥 ${allUsers.length} usuários`, 20, statsY + 25);
      ctx.fillText(`🟢 ${focusing} focando`, 150, statsY + 25);
      ctx.fillText(`🟡 ${shortBreak} pausa curta`, 280, statsY + 25);
      ctx.fillText(`🟣 ${longBreak} pausa longa`, 450, statsY + 25);
      
      const now = new Date();
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      ctx.textAlign = 'right';
      ctx.fillText(`🕐 ${timeStr}`, width - 20, statsY + 25);
    };

    let animationFrame: number;
    const animate = () => {
      render();
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [mode, currentUser, otherUsers]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center items-center bg-gray-100 dark:bg-gray-900 rounded-lg overflow-auto">
        <canvas 
          ref={canvasRef} 
          className="rounded-lg shadow-2xl"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
      
      <div className="flex flex-wrap gap-4 justify-center text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Focando</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span>Pausa Curta</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span>Pausa Longa</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <span>Offline</span>
        </div>
      </div>
    </div>
  );
};

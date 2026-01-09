import { useEffect, useRef } from 'react';
import { User } from '@/types/studyRoom.types';
import { AVATAR_CATALOG, CLASS_YEARS } from '@/types/avatar.types';

interface HospitalInfirmaryProps {
  mode: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';
  currentUser?: User;
  otherUsers?: User[];
}

export const HospitalInfirmary = ({ 
  mode, 
  currentUser,
  otherUsers = [] 
}: HospitalInfirmaryProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1200;
    const height = 800;
    canvas.width = width;
    canvas.height = height;

    const drawRect = (x: number, y: number, w: number, h: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    };

    const drawText = (text: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'left') => {
      ctx.fillStyle = color;
      ctx.font = `${size}px Arial`;
      ctx.textAlign = align;
      ctx.fillText(text, x, y);
    };

    // Desenhar piso da enfermaria
    const drawFloor = () => {
      const tileSize = 40;
      for (let x = 0; x < width; x += tileSize) {
        for (let y = 0; y < height; y += tileSize) {
          const isLight = ((x / tileSize) + (y / tileSize)) % 2 === 0;
          drawRect(x, y, tileSize, tileSize, isLight ? '#E8E8E8' : '#D8D8D8');
        }
      }
    };

    // Desenhar paredes e divisórias
    const drawWalls = () => {
      // Parede superior
      drawRect(0, 0, width, 30, '#A8C4B8');
      drawText('🏥 ENFERMARIA HOSPITALAR', width / 2, 20, 18, '#2C3E50', 'center');

      // Parede esquerda
      drawRect(0, 0, 30, height, '#A8C4B8');

      // Parede direita
      drawRect(width - 30, 0, 30, height, '#A8C4B8');

      // Divisórias internas (verticais)
      drawRect(width / 3, 30, 8, height - 30, '#98A4A8');
      drawRect((width / 3) * 2, 30, 8, height - 30, '#98A4A8');

      // Divisória horizontal
      drawRect(30, height / 2, width - 60, 8, '#98A4A8');
    };

    // Área de Triagem (superior esquerda)
    const drawTriageArea = () => {
      const x = 50;
      const y = 60;
      drawText('📋 TRIAGEM', x, y, 14, '#E74C3C', 'left');
      
      // Balcão de recepção
      drawRect(x, y + 10, 100, 60, '#8B7355');
      drawRect(x + 5, y + 15, 90, 50, '#A0826D');
      
      // Cadeiras de espera
      const chairY = y + 90;
      for (let i = 0; i < 3; i++) {
        drawRect(x + (i * 35), chairY, 25, 25, '#34495E');
      }
    };

    // Consultório 1 (superior centro)
    const drawConsultingRoom1 = () => {
      const x = (width / 3) + 40;
      const y = 60;
      drawText('🩺 CONSULTÓRIO 1', x, y, 14, '#3498DB', 'left');
      
      // Mesa do médico
      drawRect(x, y + 10, 80, 50, '#8B7355');
      
      // Maca de exame
      drawRect(x + 100, y + 10, 100, 60, '#E8E8E8');
      drawRect(x + 105, y + 15, 90, 50, '#FFFFFF');
    };

    // Consultório 2 (superior direita)
    const drawConsultingRoom2 = () => {
      const x = ((width / 3) * 2) + 40;
      const y = 60;
      drawText('🩺 CONSULTÓRIO 2', x, y, 14, '#3498DB', 'left');
      
      // Mesa do médico
      drawRect(x, y + 10, 80, 50, '#8B7355');
      
      // Maca de exame
      drawRect(x + 100, y + 10, 100, 60, '#E8E8E8');
      drawRect(x + 105, y + 15, 90, 50, '#FFFFFF');
    };

    // Enfermaria Central (inferior esquerda) - 4 leitos
    const drawInfirmaryBeds = () => {
      const x = 50;
      const y = (height / 2) + 40;
      drawText('🛏️ ENFERMARIA', x, y, 14, '#27AE60', 'left');
      
      // 4 leitos em grid 2x2
      const bedPositions = [
        { x: x, y: y + 10 },
        { x: x + 120, y: y + 10 },
        { x: x, y: y + 110 },
        { x: x + 120, y: y + 110 }
      ];
      
      bedPositions.forEach(pos => {
        // Leito
        drawRect(pos.x, pos.y, 100, 80, '#E8E8E8');
        drawRect(pos.x + 5, pos.y + 5, 90, 70, '#FFFFFF');
        
        // Travesseiro
        drawRect(pos.x + 10, pos.y + 10, 80, 20, '#B8D4E8');
      });
    };

    // Sala de Medicação (inferior centro)
    const drawMedicationRoom = () => {
      const x = (width / 3) + 40;
      const y = (height / 2) + 40;
      drawText('💊 MEDICAÇÃO', x, y, 14, '#F39C12', 'left');
      
      // Balcão de medicamentos
      drawRect(x, y + 10, 120, 60, '#8B7355');
      drawRect(x + 5, y + 15, 110, 50, '#A0826D');
      
      // Armário de medicamentos
      drawRect(x + 140, y + 10, 80, 100, '#5C4033');
      
      // Prateleiras
      for (let i = 0; i < 3; i++) {
        drawRect(x + 145, y + 20 + (i * 30), 70, 3, '#FFFFFF');
      }
    };

    // Sala de Procedimentos (inferior direita)
    const drawProcedureRoom = () => {
      const x = ((width / 3) * 2) + 40;
      const y = (height / 2) + 40;
      drawText('⚕️ PROCEDIMENTOS', x, y, 14, '#9B59B6', 'left');
      
      // Mesa de procedimentos
      drawRect(x, y + 10, 120, 80, '#C0C0C0');
      drawRect(x + 5, y + 15, 110, 70, '#E8E8E8');
      
      // Carrinho de equipamentos
      drawRect(x + 140, y + 10, 60, 80, '#34495E');
      
      // Rodas
      ctx.fillStyle = '#2C3E50';
      ctx.beginPath();
      ctx.arc(x + 150, y + 90, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 190, y + 90, 8, 0, Math.PI * 2);
      ctx.fill();
    };

    // Desenhar avatar estilo Stardew Valley
    const drawAvatar = (user: User) => {
      const { x, y } = user.position;
      const avatar = AVATAR_CATALOG[user.avatar.avatarType];
      const classInfo = CLASS_YEARS[user.avatar.classYear];
      

      // Sombra
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(x, y + 20, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Corpo (uniforme)
      ctx.fillStyle = avatar.colors.uniform;
      drawRect(x - 8, y - 5, 16, 20, avatar.colors.uniform);
      
      // Cabeça
      ctx.fillStyle = avatar.colors.skin;
      ctx.beginPath();
      ctx.arc(x, y - 12, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Cabelo
      ctx.fillStyle = avatar.colors.hair;
      ctx.beginPath();
      ctx.arc(x, y - 16, 9, 0, Math.PI);
      ctx.fill();
      
      // Braços (cor de status)
      const getStatusColor = (status: string) => {
        switch (status) {
          case 'FOCUS': return '#2ECC71';
          case 'SHORT_BREAK': return '#F39C12';
          case 'LONG_BREAK': return '#9B59B6';
          default: return '#95A5A6';
        }
      };
      
      const statusColor = getStatusColor(user.status);
      ctx.fillStyle = statusColor;
      drawRect(x - 12, y - 5, 4, 12, statusColor);
      drawRect(x + 8, y - 5, 4, 12, statusColor);

      // Detalhe do acessório (pequeno acento)
      ctx.fillStyle = avatar.colors.accent;
      ctx.beginPath();
      ctx.arc(x, y + 5, 3, 0, Math.PI * 2);
      ctx.fill();

      // Tag de identificação (Turma + ID)
      const userId = user.id === 'current-user' ? 'VOCÊ' : user.id.slice(-3);
      const tag = user.id === 'current-user' ? 'VOCÊ' : `${user.avatar.classYear} #${userId}`;
      
      // Background da tag
      ctx.fillStyle = classInfo.color;
      const tagWidth = ctx.measureText(tag).width + 10;
      drawRect(x - tagWidth / 2, y - 35, tagWidth, 16, classInfo.color);
      
      // Texto da tag
      drawText(tag, x, y - 23, 10, '#FFFFFF', 'center');
      
      // Indicador de status (círculo pequeno)
      ctx.fillStyle = statusColor;
      ctx.beginPath();
      ctx.arc(x - tagWidth / 2 + 5, y - 27, 3, 0, Math.PI * 2);
      ctx.fill();
    };

    // Função principal de renderização
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      drawFloor();
      drawWalls();
      drawTriageArea();
      drawConsultingRoom1();
      drawConsultingRoom2();
      drawInfirmaryBeds();
      drawMedicationRoom();
      drawProcedureRoom();
      
      // Desenhar todos os usuários
      const allUsers = currentUser ? [currentUser, ...otherUsers] : otherUsers;
      allUsers.forEach(user => {
        drawAvatar(user);
      });

      // Stats inferior
      const statsY = height - 30;
      drawRect(0, statsY, width, 30, 'rgba(44, 62, 80, 0.9)');
      
      const focusing = allUsers.filter(u => u.status === 'FOCUS').length;
      const shortBreak = allUsers.filter(u => u.status === 'SHORT_BREAK').length;
      const longBreak = allUsers.filter(u => u.status === 'LONG_BREAK').length;
      
      drawText(`👥 ${allUsers.length}/30`, 40, statsY + 20, 12, '#FFFFFF');
      drawText(`🟢 ${focusing}`, 140, statsY + 20, 12, '#2ECC71');
      drawText(`🟡 ${shortBreak}`, 210, statsY + 20, 12, '#F39C12');
      drawText(`🟣 ${longBreak}`, 280, statsY + 20, 12, '#9B59B6');
      
      const now = new Date();
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      drawText(`🕐 ${timeStr}`, width - 100, statsY + 20, 12, '#ECF0F1');
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
      <div className="flex justify-center items-center bg-gray-100 dark:bg-gray-900 rounded-lg overflow-auto p-4">
        <canvas 
          ref={canvasRef} 
          className="rounded-lg shadow-2xl"
          style={{ imageRendering: 'pixelated', maxWidth: '100%', height: 'auto' }}
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

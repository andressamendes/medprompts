import { useEffect, useRef } from 'react';

interface User {
  id: string;
  username: string;
  status: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK' | 'OFFLINE';
  position: { row: number; col: number };
}

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

    // Canvas maior para acomodar 50 usuários
    const width = 1400;
    const height = 900;
    canvas.width = width;
    canvas.height = height;

    // Determinar horário do dia
    const getTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 12) return 'morning';
      if (hour >= 12 && hour < 18) return 'afternoon';
      if (hour >= 18 && hour < 24) return 'evening';
      return 'night';
    };

    const timeOfDay = getTimeOfDay();

    // Cores baseadas no horário
    const getColors = () => {
      const base = {
        morning: {
          sky: '#87CEEB',
          wall: '#B8D4C8',
          floor: '#E8E8E8',
          ceiling: '#F5F5F5'
        },
        afternoon: {
          sky: '#FFD580',
          wall: '#A8C4B8',
          floor: '#E0E0E0',
          ceiling: '#F0F0F0'
        },
        evening: {
          sky: '#FF9966',
          wall: '#98B4A8',
          floor: '#D8D8D8',
          ceiling: '#E8E8E8'
        },
        night: {
          sky: '#1A1A2E',
          wall: '#2C5F4F',
          floor: '#C0C0C0',
          ceiling: '#D0D0D0'
        }
      };
      return base[timeOfDay];
    };

    const colors = getColors();

    // Função auxiliar para desenhar retângulo
    const drawRect = (x: number, y: number, w: number, h: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    };

    // Desenhar teto com luzes
    const drawCeiling = () => {
      drawRect(0, 0, width, 100, colors.ceiling);
      
      // Luzes fluorescentes
      const lightSpacing = 200;
      for (let x = 150; x < width - 100; x += lightSpacing) {
        ctx.fillStyle = timeOfDay === 'night' ? '#FFFACD' : '#FFFFFF';
        ctx.fillRect(x, 20, 100, 15);
        ctx.strokeStyle = '#B0B0B0';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, 20, 100, 15);
      }
    };

    // Desenhar parede frontal com projetor
    const drawFrontWall = () => {
      drawRect(0, 100, width, 150, colors.wall);
      
      // Tela de projeção/quadro grande
      const screenX = width / 2 - 250;
      const screenY = 130;
      
      // Moldura
      ctx.fillStyle = '#2C3E50';
      ctx.fillRect(screenX - 10, screenY - 10, 520, 120);
      
      // Tela
      ctx.fillStyle = '#F8F9FA';
      ctx.fillRect(screenX, screenY, 500, 100);
      
      // Texto motivacional
      ctx.fillStyle = '#E74C3C';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('HOSPITAL STUDY ROOM', width / 2, screenY + 45);
      
      ctx.fillStyle = '#2C3E50';
      ctx.font = '20px Arial';
      ctx.fillText('Capacidade: 50 Estudantes', width / 2, screenY + 75);
      
      // Logo médico
      ctx.fillStyle = '#E74C3C';
      ctx.beginPath();
      ctx.arc(screenX + 50, screenY + 50, 25, 0, Math.PI * 2);
      ctx.fill();
      
      // Cruz
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(screenX + 40, screenY + 45, 20, 10);
      ctx.fillRect(screenX + 45, screenY + 40, 10, 20);
    };

    // Desenhar piso com padrão
    const drawFloor = () => {
      const tileSize = 50;
      for (let x = 0; x < width; x += tileSize) {
        for (let y = 250; y < height; y += tileSize) {
          const isLight = ((x / tileSize) + (y / tileSize)) % 2 === 0;
          drawRect(x, y, tileSize, tileSize, isLight ? colors.floor : '#D0D0D0');
        }
      }
    };

    // Desenhar palco/área do professor
    const drawStage = () => {
      // Palco elevado
      ctx.fillStyle = '#8B7355';
      ctx.fillRect(width / 2 - 200, 240, 400, 50);
      
      // Púlpito
      ctx.fillStyle = '#6B5B4A';
      ctx.fillRect(width / 2 - 50, 260, 100, 70);
      
      // Microfone
      ctx.strokeStyle = '#2C3E50';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width / 2, 260);
      ctx.lineTo(width / 2, 240);
      ctx.stroke();
      
      ctx.fillStyle = '#34495E';
      ctx.beginPath();
      ctx.arc(width / 2, 235, 8, 0, Math.PI * 2);
      ctx.fill();
    };

    // Grid de posições para 50 usuários (10 colunas x 5 linhas)
    const GRID_CONFIG = {
      rows: 5,
      cols: 10,
      startX: 150,
      startY: 350,
      spacingX: 110,
      spacingY: 100
    };

    // Desenhar assentos vazios
    const drawSeats = () => {
      for (let row = 0; row < GRID_CONFIG.rows; row++) {
        for (let col = 0; col < GRID_CONFIG.cols; col++) {
          const x = GRID_CONFIG.startX + (col * GRID_CONFIG.spacingX);
          const y = GRID_CONFIG.startY + (row * GRID_CONFIG.spacingY);
          
          // Cadeira
          ctx.fillStyle = '#34495E';
          ctx.fillRect(x + 15, y + 35, 30, 10);
          ctx.fillRect(x + 25, y + 25, 10, 20);
          
          // Mesa pequena
          ctx.fillStyle = '#8B7355';
          ctx.fillRect(x + 10, y + 45, 40, 5);
          
          // Número do assento
          ctx.fillStyle = '#7F8C8D';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          const seatNumber = (row * GRID_CONFIG.cols) + col + 1;
          ctx.fillText(`#${seatNumber}`, x + 30, y + 25);
        }
      }
    };

    // Desenhar avatar de usuário
    const drawUserAvatar = (user: User, row: number, col: number) => {
      const x = GRID_CONFIG.startX + (col * GRID_CONFIG.spacingX);
      const y = GRID_CONFIG.startY + (row * GRID_CONFIG.spacingY);
      const pixelSize = 6;
      
      // Cor baseada no status
      const getStatusColor = (status: string) => {
        switch (status) {
          case 'FOCUS': return '#2ECC71';
          case 'SHORT_BREAK': return '#F39C12';
          case 'LONG_BREAK': return '#9B59B6';
          default: return '#95A5A6';
        }
      };
      
      const statusColor = getStatusColor(user.status);
      
      // Sombra/base
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(x + 15, y + 42, pixelSize * 4, pixelSize);
      
      // Cabeça
      ctx.fillStyle = '#FFD7BA';
      ctx.fillRect(x + 20, y + 10, pixelSize * 3, pixelSize * 3);
      
      // Cabelo
      ctx.fillStyle = '#2C1608';
      ctx.fillRect(x + 20, y + 8, pixelSize * 3, pixelSize);
      
      // Corpo (jaleco)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 20, y + 10 + pixelSize * 3, pixelSize * 3, pixelSize * 4);
      
      // Braços
      ctx.fillStyle = statusColor;
      ctx.fillRect(x + 20 - pixelSize, y + 10 + pixelSize * 4, pixelSize, pixelSize * 2);
      ctx.fillRect(x + 20 + pixelSize * 3, y + 10 + pixelSize * 4, pixelSize, pixelSize * 2);
      
      // Indicador de status (círculo)
      ctx.fillStyle = statusColor;
      ctx.beginPath();
      ctx.arc(x + 15, y + 15, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Nome do usuário (se for o atual)
      if (user.id === currentUser?.id) {
        ctx.fillStyle = '#E74C3C';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('VOCÊ', x + 30, y + 55);
      }
    };

    // Gerar usuários mock para demonstração
    const generateMockUsers = (): User[] => {
      const users: User[] = [];
      const statuses: Array<'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK' | 'OFFLINE'> = 
        ['FOCUS', 'SHORT_BREAK', 'LONG_BREAK', 'OFFLINE'];
      
      // Usuário atual sempre na posição 0,0
      if (currentUser) {
        users.push({
          ...currentUser,
          position: { row: 0, col: 0 }
        });
      }
      
      // Adicionar outros usuários (máximo 49 além do atual)
      const totalUsers = Math.min(otherUsers.length, 49);
      for (let i = 0; i < totalUsers; i++) {
        const row = Math.floor((i + 1) / GRID_CONFIG.cols);
        const col = (i + 1) % GRID_CONFIG.cols;
        
        users.push({
          id: `user-${i + 1}`,
          username: `Estudante ${i + 1}`,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          position: { row, col }
        });
      }
      
      return users;
    };

    // Desenhar estatísticas da sala
    const drawRoomStats = (users: User[]) => {
      const statsY = height - 80;
      
      // Background
      ctx.fillStyle = 'rgba(44, 62, 80, 0.9)';
      ctx.fillRect(20, statsY, width - 40, 60);
      
      // Contar status
      const focusing = users.filter(u => u.status === 'FOCUS').length;
      const shortBreak = users.filter(u => u.status === 'SHORT_BREAK').length;
      const longBreak = users.filter(u => u.status === 'LONG_BREAK').length;
      const offline = users.filter(u => u.status === 'OFFLINE').length;
      
      // Texto
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      
      const statsX = 40;
      ctx.fillText(`👥 Total: ${users.length}/50`, statsX, statsY + 25);
      
      ctx.fillStyle = '#2ECC71';
      ctx.fillText(`🟢 Focando: ${focusing}`, statsX + 150, statsY + 25);
      
      ctx.fillStyle = '#F39C12';
      ctx.fillText(`🟡 Pausa Curta: ${shortBreak}`, statsX + 300, statsY + 25);
      
      ctx.fillStyle = '#9B59B6';
      ctx.fillText(`🟣 Pausa Longa: ${longBreak}`, statsX + 480, statsY + 25);
      
      ctx.fillStyle = '#95A5A6';
      ctx.fillText(`⚪ Offline: ${offline}`, statsX + 660, statsY + 25);
      
      // Horário
      const now = new Date();
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      ctx.fillStyle = '#ECF0F1';
      ctx.textAlign = 'right';
      ctx.fillText(`🕐 ${timeStr}`, width - 40, statsY + 25);
      
      // Capacidade
      ctx.fillText(`Vagas: ${50 - users.length}`, width - 40, statsY + 45);
    };

    // Função principal de renderização
    const render = () => {
      // Limpar canvas
      ctx.clearRect(0, 0, width, height);
      
      // Desenhar elementos fixos
      drawCeiling();
      drawFrontWall();
      drawFloor();
      drawStage();
      drawSeats();
      
      // Gerar e desenhar usuários
      const users = generateMockUsers();
      users.forEach(user => {
        drawUserAvatar(user, user.position.row, user.position.col);
      });
      
      // Desenhar estatísticas
      drawRoomStats(users);
    };

    // Animação
    let animationFrame: number;
    let frame = 0;

    const animate = () => {
      frame++;
      
      // Redesenhar a cada 60 frames (1 segundo em 60fps)
      if (frame % 60 === 0) {
        render();
      }
      
      animationFrame = requestAnimationFrame(animate);
    };

    // Renderização inicial
    render();
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
      
      {/* Legenda */}
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

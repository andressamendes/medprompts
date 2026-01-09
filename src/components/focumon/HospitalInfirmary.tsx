import { useEffect, useRef, useState } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1600, height: 900 });

  // Responsividade automática
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = Math.max(width * 0.5625, 600); // Aspect ratio 16:9, mínimo 600px
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const { width, height } = dimensions;
    const dpr = window.devicePixelRatio || 1;
    
    // High DPI support
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Escala dinâmica baseada no tamanho
    const scale = width / 1600;


    const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x * scale, y * scale, w * scale, h * scale, r * scale);
      ctx.fill();
    };

    const drawText = (text: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center', weight: string = 'normal') => {
      ctx.fillStyle = color;
      ctx.font = `${weight} ${size * scale}px 'Inter', -apple-system, system-ui, sans-serif`;
      ctx.textAlign = align;
      ctx.fillText(text, x * scale, y * scale);
    };

    const drawShadow = (blur: number, color: string) => {
      ctx.shadowColor = color;
      ctx.shadowBlur = blur * scale;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2 * scale;
    };

    const clearShadow = () => {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    };

    // Gradiente para piso
    const createFloorGradient = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#F5F7FA');
      gradient.addColorStop(0.5, '#E8EDF2');
      gradient.addColorStop(1, '#DFE6ED');
      return gradient;
    };

    // Desenhar piso com textura
    const drawFloor = () => {
      ctx.fillStyle = createFloorGradient();
      ctx.fillRect(0, 0, width, height);
      
      // Grid de tiles
      const tileSize = 60 * scale;
      ctx.strokeStyle = '#D0D8E0';
      ctx.lineWidth = 1;
      
      for (let x = 0; x < width; x += tileSize) {
        for (let y = 0; y < height; y += tileSize) {
          ctx.strokeRect(x, y, tileSize, tileSize);
        }
      }
    };

    // Header com logo
    const drawHeader = () => {
      // Background do header com gradiente
      const headerGradient = ctx.createLinearGradient(0, 0, 0, 80 * scale);
      headerGradient.addColorStop(0, '#2C3E50');
      headerGradient.addColorStop(1, '#34495E');
      ctx.fillStyle = headerGradient;
      ctx.fillRect(0, 0, width, 80 * scale);
      
      // Logo MedFocus
      drawText('🏥 MedFocus', width / 2, 50, 32, '#FFFFFF', 'center', 'bold');
      drawText('Enfermaria Virtual', width / 2, 70, 14, '#BDC3C7', 'center', 'normal');
    };

    // Área de Triagem (melhorada)
    const drawTriageArea = () => {
      const x = 60;
      const y = 120;
      
      // Fundo da área com sombra
      drawShadow(15, 'rgba(0,0,0,0.1)');
      drawRoundedRect(x, y, 320, 200, 12, '#FFFFFF');
      clearShadow();
      
      // Borda colorida
      ctx.strokeStyle = '#E74C3C';
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.roundRect(x * scale, y * scale, 320 * scale, 200 * scale, 12 * scale);
      ctx.stroke();
      
      // Título da área
      drawText('📋 TRIAGEM', x + 160, y + 30, 18, '#E74C3C', 'center', 'bold');
      
      // Balcão de recepção 3D
      const deskX = x + 40;
      const deskY = y + 50;
      
      // Sombra do balcão
      drawShadow(15, 'rgba(0,0,0,0.1)');
      
      // Parte frontal
      const frontGradient = ctx.createLinearGradient(
        deskX * scale, deskY * scale, 
        deskX * scale, (deskY + 80) * scale
      );
      frontGradient.addColorStop(0, '#A0826D');
      frontGradient.addColorStop(1, '#8B7355');
      ctx.fillStyle = frontGradient;
      ctx.fillRect(deskX * scale, deskY * scale, 240 * scale, 80 * scale);
      
      // Topo do balcão
      ctx.fillStyle = '#B8967D';
      ctx.fillRect(deskX * scale, deskY * scale, 240 * scale, 10 * scale);
      
      clearShadow();
      
      // Computador no balcão
      ctx.fillStyle = '#34495E';
      ctx.fillRect((deskX + 180) * scale, (deskY + 20) * scale, 40 * scale, 30 * scale);
      ctx.fillStyle = '#5DADE2';
      ctx.fillRect((deskX + 183) * scale, (deskY + 23) * scale, 34 * scale, 24 * scale);
      
      // Cadeiras de espera
      const chairY = y + 150;
      for (let i = 0; i < 4; i++) {
        const chairX = x + 40 + (i * 60);
        
        // Sombra da cadeira
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect((chairX - 2) * scale, (chairY + 30) * scale, 34 * scale, 8 * scale);
        
        // Assento
        ctx.fillStyle = '#3498DB';
        ctx.fillRect(chairX * scale, chairY * scale, 30 * scale, 25 * scale);
        
        // Encosto
        ctx.fillStyle = '#2980B9';
        ctx.fillRect(chairX * scale, (chairY - 20) * scale, 30 * scale, 20 * scale);
      }
    };

    // Consultório com mais detalhes
    const drawConsultingRoom = (x: number, y: number, number: number) => {
      // Fundo
      drawShadow(15, 'rgba(0,0,0,0.1)');
      drawRoundedRect(x, y, 280, 200, 12, '#FFFFFF');
      clearShadow();
      
      // Borda
      ctx.strokeStyle = '#3498DB';
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.roundRect(x * scale, y * scale, 280 * scale, 200 * scale, 12 * scale);
      ctx.stroke();
      
      // Título
      drawText(`🩺 CONSULTÓRIO ${number}`, x + 140, y + 30, 16, '#3498DB', 'center', 'bold');
      
      // Mesa do médico
      ctx.fillStyle = '#8B7355';
      ctx.fillRect((x + 20) * scale, (y + 50) * scale, 100 * scale, 60 * scale);
      ctx.fillStyle = '#A0826D';
      ctx.fillRect((x + 20) * scale, (y + 50) * scale, 100 * scale, 8 * scale);
      
      // Laptop na mesa
      ctx.fillStyle = '#2C3E50';
      ctx.fillRect((x + 40) * scale, (y + 60) * scale, 60 * scale, 40 * scale);
      ctx.fillStyle = '#34495E';
      ctx.fillRect((x + 43) * scale, (y + 63) * scale, 54 * scale, 34 * scale);
      
      // Maca de exame detalhada
      const bedX = x + 150;
      const bedY = y + 50;
      
      // Base da maca
      ctx.fillStyle = '#BDC3C7';
      ctx.fillRect(bedX * scale, bedY * scale, 110 * scale, 80 * scale);
      
      // Colchão
      ctx.fillStyle = '#ECF0F1';
      ctx.fillRect((bedX + 5) * scale, (bedY + 5) * scale, 100 * scale, 70 * scale);
      
      // Travesseiro
      ctx.fillStyle = '#E8F6F3';
      ctx.fillRect((bedX + 10) * scale, (bedY + 10) * scale, 40 * scale, 20 * scale);
      
      // Lençol (detalhe)
      ctx.fillStyle = '#D5F4E6';
      ctx.fillRect((bedX + 10) * scale, (bedY + 35) * scale, 90 * scale, 40 * scale);
      
      // Pés da maca
      ctx.fillStyle = '#95A5A6';
      ctx.fillRect((bedX + 10) * scale, (bedY + 80) * scale, 8 * scale, 20 * scale);
      ctx.fillRect((bedX + 92) * scale, (bedY + 80) * scale, 8 * scale, 20 * scale);
      
      // Equipamentos na parede
      ctx.fillStyle = '#E8E8E8';
      ctx.fillRect((x + 20) * scale, (y + 130) * scale, 40 * scale, 50 * scale);
      ctx.fillStyle = '#FF6B6B';
      ctx.beginPath();
      ctx.arc((x + 40) * scale, (y + 150) * scale, 8 * scale, 0, Math.PI * 2);
      ctx.fill();
    };

    // Enfermaria com leitos
    const drawInfirmaryBeds = () => {
      const x = 60;
      const y = 360;
      
      // Fundo
      drawShadow(15, 'rgba(0,0,0,0.1)');
      drawRoundedRect(x, y, 660, 220, 12, '#FFFFFF');
      clearShadow();
      
      // Borda
      ctx.strokeStyle = '#27AE60';
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.roundRect(x * scale, y * scale, 660 * scale, 220 * scale, 12 * scale);
      ctx.stroke();
      
      // Título
      drawText('🛏️ ENFERMARIA', x + 330, y + 30, 18, '#27AE60', 'center', 'bold');
      
      // 4 leitos em grid 2x2
      const bedPositions = [
        { x: x + 40, y: y + 50 },
        { x: x + 360, y: y + 50 },
        { x: x + 40, y: y + 140 },
        { x: x + 360, y: y + 140 }
      ];
      
      bedPositions.forEach(pos => {
        // Leito completo
        drawShadow(15, 'rgba(0,0,0,0.1)');
        
        // Estrutura
        ctx.fillStyle = '#BDC3C7';
        ctx.fillRect(pos.x * scale, pos.y * scale, 280 * scale, 70 * scale);
        
        // Colchão
        ctx.fillStyle = '#ECF0F1';
        ctx.fillRect((pos.x + 5) * scale, (pos.y + 5) * scale, 270 * scale, 60 * scale);
        
        // Travesseiro
        ctx.fillStyle = '#D5F4E6';
        ctx.fillRect((pos.x + 15) * scale, (pos.y + 10) * scale, 80 * scale, 25 * scale);
        
        // Lençol
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect((pos.x + 15) * scale, (pos.y + 38) * scale, 250 * scale, 27 * scale);
        
        clearShadow();
        
        // Monitor de sinais vitais
        ctx.fillStyle = '#34495E';
        ctx.fillRect((pos.x + 240) * scale, (pos.y - 30) * scale, 50 * scale, 40 * scale);
        ctx.fillStyle = '#27AE60';
        ctx.fillRect((pos.x + 245) * scale, (pos.y - 25) * scale, 40 * scale, 30 * scale);
        
        // Linha do monitor (heartbeat)
        ctx.strokeStyle = '#2ECC71';
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo((pos.x + 250) * scale, (pos.y - 10) * scale);
        ctx.lineTo((pos.x + 255) * scale, (pos.y - 10) * scale);
        ctx.lineTo((pos.x + 258) * scale, (pos.y - 20) * scale);
        ctx.lineTo((pos.x + 262) * scale, (pos.y - 5) * scale);
        ctx.lineTo((pos.x + 265) * scale, (pos.y - 10) * scale);
        ctx.lineTo((pos.x + 275) * scale, (pos.y - 10) * scale);
        ctx.stroke();
      });
    };

    // Sala de Medicação
    const drawMedicationRoom = () => {
      const x = 760;
      const y = 360;
      
      drawShadow(15, 'rgba(0,0,0,0.1)');
      drawRoundedRect(x, y, 300, 220, 12, '#FFFFFF');
      clearShadow();
      
      ctx.strokeStyle = '#F39C12';
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.roundRect(x * scale, y * scale, 300 * scale, 220 * scale, 12 * scale);
      ctx.stroke();
      
      drawText('💊 MEDICAÇÃO', x + 150, y + 30, 16, '#F39C12', 'center', 'bold');
      
      // Balcão de medicamentos
      ctx.fillStyle = '#8B7355';
      ctx.fillRect((x + 30) * scale, (y + 50) * scale, 240 * scale, 80 * scale);
      ctx.fillStyle = '#A0826D';
      ctx.fillRect((x + 30) * scale, (y + 50) * scale, 240 * scale, 10 * scale);
      
      // Armário de medicamentos (detalhado)
      ctx.fillStyle = '#5C4033';
      ctx.fillRect((x + 40) * scale, (y + 140) * scale, 220 * scale, 60 * scale);
      
      // Prateleiras com medicamentos
      const shelfY = [145, 165, 185];
      shelfY.forEach(sy => {
        ctx.fillStyle = '#7F6C60';
        ctx.fillRect((x + 45) * scale, (y + sy) * scale, 210 * scale, 3 * scale);
        
        // Frascos de medicamento
        for (let i = 0; i < 8; i++) {
          const bottleX = x + 50 + (i * 25);
          ctx.fillStyle = i % 3 === 0 ? '#3498DB' : i % 3 === 1 ? '#E74C3C' : '#2ECC71';
          ctx.fillRect(bottleX * scale, (y + sy - 12) * scale, 15 * scale, 12 * scale);
        }
      });
    };

    // Sala de Procedimentos
    const drawProcedureRoom = () => {
      const x = 1100;
      const y = 360;
      
      drawShadow(15, 'rgba(0,0,0,0.1)');
      drawRoundedRect(x, y, 440, 220, 12, '#FFFFFF');
      clearShadow();
      
      ctx.strokeStyle = '#9B59B6';
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.roundRect(x * scale, y * scale, 440 * scale, 220 * scale, 12 * scale);
      ctx.stroke();
      
      drawText('⚕️ PROCEDIMENTOS', x + 220, y + 30, 16, '#9B59B6', 'center', 'bold');
      
      // Mesa cirúrgica
      ctx.fillStyle = '#C0C0C0';
      ctx.fillRect((x + 40) * scale, (y + 60) * scale, 180 * scale, 100 * scale);
      ctx.fillStyle = '#D5D5D5';
      ctx.fillRect((x + 45) * scale, (y + 65) * scale, 170 * scale, 90 * scale);
      
      // Lâmpada cirúrgica (em cima)
      ctx.fillStyle = '#F1C40F';
      ctx.beginPath();
      ctx.ellipse((x + 130) * scale, (y + 45) * scale, 35 * scale, 15 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Raios de luz
      ctx.fillStyle = 'rgba(241, 196, 15, 0.2)';
      ctx.beginPath();
      ctx.moveTo((x + 95) * scale, (y + 50) * scale);
      ctx.lineTo((x + 60) * scale, (y + 90) * scale);
      ctx.lineTo((x + 200) * scale, (y + 90) * scale);
      ctx.lineTo((x + 165) * scale, (y + 50) * scale);
      ctx.closePath();
      ctx.fill();
      
      // Carrinho de instrumentos
      ctx.fillStyle = '#7F8C8D';
      ctx.fillRect((x + 260) * scale, (y + 70) * scale, 140 * scale, 100 * scale);
      
      // Prateleiras do carrinho
      [80, 105, 130].forEach(cy => {
        ctx.fillStyle = '#95A5A6';
        ctx.fillRect((x + 265) * scale, (y + cy) * scale, 130 * scale, 3 * scale);
        
        // Instrumentos
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = '#BDC3C7';
          ctx.fillRect((x + 270 + i * 25) * scale, (y + cy - 8) * scale, 8 * scale, 8 * scale);
        }
      });
      
      // Rodas do carrinho
      ctx.fillStyle = '#34495E';
      ctx.beginPath();
      ctx.arc((x + 280) * scale, (y + 175) * scale, 10 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc((x + 380) * scale, (y + 175) * scale, 10 * scale, 0, Math.PI * 2);
      ctx.fill();
    };

    // Avatar de alta qualidade com animação
    let breatheOffset = 0;
    const drawAvatar = (user: User) => {
      const { x, y } = user.position;
      const avatar = AVATAR_CATALOG[user.avatar.avatarType];
      const classInfo = CLASS_YEARS[user.avatar.classYear];

      // Escala baseada no tamanho da tela
      const avatarScale = scale * 1.2;
      const baseX = x * scale;
      const baseY = y * scale;

      // Sombra realista
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.ellipse(baseX, baseY + (25 * avatarScale), 18 * avatarScale, 6 * avatarScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Efeito de respiração sutil
      const breathe = Math.sin(breatheOffset) * 0.5;

      // Corpo (uniforme) com gradiente
      const bodyGradient = ctx.createLinearGradient(
        baseX - (12 * avatarScale), 
        baseY - (8 * avatarScale), 
        baseX + (12 * avatarScale), 
        baseY + (18 * avatarScale)
      );
      bodyGradient.addColorStop(0, avatar.colors.uniform);
      bodyGradient.addColorStop(1, shadeColor(avatar.colors.uniform, -20));
      ctx.fillStyle = bodyGradient;
      
      ctx.beginPath();
      ctx.roundRect(
        baseX - (12 * avatarScale), 
        (baseY - 8 * avatarScale) + breathe, 
        24 * avatarScale, 
        26 * avatarScale, 
        4 * avatarScale
      );
      ctx.fill();
      
      // Cabeça com gradiente
      const headGradient = ctx.createRadialGradient(
        baseX - (3 * avatarScale), 
        (baseY - 18 * avatarScale) + breathe,
        2 * avatarScale,
        baseX, 
        (baseY - 15 * avatarScale) + breathe, 
        12 * avatarScale
      );
      headGradient.addColorStop(0, lightenColor(avatar.colors.skin, 10));
      headGradient.addColorStop(1, avatar.colors.skin);
      ctx.fillStyle = headGradient;
      ctx.beginPath();
      ctx.arc(baseX, (baseY - 15 * avatarScale) + breathe, 12 * avatarScale, 0, Math.PI * 2);
      ctx.fill();
      
      // Cabelo estilizado
      ctx.fillStyle = avatar.colors.hair;
      ctx.beginPath();
      ctx.arc(baseX, (baseY - 22 * avatarScale) + breathe, 13 * avatarScale, 0, Math.PI);
      ctx.fill();
      
      // Detalhe do cabelo (brilho)
      ctx.fillStyle = lightenColor(avatar.colors.hair, 30);
      ctx.beginPath();
      ctx.arc(baseX - (4 * avatarScale), (baseY - 24 * avatarScale) + breathe, 4 * avatarScale, 0, Math.PI * 2);
      ctx.fill();

      // Olhos
      ctx.fillStyle = '#2C3E50';
      ctx.beginPath();
      ctx.arc(baseX - (4 * avatarScale), (baseY - 16 * avatarScale) + breathe, 1.5 * avatarScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(baseX + (4 * avatarScale), (baseY - 16 * avatarScale) + breathe, 1.5 * avatarScale, 0, Math.PI * 2);
      ctx.fill();

      // Boca (sorriso)
      ctx.strokeStyle = '#E74C3C';
      ctx.lineWidth = 1.5 * avatarScale;
      ctx.beginPath();
      ctx.arc(baseX, (baseY - 12 * avatarScale) + breathe, 4 * avatarScale, 0.2, Math.PI - 0.2);
      ctx.stroke();
      
      // Braços com cor de status
      const statusColor = getStatusColor(user.status);
      ctx.fillStyle = statusColor;
      
      // Braço esquerdo
      ctx.beginPath();
      ctx.roundRect(
        baseX - (18 * avatarScale), 
        (baseY - 8 * avatarScale) + breathe, 
        6 * avatarScale, 
        20 * avatarScale, 
        3 * avatarScale
      );
      ctx.fill();
      
      // Braço direito
      ctx.beginPath();
      ctx.roundRect(
        baseX + (12 * avatarScale), 
        (baseY - 8 * avatarScale) + breathe, 
        6 * avatarScale, 
        20 * avatarScale, 
        3 * avatarScale
      );
      ctx.fill();

      // Acessório/Badge
      ctx.fillStyle = avatar.colors.accent;
      ctx.beginPath();
      ctx.arc(baseX, (baseY + 6 * avatarScale) + breathe, 4 * avatarScale, 0, Math.PI * 2);
      ctx.fill();

      // Tag de identificação premium
      const userId = user.id === 'current-user' ? 'VOCÊ' : user.id.slice(-3);
      const tag = user.id === 'current-user' ? '✨ VOCÊ' : `${user.avatar.classYear} #${userId}`;
      
      ctx.font = `bold ${12 * avatarScale}px 'Inter', sans-serif`;
      const tagWidth = ctx.measureText(tag).width + (12 * avatarScale);
      const tagX = baseX - (tagWidth / 2);
      const tagY = baseY - (45 * avatarScale);
      
      // Sombra da tag
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.roundRect(tagX + (2 * avatarScale), tagY + (2 * avatarScale), tagWidth, 20 * avatarScale, 10 * avatarScale);
      ctx.fill();
      
      // Background da tag com gradiente
      const tagGradient = ctx.createLinearGradient(tagX, tagY, tagX, tagY + (20 * avatarScale));
      tagGradient.addColorStop(0, classInfo.color);
      tagGradient.addColorStop(1, shadeColor(classInfo.color, -20));
      ctx.fillStyle = tagGradient;
      ctx.beginPath();
      ctx.roundRect(tagX, tagY, tagWidth, 20 * avatarScale, 10 * avatarScale);
      ctx.fill();
      
      // Texto da tag
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText(tag, baseX, tagY + (14 * avatarScale));
      
      // Indicador de status (círculo pulsante)
      const pulseSize = 4 + Math.abs(Math.sin(breatheOffset * 2)) * 2;
      ctx.fillStyle = statusColor;
      ctx.beginPath();
      ctx.arc(tagX + (8 * avatarScale), tagY + (10 * avatarScale), pulseSize * avatarScale, 0, Math.PI * 2);
      ctx.fill();
      
      // Glow do status
      ctx.fillStyle = `${statusColor}40`;
      ctx.beginPath();
      ctx.arc(tagX + (8 * avatarScale), tagY + (10 * avatarScale), (pulseSize + 3) * avatarScale, 0, Math.PI * 2);
      ctx.fill();
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'FOCUS': return '#2ECC71';
        case 'SHORT_BREAK': return '#F39C12';
        case 'LONG_BREAK': return '#9B59B6';
        default: return '#95A5A6';
      }
    };

    // Funções de cor
    const shadeColor = (color: string, percent: number) => {
      const num = parseInt(color.replace("#",""),16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) + amt;
      const G = (num >> 8 & 0x00FF) + amt;
      const B = (num & 0x0000FF) + amt;
      return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 +
        (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255))
        .toString(16).slice(1);
    };

    const lightenColor = (color: string, percent: number) => shadeColor(color, percent);

    // Renderização principal
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      drawFloor();
      drawHeader();
      drawTriageArea();
      drawConsultingRoom(420, 120, 1);
      drawConsultingRoom(740, 120, 2);
      drawInfirmaryBeds();
      drawMedicationRoom();
      drawProcedureRoom();
      
      // Desenhar avatares
      const allUsers = currentUser ? [currentUser, ...otherUsers] : otherUsers;
      allUsers.forEach(user => {
        drawAvatar(user);
      });

      // Footer com stats premium
      const footerY = height - 60;
      const footerGradient = ctx.createLinearGradient(0, footerY, 0, height);
      footerGradient.addColorStop(0, 'rgba(44, 62, 80, 0.95)');
      footerGradient.addColorStop(1, 'rgba(52, 73, 94, 0.98)');
      ctx.fillStyle = footerGradient;
      ctx.fillRect(0, footerY, width, 60);
      
      const focusing = allUsers.filter(u => u.status === 'FOCUS').length;
      const shortBreak = allUsers.filter(u => u.status === 'SHORT_BREAK').length;
      const longBreak = allUsers.filter(u => u.status === 'LONG_BREAK').length;
      
      // Stats com ícones
      ctx.font = `600 ${16 * scale}px 'Inter', sans-serif`;
      ctx.fillStyle = '#ECF0F1';
      ctx.textAlign = 'left';
      ctx.fillText(`👥 ${allUsers.length}/30`, 40 * scale, (footerY + 35) * scale);
      
      ctx.fillStyle = '#2ECC71';
      ctx.fillText(`🟢 ${focusing}`, 180 * scale, (footerY + 35) * scale);
      
      ctx.fillStyle = '#F39C12';
      ctx.fillText(`🟡 ${shortBreak}`, 280 * scale, (footerY + 35) * scale);
      
      ctx.fillStyle = '#9B59B6';
      ctx.fillText(`🟣 ${longBreak}`, 380 * scale, (footerY + 35) * scale);
      
      // Relógio
      const now = new Date();
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      ctx.fillStyle = '#BDC3C7';
      ctx.textAlign = 'right';
      ctx.fillText(`🕐 ${timeStr}`, (width - 40) * scale, (footerY + 35) * scale);
      
      // Atualizar animação de respiração
      breatheOffset += 0.03;
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
  }, [mode, currentUser, otherUsers, dimensions]);

  return (
    <div ref={containerRef} className="w-full">
      <canvas 
        ref={canvasRef} 
        className="rounded-xl shadow-2xl w-full"
        style={{ 
          imageRendering: 'auto',
          display: 'block'
        }}
      />
    </div>
  );
};

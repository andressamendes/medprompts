// Sistema de Compartilhamento

import { loadProgress } from './gamification';
import { loadProfile } from './profile';
import { loadUserBadges, BADGES } from './badges';

// Gerar texto de compartilhamento de progresso
export function generateShareText(): string {
  const progress = loadProgress();
  const profile = loadProfile();
  const userBadges = loadUserBadges();
  
  const earnedBadges = userBadges.earned.length;
  
  return `🩺 MedPrompts - Meu Progresso

👤 ${profile.name}
📊 Nível ${progress.level} | ${progress.xp} XP
🔥 Streak: ${progress.streak} dias
🏆 ${earnedBadges} badges conquistados
💪 ${progress.totalPromptsUsed} prompts utilizados

Estudo medicina com IA de forma gamificada!
Acesse: https://andressamendes.github.io/medprompts/`;
}

// Compartilhar via Web Share API (mobile)
export async function shareProgress(): Promise<boolean> {
  const text = generateShareText();
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Meu Progresso no MedPrompts',
        text: text,
        url: 'https://andressamendes.github.io/medprompts/',
      });
      return true;
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      return false;
    }
  }
  
  return false;
}

// Copiar link de convite
export function copyInviteLink(): void {
  const link = 'https://andressamendes.github.io/medpromps/';
  navigator.clipboard.writeText(link);
}

// Gerar QR Code URL para prompt específico
export function generatePromptQRCodeURL(promptId: string, promptTitle: string): string {
  const url = `https://andressamendes.github.io/medprompts/?prompt=${promptId}`;
  // Usar serviço público de QR Code
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&caption=${encodeURIComponent(promptTitle)}`;
}

// Baixar estatísticas como JSON
export function downloadStats(): void {
  const progress = loadProgress();
  const profile = loadProfile();
  const userBadges = loadUserBadges();
  
  // Pegar nomes dos badges conquistados
  const earnedBadgesList = BADGES
    .filter(badge => userBadges.earned.includes(badge.id))
    .map(badge => badge.name);
  
  const stats = {
    profile: {
      name: profile.name,
      currentYear: profile.currentYear,
      disciplines: profile.ongoingDisciplines,
    },
    progress: {
      level: progress.level,
      xp: progress.xp,
      streak: progress.streak,
      totalPromptsUsed: progress.totalPromptsUsed,
    },
    badges: {
      total: BADGES.length,
      earned: userBadges.earned.length,
      list: earnedBadgesList,
    },
    exportDate: new Date().toISOString(),
  };
  
  const dataStr = JSON.stringify(stats, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `medprompts-stats-${new Date().toISOString().split('T')[0]}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

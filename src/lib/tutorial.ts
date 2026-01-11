const TUTORIAL_STORAGE_KEY = 'medprompts_tutorial_completed';

export function hasTutorialCompleted(): boolean {
  return localStorage.getItem(TUTORIAL_STORAGE_KEY) === 'true';
}

export function markTutorialCompleted(): void {
  localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
}

export function resetTutorial(): void {
  localStorage.removeItem(TUTORIAL_STORAGE_KEY);
}

export async function startTutorial() {
  // Lazy load driver.js apenas quando tutorial é iniciado
  const { driver } = await import('driver.js');
  await import('driver.js/dist/driver.css');

  const driverObj = driver({
    showProgress: true,
    showButtons: ['next', 'previous', 'close'],
    progressText: 'Passo {{current}} de {{total}}',
    nextBtnText: 'Próximo →',
    prevBtnText: '← Anterior',
    doneBtnText: 'Concluir ✓',
    onDestroyStarted: () => {
      if (!driverObj.hasNextStep()) {
        markTutorialCompleted();
      }
      driverObj.destroy();
    },
    steps: [
      {
        popover: {
          title: '👋 Bem-vindo ao MedPrompts!',
          description: 'Vamos fazer um tour rápido para você conhecer todas as funcionalidades da plataforma. Leva apenas 2 minutos!',
        },
      },
      {
        element: '[data-tutorial="profile-card"]',
        popover: {
          title: '👤 Seu Perfil',
          description: 'Aqui você personaliza seu perfil, define seu ano de medicina e acompanha seu progresso acadêmico.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tutorial="xp-bar"]',
        popover: {
          title: '⭐ Sistema de XP',
          description: 'Ganhe XP usando prompts, resolvendo casos clínicos e completando missões. Quanto mais você estuda, mais pontos você ganha!',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tutorial="streak"]',
        popover: {
          title: '🔥 Streak de Dias',
          description: 'Mantenha uma sequência de dias usando a plataforma. Não quebre o streak!',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tutorial="weekly-challenge"]',
        popover: {
          title: '🎯 Desafio Semanal',
          description: 'Toda semana um novo desafio para você completar. Ganhe XP extra e badges especiais!',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '[data-tutorial="pomodoro"]',
        popover: {
          title: '⏱️ Timer Pomodoro',
          description: 'Use a técnica Pomodoro para estudar com mais foco. 25 minutos de estudo, 5 de descanso!',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '[data-tutorial="dashboard"]',
        popover: {
          title: '📊 Dashboard',
          description: 'Acompanhe suas estatísticas, gráficos de evolução e análise por categorias.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '[data-tutorial="missions"]',
        popover: {
          title: '🎮 Missões Diárias',
          description: 'Complete missões todos os dias para ganhar XP extra e manter sua motivação em alta!',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '[data-tutorial="badges"]',
        popover: {
          title: '🏆 Sistema de Badges',
          description: 'Conquiste badges especiais completando desafios e alcançando marcos importantes!',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '[data-tutorial="clinical-cases"]',
        popover: {
          title: '🩺 Casos Clínicos',
          description: 'Pratique raciocínio clínico com casos reais. Responda e veja a explicação detalhada!',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '[data-tutorial="mnemonics"]',
        popover: {
          title: '🧠 Mnemônicos',
          description: 'Memorize conceitos importantes com mnemônicos criativos e eficientes!',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '[data-tutorial="prompts"]',
        popover: {
          title: '📚 Biblioteca de Prompts',
          description: 'Mais de 130 prompts organizados por categoria para usar com IAs como ChatGPT e Claude!',
          side: 'top',
          align: 'start',
        },
      },
      {
        popover: {
          title: '🎉 Pronto para começar!',
          description: 'Agora você já sabe tudo! Comece usando a plataforma e aproveite ao máximo seu estudo. Bons estudos! 🚀',
        },
      },
    ],
  });

  driverObj.drive();
}

/* eslint-disable no-console */
/**
 * PWA Install Prompt Component
 *
 * @note Console statements são usados para logging de eventos PWA
 */
import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verifica se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Verifica se usuário já dispensou o prompt (localStorage)
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const now = new Date();
      const daysSinceDismissed = Math.floor(
        (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Mostra novamente após 7 dias
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Captura evento beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // Aguarda 10 segundos antes de mostrar (não ser invasivo)
      setTimeout(() => {
        setShowPrompt(true);
      }, 10000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detecta quando foi instalado
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      console.log('✅ PWA instalado com sucesso!');
      
      // Analytics (se integrado)
      if (window.gtag) {
        window.gtag('event', 'pwa_installed');
      }
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Mostra prompt nativo
    deferredPrompt.prompt();

    // Aguarda escolha do usuário
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('✅ Usuário aceitou instalação');
      
      // Analytics
      if (window.gtag) {
        window.gtag('event', 'pwa_install_accepted');
      }
    } else {
      console.log('❌ Usuário recusou instalação');
      
      // Analytics
      if (window.gtag) {
        window.gtag('event', 'pwa_install_dismissed');
      }
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    
    // Salva data de dispensa
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    
    // Analytics
    if (window.gtag) {
      window.gtag('event', 'pwa_prompt_dismissed');
    }
  };

  // Não mostra se já instalado ou prompt não disponível
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-6 text-white">
        {/* Botão fechar */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
          aria-label="Dispensar prompt de instalação"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Conteúdo */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Smartphone className="w-6 h-6" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">
              Instalar MedPrompts
            </h3>
            <p className="text-sm text-white/90">
              Acesse mais rápido e use offline! Instale nosso app na tela inicial.
            </p>
          </div>
        </div>

        {/* Benefícios */}
        <ul className="space-y-2 mb-4 text-sm">
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
            <span>✨ Acesso instantâneo sem abrir navegador</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
            <span>📱 Funciona offline</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
            <span>🚀 Carregamento mais rápido</span>
          </li>
        </ul>

        {/* Botões */}
        <div className="flex gap-3">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-white text-indigo-600 hover:bg-indigo-50 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Instalar Agora
          </button>
          
          <button
            onClick={handleDismiss}
            className="px-4 text-white/90 hover:text-white transition-colors text-sm"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}

// Declare gtag no window para TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

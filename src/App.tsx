import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { SkipLinks } from './components/SkipLinks';
import { ErrorBoundary } from './components/ErrorBoundary';
import { InstallPWA } from './components/InstallPWA';
import { logger, LogLevel } from './utils/logger';
import { DebugPanel } from './components/DebugPanel';

// Lazy load da página principal
const Index = lazy(() => import('./pages/Index'));

// Loading component para Suspense
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
      <div className="text-center space-y-4">
        <div className="inline-block">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-lg font-medium text-muted-foreground">
          Carregando MedPrompts...
        </p>
      </div>
    </div>
  );
}

function App() {
  useEffect(() => {
    // Configura logger na inicialização
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
    
    if (!isDevelopment) {
      // Em produção, só loga WARN ou superior
      logger.setMinLevel(LogLevel.WARN);
    }

    // Log inicial da aplicação
    logger.info('MedPrompts inicializado', {
      version: '1.0.0',
      environment: isDevelopment ? 'development' : 'production',
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });

    // Envia logs críticos para servidor a cada 5 minutos (em produção)
    if (!isDevelopment) {
      const logInterval = setInterval(() => {
        // Substitua pela URL do seu endpoint de logs
        logger.sendLogsToServer('/api/logs').catch((error) => {
          console.error('Erro ao enviar logs:', error);
        });
      }, 5 * 60 * 1000); // 5 minutos

      return () => clearInterval(logInterval);
    }
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <FavoritesProvider>
          <SkipLinks />
          <div id="app-container">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
              </Routes>
            </Suspense>
          </div>
          <InstallPWA />
          
          {/* Debug Panel - só aparece em desenvolvimento */}
          {(window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1') && (
            <DebugPanel />
          )}
        </FavoritesProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

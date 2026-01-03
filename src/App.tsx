import { Routes, Route, Navigate } from 'react-router-dom';
import { PromptHistoryProvider } from './contexts/PromptHistoryContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import Index from './pages/Index';
import FocusZone from './pages/FocusZone';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DebugPanel } from '@/components/DebugPanel';
import { logger } from '@/utils/logger';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Configurar logger baseado no ambiente
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    logger.info('Aplicação inicializada', {
      component: 'App',
      environment: isDev ? 'development' : 'production',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });

    // Configurar envio de logs para servidor (quando implementado)
    // logger.setServerUrl('https://sua-api.com/logs');
  }, []);

  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  return (
    <ErrorBoundary>
      <PromptHistoryProvider>
        <ThemeProvider>
          <FavoritesProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/focus-zone" element={<FocusZone />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster />
            {isDev && <DebugPanel />}
          </FavoritesProvider>
        </ThemeProvider>
      </PromptHistoryProvider>
    </ErrorBoundary>
  );
}

export default App;

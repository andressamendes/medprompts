import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { PromptHistoryProvider } from '@/contexts/PromptHistoryContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SkipLinks } from '@/components/SkipLinks';
import { lazy, Suspense, useEffect } from 'react';
import { logger } from '@/utils/logger';
import { cspService } from '@/services/csp.service';
import { securityHeadersService } from '@/services/security-headers.service';

// Páginas públicas
import NewIndex from '@/pages/NewIndex';
import NotFound from '@/pages/NotFound';

// Páginas com lazy loading
const Prompts = lazy(() => import('@/pages/Prompts'));
const GuiaIAs = lazy(() => import('@/pages/GuiaIAs'));
const Ferramentas = lazy(() => import('@/pages/Ferramentas'));
const FocusZone = lazy(() => import('@/pages/FocusZone'));
const Simulados = lazy(() => import('@/pages/Simulados'));

/**
 * Loading fallback otimizado para melhor LCP
 * - Tamanho mínimo reservado para evitar CLS
 * - Spinner leve com CSS puro
 * - Acessível para screen readers
 */
const LoadingScreen = () => (
  <div
    className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <div className="text-center" style={{ minHeight: '120px', minWidth: '200px' }}>
      <div
        className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"
        style={{ borderWidth: '3px' }}
        aria-hidden="true"
      />
      <p className="text-sm text-gray-500 dark:text-gray-400">Carregando...</p>
      <span className="sr-only">Aguarde enquanto o conteúdo é carregado</span>
    </div>
  </div>
);

function App() {
  useEffect(() => {
    logger.info('MedPrompts iniciado', {
      version: '1.0.0',
      environment: import.meta.env.MODE,
      timestamp: new Date().toISOString()
    });

    // Inicializa CSP reporting
    cspService.setupCSPReporting();
    logger.info('CSP inicializado', {
      csp: cspService.generateCSP()
    });

    // Aplica security headers
    securityHeadersService.applyMetaHeaders();
    securityHeadersService.logSecurityHeaders();

    // Valida configuração de segurança
    const validation = securityHeadersService.validateSecurityConfig();
    if (!validation.isValid) {
      console.error('❌ Erros de segurança:', validation.errors);
    }
    if (validation.warnings.length > 0) {
      console.warn('⚠️ Avisos de segurança:', validation.warnings);
    }
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <FavoritesProvider>
          <PromptHistoryProvider>
            <Router basename="/medprompts">
              <SkipLinks />
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  {/* ==================== ROTAS PÚBLICAS ==================== */}
                  <Route path="/" element={<NewIndex />} />
                  <Route path="/prompts" element={<Prompts />} />
                  <Route path="/guia-ias" element={<GuiaIAs />} />
                  <Route path="/ferramentas" element={<Ferramentas />} />
                  <Route path="/focus-zone" element={<FocusZone />} />
                  <Route path="/simulados" element={<Simulados />} />

                  {/* ==================== ROTA 404 ==================== */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <Toaster />
            </Router>
          </PromptHistoryProvider>
        </FavoritesProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

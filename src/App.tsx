import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { PromptHistoryProvider } from '@/contexts/PromptHistoryContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { lazy, Suspense, useEffect } from 'react';
import { logger } from '@/utils/logger';

// Páginas públicas (não requerem autenticação)
import NewIndex from '@/pages/NewIndex';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';

// ✅ Dashboard sem lazy loading (fix para dynamic import)
import Dashboard from '@/pages/Dashboard';

// Páginas protegidas (requerem autenticação) - lazy loading
const Prompts = lazy(() => import('@/pages/Prompts'));
const UserTools = lazy(() => import('@/pages/UserTools'));
const Profile = lazy(() => import('@/pages/Profile'));
const Library = lazy(() => import('@/pages/Library'));
const ToolsHub = lazy(() => import('@/pages/ToolsHub'));

// Páginas públicas com conteúdo educacional
const GuiaIAs = lazy(() => import('@/pages/GuiaIAs'));
const Ferramentas = lazy(() => import('@/pages/Ferramentas'));
const FocusZone = lazy(() => import('@/pages/FocusZone'));

// Loading fallback
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

function App() {
  useEffect(() => {
    logger.info('MedPrompts iniciado', {
      version: '2.0.0',
      environment: import.meta.env.MODE,
      timestamp: new Date().toISOString()
    });
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <FavoritesProvider>
            <PromptHistoryProvider>
              <Router basename="/medprompts">
                <Suspense fallback={<LoadingScreen />}>
                  <Routes>
                    {/* ==================== ROTAS PÚBLICAS ==================== */}
                    {/* Landing page principal */}
                    <Route path="/" element={<NewIndex />} />
                    
                    {/* Autenticação */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Páginas educacionais públicas */}
                    <Route path="/guia-ias" element={<GuiaIAs />} />
                    <Route path="/ferramentas" element={<Ferramentas />} />
                    <Route path="/focus-zone" element={<FocusZone />} />
                    
                    {/* Hub de ferramentas úteis */}
                    <Route path="/tools" element={<ToolsHub />} />
                    
                    {/* Biblioteca médica (PÚBLICA - acesso livre) */}
                    <Route path="/library" element={<Library />} />

                    {/* ==================== ROTAS PROTEGIDAS ==================== */}
                    {/* Dashboard principal do usuário autenticado */}
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Biblioteca completa de prompts (PÚBLICA - acesso livre para todos) */}
                    <Route 
                      path="/prompts" 
                      element={
                        <Prompts />
                      } 
                    />

                    {/* Ferramentas do usuário (protegida) */}
                    <Route 
                      path="/minhas-ferramentas" 
                      element={
                        <ProtectedRoute>
                          <UserTools />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Perfil do usuário */}
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } 
                    />

                    {/* ==================== ROTA 404 ==================== */}
                    {/* Qualquer rota não encontrada */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <Toaster />
              </Router>
            </PromptHistoryProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

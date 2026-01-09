import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { PromptHistoryProvider } from '@/contexts/PromptHistoryContext';
import { CalendarProvider } from '@/contexts/CalendarContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { lazy, Suspense, useEffect } from 'react';
import { logger } from '@/utils/logger';
import { cspService } from '@/services/csp.service';

// Páginas públicas
import NewIndex from '@/pages/NewIndex';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';
import Dashboard from '@/pages/Dashboard';

// Páginas com lazy loading
const Prompts = lazy(() => import('@/pages/Prompts'));
const UserTools = lazy(() => import('@/pages/UserTools'));
const Profile = lazy(() => import('@/pages/Profile'));
const StudySchedule = lazy(() => import('@/pages/StudySchedule'));

// Páginas educacionais públicas
const GuiaIAs = lazy(() => import('@/pages/GuiaIAs'));
const Ferramentas = lazy(() => import('@/pages/Ferramentas'));
const FocusZone = lazy(() => import('@/pages/FocusZone'));

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

    // Inicializa CSP reporting
    cspService.setupCSPReporting();
    logger.info('CSP inicializado', {
      csp: cspService.generateCSP()
    });
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CalendarProvider>
            <FavoritesProvider>
              <PromptHistoryProvider>
                <Router basename="/medprompts">
                  <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                      {/* ==================== ROTAS PÚBLICAS ==================== */}
                      <Route path="/" element={<NewIndex />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/guia-ias" element={<GuiaIAs />} />
                      <Route path="/ferramentas" element={<Ferramentas />} />
                      <Route path="/focus-zone" element={<FocusZone />} />
                      
                      {/* Biblioteca de prompts (pública - acessível por todos) */}
                      <Route path="/prompts" element={<Prompts />} />

                      {/* ==================== ROTAS PROTEGIDAS ==================== */}
                      {/* Dashboard */}
                      <Route 
                        path="/dashboard" 
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Cronograma de estudos (PROTEGIDO) */}
                      <Route 
                        path="/study-schedule" 
                        element={
                          <ProtectedRoute>
                            <StudySchedule />
                          </ProtectedRoute>
                        } 
                      />

                      {/* Ferramentas do usuário */}
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
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                  <Toaster />
                </Router>
              </PromptHistoryProvider>
            </FavoritesProvider>
          </CalendarProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { PromptHistoryProvider } from './contexts/PromptHistoryContext';
import ProtectedRoute from './components/ProtectedRoute';
import NewIndex from './pages/NewIndex';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Prompts from './pages/Prompts';
import StudySessions from './pages/StudySessions';
import GuiaIAs from './pages/GuiaIAs';
import Ferramentas from './pages/Ferramentas';
import FocusZone from './pages/FocusZone';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';


/**
 * Componente principal da aplicação
 * 
 * ARQUITETURA CORRETA:
 * - "/" = Landing page pública (NewIndex) para visitantes
 * - "/app" = Aplicação completa (Index) com TODOS os componentes
 * - "/dashboard" = Dashboard autenticado
 * - Login/Register redirecionam para "/app" após autenticação
 */
function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <FavoritesProvider>
            <PromptHistoryProvider>
              <Routes>
                {/* Landing Page Pública - Para visitantes */}
                <Route path="/" element={<NewIndex />} />
                
                {/* Rotas públicas - Autenticação */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Rotas públicas - Conteúdo */}
                <Route path="/guia-ias" element={<GuiaIAs />} />
                <Route path="/ferramentas" element={<Ferramentas />} />
                <Route path="/focus-zone" element={<FocusZone />} />
                
                {/* ✅ APLICAÇÃO COMPLETA - Página principal com TODOS os componentes */}
                <Route
                  path="/app"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                
                {/* Rotas protegidas - Requerem autenticação */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/prompts"
                  element={
                    <ProtectedRoute>
                      <Prompts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/study"
                  element={
                    <ProtectedRoute>
                      <StudySessions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                
                {/* Rota 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PromptHistoryProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}


export default App;

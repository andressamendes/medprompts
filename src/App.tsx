import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { PromptHistoryProvider } from './contexts/PromptHistoryContext';
import ProtectedRoute from './components/ProtectedRoute';
import NewIndex from './pages/NewIndex';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Prompts from './pages/Prompts';
import StudySessions from './pages/StudySessions';
import GuiaIAs from './pages/GuiaIAs';
import Ferramentas from './pages/Ferramentas';
import FocusZone from './pages/FocusZone';
import NotFound from './pages/NotFound';

/**
 * Componente principal da aplicação
 * 
 * Configuração de rotas: 
 * - Rotas públicas: Landing page, Login, Register, Guia IAs, Ferramentas, Focus Zone
 * - Rotas protegidas: Dashboard, Prompts (CRUD), Study Sessions
 * - Rota 404 no final para URLs inválidas
 * 
 * MUDANÇA IMPORTANTE: 
 * - Rota "/" agora usa NewIndex (landing page limpa e pública)
 * - Index.tsx antiga (confusa) não é mais usada
 */
function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <FavoritesProvider>
            <PromptHistoryProvider>
              <Routes>
                {/* ✅ ROTA INICIAL - Landing Page Pública */}
                <Route path="/" element={<NewIndex />} />
                
                {/* Rotas públicas - Autenticação */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Rotas públicas - Conteúdo */}
                <Route path="/guia-ias" element={<GuiaIAs />} />
                <Route path="/ferramentas" element={<Ferramentas />} />
                <Route path="/focus-zone" element={<FocusZone />} />
                
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
                
                {/* Rota 404:  Captura qualquer URL que não existe */}
                {/* Esta rota DEVE ser a última */}
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
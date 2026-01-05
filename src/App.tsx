import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { PromptHistoryProvider } from './contexts/PromptHistoryContext';
import ProtectedRoute from './components/ProtectedRoute';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Prompts from './pages/Prompts';
import StudySessions from './pages/StudySessions';
import NotFound from './pages/NotFound';

/**
 * Componente principal da aplicação
 * 
 * Configuração: 
 * - O basename é gerenciado pelo Vite (vite.config.ts: base: '/medprompts/')
 * - Router usa caminhos relativos sem basename para evitar duplicação
 * - Todas as rotas públicas e protegidas definidas aqui
 * - Rota 404 no final para capturar URLs inválidas
 */
function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <FavoritesProvider>
            <PromptHistoryProvider>
              <Routes>
                {/* Rotas públicas */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Rotas protegidas */}
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
                
                {/* Rota 404: Captura qualquer URL que não existe */}
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
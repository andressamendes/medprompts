import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

/**
 * Componente principal da aplicação
 * 
 * Configuração:
 * - basename="/medprompts/" para GitHub Pages (deve corresponder ao base do vite.config.ts)
 * - Todas as rotas públicas e protegidas definidas aqui
 */
function App() {
  return (
    <Router basename="/medprompts/">
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
                
                {/* Rota padrão:  redireciona para home se rota não existir */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </PromptHistoryProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Prompts from './pages/Prompts';
import StudySessions from './pages/StudySessions';

const HomePage = () => (
  <div style={{ padding: '40px', textAlign: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}>
    <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🎯 MedPrompts</h1>
    <p style={{ fontSize: '20px', marginBottom: '40px' }}>Plataforma de estudos médicos com IA</p>
    
    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
      <Link to="/login" style={{ padding: '15px 30px', background: '#fff', color: '#667eea', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
        Login
      </Link>
      <Link to="/register" style={{ padding: '15px 30px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '2px solid #fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
        Registrar
      </Link>
    </div>

    <div style={{ marginTop: '60px', padding: '30px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', maxWidth: '600px', margin: '60px auto 0' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>✅ Plataforma Completa</h2>
      <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
        <li style={{ marginBottom: '10px' }}>✓ Sistema de autenticação completo</li>
        <li style={{ marginBottom: '10px' }}>✓ Dashboard com estatísticas e gamificação</li>
        <li style={{ marginBottom: '10px' }}>✓ Gerenciador de prompts (CRUD completo)</li>
        <li style={{ marginBottom: '10px' }}>✓ Registro de sessões de estudo</li>
        <li style={{ marginBottom: '10px' }}>✓ Sistema de XP e níveis</li>
        <li style={{ marginBottom: '10px' }}>✓ Filtros, busca e favoritos</li>
        <li style={{ marginBottom: '10px' }}>✓ Design responsivo (mobile + desktop)</li>
        <li style={{ marginBottom: '10px' }}>✓ Integração com backend preparada</li>
        <li style={{ marginBottom: '10px' }}>✓ TypeScript com tipagem forte</li>
        <li style={{ marginBottom: '10px' }}>✓ Rotas protegidas funcionando</li>
      </ul>
    </div>

    <p style={{ marginTop: '40px', fontSize: '14px', opacity: 0.8 }}>
      UI Completa • Pronta para integração com backend
    </p>
  </div>
);

/**
 * Componente principal da aplicação
 */
function App() {
  return (
    <Router basename="/medprompts">
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<HomePage />} />
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
          
          {/* Rota padrão: redireciona para home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

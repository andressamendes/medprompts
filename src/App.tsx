import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Componentes temporários (serão substituídos por páginas reais)
const LoginPage = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>🔐 Login</h1>
    <p>Página de login será implementada em breve</p>
    <p style={{ color: '#666', fontSize: '14px' }}>
      Integração com API de autenticação configurada
    </p>
  </div>
);

const RegisterPage = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>📝 Registro</h1>
    <p>Página de registro será implementada em breve</p>
    <p style={{ color: '#666', fontSize: '14px' }}>
      Integração com API de autenticação configurada
    </p>
  </div>
);

const DashboardPage = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>📊 Dashboard</h1>
    <p>✅ Você está autenticado!</p>
    <p style={{ color: '#666', fontSize: '14px' }}>
      Esta é uma rota protegida - apenas usuários logados podem ver
    </p>
  </div>
);

const PromptsPage = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>💬 Prompts</h1>
    <p>✅ Rota protegida ativa!</p>
    <p style={{ color: '#666', fontSize: '14px' }}>
      Integração com API de prompts configurada
    </p>
  </div>
);

const StudyPage = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>📚 Sessões de Estudo</h1>
    <p>✅ Rota protegida ativa!</p>
    <p style={{ color: '#666', fontSize: '14px' }}>
      Integração com API de sessões configurada
    </p>
  </div>
);

const HomePage = () => (
  <div style={{ padding: '40px', textAlign: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}>
    <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🎯 MedPrompts</h1>
    <p style={{ fontSize: '20px', marginBottom: '40px' }}>Plataforma de estudos médicos com IA</p>
    
    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
      <a href="/login" style={{ padding: '15px 30px', background: '#fff', color: '#667eea', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
        Login
      </a>
      <a href="/register" style={{ padding: '15px 30px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '2px solid #fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
        Registrar
      </a>
    </div>

    <div style={{ marginTop: '60px', padding: '30px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', maxWidth: '600px', margin: '60px auto 0' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>✅ Integração com Backend Configurada</h2>
      <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
        <li style={{ marginBottom: '10px' }}>✓ Autenticação (login, registro, logout)</li>
        <li style={{ marginBottom: '10px' }}>✓ Gerenciamento de usuário e perfil</li>
        <li style={{ marginBottom: '10px' }}>✓ Sistema de XP e badges (gamificação)</li>
        <li style={{ marginBottom: '10px' }}>✓ CRUD de prompts completo</li>
        <li style={{ marginBottom: '10px' }}>✓ Sessões de estudo e estatísticas</li>
        <li style={{ marginBottom: '10px' }}>✓ Rotas protegidas funcionando</li>
        <li style={{ marginBottom: '10px' }}>✓ Refresh token automático</li>
        <li style={{ marginBottom: '10px' }}>✓ Migração de dados localStorage → API</li>
      </ul>
    </div>

    <p style={{ marginTop: '40px', fontSize: '14px', opacity: 0.8 }}>
      Backend API: Pronto para integração
    </p>
  </div>
);

/**
 * Componente principal da aplicação
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rotas protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/prompts"
            element={
              <ProtectedRoute>
                <PromptsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/study"
            element={
              <ProtectedRoute>
                <StudyPage />
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

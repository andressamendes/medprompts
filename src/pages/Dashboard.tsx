import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalHours: 0,
    totalSessions: 0,
    currentStreak: 0,
  });

  useEffect(() => {
    // 🎭 MOCK: Estatísticas simuladas
    setStats({
      totalHours: 47,
      totalSessions: 23,
      currentStreak: 5,
    });
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Calcula XP para próximo nível (fórmula simples: level * 100)
  const xpForNextLevel = user ? user.level * 100 : 100;
  const xpProgress = user ? (user.xp % 100) : 0;
  const xpPercentage = (xpProgress / 100) * 100;

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo}>🎯 MedPrompts</h1>
          <div style={styles.userInfo}>
            <span style={styles.userName}>Olá, {user?.name}!</span>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          {/* Card XP e Level */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>⚡</span>
              <h3 style={styles.cardTitle}>Experiência</h3>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.levelBadge}>
                Level {user?.level || 1}
              </div>
              <p style={styles.xpText}>{user?.xp || 0} XP</p>
              <div style={styles.progressBarContainer}>
                <div 
                  style={{
                    ...styles.progressBar,
                    width: `${xpPercentage}%`,
                  }}
                />
              </div>
              <p style={styles.progressText}>
                {xpProgress}/100 XP para próximo nível
              </p>
            </div>
          </div>

          {/* Card Horas de Estudo */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>📚</span>
              <h3 style={styles.cardTitle}>Horas de Estudo</h3>
            </div>
            <div style={styles.cardBody}>
              <p style={styles.statNumber}>{stats.totalHours}h</p>
              <p style={styles.statLabel}>{stats.totalSessions} sessões registradas</p>
            </div>
          </div>

          {/* Card Streak */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>🔥</span>
              <h3 style={styles.cardTitle}>Sequência</h3>
            </div>
            <div style={styles.cardBody}>
              <p style={styles.statNumber}>{stats.currentStreak} dias</p>
              <p style={styles.statLabel}>Continue estudando!</p>
            </div>
          </div>

          {/* Card Badges */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>🏆</span>
              <h3 style={styles.cardTitle}>Conquistas</h3>
            </div>
            <div style={styles.cardBody}>
              <p style={styles.statNumber}>{user?.badges.length || 0}</p>
              <p style={styles.statLabel}>badges desbloqueadas</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.actionsSection}>
          <h2 style={styles.sectionTitle}>Ações Rápidas</h2>
          <div style={styles.actionsGrid}>
            <button 
              onClick={() => navigate('/prompts')}
              style={styles.actionButton}
            >
              <span style={styles.actionIcon}>💬</span>
              <span>Meus Prompts</span>
            </button>
            <button 
              onClick={() => navigate('/study')}
              style={styles.actionButton}
            >
              <span style={styles.actionIcon}>📝</span>
              <span>Registrar Estudo</span>
            </button>
            <button 
              onClick={() => alert('Em breve!')}
              style={styles.actionButton}
            >
              <span style={styles.actionIcon}>👤</span>
              <span>Meu Perfil</span>
            </button>
            <button 
              onClick={() => alert('Em breve!')}
              style={styles.actionButton}
            >
              <span style={styles.actionIcon}>🌐</span>
              <span>Comunidade</span>
            </button>
          </div>
        </div>

        {/* Mock Warning */}
        <div style={styles.mockWarning}>
          🎭 <strong>MODO MOCK:</strong> Dados simulados. Quando o backend estiver pronto, os dados reais serão carregados automaticamente.
        </div>

        {/* Recent Activity */}
        <div style={styles.activitySection}>
          <h2 style={styles.sectionTitle}>Atividade Recente</h2>
          <div style={styles.activityList}>
            <div style={styles.activityItem}>
              <span style={styles.activityIcon}>📚</span>
              <div style={styles.activityInfo}>
                <p style={styles.activityTitle}>Sessão de estudo completada</p>
                <p style={styles.activityTime}>Há 2 horas • +60 XP</p>
              </div>
            </div>
            <div style={styles.activityItem}>
              <span style={styles.activityIcon}>⚡</span>
              <div style={styles.activityInfo}>
                <p style={styles.activityTitle}>Subiu para Level 5!</p>
                <p style={styles.activityTime}>Ontem</p>
              </div>
            </div>
            <div style={styles.activityItem}>
              <span style={styles.activityIcon}>🏆</span>
              <div style={styles.activityInfo}>
                <p style={styles.activityTitle}>Badge desbloqueada: Sequência de 7 dias</p>
                <p style={styles.activityTime}>Há 3 dias</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Estilos inline (CSS-in-JS)
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: '#f5f7fa',
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    padding: '20px 0',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
    cursor: 'default',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  userName: {
    fontSize: '16px',
    fontWeight: '500',
  },
  logoutButton: {
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background 0.3s',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
  },
  cardIcon: {
    fontSize: '24px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  levelBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  xpText: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: '8px 0',
  },
  progressBarContainer: {
    width: '100%',
    height: '8px',
    background: '#e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '12px',
    color: '#666',
    margin: 0,
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#333',
    margin: '8px 0',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
  },
  actionsSection: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '20px',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: '#fff',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    color: '#333',
    transition: 'all 0.3s',
  },
  actionIcon: {
    fontSize: '24px',
  },
  mockWarning: {
    padding: '16px',
    background: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '12px',
    color: '#856404',
    fontSize: '14px',
    textAlign: 'center',
    marginBottom: '40px',
  },
  activitySection: {
    marginBottom: '40px',
  },
  activityList: {
    background: '#fff',
    borderRadius: '12px',
    padding: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    borderBottom: '1px solid #f0f0f0',
  },
  activityIcon: {
    fontSize: '24px',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#333',
    margin: '0 0 4px 0',
  },
  activityTime: {
    fontSize: '13px',
    color: '#666',
    margin: 0,
  },
};

export default Dashboard;

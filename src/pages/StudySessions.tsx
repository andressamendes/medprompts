import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Interfaces
interface StudySession {
  id: string;
  subject: string;
  topic: string;
  duration: number; // em minutos
  notes?: string;
  date: string;
  xpEarned: number;
}

const StudySessions = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<StudySession[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('all');
  
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    duration: '',
    notes: '',
    date: new Date().toISOString().split('T')[0], // Data de hoje
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const subjects = [
    'Anatomia',
    'Fisiologia',
    'Farmacologia',
    'Patologia',
    'Clínica Médica',
    'Cirurgia',
    'Pediatria',
    'Ginecologia',
    'Outro',
  ];

  // 🎭 MOCK: Carrega sessões simuladas
  useEffect(() => {
    const mockSessions: StudySession[] = [
      {
        id: '1',
        subject: 'Anatomia',
        topic: 'Sistema Cardiovascular',
        duration: 120,
        notes: 'Revisão completa de anatomia cardíaca',
        date: new Date().toISOString(),
        xpEarned: 60,
      },
      {
        id: '2',
        subject: 'Farmacologia',
        topic: 'Anti-hipertensivos',
        duration: 90,
        notes: 'Mecanismos de ação dos principais grupos',
        date: new Date(Date.now() - 86400000).toISOString(), // Ontem
        xpEarned: 45,
      },
      {
        id: '3',
        subject: 'Fisiologia',
        topic: 'Sistema Renal',
        duration: 60,
        notes: 'Filtração glomerular e reabsorção tubular',
        date: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
        xpEarned: 30,
      },
      {
        id: '4',
        subject: 'Clínica Médica',
        topic: 'Insuficiência Cardíaca',
        duration: 150,
        date: new Date(Date.now() - 259200000).toISOString(), // 3 dias atrás
        xpEarned: 75,
      },
    ];
    setSessions(mockSessions);
    setFilteredSessions(mockSessions);
  }, []);

  // Filtrar sessões por período
  useEffect(() => {
    let filtered = sessions;

    if (filterPeriod === 'today') {
      const today = new Date().toDateString();
      filtered = sessions.filter(s => new Date(s.date).toDateString() === today);
    } else if (filterPeriod === 'week') {
      const weekAgo = Date.now() - 7 * 86400000;
      filtered = sessions.filter(s => new Date(s.date).getTime() > weekAgo);
    } else if (filterPeriod === 'month') {
      const monthAgo = Date.now() - 30 * 86400000;
      filtered = sessions.filter(s => new Date(s.date).getTime() > monthAgo);
    }

    // Ordena por data (mais recente primeiro)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredSessions(filtered);
  }, [sessions, filterPeriod]);

  // Calcular estatísticas
  const totalMinutes = filteredSessions.reduce((acc, s) => acc + s.duration, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const totalXP = filteredSessions.reduce((acc, s) => acc + s.xpEarned, 0);
  const averageDuration = filteredSessions.length > 0 
    ? Math.round(totalMinutes / filteredSessions.length) 
    : 0;

  // Validar formulário
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.subject) {
      errors.subject = 'Matéria é obrigatória';
    }
    if (!formData.topic.trim()) {
      errors.topic = 'Tópico é obrigatório';
    }
    if (!formData.duration || parseInt(formData.duration) <= 0) {
      errors.duration = 'Duração deve ser maior que zero';
    }
    if (!formData.date) {
      errors.date = 'Data é obrigatória';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Abrir modal
  const handleOpenModal = () => {
    setFormData({
      subject: '',
      topic: '',
      duration: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Salvar sessão
  const handleSave = () => {
    if (!validateForm()) return;

    const duration = parseInt(formData.duration);
    const xpEarned = Math.round(duration / 2); // 1 XP a cada 2 minutos

    const newSession: StudySession = {
      id: Date.now().toString(),
      subject: formData.subject,
      topic: formData.topic,
      duration,
      notes: formData.notes || undefined,
      date: new Date(formData.date).toISOString(),
      xpEarned,
    };

    setSessions([newSession, ...sessions]);
    setIsModalOpen(false);

    // Feedback visual
    alert(`✅ Sessão registrada! +${xpEarned} XP`);
  };

  // Deletar sessão
  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta sessão?')) {
      setSessions(sessions.filter(s => s.id !== id));
    }
  };

  // Formatar duração
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  // Formatar data
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);

    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === yesterday.toDateString()) return 'Ontem';

    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo} onClick={() => navigate('/dashboard')}>
            🎯 MedPrompts
          </h1>
          <nav style={styles.nav}>
            <button onClick={() => navigate('/dashboard')} style={styles.navButton}>
              Dashboard
            </button>
            <button onClick={() => navigate('/prompts')} style={styles.navButton}>
              Prompts
            </button>
            <button onClick={() => navigate('/study')} style={{ ...styles.navButton, ...styles.navButtonActive }}>
              Estudo
            </button>
          </nav>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user?.name}</span>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Toolbar */}
        <div style={styles.toolbar}>
          <h2 style={styles.pageTitle}>Sessões de Estudo</h2>
          <button onClick={handleOpenModal} style={styles.createButton}>
            + Registrar Sessão
          </button>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>⏱️</span>
            <div>
              <p style={styles.statValue}>
                {totalHours}h {remainingMinutes > 0 && `${remainingMinutes}min`}
              </p>
              <p style={styles.statLabel}>Tempo total</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>📚</span>
            <div>
              <p style={styles.statValue}>{filteredSessions.length}</p>
              <p style={styles.statLabel}>Sessões registradas</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>⚡</span>
            <div>
              <p style={styles.statValue}>{totalXP} XP</p>
              <p style={styles.statLabel}>Experiência ganha</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>📊</span>
            <div>
              <p style={styles.statValue}>{formatDuration(averageDuration)}</p>
              <p style={styles.statLabel}>Duração média</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <button
            onClick={() => setFilterPeriod('all')}
            style={{
              ...styles.filterButton,
              ...(filterPeriod === 'all' ? styles.filterButtonActive : {}),
            }}
          >
            Todas
          </button>
          <button
            onClick={() => setFilterPeriod('today')}
            style={{
              ...styles.filterButton,
              ...(filterPeriod === 'today' ? styles.filterButtonActive : {}),
            }}
          >
            Hoje
          </button>
          <button
            onClick={() => setFilterPeriod('week')}
            style={{
              ...styles.filterButton,
              ...(filterPeriod === 'week' ? styles.filterButtonActive : {}),
            }}
          >
            Esta semana
          </button>
          <button
            onClick={() => setFilterPeriod('month')}
            style={{
              ...styles.filterButton,
              ...(filterPeriod === 'month' ? styles.filterButtonActive : {}),
            }}
          >
            Este mês
          </button>
        </div>

        {/* Mock Warning */}
        <div style={styles.mockWarning}>
          🎭 <strong>MODO MOCK:</strong> Dados simulados. Backend integrará automaticamente.
        </div>

        {/* Sessions List */}
        {filteredSessions.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>📚</p>
            <p style={styles.emptyText}>Nenhuma sessão encontrada</p>
            <button onClick={handleOpenModal} style={styles.createButton}>
              Registrar primeira sessão
            </button>
          </div>
        ) : (
          <div style={styles.sessionsList}>
            {filteredSessions.map(session => (
              <div key={session.id} style={styles.sessionCard}>
                <div style={styles.sessionHeader}>
                  <div>
                    <span style={styles.subjectBadge}>{session.subject}</span>
                    <p style={styles.sessionDate}>{formatDate(session.date)}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(session.id)}
                    style={styles.deleteButton}
                    title="Deletar sessão"
                  >
                    🗑️
                  </button>
                </div>

                <h3 style={styles.sessionTopic}>{session.topic}</h3>

                {session.notes && (
                  <p style={styles.sessionNotes}>{session.notes}</p>
                )}

                <div style={styles.sessionFooter}>
                  <span style={styles.sessionInfo}>
                    ⏱️ {formatDuration(session.duration)}
                  </span>
                  <span style={styles.sessionInfo}>
                    ⚡ +{session.xpEarned} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Registrar Sessão de Estudo</h3>

            <div style={styles.modalForm}>
              {/* Matéria */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Matéria *</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  style={{
                    ...styles.input,
                    ...(formErrors.subject ? styles.inputError : {}),
                  }}
                >
                  <option value="">Selecione...</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                {formErrors.subject && <span style={styles.errorText}>{formErrors.subject}</span>}
              </div>

              {/* Tópico */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Tópico *</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  style={{
                    ...styles.input,
                    ...(formErrors.topic ? styles.inputError : {}),
                  }}
                  placeholder="Ex: Sistema Cardiovascular"
                />
                {formErrors.topic && <span style={styles.errorText}>{formErrors.topic}</span>}
              </div>

              {/* Grid 2 colunas */}
              <div style={styles.gridRow}>
                {/* Duração */}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Duração (minutos) *</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    style={{
                      ...styles.input,
                      ...(formErrors.duration ? styles.inputError : {}),
                    }}
                    placeholder="60"
                    min="1"
                  />
                  {formErrors.duration && <span style={styles.errorText}>{formErrors.duration}</span>}
                </div>

                {/* Data */}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Data *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{
                      ...styles.input,
                      ...(formErrors.date ? styles.inputError : {}),
                    }}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {formErrors.date && <span style={styles.errorText}>{formErrors.date}</span>}
                </div>
              </div>

              {/* Notas */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Notas (opcional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={styles.textarea}
                  placeholder="O que você estudou nesta sessão?"
                  rows={3}
                />
              </div>

              {/* XP Preview */}
              {formData.duration && parseInt(formData.duration) > 0 && (
                <div style={styles.xpPreview}>
                  ⚡ Você ganhará <strong>{Math.round(parseInt(formData.duration) / 2)} XP</strong> por esta sessão
                </div>
              )}
            </div>

            <div style={styles.modalActions}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={styles.cancelButton}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                style={styles.saveButton}
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Estilos
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: '#f5f7fa',
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    padding: '15px 0',
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
    cursor: 'pointer',
  },
  nav: {
    display: 'flex',
    gap: '10px',
  },
  navButton: {
    padding: '8px 16px',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '6px',
    transition: 'background 0.3s',
  },
  navButtonActive: {
    background: 'rgba(255,255,255,0.2)',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '500',
  },
  logoutButton: {
    padding: '6px 12px',
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  createButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '25px',
  },
  statCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  statIcon: {
    fontSize: '32px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 4px 0',
  },
  statLabel: {
    fontSize: '13px',
    color: '#666',
    margin: 0,
  },
  filters: {
    display: 'flex',
    gap: '10px',
    marginBottom: '25px',
    flexWrap: 'wrap',
  },
  filterButton: {
    padding: '10px 20px',
    background: '#fff',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  filterButtonActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    borderColor: 'transparent',
  },
  mockWarning: {
    padding: '12px',
    background: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    color: '#856404',
    fontSize: '13px',
    textAlign: 'center',
    marginBottom: '25px',
  },
  sessionsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  sessionCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  sessionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  subjectBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    background: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  sessionDate: {
    fontSize: '12px',
    color: '#999',
    margin: '6px 0 0 0',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    opacity: 0.6,
    transition: 'opacity 0.2s',
  },
  sessionTopic: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    margin: '0 0 10px 0',
  },
  sessionNotes: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.5',
    margin: '0 0 12px 0',
  },
  sessionFooter: {
    display: 'flex',
    gap: '15px',
    paddingTop: '12px',
    borderTop: '1px solid #f0f0f0',
  },
  sessionInfo: {
    fontSize: '13px',
    color: '#666',
    fontWeight: '500',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyIcon: {
    fontSize: '64px',
    margin: '0 0 20px 0',
  },
  emptyText: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '20px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: '#fff',
    borderRadius: '16px',
    padding: '30px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  gridRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    padding: '12px 16px',
    fontSize: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    outline: 'none',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    fontSize: '13px',
    color: '#ff4444',
  },
  textarea: {
    padding: '12px 16px',
    fontSize: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  xpPreview: {
    padding: '12px',
    background: '#e8f5e9',
    border: '1px solid #4caf50',
    borderRadius: '8px',
    color: '#2e7d32',
    fontSize: '14px',
    textAlign: 'center',
  },
  modalActions: {
    display: 'flex',
    gap: '15px',
    marginTop: '20px',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: '12px 24px',
    background: '#f5f7fa',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  saveButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default StudySessions;

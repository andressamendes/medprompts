import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Interfaces
interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  usageCount: number;
  createdAt: string;
}

const Prompts = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'geral',
    tags: '',
  });

  const categories = ['all', 'anatomia', 'fisiologia', 'farmacologia', 'clinica', 'geral'];

  // 🎭 MOCK: Carrega prompts simulados
  useEffect(() => {
    const mockPrompts: Prompt[] = [
      {
        id: '1',
        title: 'Resumo de Anatomia',
        content: 'Explique de forma detalhada o sistema cardiovascular humano, incluindo estrutura do coração, circulação sanguínea e principais vasos.',
        category: 'anatomia',
        tags: ['cardiovascular', 'coração'],
        isFavorite: true,
        usageCount: 15,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Farmacologia - Anti-hipertensivos',
        content: 'Liste os principais grupos de medicamentos anti-hipertensivos, seus mecanismos de ação, indicações e contraindicações.',
        category: 'farmacologia',
        tags: ['hipertensão', 'medicamentos'],
        isFavorite: false,
        usageCount: 8,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Diagnóstico diferencial - Dor torácica',
        content: 'Faça um diagnóstico diferencial completo de dor torácica em paciente de 55 anos, considerando principais causas e exames complementares.',
        category: 'clinica',
        tags: ['diagnóstico', 'emergência'],
        isFavorite: true,
        usageCount: 23,
        createdAt: new Date().toISOString(),
      },
    ];
    setPrompts(mockPrompts);
    setFilteredPrompts(mockPrompts);
  }, []);

  // Filtrar prompts
  useEffect(() => {
    let filtered = prompts;

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPrompts(filtered);
  }, [prompts, selectedCategory, searchTerm]);

  // Abrir modal para criar
  const handleCreate = () => {
    setEditingPrompt(null);
    setFormData({ title: '', content: '', category: 'geral', tags: '' });
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setFormData({
      title: prompt.title,
      content: prompt.content,
      category: prompt.category,
      tags: prompt.tags.join(', '),
    });
    setIsModalOpen(true);
  };

  // Salvar prompt (criar ou editar)
  const handleSave = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Preencha título e conteúdo');
      return;
    }

    const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);

    if (editingPrompt) {
      // Editar
      setPrompts(prompts.map(p =>
        p.id === editingPrompt.id
          ? { ...p, ...formData, tags }
          : p
      ));
    } else {
      // Criar novo
      const newPrompt: Prompt = {
        id: Date.now().toString(),
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags,
        isFavorite: false,
        usageCount: 0,
        createdAt: new Date().toISOString(),
      };
      setPrompts([newPrompt, ...prompts]);
    }

    setIsModalOpen(false);
  };

  // Deletar prompt
  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este prompt?')) {
      setPrompts(prompts.filter(p => p.id !== id));
    }
  };

  // Toggle favorito
  const handleToggleFavorite = (id: string) => {
    setPrompts(prompts.map(p =>
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  // Copiar prompt
  const handleCopy = async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      alert('✅ Prompt copiado!');
      // Incrementa uso
      setPrompts(prompts.map(p =>
        p.id === prompt.id ? { ...p, usageCount: p.usageCount + 1 } : p
      ));
    } catch (error) {
      alert('❌ Erro ao copiar');
    }
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
            <button onClick={() => navigate('/prompts')} style={{ ...styles.navButton, ...styles.navButtonActive }}>
              Prompts
            </button>
            <button onClick={() => navigate('/study')} style={styles.navButton}>
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
          <h2 style={styles.pageTitle}>Meus Prompts</h2>
          <button onClick={handleCreate} style={styles.createButton}>
            + Novo Prompt
          </button>
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <input
            type="text"
            placeholder="🔍 Buscar prompts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={styles.categorySelect}
          >
            <option value="all">Todas as categorias</option>
            {categories.filter(c => c !== 'all').map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Mock Warning */}
        <div style={styles.mockWarning}>
          🎭 <strong>MODO MOCK:</strong> Dados simulados. Criar, editar e deletar funcionam localmente. Backend integrará automaticamente.
        </div>

        {/* Prompts List */}
        {filteredPrompts.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>Nenhum prompt encontrado</p>
            <button onClick={handleCreate} style={styles.createButton}>
              Criar primeiro prompt
            </button>
          </div>
        ) : (
          <div style={styles.promptsGrid}>
            {filteredPrompts.map(prompt => (
              <div key={prompt.id} style={styles.promptCard}>
                <div style={styles.promptHeader}>
                  <div>
                    <h3 style={styles.promptTitle}>{prompt.title}</h3>
                    <div style={styles.promptMeta}>
                      <span style={styles.categoryBadge}>{prompt.category}</span>
                      <span style={styles.usageCount}>📊 {prompt.usageCount} usos</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleFavorite(prompt.id)}
                    style={styles.favoriteButton}
                  >
                    {prompt.isFavorite ? '⭐' : '☆'}
                  </button>
                </div>

                <p style={styles.promptContent}>
                  {prompt.content.length > 150
                    ? prompt.content.substring(0, 150) + '...'
                    : prompt.content}
                </p>

                {prompt.tags.length > 0 && (
                  <div style={styles.tags}>
                    {prompt.tags.map((tag, i) => (
                      <span key={i} style={styles.tag}>#{tag}</span>
                    ))}
                  </div>
                )}

                <div style={styles.promptActions}>
                  <button
                    onClick={() => handleCopy(prompt)}
                    style={styles.actionButton}
                  >
                    📋 Copiar
                  </button>
                  <button
                    onClick={() => handleEdit(prompt)}
                    style={styles.actionButton}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(prompt.id)}
                    style={{ ...styles.actionButton, ...styles.deleteButton }}
                  >
                    🗑️ Deletar
                  </button>
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
            <h3 style={styles.modalTitle}>
              {editingPrompt ? 'Editar Prompt' : 'Novo Prompt'}
            </h3>

            <div style={styles.modalForm}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={styles.input}
                  placeholder="Ex: Resumo de Anatomia"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Conteúdo *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  style={styles.textarea}
                  placeholder="Escreva seu prompt aqui..."
                  rows={6}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={styles.input}
                >
                  {categories.filter(c => c !== 'all').map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  style={styles.input}
                  placeholder="Ex: cardiovascular, coração"
                />
              </div>
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
                {editingPrompt ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Estilos (continuação no próximo bloco)
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
  filters: {
    display: 'flex',
    gap: '15px',
    marginBottom: '25px',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    minWidth: '200px',
    padding: '12px 16px',
    fontSize: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    outline: 'none',
  },
  categorySelect: {
    padding: '12px 16px',
    fontSize: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    outline: 'none',
    cursor: 'pointer',
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
  promptsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  promptCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  promptHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  promptTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    margin: '0 0 8px 0',
  },
  promptMeta: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    background: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  usageCount: {
    fontSize: '12px',
    color: '#666',
  },
  favoriteButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
  },
  promptContent: {
    fontSize: '14px',
    color: '#555',
    lineHeight: '1.6',
    marginBottom: '12px',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '15px',
  },
  tag: {
    padding: '4px 8px',
    background: '#f0f0f0',
    color: '#666',
    borderRadius: '6px',
    fontSize: '12px',
  },
  promptActions: {
    display: 'flex',
    gap: '10px',
    borderTop: '1px solid #f0f0f0',
    paddingTop: '15px',
  },
  actionButton: {
    flex: 1,
    padding: '8px',
    background: '#f5f7fa',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  deleteButton: {
    color: '#d32f2f',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
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
  textarea: {
    padding: '12px 16px',
    fontSize: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
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

export default Prompts;

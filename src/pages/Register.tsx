import { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    graduationYear: '',
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Nome
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter no mínimo 3 caracteres';
    }

    // Email
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Senha
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    // Confirmação de senha
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirme sua senha';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    // Ano de formatura (opcional, mas valida se preenchido)
    if (formData.graduationYear) {
      const year = parseInt(formData.graduationYear);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < currentYear || year > currentYear + 10) {
        newErrors.graduationYear = 'Ano inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      // 🎭 MOCK TEMPORÁRIO - Simula registro
      console.log('🎭 MODO MOCK: Registro simulado');
      console.log('Dados:', formData);
      
      // Simula delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simula usuário mockado criado
      const mockUser = {
        id: 'mock-user-' + Date.now(),
        email: formData.email,
        name: formData.name,
        university: formData.university || undefined,
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : undefined,
        xp: 0,
        level: 1,
        badges: ['welcome'],
        emailVerified: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Salva no localStorage (mock)
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('accessToken', 'mock-token-' + Date.now());
      localStorage.setItem('refreshToken', 'mock-refresh-token-' + Date.now());

      console.log('✅ Usuário criado e salvo no localStorage');

      // Força reload para AuthContext recarregar usuário
      window.location.href = '/dashboard';
      
      // ⚠️ QUANDO BACKEND ESTIVER PRONTO, use:
      // await register({
      //   name: formData.name,
      //   email: formData.email,
      //   password: formData.password,
      //   university: formData.university || undefined,
      //   graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : undefined,
      // });
      // navigate('/dashboard');
      
    } catch (error: any) {
      setApiError(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.registerBox}>
        {/* Logo e Título */}
        <div style={styles.header}>
          <h1 style={styles.logo}>🎯 MedPrompts</h1>
          <p style={styles.subtitle}>Crie sua conta gratuitamente</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Campo Nome */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nome completo *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                ...styles.input,
                ...(errors.name ? styles.inputError : {}),
              }}
              placeholder="Seu nome"
              disabled={loading}
            />
            {errors.name && <span style={styles.errorText}>{errors.name}</span>}
          </div>

          {/* Campo Email */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{
                ...styles.input,
                ...(errors.email ? styles.inputError : {}),
              }}
              placeholder="seu@email.com"
              disabled={loading}
            />
            {errors.email && <span style={styles.errorText}>{errors.email}</span>}
          </div>

          {/* Grid 2 colunas - Universidade e Ano */}
          <div style={styles.gridRow}>
            {/* Campo Universidade */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Universidade</label>
              <input
                type="text"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                style={styles.input}
                placeholder="Opcional"
                disabled={loading}
              />
            </div>

            {/* Campo Ano de Formatura */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Ano de formatura</label>
              <input
                type="number"
                value={formData.graduationYear}
                onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                style={{
                  ...styles.input,
                  ...(errors.graduationYear ? styles.inputError : {}),
                }}
                placeholder="2026"
                disabled={loading}
                min={new Date().getFullYear()}
                max={new Date().getFullYear() + 10}
              />
              {errors.graduationYear && <span style={styles.errorText}>{errors.graduationYear}</span>}
            </div>
          </div>

          {/* Campo Senha */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Senha *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{
                ...styles.input,
                ...(errors.password ? styles.inputError : {}),
              }}
              placeholder="Mínimo 6 caracteres"
              disabled={loading}
            />
            {errors.password && <span style={styles.errorText}>{errors.password}</span>}
          </div>

          {/* Campo Confirmar Senha */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirmar senha *</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              style={{
                ...styles.input,
                ...(errors.confirmPassword ? styles.inputError : {}),
              }}
              placeholder="Digite a senha novamente"
              disabled={loading}
            />
            {errors.confirmPassword && <span style={styles.errorText}>{errors.confirmPassword}</span>}
          </div>

          {/* Erro da API */}
          {apiError && (
            <div style={styles.apiError}>
              {apiError}
            </div>
          )}

          {/* Mock Warning */}
          <div style={styles.mockWarning}>
            🎭 <strong>MODO MOCK:</strong> Preencha o formulário para criar uma conta de teste
          </div>

          {/* Botão Submit */}
          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            disabled={loading}
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>

          {/* Link para Login */}
          <div style={styles.footer}>
            <span style={styles.footerText}>Já tem uma conta?</span>
            <Link to="/login" style={styles.link}>
              Fazer login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

// Estilos inline (CSS-in-JS)
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  registerBox: {
    background: '#fff',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '520px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  logo: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#667eea',
    margin: '0 0 10px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: 0,
  },
  form: {
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
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    fontSize: '13px',
    color: '#ff4444',
  },
  apiError: {
    padding: '12px',
    background: '#ffe6e6',
    border: '1px solid #ff4444',
    borderRadius: '8px',
    color: '#cc0000',
    fontSize: '14px',
  },
  mockWarning: {
    padding: '12px',
    background: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    color: '#856404',
    fontSize: '13px',
    textAlign: 'center',
  },
  button: {
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'transform 0.2s, opacity 0.3s',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  footer: {
    textAlign: 'center',
    marginTop: '10px',
  },
  footerText: {
    fontSize: '14px',
    color: '#666',
    marginRight: '8px',
  },
  link: {
    fontSize: '14px',
    color: '#667eea',
    fontWeight: '600',
    textDecoration: 'none',
  },
};

export default Register;

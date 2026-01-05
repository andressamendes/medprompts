import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Página 404 - Não Encontrado
 * Redireciona para home após 3 segundos
 */
const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redireciona para home após 3 segundos
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      {/* Ícone 404 */}
      <div
        style={{
          fontSize: '120px',
          fontWeight: 'bold',
          color: '#667eea',
          marginBottom:  '20px',
          animation: 'float 3s ease-in-out infinite',
        }}
      >
        404
      </div>

      {/* Título */}
      <h1
        style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '10px',
        }}
      >
        Página não encontrada
      </h1>

      {/* Descrição */}
      <p
        style={{
          fontSize: '18px',
          color: '#666',
          marginBottom: '30px',
          maxWidth: '500px',
        }}
      >
        A página que você está procurando não existe ou foi movida.  Você será
        redirecionado para a home em 3 segundos... 
      </p>

      {/* Botão */}
      <button
        onClick={() => navigate('/', { replace: true })}
        style={{
          padding: '12px 30px',
          fontSize: '16px',
          fontWeight: '600',
          color: '#fff',
          backgroundColor: '#667eea',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.3s',
        }}
        onMouseOver={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = '#5568d3';
        }}
        onMouseOut={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = '#667eea';
        }}
      >
        Voltar para Home
      </button>

      {/* Animação CSS */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}
      </style>
    </div>
  );
};

export default NotFound;
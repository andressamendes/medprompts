import { useState, useEffect } from 'react';
import { logger, LogLevel, LogEntry } from '@/utils/logger';

/**
 * Painel de debug para visualizar logs em tempo real
 * Útil durante desenvolvimento
 */
export function DebugPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogLevel | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(logger.getLogs());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const displayLogs = (() => {
    let filtered = filter !== null ? logger.getLogsByLevel(filter) : logs;
    
    if (searchQuery) {
      filtered = logger.searchLogs(searchQuery);
    }
    
    return filtered.reverse(); // Mais recentes primeiro
  })();

  const counts = logger.getLogCounts();

  const handleExport = () => {
    const blob = new Blob([logger.exportLogs()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelStyle = (level: LogLevel): React.CSSProperties => {
    const colors = {
      [LogLevel.DEBUG]: '#6B7280',
      [LogLevel.INFO]: '#3B82F6',
      [LogLevel.WARN]: '#F59E0B',
      [LogLevel.ERROR]: '#EF4444',
      [LogLevel.FATAL]: '#7F1D1D',
    };

    return {
      color: colors[level],
      fontWeight: 'bold',
    };
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#3B82F6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 9999,
          fontSize: '14px',
          fontWeight: 'bold',
        }}
      >
        🐛 Debug Panel
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        width: '600px',
        maxHeight: '80vh',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
          🐛 Debug Panel - Logs
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0',
          }}
        >
          ✕
        </button>
      </div>

      {/* Filters */}
      <div
        style={{
          padding: '1rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <button
          onClick={() => setFilter(null)}
          style={{
            padding: '0.25rem 0.75rem',
            backgroundColor: filter === null ? '#3B82F6' : '#f3f4f6',
            color: filter === null ? 'white' : '#374151',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Todos ({Object.values(counts).reduce((a, b) => a + b, 0)})
        </button>
        
        {Object.entries(counts).map(([level, count]) => {
          const levelNum = LogLevel[level as keyof typeof LogLevel];
          const emojis = {
            DEBUG: '🐛',
            INFO: 'ℹ️',
            WARN: '⚠️',
            ERROR: '❌',
            FATAL: '💀',
          };
          
          return (
            <button
              key={level}
              onClick={() => setFilter(levelNum)}
              style={{
                padding: '0.25rem 0.75rem',
                backgroundColor: filter === levelNum ? '#3B82F6' : '#f3f4f6',
                color: filter === levelNum ? 'white' : '#374151',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {emojis[level as keyof typeof emojis]} {level} ({count})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
        <input
          type="text"
          placeholder="Buscar logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />
      </div>

      {/* Actions */}
      <div
        style={{
          padding: '0.5rem 1rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          gap: '0.5rem',
        }}
      >
        <button
          onClick={handleExport}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          📥 Exportar
        </button>
        <button
          onClick={() => {
            if (confirm('Deseja limpar todos os logs?')) {
              logger.clearLogs();
              setLogs([]);
            }
          }}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          🗑️ Limpar
        </button>
      </div>

      {/* Logs List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
        }}
      >
        {displayLogs.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
            Nenhum log encontrado
          </div>
        ) : (
          displayLogs.map((log, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                borderRadius: '4px',
                borderLeft: `3px solid ${
                  {
                    [LogLevel.DEBUG]: '#6B7280',
                    [LogLevel.INFO]: '#3B82F6',
                    [LogLevel.WARN]: '#F59E0B',
                    [LogLevel.ERROR]: '#EF4444',
                    [LogLevel.FATAL]: '#7F1D1D',
                  }[log.level]
                }`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}
              >
                <span style={getLevelStyle(log.level)}>
                  {LogLevel[log.level]}
                </span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              
              <div style={{ fontSize: '14px', marginBottom: '0.5rem' }}>
                {log.message}
              </div>

              {log.context && Object.keys(log.context).length > 0 && (
                <details style={{ fontSize: '12px', marginTop: '0.5rem' }}>
                  <summary style={{ cursor: 'pointer', color: '#6b7280' }}>
                    Contexto
                  </summary>
                  <pre
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem',
                      backgroundColor: '#fff',
                      borderRadius: '4px',
                      overflow: 'auto',
                      fontSize: '11px',
                    }}
                  >
                    {JSON.stringify(log.context, null, 2)}
                  </pre>
                </details>
              )}

              {log.stackTrace && (
                <details style={{ fontSize: '12px', marginTop: '0.5rem' }}>
                  <summary style={{ cursor: 'pointer', color: '#ef4444' }}>
                    Stack Trace
                  </summary>
                  <pre
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem',
                      backgroundColor: '#fff',
                      borderRadius: '4px',
                      overflow: 'auto',
                      fontSize: '11px',
                      color: '#ef4444',
                    }}
                  >
                    {log.stackTrace}
                  </pre>
                </details>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

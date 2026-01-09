import React, { useState, useEffect } from 'react';
import { StardewHospital } from './StardewHospital';
import { useStudyRoom } from '../../hooks/useStudyRoom';
import { UserStatus } from '../../types/studyRoom.types';

/**
 * Componente de demonstração do hospital Stardew Valley
 */
export const StardewDemo: React.FC = () => {
  const {
    currentUser,
    otherUsers,
    updateUserStatus,
    pomodoroSuggestion,
    clearPomodoroSuggestion,
    isLoading
  } = useStudyRoom('Você', 'FOCUS');

  const [allUsers, setAllUsers] = useState(currentUser ? [currentUser, ...otherUsers] : []);

  useEffect(() => {
    if (currentUser) {
      setAllUsers([currentUser, ...otherUsers]);
    }
  }, [currentUser, otherUsers]);

  if (isLoading || !currentUser) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#E8D4F8',
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#2C3E50'
      }}>
        <div>
          <div style={{ marginBottom: '16px', textAlign: 'center' }}>🏥</div>
          <div>Carregando Hospital MedFocus...</div>
        </div>
      </div>
    );
  }

  const handleStatusChange = (status: UserStatus) => {
    updateUserStatus(status);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F5F0FA',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '28px',
          color: '#2C3E50',
          fontFamily: 'monospace'
        }}>
          🏥 Hospital MedFocus - Stardew Valley Edition
        </h1>
        <p style={{
          margin: '8px 0 0 0',
          fontSize: '14px',
          color: '#7F8C8D',
          fontFamily: 'monospace'
        }}>
          Experiência interativa de estudo colaborativo
        </p>
      </div>

      {/* Controles de Status */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          fontFamily: 'monospace',
          fontSize: '14px',
          marginBottom: '12px',
          color: '#2C3E50'
        }}>
          <strong>🎯 Seu Status:</strong> {currentUser.status}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleStatusChange('FOCUS')}
            style={{
              padding: '8px 16px',
              backgroundColor: currentUser.status === 'FOCUS' ? '#E74C3C' : '#ECF0F1',
              color: currentUser.status === 'FOCUS' ? '#FFFFFF' : '#2C3E50',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '13px',
              fontWeight: 'bold'
            }}
          >
            🔴 FOCO
          </button>
          <button
            onClick={() => handleStatusChange('SHORT_BREAK')}
            style={{
              padding: '8px 16px',
              backgroundColor: currentUser.status === 'SHORT_BREAK' ? '#3498DB' : '#ECF0F1',
              color: currentUser.status === 'SHORT_BREAK' ? '#FFFFFF' : '#2C3E50',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '13px',
              fontWeight: 'bold'
            }}
          >
            🔵 PAUSA CURTA
          </button>
          <button
            onClick={() => handleStatusChange('LONG_BREAK')}
            style={{
              padding: '8px 16px',
              backgroundColor: currentUser.status === 'LONG_BREAK' ? '#2ECC71' : '#ECF0F1',
              color: currentUser.status === 'LONG_BREAK' ? '#FFFFFF' : '#2C3E50',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '13px',
              fontWeight: 'bold'
            }}
          >
            🟢 PAUSA LONGA
          </button>
        </div>
      </div>

      {/* Hospital Canvas */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <StardewHospital
          users={allUsers}
          currentUserId={currentUser.id}
          pomodoroSuggestions={pomodoroSuggestion?.suggestions || []}
          onSuggestionDismiss={clearPomodoroSuggestion}
        />
      </div>

      {/* Info adicional */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#E8D4F8',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#2C3E50'
      }}>
        <div><strong>📊 Estatísticas:</strong></div>
        <div>👤 Você: {currentUser.username}</div>
        <div>🏆 Pomodoros: {currentUser.pomodorosCompleted}</div>
        <div>👥 Usuários online: {allUsers.length}</div>
        <div>📍 Posição: ({Math.floor(currentUser.position.x)}, {Math.floor(currentUser.position.y)})</div>
        <div>🧭 Direção: {currentUser.direction}</div>
        <div>🚶 Estado: {currentUser.movementState}</div>
      </div>
    </div>
  );
};

export default StardewDemo;

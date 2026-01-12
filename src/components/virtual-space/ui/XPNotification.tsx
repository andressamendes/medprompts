import React, { useEffect, useState } from 'react';
import { NetworkManager } from '../game/managers/NetworkManager';

interface XPEvent {
  id: string;
  amount: number;
  reason: string;
  timestamp: number;
}

interface XPNotificationProps {
  networkManager: NetworkManager;
}

export const XPNotification: React.FC<XPNotificationProps> = ({ networkManager }) => {
  const [notifications, setNotifications] = useState<XPEvent[]>([]);

  useEffect(() => {
    // Listen for XP events (simulado via eventos de interação)
    const handleInteraction = () => {
      addNotification(5, 'Interação');
    };

    const handleCaseDiscussion = () => {
      addNotification(20, 'Discussão de caso');
    };

    const handleProcedure = () => {
      addNotification(30, 'Procedimento cirúrgico');
    };

    const handlePlayerJoined = () => {
      addNotification(10, 'Entrou na sala');
    };

    networkManager.on('interaction', handleInteraction);
    networkManager.on('caseDiscussionInvite', handleCaseDiscussion);
    networkManager.on('procedureStarted', handleProcedure);
    networkManager.on('playerJoined', handlePlayerJoined);

    return () => {
      networkManager.off('interaction', handleInteraction);
      networkManager.off('caseDiscussionInvite', handleCaseDiscussion);
      networkManager.off('procedureStarted', handleProcedure);
      networkManager.off('playerJoined', handlePlayerJoined);
    };
  }, [networkManager]);

  const addNotification = (amount: number, reason: string) => {
    const newNotification: XPEvent = {
      id: `xp-${Date.now()}-${Math.random()}`,
      amount,
      reason,
      timestamp: Date.now(),
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Remove após 3 segundos
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id));
    }, 3000);
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className="animate-slide-in-right pointer-events-auto"
          style={{
            animation: 'slideInRight 0.3s ease-out, fadeOut 0.3s ease-in 2.7s',
          }}
        >
          <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 min-w-[200px]">
            {/* Ícone de estrela/XP */}
            <div className="text-2xl animate-bounce">⭐</div>

            {/* Conteúdo */}
            <div className="flex-1">
              <div className="font-bold text-lg">+{notification.amount} XP</div>
              <div className="text-xs text-yellow-100">{notification.reason}</div>
            </div>

            {/* Efeito de brilho */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shine" />
          </div>
        </div>
      ))}

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shine {
          animation: shine 2s infinite;
        }
      `}</style>
    </div>
  );
};

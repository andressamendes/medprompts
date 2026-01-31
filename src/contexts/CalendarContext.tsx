import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import calendarService from '@/services/api/calendar';

interface CalendarContextType {
  isCalendarAuthenticated: boolean;
  isCalendarLoading: boolean;
  connectCalendar: () => Promise<void>;
  disconnectCalendar: () => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [isCalendarAuthenticated, setIsCalendarAuthenticated] = useState(false);
  const [isCalendarLoading, setIsCalendarLoading] = useState(true);

  useEffect(() => {
    const loadGoogleScriptsInline = (): Promise<void> => {
      return new Promise((resolve) => {
        // Verificar se scripts já foram carregados
        if (document.querySelector('script[src*="apis.google.com"]')) {
          resolve();
          return;
        }

        // Carregar Google API
        const script1 = document.createElement('script');
        script1.src = 'https://apis.google.com/js/api.js';
        script1.async = true;
        script1.defer = true;

        // Carregar Google Identity Services
        const script2 = document.createElement('script');
        script2.src = 'https://accounts.google.com/gsi/client';
        script2.async = true;
        script2.defer = true;

        let loaded = 0;
        const checkLoaded = () => {
          loaded++;
          if (loaded === 2) resolve();
        };

        script1.onload = checkLoaded;
        script2.onload = checkLoaded;

        document.body.appendChild(script1);
        document.body.appendChild(script2);
      });
    };

    const initializeCalendar = async () => {
      setIsCalendarLoading(true);
      try {
        // Carregar scripts do Google
        await loadGoogleScriptsInline();

        // Inicializar Google API
        await calendarService.initGoogleApi();

        // Inicializar Google Identity Services
        calendarService.initGoogleIdentity(() => {
          setIsCalendarAuthenticated(true);
          localStorage.setItem('calendar_connected', 'true');
        });

        // Verificar se já estava conectado
        const wasConnected = localStorage.getItem('calendar_connected') === 'true';
        if (wasConnected && calendarService.isAuthenticated()) {
          setIsCalendarAuthenticated(true);
        }
      } catch (error) {
        console.error('Erro ao inicializar Calendar:', error);
      } finally {
        setIsCalendarLoading(false);
      }
    };

    initializeCalendar();
  }, []);

  const connectCalendar = async () => {
    try {
      await calendarService.login();
      setIsCalendarAuthenticated(true);
      localStorage.setItem('calendar_connected', 'true');
    } catch (error) {
      console.error('Erro ao conectar Calendar:', error);
      throw error;
    }
  };

  const disconnectCalendar = () => {
    calendarService.logout();
    setIsCalendarAuthenticated(false);
    localStorage.removeItem('calendar_connected');
  };

  return (
    <CalendarContext.Provider
      value={{
        isCalendarAuthenticated,
        isCalendarLoading,
        connectCalendar,
        disconnectCalendar,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
}

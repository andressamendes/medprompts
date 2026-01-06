/* eslint-disable @typescript-eslint/no-explicit-any */
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CALENDAR_CLIENT_ID;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events';

/**
 * Interface para evento do calendário
 */
export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
  colorId?: string;
}

/**
 * Serviço de integração com Google Calendar API
 */
class CalendarService {
  private tokenClient: any = null;
  private gapiInited = false;
  private gisInited = false;

  /**
   * Inicializar Google API
   */
  async initGoogleApi(): Promise<void> {
    if (this.gapiInited) return;

    return new Promise((resolve) => {
      (window as any).gapi.load('client', async () => {
        await (window as any).gapi.client.init({
          apiKey: GOOGLE_API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        this.gapiInited = true;
        resolve();
      });
    });
  }

  /**
   * Inicializar Google Identity Services
   */
  initGoogleIdentity(callback: () => void): void {
    if (this.gisInited) return;

    this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: callback,
    });
    this.gisInited = true;
  }

  /**
   * Fazer login no Google
   */
  async login(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.tokenClient) {
        reject(new Error('Token client não inicializado'));
        return;
      }

      this.tokenClient.callback = async (resp: any) => {
        if (resp.error !== undefined) {
          reject(resp);
        } else {
          resolve();
        }
      };

      if ((window as any).gapi.client.getToken() === null) {
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        this.tokenClient.requestAccessToken({ prompt: '' });
      }
    });
  }

  /**
   * Fazer logout
   */
  logout(): void {
    const token = (window as any).gapi.client.getToken();
    if (token !== null) {
      (window as any).google.accounts.oauth2.revoke(token.access_token);
      (window as any).gapi.client.setToken(null);
    }
  }

  /**
   * Verificar se está autenticado
   */
  isAuthenticated(): boolean {
    return (window as any).gapi?.client?.getToken() !== null;
  }

  /**
   * Listar eventos do calendário
   */
  async listEvents(maxResults: number = 10): Promise<CalendarEvent[]> {
    try {
      const response = await (window as any).gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: maxResults,
        orderBy: 'startTime',
      });

      return response.result.items || [];
    } catch (error: any) {
      console.error('Erro ao listar eventos:', error);
      throw new Error(error.message || 'Erro ao listar eventos');
    }
  }

  /**
   * Criar novo evento
   */
  async createEvent(event: CalendarEvent): Promise<CalendarEvent> {
    try {
      const response = await (window as any).gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      return response.result;
    } catch (error: any) {
      console.error('Erro ao criar evento:', error);
      throw new Error(error.message || 'Erro ao criar evento');
    }
  }

  /**
   * Atualizar evento existente
   */
  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const response = await (window as any).gapi.client.calendar.events.patch({
        calendarId: 'primary',
        eventId: eventId,
        resource: event,
      });

      return response.result;
    } catch (error: any) {
      console.error('Erro ao atualizar evento:', error);
      throw new Error(error.message || 'Erro ao atualizar evento');
    }
  }

  /**
   * Deletar evento
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      await (window as any).gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
    } catch (error: any) {
      console.error('Erro ao deletar evento:', error);
      throw new Error(error.message || 'Erro ao deletar evento');
    }
  }

  /**
   * Criar série de eventos de revisão espaçada
   * Baseado na curva de esquecimento de Ebbinghaus
   */
  async createSpacedRepetitionSeries(
    baseEvent: Omit<CalendarEvent, 'start' | 'end'>,
    startDate: Date,
    duration: number = 60 // duração em minutos
  ): Promise<CalendarEvent[]> {
    // Intervalos de revisão (em dias): 1, 3, 7, 14, 30
    const intervals = [1, 3, 7, 14, 30];
    const createdEvents: CalendarEvent[] = [];

    for (const interval of intervals) {
      const eventDate = new Date(startDate);
      eventDate.setDate(eventDate.getDate() + interval);

      const endDate = new Date(eventDate);
      endDate.setMinutes(endDate.getMinutes() + duration);

      const event: CalendarEvent = {
        ...baseEvent,
        summary: `[Revisão] ${baseEvent.summary}`,
        description: `${baseEvent.description || ''}\n\nRevisão espaçada - Dia ${interval}`,
        start: {
          dateTime: eventDate.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        colorId: '5', // Amarelo para revisões
      };

      try {
        const created = await this.createEvent(event);
        createdEvents.push(created);
      } catch (error) {
        console.error(`Erro ao criar revisão do dia ${interval}:`, error);
      }
    }

    return createdEvents;
  }
}

export default new CalendarService();

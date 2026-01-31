/* eslint-disable no-console */
/**
 * SISTEMA DE LOGGING ESTRUTURADO
 *
 * Logger profissional com níveis de severidade, persistência
 * local, formatação consistente, e recursos avançados para
 * debug, monitoramento e análise.
 *
 * @note Este arquivo usa console.* intencionalmente como implementação do logger
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  stackTrace?: string;
  userAgent?: string;
  url?: string;
}

class Logger {
  private static instance: Logger;
  private minLevel: LogLevel = LogLevel.INFO;
  private maxLogs: number = 100;
  private logs: LogEntry[] = [];
  private readonly STORAGE_KEY = 'medprompts-logs';
  private saveTimeout: number | null = null;
  private storage: Storage = localStorage;

  private constructor() {
    this.loadLogs();
    
    const isDev = this.isDevelopment();
    if (isDev) {
      this.minLevel = LogLevel.DEBUG;
    }
  }

  private isDevelopment(): boolean {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('local')) {
        return true;
      }
    }
    
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
      return true;
    }
    
    return false;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public static resetInstance(): void {
    Logger.instance = null as any;
  }

  public setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  public setStorage(storage: Storage): void {
    this.storage = storage;
  }

  public debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  public info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  public error(message: string, error?: Error, context?: Record<string, unknown>): void {
    const enrichedContext = {
      ...context,
      errorName: error?.name,
      errorMessage: error?.message,
    };

    this.log(LogLevel.ERROR, message, enrichedContext, error?.stack);
  }

  public fatal(message: string, error?: Error, context?: Record<string, unknown>): void {
    const enrichedContext = {
      ...context,
      errorName: error?.name,
      errorMessage: error?.message,
    };

    this.log(LogLevel.FATAL, message, enrichedContext, error?.stack);
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    stackTrace?: string
  ): void {
    if (level < this.minLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.serializeContext(context),
      stackTrace,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    this.saveLogs();
    this.consoleOutput(entry);
  }

  private serializeContext(context?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!context) return undefined;
    
    try {
      const seen = new WeakSet();
      return JSON.parse(JSON.stringify(context, (_key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      }));
    } catch (error) {
      console.error('Erro ao serializar contexto:', error);
      return { error: 'Failed to serialize context' };
    }
  }

  private consoleOutput(entry: LogEntry): void {
    const levelName = LogLevel[entry.level];
    const emoji = this.getLevelEmoji(entry.level);
    const color = this.getLevelColor(entry.level);
    
    const prefix = `${emoji} [${levelName}] ${entry.timestamp}`;
    const style = `color: ${color}; font-weight: bold;`;

    console.groupCollapsed(`%c${prefix}`, style, entry.message);
    
    if (entry.context) {
      console.log('Context:', entry.context);
    }
    
    if (entry.stackTrace) {
      console.log('Stack Trace:', entry.stackTrace);
    }
    
    console.log('URL:', entry.url);
    console.log('User Agent:', entry.userAgent);
    console.groupEnd();

    const consoleMethod = this.getConsoleMethod(entry.level);
    consoleMethod(entry.message, entry.context);
  }

  private getLevelEmoji(level: LogLevel): string {
    const emojis = {
      [LogLevel.DEBUG]: '🐛',
      [LogLevel.INFO]: 'ℹ️',
      [LogLevel.WARN]: '⚠️',
      [LogLevel.ERROR]: '❌',
      [LogLevel.FATAL]: '💀',
    };
    return emojis[level];
  }

  private getLevelColor(level: LogLevel): string {
    const colors = {
      [LogLevel.DEBUG]: '#6B7280',
      [LogLevel.INFO]: '#3B82F6',
      [LogLevel.WARN]: '#F59E0B',
      [LogLevel.ERROR]: '#EF4444',
      [LogLevel.FATAL]: '#7F1D1D',
    };
    return colors[level];
  }

  private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        return console.error;
      default:
        return console.log;
    }
  }

  private loadLogs(): void {
    try {
      const stored = this.storage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      this.logs = [];
    }
  }

  private saveLogs(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = window.setTimeout(() => {
      try {
        const logsString = JSON.stringify(this.logs);
        
        if (logsString.length > 4 * 1024 * 1024) {
          console.warn('Logs excederam limite, reduzindo quantidade...');
          this.logs = this.logs.slice(-Math.floor(this.maxLogs / 2));
          this.saveLogs();
          return;
        }
        
        this.storage.setItem(this.STORAGE_KEY, logsString);
      } catch (error: any) {
        if (error.name === 'QuotaExceededError') {
          console.error('Quota do storage excedida, reduzindo logs...');
          this.logs = this.logs.slice(-Math.floor(this.maxLogs / 2));
          this.saveLogs();
        } else {
          console.error('Erro ao salvar logs:', error);
        }
      }
    }, 500);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  public searchLogs(query: string): LogEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.logs.filter(log =>
      log.message.toLowerCase().includes(lowerQuery) ||
      JSON.stringify(log.context).toLowerCase().includes(lowerQuery)
    );
  }

  public getLogsByTimeRange(startDate: Date, endDate: Date): LogEntry[] {
    return this.logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  public clearLogs(): void {
    this.logs = [];
    this.storage.removeItem(this.STORAGE_KEY);
    console.info('Logs limpos');
  }

  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  public getLogCounts(): Record<string, number> {
    const counts: Record<string, number> = {
      DEBUG: 0,
      INFO: 0,
      WARN: 0,
      ERROR: 0,
      FATAL: 0,
    };

    this.logs.forEach((log) => {
      const levelName = LogLevel[log.level];
      counts[levelName]++;
    });

    return counts;
  }

  public async sendLogsToServer(endpoint: string): Promise<void> {
    try {
      const errorLogs = this.logs.filter(log => 
        log.level >= LogLevel.ERROR
      );
      
      if (errorLogs.length === 0) {
        console.info('Nenhum log de erro para enviar');
        return;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorLogs)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.info(`${errorLogs.length} logs enviados com sucesso`);
      
      this.logs = this.logs.filter(log => log.level < LogLevel.ERROR);
      this.saveLogs();
    } catch (error) {
      console.error('Falha ao enviar logs para servidor:', error);
    }
  }

  public setMaxLogs(max: number): void {
    this.maxLogs = max;
    if (this.logs.length > max) {
      this.logs = this.logs.slice(-max);
      this.saveLogs();
    }
  }
}

export const logger = Logger.getInstance();
export { Logger };

export function useLogger() {
  return logger;
}

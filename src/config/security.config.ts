/**
 * 🔒 Configuração de Segurança - MedPrompts
 *
 * Centraliza todas as configurações de segurança e valida variáveis de ambiente.
 * Falha de forma segura se configurações críticas estiverem ausentes.
 */

interface SecurityConfig {
  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  bcrypt: {
    rounds: number;
  };
  rateLimit: {
    maxLoginAttempts: number;
    lockoutDuration: number; // minutos
  };
  urls: {
    allowedMusicStreams: string[];
    alarmSoundUrl: string;
  };
  csp: {
    allowedDomains: string[];
  };
  environment: {
    nodeEnv: 'development' | 'production' | 'test';
    appUrl: string;
  };
}

/**
 * Valida se uma variável de ambiente está presente
 */
function requireEnv(key: string, defaultValue?: string): string {
  const value = import.meta.env[key] || defaultValue;

  if (!value) {
    throw new Error(
      `⚠️ SECURITY ERROR: Variável de ambiente obrigatória ausente: ${key}\n` +
      `Por favor, configure ${key} no arquivo .env (veja .env.example)`
    );
  }

  return value;
}

/**
 * Obtém variável de ambiente opcional com valor padrão
 */
function getEnv(key: string, defaultValue: string): string {
  return import.meta.env[key] || defaultValue;
}

/**
 * Parse de número com validação
 */
function getNumberEnv(key: string, defaultValue: number): number {
  const value = import.meta.env[key];
  if (!value) return defaultValue;

  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    console.warn(`⚠️ WARNING: ${key} deve ser um número. Usando padrão: ${defaultValue}`);
    return defaultValue;
  }

  return parsed;
}

/**
 * Parse de array separado por vírgulas
 */
function getArrayEnv(key: string, defaultValue: string[]): string[] {
  const value = import.meta.env[key];
  if (!value) return defaultValue;

  return value.split(',').map((item: string) => item.trim()).filter(Boolean);
}

/**
 * Valores padrão seguros para desenvolvimento
 * ⚠️ NUNCA use estes valores em produção!
 */
const DEVELOPMENT_DEFAULTS = {
  JWT_SECRET: 'dev-secret-CHANGE-IN-PRODUCTION-' + Date.now(),
  JWT_REFRESH_SECRET: 'dev-refresh-secret-CHANGE-IN-PRODUCTION-' + Date.now(),
  BCRYPT_ROUNDS: 10, // Menor para dev (mais rápido)
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15,
  ALLOWED_MUSIC_STREAMS: [
    'https://stream.zeno.fm/f3wvbbqmdg8uv',
    'https://stream.zeno.fm/0r0xa792kwzuv',
    'https://stream.zeno.fm/f6vhq8qqtg8uv'
  ],
  ALARM_SOUND_URL: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg',
  CSP_DOMAINS: ['https://stream.zeno.fm', 'https://actions.google.com'],
  APP_URL: 'http://localhost:5173'
};

/**
 * Valida configuração de produção
 */
function validateProductionConfig(config: SecurityConfig): void {
  if (config.environment.nodeEnv !== 'production') {
    return; // Só valida em produção
  }

  const errors: string[] = [];

  // JWT secrets devem ser fortes em produção
  if (config.jwt.secret.length < 32) {
    errors.push('JWT_SECRET deve ter pelo menos 32 caracteres em produção');
  }

  if (config.jwt.refreshSecret.length < 32) {
    errors.push('JWT_REFRESH_SECRET deve ter pelo menos 32 caracteres em produção');
  }

  // Secrets não podem conter valores de desenvolvimento
  if (config.jwt.secret.includes('dev-secret')) {
    errors.push('JWT_SECRET está usando valor de desenvolvimento em produção!');
  }

  if (config.jwt.refreshSecret.includes('dev-refresh-secret')) {
    errors.push('JWT_REFRESH_SECRET está usando valor de desenvolvimento em produção!');
  }

  // Bcrypt rounds deve ser adequado
  if (config.bcrypt.rounds < 12) {
    errors.push('BCRYPT_ROUNDS deve ser pelo menos 12 em produção (recomendado: 12-14)');
  }

  if (errors.length > 0) {
    throw new Error(
      '⚠️ SECURITY ERROR: Configuração de produção inválida:\n' +
      errors.map(err => `  - ${err}`).join('\n')
    );
  }
}

/**
 * Carrega e valida configuração de segurança
 */
function loadSecurityConfig(): SecurityConfig {
  const nodeEnv = (getEnv('VITE_NODE_ENV', 'development') as SecurityConfig['environment']['nodeEnv']);
  const isProduction = nodeEnv === 'production';

  // Em produção, exige secrets. Em dev, permite defaults.
  const config: SecurityConfig = {
    jwt: {
      secret: isProduction
        ? requireEnv('VITE_JWT_SECRET')
        : getEnv('VITE_JWT_SECRET', DEVELOPMENT_DEFAULTS.JWT_SECRET),
      refreshSecret: isProduction
        ? requireEnv('VITE_JWT_REFRESH_SECRET')
        : getEnv('VITE_JWT_REFRESH_SECRET', DEVELOPMENT_DEFAULTS.JWT_REFRESH_SECRET),
      expiresIn: getEnv('VITE_JWT_EXPIRES_IN', '15m'),
      refreshExpiresIn: getEnv('VITE_JWT_REFRESH_EXPIRES_IN', '7d'),
    },
    bcrypt: {
      rounds: getNumberEnv(
        'VITE_BCRYPT_ROUNDS',
        isProduction ? 12 : DEVELOPMENT_DEFAULTS.BCRYPT_ROUNDS
      ),
    },
    rateLimit: {
      maxLoginAttempts: getNumberEnv('VITE_MAX_LOGIN_ATTEMPTS', DEVELOPMENT_DEFAULTS.MAX_LOGIN_ATTEMPTS),
      lockoutDuration: getNumberEnv('VITE_ACCOUNT_LOCKOUT_DURATION', DEVELOPMENT_DEFAULTS.LOCKOUT_DURATION),
    },
    urls: {
      allowedMusicStreams: getArrayEnv('VITE_ALLOWED_MUSIC_STREAMS', DEVELOPMENT_DEFAULTS.ALLOWED_MUSIC_STREAMS),
      alarmSoundUrl: getEnv('VITE_ALARM_SOUND_URL', DEVELOPMENT_DEFAULTS.ALARM_SOUND_URL),
    },
    csp: {
      allowedDomains: getArrayEnv('VITE_CSP_DOMAINS', DEVELOPMENT_DEFAULTS.CSP_DOMAINS),
    },
    environment: {
      nodeEnv,
      appUrl: getEnv('VITE_APP_URL', DEVELOPMENT_DEFAULTS.APP_URL),
    },
  };

  // Valida configuração em produção
  validateProductionConfig(config);

  // Log warning em desenvolvimento
  if (!isProduction && config.jwt.secret.includes('dev-secret')) {
    console.warn(
      '⚠️ SECURITY WARNING: Usando JWT secrets padrão de desenvolvimento.\n' +
      'Configure VITE_JWT_SECRET e VITE_JWT_REFRESH_SECRET no arquivo .env\n' +
      'Veja .env.example para referência.'
    );
  }

  return config;
}

/**
 * Configuração de segurança singleton
 */
export const securityConfig: SecurityConfig = loadSecurityConfig();

/**
 * Helper: Verifica se está em produção
 */
export const isProduction = (): boolean => {
  return securityConfig.environment.nodeEnv === 'production';
};

/**
 * Helper: Verifica se está em desenvolvimento
 */
export const isDevelopment = (): boolean => {
  return securityConfig.environment.nodeEnv === 'development';
};

/**
 * Helper: Verifica se URL é permitida
 */
export const isUrlAllowed = (url: string): boolean => {
  try {
    const urlObj = new URL(url);

    // Verifica streams de música
    if (securityConfig.urls.allowedMusicStreams.includes(url)) {
      return true;
    }

    // Verifica domínios CSP
    return securityConfig.csp.allowedDomains.some(domain => {
      const domainUrl = new URL(domain);
      return urlObj.hostname === domainUrl.hostname;
    });
  } catch {
    return false; // URL inválida
  }
};

/**
 * Helper: Valida e sanitiza URL externa
 */
export const validateExternalUrl = (url: string, _type: 'music' | 'alarm' | 'general'): string => {
  if (!isUrlAllowed(url)) {
    throw new Error(
      `⚠️ SECURITY ERROR: URL não autorizada: ${url}\n` +
      `Adicione o domínio em VITE_CSP_DOMAINS no .env`
    );
  }

  return url;
};

// Log de inicialização
if (isDevelopment()) {
  console.log('🔒 Security Config carregado:', {
    environment: securityConfig.environment.nodeEnv,
    jwtExpiresIn: securityConfig.jwt.expiresIn,
    bcryptRounds: securityConfig.bcrypt.rounds,
    maxLoginAttempts: securityConfig.rateLimit.maxLoginAttempts,
    allowedStreams: securityConfig.urls.allowedMusicStreams.length,
  });
}

export default securityConfig;

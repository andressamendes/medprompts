// Sistema de Export/Import de dados (Backup completo)

import { loadProgress, saveProgress, type UserProgress } from './gamification';
import { loadProfile, saveProfile, type StudentProfile } from './profile';
import { loadUserBadges, saveUserBadges, type UserBadges } from './badges';
import { loadDailyMissions, saveDailyMissions, type DailyMissionsState } from './daily-missions';
import { loadPomodoroState, savePomodoroState, type PomodoroState } from './pomodoro';
import {
  CustomizationPreferences,
  CUSTOMIZATION_STORAGE_KEY,
  DEFAULT_PREFERENCES,
} from '@/types/customization';
import { validatePromptOutput, extractPlaceholders } from './promptOutputValidator';

export interface MedPromptsBackup {
  version: string;
  exportDate: string;
  data: {
    progress: UserProgress;
    profile: StudentProfile;
    badges: UserBadges;
    missions: DailyMissionsState;
    pomodoro: PomodoroState;
  };
}

const CURRENT_VERSION = '1.0.0';

// Exportar todos os dados
export function exportAllData(): MedPromptsBackup {
  const backup: MedPromptsBackup = {
    version: CURRENT_VERSION,
    exportDate: new Date().toISOString(),
    data: {
      progress: loadProgress(),
      profile: loadProfile(),
      badges: loadUserBadges(),
      missions: loadDailyMissions(),
      pomodoro: loadPomodoroState(),
    },
  };

  return backup;
}

// Gerar arquivo JSON para download
export function downloadBackup(): void {
  const backup = exportAllData();
  const dataStr = JSON.stringify(backup, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `medprompts-backup-${new Date().toISOString().split('T')[0]}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Importar dados de um backup
export function importBackup(backupData: MedPromptsBackup): {
  success: boolean;
  message: string;
  imported: string[];
} {
  const imported: string[] = [];

  try {
    // Validar versão
    if (!backupData.version) {
      return {
        success: false,
        message: 'Arquivo de backup inválido: versão não encontrada',
        imported: [],
      };
    }

    // Importar cada componente
    if (backupData.data.progress) {
      saveProgress(backupData.data.progress);
      imported.push('Progresso e XP');
    }

    if (backupData.data.profile) {
      saveProfile(backupData.data.profile);
      imported.push('Perfil');
    }

    if (backupData.data.badges) {
      saveUserBadges(backupData.data.badges);
      imported.push('Badges');
    }

    if (backupData.data.missions) {
      saveDailyMissions(backupData.data.missions);
      imported.push('Missões Diárias');
    }

    if (backupData.data.pomodoro) {
      savePomodoroState(backupData.data.pomodoro);
      imported.push('Histórico Pomodoro');
    }

    // Disparar eventos de atualização
    window.dispatchEvent(new Event('progressUpdated'));
    window.dispatchEvent(new Event('profileUpdated'));
    window.dispatchEvent(new Event('badgesUpdated'));
    window.dispatchEvent(new Event('missionsUpdated'));
    window.dispatchEvent(new Event('pomodoroUpdated'));

    return {
      success: true,
      message: `Backup restaurado com sucesso!`,
      imported,
    };
  } catch (error) {
    console.error('Erro ao importar backup:', error);
    return {
      success: false,
      message: 'Erro ao processar arquivo de backup',
      imported: [],
    };
  }
}

// Validar arquivo de backup
export function validateBackup(data: any): data is MedPromptsBackup {
  return (
    data &&
    typeof data === 'object' &&
    'version' in data &&
    'exportDate' in data &&
    'data' in data &&
    typeof data.data === 'object'
  );
}

// Limpar todos os dados (reset completo)
export function clearAllData(): void {
  const keys = [
    'medprompts_user_progress',
    'medprompts_user_profile',
    'medprompts_user_badges',
    'medprompts_daily_missions',
    'medprompts_pomodoro',
    CUSTOMIZATION_STORAGE_KEY,
  ];

  keys.forEach(key => {
    localStorage.removeItem(key);
  });

  // Disparar eventos de atualização
  window.dispatchEvent(new Event('progressUpdated'));
  window.dispatchEvent(new Event('profileUpdated'));
  window.dispatchEvent(new Event('badgesUpdated'));
  window.dispatchEvent(new Event('missionsUpdated'));
  window.dispatchEvent(new Event('pomodoroUpdated'));
  window.dispatchEvent(new Event('customizationUpdated'));
}

// ============================================
// EXPORTAÇÃO DE PROMPTS CUSTOMIZADOS
// ============================================

export interface ExportedCustomizedPrompt {
  title: string;
  originalPromptId: string;
  customizedContent: string;
  preferences: Partial<CustomizationPreferences>;
  placeholders: string[];
  exportDate: string;
  isValid: boolean;
  validationScore: number;
}

/**
 * Carrega preferências de customização do localStorage
 */
export function loadCustomizationPreferences(): CustomizationPreferences {
  try {
    const stored = localStorage.getItem(CUSTOMIZATION_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn('Erro ao carregar preferências de customização:', error);
  }
  return DEFAULT_PREFERENCES;
}

/**
 * Salva preferências de customização no localStorage
 */
export function saveCustomizationPreferences(
  prefs: CustomizationPreferences
): void {
  try {
    localStorage.setItem(CUSTOMIZATION_STORAGE_KEY, JSON.stringify(prefs));
    window.dispatchEvent(new Event('customizationUpdated'));
  } catch (error) {
    console.warn('Erro ao salvar preferências de customização:', error);
  }
}

/**
 * Exporta um prompt customizado para arquivo
 */
export function exportCustomizedPrompt(
  title: string,
  originalPromptId: string,
  customizedContent: string,
  originalTemplate: string,
  preferences?: Partial<CustomizationPreferences>
): ExportedCustomizedPrompt {
  const validation = validatePromptOutput(
    customizedContent,
    originalTemplate,
    preferences
  );

  const placeholders = extractPlaceholders(customizedContent).map(
    (p) => p.placeholder
  );

  return {
    title,
    originalPromptId,
    customizedContent,
    preferences: preferences || {},
    placeholders,
    exportDate: new Date().toISOString(),
    isValid: validation.isValid,
    validationScore: validation.score,
  };
}

/**
 * Faz download de um prompt customizado como arquivo de texto
 */
export function downloadCustomizedPrompt(
  title: string,
  content: string,
  format: 'txt' | 'md' = 'txt'
): void {
  const extension = format;
  const mimeType = format === 'md' ? 'text/markdown' : 'text/plain';
  const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-customizado.${extension}`;

  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Exporta prompt customizado com metadados em JSON
 */
export function downloadCustomizedPromptWithMetadata(
  exported: ExportedCustomizedPrompt
): void {
  const filename = `${exported.title.toLowerCase().replace(/\s+/g, '-')}-customizado.json`;
  const dataStr = JSON.stringify(exported, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Valida que um prompt exportado mantém placeholders editáveis
 */
export function validateExportedPrompt(
  content: string,
  originalTemplate: string
): {
  isValid: boolean;
  hasPlaceholders: boolean;
  placeholderCount: number;
  errors: string[];
} {
  const validation = validatePromptOutput(content, originalTemplate);

  return {
    isValid: validation.isValid,
    hasPlaceholders: validation.hasEditablePlaceholders,
    placeholderCount: validation.placeholders.length,
    errors: validation.errors.map((e) => e.message),
  };
}

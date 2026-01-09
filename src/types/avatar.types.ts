/**
 * Tipos TypeScript para avatares estilo Stardew Valley
 */

export type AvatarType = 
  | 'veteran_doctor'
  | 'dedicated_resident'
  | 'caring_nurse'
  | 'focused_student'
  | 'expert_surgeon'
  | 'on_call'
  | 'researcher'
  | 'intern';

export type ClassYear = 'TI' | 'TII' | 'TIII' | 'TIV' | 'TV' | 'TVI';

export interface AvatarCustomization {
  avatarType: AvatarType;
  classYear: ClassYear;
}

export interface AvatarInfo {
  type: AvatarType;
  name: string;
  description: string;
  emoji: string;
  colors: {
    skin: string;
    hair: string;
    uniform: string;
    accent: string;
  };
}

export const AVATAR_CATALOG: Record<AvatarType, AvatarInfo> = {
  veteran_doctor: {
    type: 'veteran_doctor',
    name: 'Médico(a) Veterano(a)',
    description: 'Experiente e sábio, sempre disposto a ensinar',
    emoji: '👨‍⚕️',
    colors: {
      skin: '#FFD7BA',
      hair: '#A0A0A0',
      uniform: '#FFFFFF',
      accent: '#E74C3C'
    }
  },
  dedicated_resident: {
    type: 'dedicated_resident',
    name: 'Residente Dedicado(a)',
    description: 'Sempre estudando, comprometido com excelência',
    emoji: '👩‍⚕️',
    colors: {
      skin: '#E6A57E',
      hair: '#2C1608',
      uniform: '#4A90E2',
      accent: '#2C3E50'
    }
  },
  caring_nurse: {
    type: 'caring_nurse',
    name: 'Enfermeiro(a) Atencioso(a)',
    description: 'Cuidadoso e empático, coração do time',
    emoji: '🩺',
    colors: {
      skin: '#C68642',
      hair: '#5C3317',
      uniform: '#27AE60',
      accent: '#FFFFFF'
    }
  },
  focused_student: {
    type: 'focused_student',
    name: 'Estudante Focado(a)',
    description: 'Determinado a absorver todo conhecimento',
    emoji: '📚',
    colors: {
      skin: '#FFD7BA',
      hair: '#F4C542',
      uniform: '#34495E',
      accent: '#FFFFFF'
    }
  },
  expert_surgeon: {
    type: 'expert_surgeon',
    name: 'Cirurgião(ã) Expert',
    description: 'Mãos firmes, mente afiada',
    emoji: '⚕️',
    colors: {
      skin: '#E6A57E',
      hair: '#2C1608',
      uniform: '#16A085',
      accent: '#FFFFFF'
    }
  },
  on_call: {
    type: 'on_call',
    name: 'Plantonista',
    description: 'Sempre alerta, pronto para emergências',
    emoji: '🚑',
    colors: {
      skin: '#C68642',
      hair: '#2C1608',
      uniform: '#9B59B6',
      accent: '#FFFFFF'
    }
  },
  researcher: {
    type: 'researcher',
    name: 'Pesquisador(a)',
    description: 'Curioso, busca respostas através da ciência',
    emoji: '🔬',
    colors: {
      skin: '#8D5524',
      hair: '#2C1608',
      uniform: '#FFFFFF',
      accent: '#3498DB'
    }
  },
  intern: {
    type: 'intern',
    name: 'Interno(a) Novato(a)',
    description: 'Cheio de energia e vontade de aprender',
    emoji: '🎓',
    colors: {
      skin: '#FFD7BA',
      hair: '#C04000',
      uniform: '#ECF0F1',
      accent: '#E67E22'
    }
  }
};

export const CLASS_YEARS: Record<ClassYear, { name: string; color: string }> = {
  TI: { name: 'Turma I', color: '#E74C3C' },
  TII: { name: 'Turma II', color: '#F39C12' },
  TIII: { name: 'Turma III', color: '#27AE60' },
  TIV: { name: 'Turma IV', color: '#3498DB' },
  TV: { name: 'Turma V', color: '#9B59B6' },
  TVI: { name: 'Turma VI', color: '#E91E63' }
};

export const DEFAULT_AVATAR: AvatarCustomization = {
  avatarType: 'focused_student',
  classYear: 'TI'
};

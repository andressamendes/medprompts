/**
 * Tipos para Sistema de Customização de Prompts
 *
 * Permite usuários editarem campos dinâmicos enquanto preserva
 * placeholders editáveis no output final para uso posterior.
 */

export type DetailLevel = 'basico' | 'intermediario' | 'avancado' | 'especialista';

export type ClinicalContext =
  | 'ambulatorio'
  | 'emergencia'
  | 'enfermaria'
  | 'uti'
  | 'centro-cirurgico'
  | 'consultorio'
  | 'outro';

export interface CustomizationPreferences {
  // Campos principais de customização
  especialidade: string;
  contextoClinico: ClinicalContext;
  nivelDetalhe: DetailLevel;

  // Campos auxiliares opcionais
  publicoAlvo?: string;
  objetivoEspecifico?: string;
  formatoPreferido?: string;

  // Metadados
  updatedAt: string;
}

export interface CustomizationField {
  id: keyof CustomizationPreferences | string;
  label: string;
  description: string;
  type: 'text' | 'select' | 'textarea';
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  // Placeholder que será inserido no output quando o campo estiver vazio
  outputPlaceholder: string;
}

export interface PromptTemplate {
  id: string;
  originalContent: string;
  customizedContent?: string;
  appliedPreferences?: Partial<CustomizationPreferences>;
}

export interface ExportedPrompt {
  content: string;
  hasEditablePlaceholders: boolean;
  placeholders: string[];
  validationErrors: string[];
  isValid: boolean;
}

export interface CustomizationValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  hardcodedValues: string[];
}

// Constantes para campos de customização
export const CUSTOMIZATION_FIELDS: CustomizationField[] = [
  {
    id: 'especialidade',
    label: 'Especialidade Médica',
    description: 'Área de atuação ou foco do prompt',
    type: 'select',
    options: [
      { value: '', label: 'Selecione ou deixe flexível' },
      { value: 'cardiologia', label: 'Cardiologia' },
      { value: 'neurologia', label: 'Neurologia' },
      { value: 'pediatria', label: 'Pediatria' },
      { value: 'ginecologia', label: 'Ginecologia e Obstetrícia' },
      { value: 'ortopedia', label: 'Ortopedia' },
      { value: 'clinica-medica', label: 'Clínica Médica' },
      { value: 'cirurgia', label: 'Cirurgia Geral' },
      { value: 'emergencia', label: 'Medicina de Emergência' },
      { value: 'psiquiatria', label: 'Psiquiatria' },
      { value: 'dermatologia', label: 'Dermatologia' },
      { value: 'oftalmologia', label: 'Oftalmologia' },
      { value: 'outra', label: 'Outra especialidade' },
    ],
    outputPlaceholder: '{{ESPECIALIDADE}}',
    required: false,
  },
  {
    id: 'contextoClinico',
    label: 'Contexto Clínico',
    description: 'Ambiente onde o prompt será utilizado',
    type: 'select',
    options: [
      { value: '', label: 'Selecione ou deixe flexível' },
      { value: 'ambulatorio', label: 'Ambulatório' },
      { value: 'emergencia', label: 'Emergência/Pronto-Socorro' },
      { value: 'enfermaria', label: 'Enfermaria' },
      { value: 'uti', label: 'UTI' },
      { value: 'centro-cirurgico', label: 'Centro Cirúrgico' },
      { value: 'consultorio', label: 'Consultório' },
      { value: 'outro', label: 'Outro contexto' },
    ],
    outputPlaceholder: '{{CONTEXTO_CLINICO}}',
    required: false,
  },
  {
    id: 'nivelDetalhe',
    label: 'Nível de Detalhe',
    description: 'Profundidade da resposta esperada',
    type: 'select',
    options: [
      { value: '', label: 'Selecione ou deixe flexível' },
      { value: 'basico', label: 'Básico - Conceitos fundamentais' },
      { value: 'intermediario', label: 'Intermediário - Detalhes clínicos' },
      { value: 'avancado', label: 'Avançado - Análise aprofundada' },
      { value: 'especialista', label: 'Especialista - Máxima profundidade' },
    ],
    outputPlaceholder: '{{NIVEL_DETALHE}}',
    required: false,
  },
  {
    id: 'publicoAlvo',
    label: 'Público-Alvo',
    description: 'Para quem a resposta é destinada',
    type: 'text',
    placeholder: 'Ex: Estudantes de medicina, Residentes R1...',
    outputPlaceholder: '[PÚBLICO-ALVO]',
    required: false,
    maxLength: 100,
  },
  {
    id: 'objetivoEspecifico',
    label: 'Objetivo Específico',
    description: 'O que deseja alcançar com este prompt',
    type: 'textarea',
    placeholder: 'Descreva brevemente seu objetivo...',
    outputPlaceholder: '[INSIRA SEU OBJETIVO AQUI]',
    required: false,
    maxLength: 500,
  },
];

// Placeholders padrão que devem estar presentes no output
export const REQUIRED_OUTPUT_PLACEHOLDERS = [
  '[INSIRA SEU CASO AQUI]',
  '{{contexto_paciente}}',
];

// Labels amigáveis para níveis de detalhe
export const DETAIL_LEVEL_LABELS: Record<DetailLevel, string> = {
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
  especialista: 'Especialista',
};

// Labels amigáveis para contextos clínicos
export const CLINICAL_CONTEXT_LABELS: Record<ClinicalContext, string> = {
  ambulatorio: 'Ambulatório',
  emergencia: 'Emergência',
  enfermaria: 'Enfermaria',
  uti: 'UTI',
  'centro-cirurgico': 'Centro Cirúrgico',
  consultorio: 'Consultório',
  outro: 'Outro',
};

// Chave padrão para localStorage
export const CUSTOMIZATION_STORAGE_KEY = 'medprompts_customization_preferences';

// Preferências padrão
export const DEFAULT_PREFERENCES: CustomizationPreferences = {
  especialidade: '',
  contextoClinico: 'ambulatorio',
  nivelDetalhe: 'intermediario',
  publicoAlvo: '',
  objetivoEspecifico: '',
  formatoPreferido: '',
  updatedAt: new Date().toISOString(),
};

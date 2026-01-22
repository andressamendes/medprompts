/**
 * Sistema de Geração Contextual Inteligente
 * Tipos e interfaces para o motor de processamento semântico
 */

import type { Prompt } from './prompt';

// Especialidades médicas reconhecidas
export type MedicalSpecialty =
  | 'cardiologia'
  | 'neurologia'
  | 'pediatria'
  | 'ginecologia'
  | 'ortopedia'
  | 'emergencia'
  | 'clinica-medica'
  | 'cirurgia'
  | 'dermatologia'
  | 'psiquiatria'
  | 'endocrinologia'
  | 'gastroenterologia'
  | 'nefrologia'
  | 'pneumologia'
  | 'reumatologia'
  | 'infectologia'
  | 'hematologia'
  | 'oncologia'
  | 'geriatria'
  | 'medicina-intensiva'
  | 'oftalmologia'
  | 'otorrinolaringologia'
  | 'urologia';

// Níveis acadêmicos
export type AcademicLevel =
  | 'basico'
  | 'intermediario'
  | 'avancado'
  | 'residencia';

// Formatos de output desejados
export type OutputFormat =
  | 'flashcards'
  | 'resumo'
  | 'questoes'
  | 'caso-clinico'
  | 'mapa-mental'
  | 'mnemonico'
  | 'revisao'
  | 'explicacao'
  | 'checklist'
  | 'protocolo'
  | 'analise';

// Contextos clínicos
export type ClinicalContext =
  | 'ambulatorio'
  | 'enfermaria'
  | 'emergencia'
  | 'uti'
  | 'centro-cirurgico'
  | 'domiciliar'
  | 'consultorio';

// Tipos de exame/prova
export type ExamType =
  | 'prova-faculdade'
  | 'residencia'
  | 'titulo-especialista'
  | 'revalida'
  | 'concurso';

/**
 * Entidades extraídas do input do usuário pelo parser semântico
 */
export interface ExtractedEntities {
  /** Tópico médico principal identificado */
  medicalTopic?: string;
  /** Especialidade médica */
  specialty?: MedicalSpecialty;
  /** Nível acadêmico do usuário */
  academicLevel?: AcademicLevel;
  /** Formato de output desejado */
  outputFormat?: OutputFormat;
  /** Contexto clínico (se aplicável) */
  clinicalContext?: ClinicalContext;
  /** Tipo de exame/prova */
  examType?: ExamType;
  /** Prazo ou período de tempo mencionado */
  timeframe?: string;
  /** Contextos adicionais detectados */
  additionalContext: string[];
  /** Input original do usuário */
  rawInput: string;
  /** Score de confiança da extração (0-1) */
  confidence: number;
}

/**
 * Resultado da análise contextual com intent identificado
 */
export interface ContextualIntent {
  /** Prompt mais adequado baseado no contexto */
  primaryPrompt: Prompt | null;
  /** Prompts alternativos sugeridos */
  alternativePrompts: Prompt[];
  /** Valores inferidos para as variáveis do prompt */
  inferredValues: Record<string, string>;
  /** Campos críticos que ainda precisam ser preenchidos */
  missingCritical: string[];
  /** Campos opcionais não preenchidos */
  missingOptional: string[];
  /** Score de match (0-100) */
  matchScore: number;
  /** Notas de adaptação aplicadas */
  adaptationNotes: string[];
}

/**
 * Adaptação aplicada ao prompt
 */
export interface PromptAdaptation {
  /** Tipo de adaptação */
  type: 'fill' | 'remove' | 'transform' | 'append' | 'context';
  /** Campo alvo da adaptação */
  target: string;
  /** Valor original (se aplicável) */
  original?: string;
  /** Resultado da adaptação */
  result: string;
  /** Razão da adaptação */
  reason: string;
}

/**
 * Prompt adaptado pronto para uso
 */
export interface AdaptedPrompt {
  /** Prompt original */
  original: Prompt;
  /** Conteúdo do prompt adaptado */
  adapted: string;
  /** Variáveis que foram preenchidas automaticamente */
  filledVariables: string[];
  /** Variáveis que ainda precisam de valor */
  pendingVariables: string[];
  /** Adaptações aplicadas */
  adaptations: PromptAdaptation[];
  /** Indica se o prompt está pronto para uso */
  ready: boolean;
}

/**
 * Sugestão de prompt com score
 */
export interface PromptSuggestion {
  /** Prompt sugerido */
  prompt: Prompt;
  /** Score de relevância (0-100) */
  score: number;
  /** Razão da sugestão */
  reason: string;
  /** Campos que seriam preenchidos automaticamente */
  autoFillFields: string[];
  /** Campos que precisariam de input manual */
  manualFields: string[];
}

/**
 * Resultado completo da análise contextual
 */
export interface ContextualAnalysis {
  /** Entidades extraídas do input */
  entities: ExtractedEntities;
  /** Intent identificado */
  intent: ContextualIntent;
  /** Prompt adaptado (se disponível) */
  adaptedPrompt: AdaptedPrompt | null;
  /** Sugestões de prompts */
  suggestions: PromptSuggestion[];
  /** Timestamp da análise */
  timestamp: number;
}

/**
 * Regra de mapeamento de variável para entidade
 */
export interface VariableMappingRule {
  /** Campo da entidade fonte */
  source: keyof ExtractedEntities;
  /** Função de transformação */
  transform: (value: string, entities: ExtractedEntities) => string;
  /** Condição para aplicar a regra */
  condition?: (entities: ExtractedEntities) => boolean;
  /** Prioridade da regra (maior = mais prioritária) */
  priority: number;
}

/**
 * Configuração de mapeamento de variáveis
 */
export type VariableMappings = Record<string, VariableMappingRule[]>;

/**
 * Entrada da ontologia médica
 */
export interface OntologyEntry {
  /** Termo canônico */
  canonical: string;
  /** Sinônimos e variações */
  synonyms: string[];
  /** Termos relacionados */
  related: string[];
  /** Categoria pai (se houver) */
  parent?: string;
}

/**
 * Ontologia médica completa
 */
export interface MedicalOntology {
  /** Mapa de especialidades */
  specialties: Map<string, OntologyEntry>;
  /** Mapa de tópicos médicos */
  topics: Map<string, OntologyEntry>;
  /** Mapa de formatos de output */
  formats: Map<string, OntologyEntry>;
  /** Mapa de níveis acadêmicos */
  levels: Map<string, OntologyEntry>;
  /** Mapa de contextos clínicos */
  contexts: Map<string, OntologyEntry>;
}

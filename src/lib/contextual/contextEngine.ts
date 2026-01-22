/**
 * Motor de Contexto para Geração Contextual Inteligente
 * Ranqueia prompts e infere valores baseado nas entidades extraídas
 */

import type { Prompt } from '@/types/prompt';
import type {
  ExtractedEntities,
  ContextualIntent,
  PromptSuggestion,
  VariableMappings,
} from '@/types/contextual';
import { normalizeText } from '@/data/medical-ontology';

/**
 * Mapeamento de variáveis para entidades
 * Define como cada variável de prompt pode ser preenchida automaticamente
 */
const VARIABLE_MAPPINGS: VariableMappings = {
  // Tópico médico
  'TEMA': [
    { source: 'medicalTopic', transform: (v) => v, priority: 10 },
    { source: 'specialty', transform: (v) => `${v} (geral)`, priority: 5 },
  ],
  'CONCEITO ABSTRATO': [
    { source: 'medicalTopic', transform: (v) => v, priority: 10 },
  ],
  'NOVO TEMA': [
    { source: 'medicalTopic', transform: (v) => v, priority: 10 },
  ],
  'SINDROME/DOENCA': [
    { source: 'medicalTopic', transform: (v) => v, priority: 10 },
  ],
  'SINDROME': [
    { source: 'medicalTopic', transform: (v) => v, priority: 10 },
  ],
  'DOENCA': [
    { source: 'medicalTopic', transform: (v) => v, priority: 10 },
  ],
  'TEMA/DISCIPLINA': [
    { source: 'medicalTopic', transform: (v) => v, priority: 10 },
    { source: 'specialty', transform: (v) => v, priority: 5 },
  ],
  'CONTEUDO A MEMORIZAR': [
    { source: 'medicalTopic', transform: (v) => v, priority: 10 },
  ],
  'LISTA OU CONCEITO': [
    { source: 'medicalTopic', transform: (v) => v, priority: 10 },
  ],

  // Especialidade
  'ESPECIALIDADE': [
    { source: 'specialty', transform: (v) => v, priority: 10 },
    { source: 'medicalTopic', transform: (v, e) => inferSpecialtyFromTopic(v, e), priority: 5 },
  ],

  // Nível
  'NIVEL': [
    { source: 'academicLevel', transform: normalizeLevel, priority: 10 },
    { source: 'examType', transform: inferLevelFromExam, priority: 5 },
  ],

  // Contexto
  'CONTEXTO CLINICO': [
    { source: 'clinicalContext', transform: (v) => v, priority: 10 },
  ],
  'CONTEXTO': [
    { source: 'clinicalContext', transform: (v) => v, priority: 10 },
    { source: 'additionalContext', transform: (v) => Array.isArray(v) ? v.join(', ') : v, priority: 5 },
  ],

  // Tempo
  'DATA DA PROVA': [
    { source: 'timeframe', transform: (v) => v, priority: 10 },
  ],
  'TEMPO DISPONIVEL POR DIA': [
    { source: 'timeframe', transform: extractDailyTime, priority: 5 },
  ],
  'DISPONIBILIDADE': [
    { source: 'timeframe', transform: (v) => v, priority: 10 },
  ],
};

/**
 * Normaliza nível acadêmico para formato esperado
 */
function normalizeLevel(level: string): string {
  const mapping: Record<string, string> = {
    'basico': 'Iniciante',
    'intermediario': 'Intermediário',
    'avancado': 'Avançado',
    'residencia': 'Avançado (Residência)',
  };
  return mapping[level] || level;
}

/**
 * Infere nível a partir do tipo de exame
 */
function inferLevelFromExam(examType: string): string {
  const mapping: Record<string, string> = {
    'prova-faculdade': 'Intermediário',
    'residencia': 'Avançado',
    'titulo-especialista': 'Avançado',
    'revalida': 'Avançado',
    'concurso': 'Avançado',
  };
  return mapping[examType] || 'Intermediário';
}

/**
 * Infere especialidade a partir do tópico
 */
function inferSpecialtyFromTopic(topic: string, _entities: ExtractedEntities): string {
  // Mapeamento de tópicos para especialidades
  const topicToSpecialty: Record<string, string> = {
    'insuficiencia cardiaca': 'Cardiologia',
    'arritmia': 'Cardiologia',
    'infarto': 'Cardiologia',
    'hipertensao': 'Cardiologia',
    'avc': 'Neurologia',
    'cefaleia': 'Neurologia',
    'diabetes': 'Endocrinologia',
    'tireoide': 'Endocrinologia',
    'asma': 'Pneumologia',
    'dpoc': 'Pneumologia',
    'pneumonia': 'Pneumologia',
  };

  const normalized = normalizeText(topic);
  for (const [key, specialty] of Object.entries(topicToSpecialty)) {
    if (normalized.includes(normalizeText(key))) {
      return specialty;
    }
  }

  return 'Clínica Médica';
}

/**
 * Extrai tempo diário disponível
 */
function extractDailyTime(timeframe: string): string {
  // Se menciona horas por dia, retorna direto
  if (timeframe.includes('hora')) {
    const match = timeframe.match(/(\d+)\s*horas?/);
    if (match) {
      return `${match[1]} horas`;
    }
  }
  return '2-3 horas'; // Default
}

/**
 * Motor de contexto que analisa entidades e seleciona/adapta prompts
 */
export class ContextEngine {
  private prompts: Prompt[];

  constructor(prompts: Prompt[]) {
    this.prompts = prompts;
  }

  /**
   * Analisa entidades e retorna intent contextual
   */
  analyze(entities: ExtractedEntities): ContextualIntent {
    // 1. Ranquear prompts por relevância
    const suggestions = this.rankPrompts(entities);
    const primaryPrompt = suggestions.length > 0 ? suggestions[0].prompt : null;

    // 2. Inferir valores para variáveis
    const inferredValues = primaryPrompt
      ? this.inferValues(entities, primaryPrompt)
      : {};

    // 3. Identificar campos faltantes
    const { critical, optional } = this.identifyMissing(
      entities,
      primaryPrompt,
      inferredValues
    );

    // 4. Gerar notas de adaptação
    const adaptationNotes = this.generateAdaptationNotes(entities, primaryPrompt);

    // 5. Calcular score de match
    const matchScore = suggestions.length > 0 ? suggestions[0].score : 0;

    return {
      primaryPrompt,
      alternativePrompts: suggestions.slice(1, 4).map(s => s.prompt),
      inferredValues,
      missingCritical: critical,
      missingOptional: optional,
      matchScore,
      adaptationNotes,
    };
  }

  /**
   * Ranqueia prompts por relevância às entidades
   */
  private rankPrompts(entities: ExtractedEntities): PromptSuggestion[] {
    return this.prompts
      .map(prompt => this.scorePrompt(prompt, entities))
      .filter(suggestion => suggestion.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Calcula score de um prompt para as entidades dadas
   */
  private scorePrompt(prompt: Prompt, entities: ExtractedEntities): PromptSuggestion {
    let score = 0;
    const reasons: string[] = [];
    const autoFillFields: string[] = [];
    const manualFields: string[] = [];

    const promptText = normalizeText(`${prompt.title} ${prompt.description} ${prompt.content}`);

    // 1. Match por formato de output (peso: 40)
    if (entities.outputFormat) {
      const formatScore = this.calculateFormatMatch(prompt, entities.outputFormat);
      score += formatScore * 40;
      if (formatScore > 0.5) {
        reasons.push(`Formato "${entities.outputFormat}" compatível`);
      }
    }

    // 2. Match por especialidade (peso: 20)
    if (entities.specialty) {
      const specialtyScore = this.calculateSpecialtyMatch(prompt, entities.specialty);
      score += specialtyScore * 20;
      if (specialtyScore > 0.5) {
        reasons.push(`Especialidade "${entities.specialty}" relevante`);
      }
    }

    // 3. Match por tópico médico (peso: 25)
    if (entities.medicalTopic) {
      const topicScore = this.calculateTopicMatch(prompt, entities.medicalTopic);
      score += topicScore * 25;
      if (topicScore > 0.3) {
        reasons.push(`Tópico "${entities.medicalTopic}" aplicável`);
      }
    }

    // 4. Match por nível acadêmico (peso: 10)
    if (entities.academicLevel) {
      const levelScore = this.calculateLevelMatch(prompt, entities.academicLevel);
      score += levelScore * 10;
    }

    // 5. Match por contexto clínico (peso: 5)
    if (entities.clinicalContext) {
      if (promptText.includes(normalizeText(entities.clinicalContext))) {
        score += 5;
      }
    }

    // Identificar campos auto-preenchíveis e manuais
    const variables = this.extractVariables(prompt.content);
    for (const varName of variables) {
      const canAutoFill = this.canAutoFillVariable(varName, entities);
      if (canAutoFill) {
        autoFillFields.push(varName);
      } else {
        manualFields.push(varName);
      }
    }

    // Bônus se muitos campos podem ser auto-preenchidos
    if (variables.length > 0) {
      const autoFillRatio = autoFillFields.length / variables.length;
      score += autoFillRatio * 10;
    }

    return {
      prompt,
      score: Math.round(score),
      reason: reasons.join('; ') || 'Prompt genérico aplicável',
      autoFillFields,
      manualFields,
    };
  }

  /**
   * Calcula match de formato
   */
  private calculateFormatMatch(prompt: Prompt, format: string): number {
    const promptText = normalizeText(`${prompt.title} ${prompt.description}`);
    const formatNorm = normalizeText(format);

    // Mapeamento de formatos para palavras-chave do prompt
    const formatKeywords: Record<string, string[]> = {
      'flashcards': ['flashcard', 'anki', 'card', 'revisao espacada'],
      'resumo': ['resumo', 'resumir', 'sintese', 'sumario'],
      'questoes': ['questao', 'questoes', 'simulado', 'prova', 'banco', 'exercicio'],
      'caso-clinico': ['caso clinico', 'simulador', 'vinheta', 'cenario'],
      'mapa-mental': ['mapa mental', 'diagrama', 'esquema'],
      'mnemonico': ['mnemonico', 'memoria', 'memorizar', 'decorar'],
      'revisao': ['revisao', 'revisar', 'protocolo revisao'],
      'explicacao': ['explicacao', 'entender', 'guia', 'autoexplicacao'],
      'checklist': ['checklist', 'lista', 'verificacao'],
      'analise': ['analise', 'analisar', 'interpretar', 'ebm', 'artigo'],
    };

    const keywords = formatKeywords[formatNorm] || [formatNorm];
    for (const keyword of keywords) {
      if (promptText.includes(normalizeText(keyword))) {
        return 1.0;
      }
    }

    return 0;
  }

  /**
   * Calcula match de especialidade
   */
  private calculateSpecialtyMatch(prompt: Prompt, specialty: string): number {
    const promptText = normalizeText(`${prompt.title} ${prompt.description} ${prompt.content}`);
    const specialtyNorm = normalizeText(specialty);

    // Match direto
    if (promptText.includes(specialtyNorm)) {
      return 1.0;
    }

    // Prompts genéricos que funcionam para qualquer especialidade
    const genericPrompts = ['flashcard', 'resumo', 'questao', 'mnemonico', 'revisao'];
    for (const generic of genericPrompts) {
      if (promptText.includes(generic)) {
        return 0.7; // Score parcial para prompts genéricos
      }
    }

    return 0;
  }

  /**
   * Calcula match de tópico
   */
  private calculateTopicMatch(prompt: Prompt, topic: string): number {
    const promptText = normalizeText(`${prompt.title} ${prompt.description}`);
    const topicNorm = normalizeText(topic);

    // Match direto
    if (promptText.includes(topicNorm)) {
      return 1.0;
    }

    // Prompts com variáveis de tópico
    if (prompt.content.includes('[TEMA]') ||
        prompt.content.includes('[CONCEITO') ||
        prompt.content.includes('[SINDROME') ||
        prompt.content.includes('[DOENCA')) {
      return 0.8;
    }

    return 0.3; // Score base para prompts genéricos
  }

  /**
   * Calcula match de nível
   */
  private calculateLevelMatch(prompt: Prompt, level: string): number {
    const promptStudyLevel = prompt.studyLevel || prompt.academicLevel;
    if (!promptStudyLevel) return 0.5;

    const levelMapping: Record<string, string[]> = {
      'basico': ['1º-2º ano', 'Todos os níveis'],
      'intermediario': ['3º-4º ano', 'Todos os níveis'],
      'avancado': ['5º-6º ano', 'Residência', 'Todos os níveis'],
      'residencia': ['Residência', '5º-6º ano', 'Todos os níveis'],
    };

    const acceptableLevels = levelMapping[level] || [];
    const promptLevels = Array.isArray(promptStudyLevel) ? promptStudyLevel : [promptStudyLevel];

    for (const pLevel of promptLevels) {
      if (acceptableLevels.includes(pLevel)) {
        return 1.0;
      }
    }

    return 0.3;
  }

  /**
   * Extrai nomes de variáveis do conteúdo do prompt
   */
  private extractVariables(content: string): string[] {
    const regex = /\[([A-Za-zÀ-ÖØ-öø-ÿ0-9_\-\s]+)\]/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }

  /**
   * Verifica se uma variável pode ser preenchida automaticamente
   */
  private canAutoFillVariable(varName: string, entities: ExtractedEntities): boolean {
    const normalizedVar = varName.toUpperCase().replace(/\s+/g, ' ');
    const mappings = VARIABLE_MAPPINGS[normalizedVar];

    if (!mappings) return false;

    for (const mapping of mappings) {
      const value = entities[mapping.source];
      if (value !== undefined && value !== null) {
        if (Array.isArray(value) ? value.length > 0 : true) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Infere valores para variáveis do prompt
   */
  inferValues(entities: ExtractedEntities, prompt: Prompt): Record<string, string> {
    const variables = this.extractVariables(prompt.content);
    const inferred: Record<string, string> = {};

    for (const varName of variables) {
      const value = this.inferValueForVariable(varName, entities);
      if (value) {
        inferred[varName] = value;
      }
    }

    return inferred;
  }

  /**
   * Infere valor para uma variável específica
   */
  private inferValueForVariable(varName: string, entities: ExtractedEntities): string | undefined {
    const normalizedVar = varName.toUpperCase().replace(/\s+/g, ' ');
    const mappings = VARIABLE_MAPPINGS[normalizedVar];

    if (!mappings) {
      // Tentar inferir por nome similar
      return this.inferByNameSimilarity(varName, entities);
    }

    // Ordenar por prioridade e tentar cada mapping
    const sortedMappings = [...mappings].sort((a, b) => b.priority - a.priority);

    for (const mapping of sortedMappings) {
      const sourceValue = entities[mapping.source];

      if (sourceValue !== undefined && sourceValue !== null) {
        // Verificar condição se existir
        if (mapping.condition && !mapping.condition(entities)) {
          continue;
        }

        // Aplicar transformação
        const transformed = mapping.transform(
          Array.isArray(sourceValue) ? sourceValue.join(', ') : String(sourceValue),
          entities
        );

        if (transformed) {
          return transformed;
        }
      }
    }

    return undefined;
  }

  /**
   * Tenta inferir valor por similaridade de nome
   */
  private inferByNameSimilarity(varName: string, entities: ExtractedEntities): string | undefined {
    const normalized = normalizeText(varName);

    // Heurísticas baseadas em palavras-chave
    if (normalized.includes('tema') || normalized.includes('assunto') || normalized.includes('topico')) {
      return entities.medicalTopic;
    }

    if (normalized.includes('especialidade') || normalized.includes('area')) {
      return entities.specialty;
    }

    if (normalized.includes('nivel') || normalized.includes('dificuldade')) {
      return entities.academicLevel ? normalizeLevel(entities.academicLevel) : undefined;
    }

    if (normalized.includes('contexto')) {
      return entities.clinicalContext || entities.additionalContext?.join(', ');
    }

    if (normalized.includes('tempo') || normalized.includes('prazo') || normalized.includes('data')) {
      return entities.timeframe;
    }

    return undefined;
  }

  /**
   * Identifica campos faltantes
   */
  private identifyMissing(
    _entities: ExtractedEntities,
    prompt: Prompt | null,
    inferredValues: Record<string, string>
  ): { critical: string[]; optional: string[] } {
    if (!prompt) {
      return { critical: [], optional: [] };
    }

    const variables = this.extractVariables(prompt.content);
    const critical: string[] = [];
    const optional: string[] = [];

    // Variáveis consideradas críticas (prompt não funciona bem sem elas)
    const criticalVars = ['TEMA', 'ESPECIALIDADE', 'TEXTO', 'ARTIGO', 'QUESTAO'];

    for (const varName of variables) {
      if (!inferredValues[varName]) {
        const isCritical = criticalVars.some(cv =>
          varName.toUpperCase().includes(cv)
        );

        if (isCritical) {
          critical.push(varName);
        } else {
          optional.push(varName);
        }
      }
    }

    return { critical, optional };
  }

  /**
   * Gera notas de adaptação
   */
  private generateAdaptationNotes(
    entities: ExtractedEntities,
    prompt: Prompt | null
  ): string[] {
    const notes: string[] = [];

    if (!prompt) {
      notes.push('Nenhum prompt específico encontrado. Tente ser mais específico sobre o formato desejado.');
      return notes;
    }

    if (entities.medicalTopic) {
      notes.push(`Tópico "${entities.medicalTopic}" será usado como tema principal.`);
    }

    if (entities.academicLevel) {
      notes.push(`Nível adaptado para ${normalizeLevel(entities.academicLevel)}.`);
    }

    if (entities.additionalContext && entities.additionalContext.length > 0) {
      notes.push(`Contexto adicional: ${entities.additionalContext.join(', ')}.`);
    }

    if (entities.timeframe) {
      notes.push(`Prazo considerado: ${entities.timeframe}.`);
    }

    return notes;
  }
}

/**
 * Cria instância do motor de contexto
 */
export function createContextEngine(prompts: Prompt[]): ContextEngine {
  return new ContextEngine(prompts);
}

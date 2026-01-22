/**
 * Parser Semântico para Geração Contextual Inteligente
 * Extrai entidades médicas do input em texto livre do usuário
 */

import type { ExtractedEntities, MedicalSpecialty, AcademicLevel, OutputFormat, ClinicalContext, ExamType } from '@/types/contextual';
import {
  findInOntology,
  findMultipleInOntology,
  normalizeText,
  SPECIALTIES,
  TOPICS,
  FORMATS,
  LEVELS,
  CONTEXTS,
  EXAM_TYPES,
} from '@/data/medical-ontology';

/**
 * Parser semântico que extrai entidades do texto do usuário
 */
export class SemanticParser {
  /**
   * Analisa o input do usuário e extrai entidades
   */
  parse(input: string): ExtractedEntities {
    const normalized = normalizeText(input);
    const original = input.trim();

    // Extrair cada tipo de entidade
    const specialty = this.extractSpecialty(normalized);
    const outputFormat = this.extractFormat(normalized);
    const academicLevel = this.extractLevel(normalized);
    const clinicalContext = this.extractContext(normalized);
    const examType = this.extractExamType(normalized);
    const medicalTopic = this.extractTopic(normalized, specialty);
    const timeframe = this.extractTimeframe(original);
    const additionalContext = this.extractAdditionalContext(normalized, {
      specialty,
      outputFormat,
      academicLevel,
      medicalTopic,
    });

    // Calcular confiança baseada em quantas entidades foram encontradas
    const confidence = this.calculateConfidence({
      medicalTopic,
      specialty,
      academicLevel,
      outputFormat,
      clinicalContext,
      examType,
      timeframe,
    });

    return {
      medicalTopic,
      specialty,
      academicLevel,
      outputFormat,
      clinicalContext,
      examType,
      timeframe,
      additionalContext,
      rawInput: original,
      confidence,
    };
  }

  /**
   * Extrai especialidade médica do texto
   */
  private extractSpecialty(text: string): MedicalSpecialty | undefined {
    const found = findInOntology(SPECIALTIES, text);
    if (found) {
      return found.key as MedicalSpecialty;
    }

    // Busca múltipla para casos com várias menções
    const multiple = findMultipleInOntology(SPECIALTIES, text);
    if (multiple.length > 0) {
      return multiple[0].key as MedicalSpecialty;
    }

    return undefined;
  }

  /**
   * Extrai formato de output desejado
   */
  private extractFormat(text: string): OutputFormat | undefined {
    const found = findInOntology(FORMATS, text);
    if (found) {
      return found.key as OutputFormat;
    }

    const multiple = findMultipleInOntology(FORMATS, text);
    if (multiple.length > 0) {
      return multiple[0].key as OutputFormat;
    }

    return undefined;
  }

  /**
   * Extrai nível acadêmico
   */
  private extractLevel(text: string): AcademicLevel | undefined {
    const found = findInOntology(LEVELS, text);
    if (found) {
      return found.key as AcademicLevel;
    }

    const multiple = findMultipleInOntology(LEVELS, text);
    if (multiple.length > 0) {
      return multiple[0].key as AcademicLevel;
    }

    return undefined;
  }

  /**
   * Extrai contexto clínico
   */
  private extractContext(text: string): ClinicalContext | undefined {
    const found = findInOntology(CONTEXTS, text);
    if (found) {
      return found.key as ClinicalContext;
    }

    const multiple = findMultipleInOntology(CONTEXTS, text);
    if (multiple.length > 0) {
      return multiple[0].key as ClinicalContext;
    }

    return undefined;
  }

  /**
   * Extrai tipo de exame
   */
  private extractExamType(text: string): ExamType | undefined {
    const found = findInOntology(EXAM_TYPES, text);
    if (found) {
      return found.key as ExamType;
    }

    const multiple = findMultipleInOntology(EXAM_TYPES, text);
    if (multiple.length > 0) {
      return multiple[0].key as ExamType;
    }

    return undefined;
  }

  /**
   * Extrai tópico médico principal
   */
  private extractTopic(text: string, specialty?: string): string | undefined {
    // Primeiro, tenta encontrar um tópico conhecido
    const found = findInOntology(TOPICS, text);
    if (found) {
      return found.entry.canonical;
    }

    const multiple = findMultipleInOntology(TOPICS, text);
    if (multiple.length > 0) {
      return multiple[0].entry.canonical;
    }

    // Se tem especialidade, procura termos relacionados
    if (specialty) {
      const specialtyEntry = SPECIALTIES.get(specialty);
      if (specialtyEntry) {
        for (const related of specialtyEntry.related) {
          if (normalizeText(text).includes(normalizeText(related))) {
            return related;
          }
        }
      }
    }

    // Extração heurística: procura padrões comuns
    const topicPatterns = [
      /(?:sobre|estudar|revisar|aprender)\s+(.+?)(?:\s+para|\s+usando|\s+com|$)/i,
      /(?:tema|topico|assunto)[:\s]+(.+?)(?:\s+para|\s+usando|\s+com|$)/i,
      /(?:flashcards?|resumo|questoes?|caso)\s+(?:de|sobre)\s+(.+?)(?:\s+para|$)/i,
    ];

    for (const pattern of topicPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const candidate = match[1].trim();
        // Filtra termos muito genéricos ou muito longos
        if (candidate.length > 3 && candidate.length < 100) {
          return candidate;
        }
      }
    }

    return undefined;
  }

  /**
   * Extrai timeframe (prazo) do texto
   */
  private extractTimeframe(text: string): string | undefined {
    const patterns = [
      /(\d+)\s*(dias?|semanas?|meses?|horas?)/i,
      /(?:em|para|ate|até)\s+(\d+)\s*(dias?|semanas?|meses?)/i,
      /(?:prazo|tempo)[:\s]+(\d+)\s*(dias?|semanas?|meses?)/i,
      /(?:tenho|disponiveis?|disponíveis?)\s+(\d+)\s*(dias?|semanas?|meses?|horas?)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return `${match[1]} ${match[2]}`;
      }
    }

    // Padrões de data específica
    const datePatterns = [
      /(?:para|ate|até)\s+(?:dia\s+)?(\d{1,2})[\/\-](\d{1,2})/i,
      /(?:prova|exame)\s+(?:dia\s+)?(\d{1,2})[\/\-](\d{1,2})/i,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        return `até ${match[1]}/${match[2]}`;
      }
    }

    return undefined;
  }

  /**
   * Extrai contexto adicional não coberto pelas entidades principais
   */
  private extractAdditionalContext(
    text: string,
    _extracted: Partial<ExtractedEntities>
  ): string[] {
    const additional: string[] = [];

    // Palavras-chave de foco específico
    const focusPatterns = [
      { pattern: /foco\s+(?:em|no|na)\s+(.+?)(?:\.|,|$)/i, label: 'Foco' },
      { pattern: /(?:com\s+)?enfase\s+(?:em|no|na)\s+(.+?)(?:\.|,|$)/i, label: 'Ênfase' },
      { pattern: /(?:principalmente|especialmente)\s+(.+?)(?:\.|,|$)/i, label: 'Principal' },
    ];

    for (const { pattern, label } of focusPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        additional.push(`${label}: ${match[1].trim()}`);
      }
    }

    // Detecta se menciona diagnóstico, tratamento, fisiopatologia
    const aspects = [
      { keywords: ['diagnostico', 'diagnóstico', 'diagnose'], label: 'Diagnóstico' },
      { keywords: ['tratamento', 'terapia', 'manejo', 'conduta'], label: 'Tratamento' },
      { keywords: ['fisiopatologia', 'mecanismo', 'patogenese'], label: 'Fisiopatologia' },
      { keywords: ['epidemiologia', 'prevalencia', 'incidencia'], label: 'Epidemiologia' },
      { keywords: ['prevencao', 'prevenção', 'profilaxia'], label: 'Prevenção' },
      { keywords: ['prognostico', 'prognóstico'], label: 'Prognóstico' },
    ];

    for (const { keywords, label } of aspects) {
      if (keywords.some(kw => text.includes(kw))) {
        additional.push(label);
      }
    }

    return additional;
  }

  /**
   * Calcula score de confiança baseado nas entidades encontradas
   */
  private calculateConfidence(entities: Partial<ExtractedEntities>): number {
    let score = 0;
    let total = 0;

    // Pesos para cada tipo de entidade
    const weights = {
      medicalTopic: 0.35,
      outputFormat: 0.25,
      specialty: 0.15,
      academicLevel: 0.10,
      clinicalContext: 0.05,
      examType: 0.05,
      timeframe: 0.05,
    };

    for (const [key, weight] of Object.entries(weights)) {
      total += weight;
      if (entities[key as keyof typeof entities]) {
        score += weight;
      }
    }

    // Normalizar para 0-1
    return Math.min(1, score / total);
  }
}

/**
 * Instância singleton do parser
 */
let parserInstance: SemanticParser | null = null;

/**
 * Obtém instância do parser (singleton)
 */
export function getSemanticParser(): SemanticParser {
  if (!parserInstance) {
    parserInstance = new SemanticParser();
  }
  return parserInstance;
}

/**
 * Função utilitária para parse direto
 */
export function parseUserInput(input: string): ExtractedEntities {
  return getSemanticParser().parse(input);
}

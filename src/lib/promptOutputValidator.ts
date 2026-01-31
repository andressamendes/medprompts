/**
 * Validador de Output de Prompts Customizados
 *
 * Garante que:
 * 1. Campos de entrada não são hard-coded no output final
 * 2. Placeholders editáveis estão presentes
 * 3. Templates originais são preservados
 */

import type { CustomizationPreferences } from '@/types/customization';

export interface PlaceholderInfo {
  placeholder: string;
  type: 'bracket' | 'mustache';
  position: number;
  isEssential: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  hasEditablePlaceholders: boolean;
  placeholders: PlaceholderInfo[];
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100 score de qualidade
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  suggestion?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  field?: string;
}

// Placeholders essenciais que DEVEM estar presentes
const ESSENTIAL_PLACEHOLDERS = [
  '[INSIRA SEU CASO AQUI]',
  '{{contexto_paciente}}',
  '[TEMA]',
  '[CASO CLÍNICO]',
  '[PACIENTE]',
];

// Campos que nunca devem ser hard-coded
const PROTECTED_FIELDS = [
  'objetivoEspecifico',
  'casoClinico',
  'paciente',
  'sintomas',
  'diagnostico',
];

// Regex para detectar placeholders
const BRACKET_PLACEHOLDER_REGEX = /\[([A-ZÀ-Ú][A-ZÀ-Ú\s\-_]*)\]/g;
const MUSTACHE_PLACEHOLDER_REGEX = /\{\{([a-z_][a-z0-9_]*)\}\}/g;

/**
 * Extrai todos os placeholders de um conteúdo
 */
export function extractPlaceholders(content: string): PlaceholderInfo[] {
  const placeholders: PlaceholderInfo[] = [];

  // Extrai [PLACEHOLDERS]
  let match: RegExpExecArray | null;
  while ((match = BRACKET_PLACEHOLDER_REGEX.exec(content)) !== null) {
    const currentMatch = match;
    placeholders.push({
      placeholder: currentMatch[0],
      type: 'bracket',
      position: currentMatch.index,
      isEssential: ESSENTIAL_PLACEHOLDERS.some(
        (e) => e.toLowerCase() === currentMatch[0].toLowerCase()
      ),
    });
  }

  // Reset regex lastIndex
  BRACKET_PLACEHOLDER_REGEX.lastIndex = 0;

  // Extrai {{placeholders}}
  while ((match = MUSTACHE_PLACEHOLDER_REGEX.exec(content)) !== null) {
    const currentMatch = match;
    placeholders.push({
      placeholder: currentMatch[0],
      type: 'mustache',
      position: currentMatch.index,
      isEssential: ESSENTIAL_PLACEHOLDERS.some(
        (e) => e.toLowerCase() === currentMatch[0].toLowerCase()
      ),
    });
  }

  // Reset regex lastIndex
  MUSTACHE_PLACEHOLDER_REGEX.lastIndex = 0;

  return placeholders;
}

/**
 * Verifica se um valor específico foi hard-coded no output
 */
export function detectHardcodedValues(
  content: string,
  preferences: Partial<CustomizationPreferences>,
  originalTemplate: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Verifica campos protegidos
  for (const field of PROTECTED_FIELDS) {
    const prefKey = field as keyof CustomizationPreferences;
    const value = preferences[prefKey];

    if (value && typeof value === 'string' && value.trim().length > 10) {
      // Verifica se o valor está no conteúdo mas não estava no template original
      const valueInContent = content.includes(value);
      const valueInOriginal = originalTemplate.includes(value);

      if (valueInContent && !valueInOriginal) {
        // Verifica se há um placeholder correspondente
        const hasPlaceholder =
          content.includes(`[${field.toUpperCase()}]`) ||
          content.includes(`{{${field}}}`) ||
          content.includes('[INSIRA') ||
          content.includes('{{contexto');

        if (!hasPlaceholder) {
          errors.push({
            code: 'HARDCODED_VALUE',
            message: `O campo "${field}" parece estar hard-coded no output sem placeholder alternativo.`,
            field,
            suggestion: `Mantenha um placeholder como [${field.toUpperCase()}] ou {{${field}}} para flexibilidade.`,
          });
        }
      }
    }
  }

  return errors;
}

/**
 * Valida que o output contém placeholders editáveis necessários
 */
export function validateRequiredPlaceholders(
  content: string
): { isValid: boolean; missing: string[] } {
  const requiredPatterns = [
    { pattern: /\[INSIRA[^\]]*\]/i, name: '[INSIRA SEU CASO AQUI]' },
    { pattern: /\{\{contexto[_a-z]*\}\}/i, name: '{{contexto_paciente}}' },
  ];

  // Pelo menos um dos padrões essenciais deve estar presente
  const found = requiredPatterns.filter((p) => p.pattern.test(content));
  const missing = requiredPatterns
    .filter((p) => !p.pattern.test(content))
    .map((p) => p.name);

  // Também aceita outros placeholders comuns
  const hasOtherPlaceholders =
    /\[[A-ZÀ-Ú]{2,}\]/.test(content) || /\{\{[a-z_]+\}\}/.test(content);

  return {
    isValid: found.length > 0 || hasOtherPlaceholders,
    missing: found.length === 0 ? missing : [],
  };
}

/**
 * Calcula score de qualidade do output (0-100)
 */
export function calculateQualityScore(
  content: string,
  placeholders: PlaceholderInfo[],
  errors: ValidationError[],
  warnings: ValidationWarning[]
): number {
  let score = 100;

  // Penalidades por erros
  score -= errors.length * 20;

  // Penalidades por warnings
  score -= warnings.length * 5;

  // Bônus por placeholders essenciais
  const essentialCount = placeholders.filter((p) => p.isEssential).length;
  score += Math.min(essentialCount * 5, 15);

  // Penalidade se não há placeholders
  if (placeholders.length === 0) {
    score -= 30;
  }

  // Bônus por boa estrutura (seções organizadas)
  const hasStructure =
    content.includes('**') ||
    content.includes('##') ||
    content.includes('OBJETIVO') ||
    content.includes('ENTRADA');
  if (hasStructure) {
    score += 5;
  }

  // Normaliza entre 0 e 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Valida completamente o output de um prompt customizado
 */
export function validatePromptOutput(
  content: string,
  originalTemplate: string,
  preferences?: Partial<CustomizationPreferences>
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 1. Extrai placeholders
  const placeholders = extractPlaceholders(content);

  // 2. Valida placeholders necessários
  const placeholderValidation = validateRequiredPlaceholders(content);
  if (!placeholderValidation.isValid) {
    errors.push({
      code: 'MISSING_PLACEHOLDERS',
      message:
        'O prompt deve conter placeholders editáveis para entrada de dados.',
      suggestion: `Adicione placeholders como: ${placeholderValidation.missing.join(', ')}`,
    });
  }

  // 3. Detecta valores hard-coded
  if (preferences) {
    const hardcodedErrors = detectHardcodedValues(
      content,
      preferences,
      originalTemplate
    );
    errors.push(...hardcodedErrors);
  }

  // 4. Verifica se template original foi preservado
  // (seções principais devem estar presentes)
  const mainSections = ['PAPEL', 'OBJETIVO', 'FORMATO', 'PROCESSO'];
  for (const section of mainSections) {
    if (originalTemplate.includes(section) && !content.includes(section)) {
      warnings.push({
        code: 'SECTION_MISSING',
        message: `A seção "${section}" do template original pode ter sido removida.`,
      });
    }
  }

  // 5. Calcula score
  const score = calculateQualityScore(content, placeholders, errors, warnings);

  // 6. Verifica se há placeholders editáveis
  const hasEditablePlaceholders = placeholders.length > 0;

  return {
    isValid: errors.length === 0 && hasEditablePlaceholders,
    hasEditablePlaceholders,
    placeholders,
    errors,
    warnings,
    score,
  };
}

/**
 * Formata mensagem de validação para exibição
 */
export function formatValidationMessage(result: ValidationResult): string {
  if (result.isValid) {
    return `✓ Prompt válido (Score: ${result.score}/100) com ${result.placeholders.length} placeholder(s) editável(is).`;
  }

  const messages = [
    `✗ Prompt com problemas (Score: ${result.score}/100):`,
    ...result.errors.map((e) => `  • ${e.message}`),
  ];

  if (result.warnings.length > 0) {
    messages.push('Avisos:');
    messages.push(...result.warnings.map((w) => `  ⚠ ${w.message}`));
  }

  return messages.join('\n');
}

/**
 * Verifica rapidamente se um conteúdo tem placeholders
 */
export function hasPlaceholders(content: string): boolean {
  return (
    BRACKET_PLACEHOLDER_REGEX.test(content) ||
    MUSTACHE_PLACEHOLDER_REGEX.test(content)
  );
}

/**
 * Substitui placeholders por valores, mantendo não-preenchidos
 */
export function fillPlaceholders(
  content: string,
  values: Record<string, string>,
  _keepEmpty: boolean = true
): string {
  let result = content;

  for (const [key, value] of Object.entries(values)) {
    if (value.trim()) {
      // Substitui [KEY] e {{key}}
      result = result.replace(new RegExp(`\\[${key}\\]`, 'gi'), value);
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'gi'), value);
    }
  }

  return result;
}

export default {
  extractPlaceholders,
  detectHardcodedValues,
  validateRequiredPlaceholders,
  validatePromptOutput,
  formatValidationMessage,
  hasPlaceholders,
  fillPlaceholders,
  calculateQualityScore,
};

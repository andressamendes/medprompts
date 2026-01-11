/**
 * 🎯 Utilitário de Detecção e Substituição de Variáveis em Prompts
 *
 * Detecta variáveis no formato [VARIAVEL] e permite personalização
 */

export interface PromptVariable {
  name: string; // Nome da variável (ex: "TEMA")
  placeholder: string; // Placeholder original (ex: "[TEMA]")
  description?: string; // Descrição extraída do contexto
  type: 'text' | 'textarea' | 'number' | 'date'; // Tipo de input
  required: boolean; // Se é obrigatória
  example?: string; // Exemplo de preenchimento
  maxLength?: number; // Limite de caracteres
}

/**
 * Extrai todas as variáveis de um prompt
 */
export function extractVariables(promptContent: string): PromptVariable[] {
  const variableRegex = /\[([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ\s]+)\]/g;
  const matches = promptContent.matchAll(variableRegex);
  const variablesMap = new Map<string, PromptVariable>();

  for (const match of matches) {
    const fullMatch = match[0]; // [TEMA]
    const varName = match[1]; // TEMA

    if (!variablesMap.has(varName)) {
      // Extrair descrição do contexto (linha seguinte ao placeholder)
      const description = extractDescription(promptContent, fullMatch);
      const example = extractExample(promptContent, fullMatch);

      variablesMap.set(varName, {
        name: varName,
        placeholder: fullMatch,
        description,
        type: inferType(varName, promptContent),
        required: true, // Por padrão, todas são obrigatórias
        example,
        maxLength: inferMaxLength(varName),
      });
    }
  }

  return Array.from(variablesMap.values());
}

/**
 * Extrai descrição do contexto ao redor da variável
 */
function extractDescription(content: string, placeholder: string): string | undefined {
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(placeholder)) {
      // Procura na mesma linha após ':'
      const afterColon = lines[i].split(':')[1];
      if (afterColon && afterColon.trim().length > 0) {
        return afterColon.trim().replace(placeholder, '').trim();
      }

      // Procura na linha seguinte
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.length > 0 && !nextLine.startsWith('[')) {
          return nextLine;
        }
      }
    }
  }

  return undefined;
}

/**
 * Extrai exemplo de uso da variável
 */
function extractExample(content: string, placeholder: string): string | undefined {
  const lines = content.split('\n');

  for (const line of lines) {
    if (line.includes(placeholder)) {
      // Procura por padrão (ex.: Diabetes Mellitus)
      const exMatch = line.match(/\(ex\.?:?\s*([^)]+)\)/i);
      if (exMatch) {
        return exMatch[1].trim();
      }

      // Procura por padrão "exemplo:"
      const exemploMatch = line.match(/exemplo:?\s*([^,.;\n]+)/i);
      if (exemploMatch) {
        return exemploMatch[1].trim();
      }
    }
  }

  return undefined;
}

/**
 * Infere tipo de input baseado no nome da variável
 */
function inferType(varName: string, _content: string): PromptVariable['type'] {
  const lowerName = varName.toLowerCase();

  // Textarea para conteúdos longos
  if (lowerName.includes('artigo') ||
      lowerName.includes('texto') ||
      lowerName.includes('conteudo') ||
      lowerName.includes('conteúdo') ||
      lowerName.includes('resumo') ||
      lowerName.includes('caso')) {
    return 'textarea';
  }

  // Number para quantidades
  if (lowerName.includes('numero') ||
      lowerName.includes('número') ||
      lowerName.includes('quantidade') ||
      lowerName.includes('idade')) {
    return 'number';
  }

  // Date para datas
  if (lowerName.includes('data') || lowerName.includes('prazo')) {
    return 'date';
  }

  return 'text';
}

/**
 * Infere tamanho máximo baseado no tipo
 */
function inferMaxLength(varName: string): number | undefined {
  const lowerName = varName.toLowerCase();

  if (lowerName.includes('artigo') || lowerName.includes('texto')) {
    return 5000; // Textos longos
  }

  if (lowerName.includes('tema') || lowerName.includes('titulo') || lowerName.includes('título')) {
    return 200;
  }

  return 500; // Padrão
}

/**
 * Substitui variáveis no prompt com valores fornecidos
 */
export function fillPromptVariables(
  promptContent: string,
  values: Record<string, string>
): string {
  let filled = promptContent;

  Object.entries(values).forEach(([varName, value]) => {
    const placeholder = `[${varName}]`;
    // Substituição global (case-sensitive)
    filled = filled.split(placeholder).join(value);
  });

  return filled;
}

/**
 * Valida se todos os campos obrigatórios foram preenchidos
 */
export function validateVariables(
  variables: PromptVariable[],
  values: Record<string, string>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  variables.forEach(variable => {
    const value = values[variable.name];

    // Check required
    if (variable.required && (!value || value.trim().length === 0)) {
      errors.push(`${variable.name} é obrigatório`);
    }

    // Check max length
    if (value && variable.maxLength && value.length > variable.maxLength) {
      errors.push(`${variable.name} excede o limite de ${variable.maxLength} caracteres`);
    }

    // Check number type
    if (value && variable.type === 'number' && isNaN(Number(value))) {
      errors.push(`${variable.name} deve ser um número`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Destaca variáveis no texto HTML
 */
export function highlightVariables(promptContent: string): string {
  return promptContent.replace(
    /\[([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ\s]+)\]/g,
    '<span class="variable-highlight font-semibold text-indigo-600 dark:text-indigo-400">[$1]</span>'
  );
}

/**
 * Conta variáveis preenchidas vs. total
 */
export function countFilledVariables(
  variables: PromptVariable[],
  values: Record<string, string>
): { filled: number; total: number; percentage: number } {
  const total = variables.length;
  const filled = variables.filter(v => {
    const value = values[v.name];
    return value && value.trim().length > 0;
  }).length;

  return {
    filled,
    total,
    percentage: total > 0 ? Math.round((filled / total) * 100) : 0,
  };
}

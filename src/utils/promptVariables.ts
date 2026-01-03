// Sistema de detecção e processamento de variáveis em prompts

export interface PromptVariable {
  name: string;
  type: 'required' | 'optional' | 'select';
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
  pattern: string; // Padrão original encontrado no texto
}

export interface FilledVariable {
  name: string;
  value: string;
}

/**
 * Detecta variáveis em um prompt
 * Padrões suportados:
 * - [VARIAVEL] → obrigatória
 * - {variavel} → opcional
 * - <LISTA|opcao1,opcao2> → seleção
 */
export function detectVariables(promptText: string): PromptVariable[] {
  const variables: PromptVariable[] = [];
  const seen = new Set<string>();

  // Padrão 1: [VARIAVEL] - obrigatória
  const requiredPattern = /\[([A-Z_]+)\]/g;
  let match;
  
  while ((match = requiredPattern.exec(promptText)) !== null) {
    const name = match[1];
    if (!seen.has(name)) {
      variables.push({
        name,
        type: 'required',
        placeholder: `Digite ${name.toLowerCase().replace(/_/g, ' ')}`,
        pattern: match[0],
      });
      seen.add(name);
    }
  }

  // Padrão 2: {variavel} - opcional
  const optionalPattern = /\{([a-z_]+)\}/g;
  while ((match = optionalPattern.exec(promptText)) !== null) {
    const name = match[1].toUpperCase();
    if (!seen.has(name)) {
      variables.push({
        name,
        type: 'optional',
        placeholder: `Digite ${match[1].replace(/_/g, ' ')} (opcional)`,
        defaultValue: '',
        pattern: match[0],
      });
      seen.add(name);
    }
  }

  // Padrão 3: <LISTA|opcao1,opcao2> - seleção
  const selectPattern = /<([A-Z_]+)\|([^>]+)>/g;
  while ((match = selectPattern.exec(promptText)) !== null) {
    const name = match[1];
    const options = match[2].split(',').map(opt => opt.trim());
    if (!seen.has(name)) {
      variables.push({
        name,
        type: 'select',
        options,
        defaultValue: options[0],
        pattern: match[0],
      });
      seen.add(name);
    }
  }

  return variables;
}

/**
 * Substitui variáveis no prompt pelos valores preenchidos
 */
export function fillVariables(
  promptText: string,
  variables: PromptVariable[],
  values: Record<string, string>
): string {
  let result = promptText;

  variables.forEach(variable => {
    const value = values[variable.name] || variable.defaultValue || '';
    result = result.replace(new RegExp(escapeRegExp(variable.pattern), 'g'), value);
  });

  return result;
}

/**
 * Valida se todas as variáveis obrigatórias foram preenchidas
 */
export function validateVariables(
  variables: PromptVariable[],
  values: Record<string, string>
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  variables.forEach(variable => {
    if (variable.type === 'required') {
      const value = values[variable.name];
      if (!value || value.trim() === '') {
        missingFields.push(variable.name);
      }
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Escape regex special characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Gera sugestões baseadas no nome da variável
 */
export function getSuggestions(variableName: string): string[] {
  const suggestions: Record<string, string[]> = {
    TOPICO: [
      'Hipertensão Arterial',
      'Diabetes Mellitus',
      'Insuficiência Cardíaca',
      'Pneumonia',
      'AVC Isquêmico',
    ],
    DISCIPLINA: [
      'Anatomia',
      'Fisiologia',
      'Patologia',
      'Farmacologia',
      'Semiologia',
      'Clínica Médica',
    ],
    SINTOMAS: [
      'dor torácica, dispneia, palpitações',
      'febre, tosse, dispneia',
      'cefaleia, náuseas, fotofobia',
      'dor abdominal, vômitos, diarreia',
    ],
    SISTEMA: [
      'Cardiovascular',
      'Respiratório',
      'Digestório',
      'Nervoso',
      'Renal',
      'Endócrino',
    ],
    ESPECIALIDADE: [
      'Cardiologia',
      'Pneumologia',
      'Neurologia',
      'Gastroenterologia',
      'Nefrologia',
      'Endocrinologia',
    ],
    IDADE: [
      '25 anos',
      '45 anos',
      '65 anos',
      '5 anos',
      '80 anos',
    ],
    GENERO: [
      'masculino',
      'feminino',
    ],
  };

  return suggestions[variableName] || [];
}

/**
 * Formata nome de variável para exibição
 */
export function formatVariableName(name: string): string {
  return name
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Verifica se um prompt tem variáveis
 */
export function hasVariables(promptText: string): boolean {
  return /\[[A-Z_]+\]|\{[a-z_]+\}|<[A-Z_]+\|[^>]+>/.test(promptText);
}

/**
 * Salva valores preenchidos no localStorage para reutilização
 */
export function saveFilledValues(promptId: string, values: Record<string, string>): void {
  try {
    const key = `prompt_values_${promptId}`;
    localStorage.setItem(key, JSON.stringify(values));
  } catch (error) {
    console.error('Erro ao salvar valores preenchidos:', error);
  }
}

/**
 * Recupera valores salvos anteriormente
 */
export function loadFilledValues(promptId: string): Record<string, string> | null {
  try {
    const key = `prompt_values_${promptId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Erro ao carregar valores preenchidos:', error);
    return null;
  }
}

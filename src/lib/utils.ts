import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Prompt } from '@/types/prompt';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extrai nome da IA recomendada do prompt
 */
export function getAIName(prompt: Prompt): string {
  if (typeof prompt.recommendedAI === 'string') {
    return prompt.recommendedAI;
  }
  if (prompt.recommendedAI && typeof prompt.recommendedAI === 'object') {
    return prompt.recommendedAI.primary;
  }
  return 'ChatGPT';
}

/**
 * Extrai variáveis do conteúdo do prompt
 * Cacheia resultado por conteúdo para evitar reprocessamento
 */
const variablesCache = new Map<string, string[]>();

export function extractVariables(content: string): string[] {
  if (variablesCache.has(content)) {
    return variablesCache.get(content)!;
  }

  const regex = /\[([A-Za-zÀ-ÖØ-öø-ÿ0-9_\-\s]+)\]/g;
  const variables: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }

  variablesCache.set(content, variables);
  return variables;
}

/**
 * Formata nome da categoria para exibição
 */
export function formatCategoryName(category: string): string {
  const names: Record<string, string> = {
    estudos: 'Estudos',
    clinica: 'Clínica',
    anamnese: 'Anamnese',
    diagnostico: 'Diagnóstico',
    tratamento: 'Tratamento',
    pediatria: 'Pediatria',
    ginecologia: 'Ginecologia',
    cardiologia: 'Cardiologia',
    neurologia: 'Neurologia',
    ortopedia: 'Ortopedia',
    emergencia: 'Emergência',
    cirurgia: 'Cirurgia',
    'clinica-medica': 'Clínica Médica',
    'estudos-caso': 'Estudos de Caso',
    revisao: 'Revisão',
    outros: 'Outros',
  };
  return names[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * URLs das IAs suportadas
 */
export const AI_URLS: Record<string, string> = {
  ChatGPT: 'https://chat.openai.com',
  Claude: 'https://claude.ai/new',
  Perplexity: 'https://www.perplexity.ai',
  NotebookLM: 'https://notebooklm.google.com',
  Gemini: 'https://gemini.google.com/app',
};

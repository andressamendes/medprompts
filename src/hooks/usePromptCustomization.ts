/**
 * Hook para gerenciamento de customização de prompts
 *
 * Gerencia preferências do usuário via localStorage,
 * aplica customizações aos prompts e valida outputs.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Prompt } from '@/types/prompt';
import {
  CustomizationPreferences,
  ExportedPrompt,
  CustomizationValidation,
  CUSTOMIZATION_STORAGE_KEY,
  DEFAULT_PREFERENCES,
  CUSTOMIZATION_FIELDS,
  DETAIL_LEVEL_LABELS,
  CLINICAL_CONTEXT_LABELS,
  type DetailLevel,
  type ClinicalContext,
} from '@/types/customization';

// Cache de templates originais para não modificar o original
const templateCache = new Map<string, string>();

interface UsePromptCustomizationReturn {
  // Preferências atuais
  preferences: CustomizationPreferences;

  // Setters
  setPreference: <K extends keyof CustomizationPreferences>(
    key: K,
    value: CustomizationPreferences[K]
  ) => void;
  setPreferences: (prefs: Partial<CustomizationPreferences>) => void;
  resetPreferences: () => void;

  // Aplicação de customização
  applyCustomization: (prompt: Prompt) => ExportedPrompt;

  // Validação
  validateOutput: (content: string) => CustomizationValidation;

  // Utilitários
  getOriginalTemplate: (promptId: string) => string | null;
  hasCustomizations: boolean;

  // Estado
  isLoading: boolean;
}

export function usePromptCustomization(): UsePromptCustomizationReturn {
  const [preferences, setPreferencesState] = useState<CustomizationPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega preferências do localStorage na inicialização
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CUSTOMIZATION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CustomizationPreferences;
        setPreferencesState({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (error) {
      console.warn('Erro ao carregar preferências de customização:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salva preferências no localStorage sempre que mudam
  const savePreferences = useCallback((prefs: CustomizationPreferences) => {
    try {
      const toSave = { ...prefs, updatedAt: new Date().toISOString() };
      localStorage.setItem(CUSTOMIZATION_STORAGE_KEY, JSON.stringify(toSave));
      setPreferencesState(toSave);
    } catch (error) {
      console.warn('Erro ao salvar preferências:', error);
    }
  }, []);

  // Atualiza uma preferência específica
  const setPreference = useCallback(
    <K extends keyof CustomizationPreferences>(
      key: K,
      value: CustomizationPreferences[K]
    ) => {
      setPreferencesState((prev) => {
        const updated = { ...prev, [key]: value };
        savePreferences(updated);
        return updated;
      });
    },
    [savePreferences]
  );

  // Atualiza múltiplas preferências
  const setPreferences = useCallback(
    (prefs: Partial<CustomizationPreferences>) => {
      setPreferencesState((prev) => {
        const updated = { ...prev, ...prefs };
        savePreferences(updated);
        return updated;
      });
    },
    [savePreferences]
  );

  // Reseta para preferências padrão
  const resetPreferences = useCallback(() => {
    savePreferences(DEFAULT_PREFERENCES);
  }, [savePreferences]);

  // Obtém o template original de um prompt
  const getOriginalTemplate = useCallback((promptId: string): string | null => {
    return templateCache.get(promptId) || null;
  }, []);

  // Gera a seção de customização para inserir no prompt
  const generateCustomizationSection = useCallback(
    (prefs: CustomizationPreferences): string => {
      const sections: string[] = [];

      // Adiciona contexto de especialidade
      if (prefs.especialidade) {
        sections.push(
          `**Especialidade:** ${prefs.especialidade.charAt(0).toUpperCase() + prefs.especialidade.slice(1)}`
        );
      } else {
        sections.push(`**Especialidade:** {{ESPECIALIDADE}}`);
      }

      // Adiciona contexto clínico
      if (prefs.contextoClinico && prefs.contextoClinico !== 'outro') {
        sections.push(
          `**Contexto:** ${CLINICAL_CONTEXT_LABELS[prefs.contextoClinico as ClinicalContext] || prefs.contextoClinico}`
        );
      } else {
        sections.push(`**Contexto:** {{CONTEXTO_CLINICO}}`);
      }

      // Adiciona nível de detalhe
      if (prefs.nivelDetalhe) {
        sections.push(
          `**Nível de Detalhe:** ${DETAIL_LEVEL_LABELS[prefs.nivelDetalhe as DetailLevel] || prefs.nivelDetalhe}`
        );
      } else {
        sections.push(`**Nível de Detalhe:** {{NIVEL_DETALHE}}`);
      }

      // Adiciona público-alvo se definido, senão placeholder
      if (prefs.publicoAlvo?.trim()) {
        sections.push(`**Público-Alvo:** ${prefs.publicoAlvo}`);
      } else {
        sections.push(`**Público-Alvo:** [PÚBLICO-ALVO]`);
      }

      return sections.join('\n');
    },
    []
  );

  // Aplica customização ao prompt, mantendo placeholders editáveis
  const applyCustomization = useCallback(
    (prompt: Prompt): ExportedPrompt => {
      // Salva template original no cache
      if (!templateCache.has(prompt.id)) {
        templateCache.set(prompt.id, prompt.content);
      }

      let content = prompt.content;
      const placeholders: string[] = [];
      const validationErrors: string[] = [];

      // Encontra a seção de OBJETIVO ou equivalente para inserir placeholders
      const objectivePatterns = [
        /(\*\*OBJETIVO:?\*\*[^\n]*\n)/i,
        /(## OBJETIVO[^\n]*\n)/i,
        /(OBJETIVO:?[^\n]*\n)/i,
        /(\*\*CAMPO DE ENTRADA:?\*\*)/i,
      ];

      let insertPoint = -1;

      for (const pattern of objectivePatterns) {
        const match = content.match(pattern);
        if (match && match.index !== undefined) {
          insertPoint = match.index + match[0].length;
          break;
        }
      }

      // Gera bloco de customização com placeholders
      const customizationBlock = `
---
### PARÂMETROS DE CUSTOMIZAÇÃO
${generateCustomizationSection(preferences)}

### CASO CLÍNICO / ENTRADA
[INSIRA SEU CASO AQUI]

**Contexto do Paciente:** {{contexto_paciente}}

---
`;

      // Insere o bloco de customização
      if (insertPoint > 0) {
        content =
          content.slice(0, insertPoint) +
          '\n' +
          customizationBlock +
          content.slice(insertPoint);
      } else {
        // Se não encontrar ponto de inserção, adiciona após a primeira linha
        const firstLineEnd = content.indexOf('\n');
        if (firstLineEnd > 0) {
          content =
            content.slice(0, firstLineEnd + 1) +
            customizationBlock +
            content.slice(firstLineEnd + 1);
        } else {
          content = customizationBlock + content;
        }
      }

      // Coleta todos os placeholders presentes
      const placeholderPatterns = [
        /\[([A-ZÀ-Ú][A-ZÀ-Ú\s\-_]+)\]/g, // [PLACEHOLDER]
        /\{\{([a-z_]+)\}\}/g, // {{placeholder}}
      ];

      for (const pattern of placeholderPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          if (!placeholders.includes(match[0])) {
            placeholders.push(match[0]);
          }
        }
      }

      // Validação: verifica se campos não foram hard-coded
      const validation = validateOutputContent(content, preferences);

      if (!validation.isValid) {
        validationErrors.push(...validation.errors);
      }

      // Garante que placeholders essenciais estejam presentes
      const hasEditablePlaceholders =
        placeholders.includes('[INSIRA SEU CASO AQUI]') ||
        placeholders.includes('{{contexto_paciente}}') ||
        placeholders.some((p) => p.includes('ESPECIALIDADE') || p.includes('CONTEXTO'));

      return {
        content,
        hasEditablePlaceholders,
        placeholders,
        validationErrors,
        isValid: hasEditablePlaceholders && validationErrors.length === 0,
      };
    },
    [preferences, generateCustomizationSection]
  );

  // Valida que o output não tem valores hard-coded
  const validateOutputContent = (
    content: string,
    prefs: CustomizationPreferences
  ): CustomizationValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const hardcodedValues: string[] = [];

    // Verifica se valores específicos do usuário foram substituídos sem deixar placeholder
    const fieldsToCheck = CUSTOMIZATION_FIELDS.filter((f) => f.required === false);

    for (const field of fieldsToCheck) {
      const prefValue = prefs[field.id as keyof CustomizationPreferences];
      if (prefValue && typeof prefValue === 'string' && prefValue.trim()) {
        // Verifica se o valor foi hard-coded E não há placeholder alternativo
        const valueInContent = content.includes(prefValue);
        const hasPlaceholder =
          content.includes(field.outputPlaceholder) ||
          content.includes(`[${field.id.toUpperCase()}]`) ||
          content.includes(`{{${field.id}}}`);

        if (valueInContent && !hasPlaceholder) {
          // Valor está presente mas sem placeholder - isso é OK para campos preenchidos
          // Apenas avisa se o campo deveria ter alternativa flexível
          if (field.id === 'objetivoEspecifico' || field.id === 'publicoAlvo') {
            warnings.push(
              `Campo "${field.label}" foi preenchido. Considere manter um placeholder para flexibilidade.`
            );
          }
        }
      }
    }

    // Verifica se há pelo menos um placeholder editável principal
    const essentialPlaceholders = [
      '[INSIRA SEU CASO AQUI]',
      '{{contexto_paciente}}',
      '[TEMA]',
      '[CASO]',
    ];

    const hasEssentialPlaceholder = essentialPlaceholders.some((p) =>
      content.includes(p)
    );

    if (!hasEssentialPlaceholder) {
      errors.push(
        'O prompt deve conter pelo menos um placeholder editável para entrada de dados (ex: [INSIRA SEU CASO AQUI])'
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      hardcodedValues,
    };
  };

  // Função pública de validação
  const validateOutput = useCallback(
    (content: string): CustomizationValidation => {
      return validateOutputContent(content, preferences);
    },
    [preferences]
  );

  // Verifica se há customizações aplicadas
  const hasCustomizations = useMemo(() => {
    return (
      preferences.especialidade !== '' ||
      preferences.contextoClinico !== DEFAULT_PREFERENCES.contextoClinico ||
      preferences.nivelDetalhe !== DEFAULT_PREFERENCES.nivelDetalhe ||
      (preferences.publicoAlvo?.trim() ?? '') !== '' ||
      (preferences.objetivoEspecifico?.trim() ?? '') !== ''
    );
  }, [preferences]);

  return {
    preferences,
    setPreference,
    setPreferences,
    resetPreferences,
    applyCustomization,
    validateOutput,
    getOriginalTemplate,
    hasCustomizations,
    isLoading,
  };
}

export default usePromptCustomization;

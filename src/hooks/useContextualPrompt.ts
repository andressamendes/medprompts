/**
 * Hook para Sistema de Geração Contextual Inteligente
 * Gerencia o estado e processamento do input contextual do usuário
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Prompt } from '@/types/prompt';
import type {
  ExtractedEntities,
  ContextualIntent,
  AdaptedPrompt,
  ContextualAnalysis,
} from '@/types/contextual';
import {
  getSemanticParser,
  createContextEngine,
  createPromptAdapter,
  preparePromptForExecution,
} from '@/lib/contextual';

/**
 * Opções do hook
 */
interface UseContextualPromptOptions {
  /** Prompts disponíveis para seleção */
  prompts: Prompt[];
  /** Debounce em ms para parsing (default: 300) */
  debounceMs?: number;
  /** Callback quando prompt está pronto */
  onPromptReady?: (adapted: AdaptedPrompt) => void;
  /** Callback quando entidades são extraídas */
  onEntitiesExtracted?: (entities: ExtractedEntities) => void;
}

/**
 * Retorno do hook
 */
interface UseContextualPromptReturn {
  /** Input atual do usuário */
  input: string;
  /** Atualiza o input */
  setInput: (value: string) => void;
  /** Entidades extraídas do input */
  entities: ExtractedEntities | null;
  /** Intent contextual identificado */
  intent: ContextualIntent | null;
  /** Prompt adaptado */
  adaptedPrompt: AdaptedPrompt | null;
  /** Indica se o prompt está pronto para uso */
  isReady: boolean;
  /** Indica se está processando */
  isProcessing: boolean;
  /** Conteúdo anexado (de arquivos) */
  attachedContent: string;
  /** Atualiza conteúdo anexado */
  setAttachedContent: (content: string) => void;
  /** Análise contextual completa */
  analysis: ContextualAnalysis | null;
  /** Prompt final pronto para execução */
  executionPrompt: string;
  /** Preenche manualmente uma variável pendente */
  fillVariable: (varName: string, value: string) => void;
  /** Valores manuais preenchidos pelo usuário */
  manualValues: Record<string, string>;
  /** Limpa todos os valores manuais */
  clearManualValues: () => void;
  /** Seleciona um prompt alternativo */
  selectAlternativePrompt: (prompt: Prompt) => void;
  /** Reseta todo o estado */
  reset: () => void;
}

/**
 * Hook principal para geração contextual de prompts
 */
export function useContextualPrompt(options: UseContextualPromptOptions): UseContextualPromptReturn {
  const { prompts, debounceMs = 300, onPromptReady, onEntitiesExtracted } = options;

  // Estado principal
  const [input, setInput] = useState('');
  const [attachedContent, setAttachedContent] = useState('');
  const [entities, setEntities] = useState<ExtractedEntities | null>(null);
  const [intent, setIntent] = useState<ContextualIntent | null>(null);
  const [adaptedPrompt, setAdaptedPrompt] = useState<AdaptedPrompt | null>(null);
  const [manualValues, setManualValues] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  // Refs para debounce
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastInputRef = useRef('');

  // Instâncias do motor (memoizadas)
  const parser = useMemo(() => getSemanticParser(), []);
  const contextEngine = useMemo(() => createContextEngine(prompts), [prompts]);
  const adapter = useMemo(() => createPromptAdapter(), []);

  /**
   * Processa o input do usuário
   */
  const processInput = useCallback((inputText: string) => {
    if (!inputText.trim()) {
      setEntities(null);
      setIntent(null);
      setAdaptedPrompt(null);
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Extrair entidades
      const extractedEntities = parser.parse(inputText);
      setEntities(extractedEntities);
      onEntitiesExtracted?.(extractedEntities);

      // 2. Analisar contexto
      const contextIntent = contextEngine.analyze(extractedEntities);
      setIntent(contextIntent);

      // 3. Usar prompt selecionado manualmente ou o primário do intent
      const promptToUse = selectedPrompt || contextIntent.primaryPrompt;

      // 4. Adaptar prompt
      if (promptToUse) {
        // Mesclar valores inferidos com manuais
        const allValues = {
          ...contextIntent.inferredValues,
          ...manualValues,
        };

        const adapted = adapter.adapt(
          promptToUse,
          allValues,
          inputText,
          attachedContent || undefined
        );

        setAdaptedPrompt(adapted);

        if (adapted.ready) {
          onPromptReady?.(adapted);
        }
      } else {
        setAdaptedPrompt(null);
      }
    } catch (error) {
      console.error('Erro ao processar input contextual:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [parser, contextEngine, adapter, attachedContent, manualValues, selectedPrompt, onEntitiesExtracted, onPromptReady]);

  /**
   * Atualiza input com debounce
   */
  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    lastInputRef.current = value;

    // Limpar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Configurar novo timer
    debounceTimerRef.current = setTimeout(() => {
      if (lastInputRef.current === value) {
        processInput(value);
      }
    }, debounceMs);
  }, [processInput, debounceMs]);

  // Reprocessar quando conteúdo anexado ou valores manuais mudam
  useEffect(() => {
    if (input.trim()) {
      processInput(input);
    }
  }, [attachedContent, manualValues, selectedPrompt]);

  // Cleanup do timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /**
   * Preenche manualmente uma variável
   */
  const fillVariable = useCallback((varName: string, value: string) => {
    setManualValues(prev => ({
      ...prev,
      [varName]: value,
    }));
  }, []);

  /**
   * Limpa valores manuais
   */
  const clearManualValues = useCallback(() => {
    setManualValues({});
  }, []);

  /**
   * Seleciona um prompt alternativo
   */
  const selectAlternativePrompt = useCallback((prompt: Prompt) => {
    setSelectedPrompt(prompt);
  }, []);

  /**
   * Reseta todo o estado
   */
  const reset = useCallback(() => {
    setInput('');
    setAttachedContent('');
    setEntities(null);
    setIntent(null);
    setAdaptedPrompt(null);
    setManualValues({});
    setSelectedPrompt(null);
    lastInputRef.current = '';
  }, []);

  // Indica se o prompt está pronto
  const isReady = adaptedPrompt?.ready ?? false;

  // Prompt final pronto para execução
  const executionPrompt = useMemo(() => {
    if (!adaptedPrompt) return '';
    return preparePromptForExecution(adaptedPrompt.adapted);
  }, [adaptedPrompt]);

  // Análise contextual completa
  const analysis: ContextualAnalysis | null = useMemo(() => {
    if (!entities || !intent) return null;

    return {
      entities,
      intent,
      adaptedPrompt,
      suggestions: intent.alternativePrompts.map((p, idx) => ({
        prompt: p,
        score: Math.max(0, intent.matchScore - (idx + 1) * 15),
        reason: 'Alternativa sugerida',
        autoFillFields: [],
        manualFields: [],
      })),
      timestamp: Date.now(),
    };
  }, [entities, intent, adaptedPrompt]);

  return {
    input,
    setInput: handleInputChange,
    entities,
    intent,
    adaptedPrompt,
    isReady,
    isProcessing,
    attachedContent,
    setAttachedContent,
    analysis,
    executionPrompt,
    fillVariable,
    manualValues,
    clearManualValues,
    selectAlternativePrompt,
    reset,
  };
}

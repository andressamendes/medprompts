/**
 * PromptCustomizer - Interface Direta de Personalização
 * Campos visíveis inline com autocomplete e validação
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import {
  Copy,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  History,
  X,
} from 'lucide-react';
import type { Prompt } from '@/types/prompt';

// Storage key para histórico
const HISTORY_KEY = 'medprompts_variable_history';

interface PromptCustomizerProps {
  prompt: Prompt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface VariableHistory {
  [varName: string]: string[];
}

/**
 * Extrai variáveis do conteúdo do prompt
 */
function extractVariables(content: string): string[] {
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
 * Retorna placeholder baseado no nome da variável
 */
function getPlaceholder(varName: string): string {
  const normalized = varName.toLowerCase();

  if (normalized.includes('tema') || normalized.includes('topico') || normalized.includes('assunto')) {
    return 'Ex: Insuficiência cardíaca, Diabetes tipo 2...';
  }
  if (normalized.includes('especialidade') || normalized.includes('area')) {
    return 'Ex: Cardiologia, Neurologia, Pediatria...';
  }
  if (normalized.includes('nivel') || normalized.includes('dificuldade')) {
    return 'Ex: Básico, Intermediário, Avançado...';
  }
  if (normalized.includes('contexto')) {
    return 'Ex: Ambulatório, Emergência, UTI...';
  }
  if (normalized.includes('data') || normalized.includes('prazo')) {
    return 'Ex: 15/03/2025, 2 semanas...';
  }
  if (normalized.includes('quantidade') || normalized.includes('numero')) {
    return 'Ex: 10, 20, 5...';
  }
  if (normalized.includes('texto') || normalized.includes('conteudo') || normalized.includes('artigo')) {
    return 'Cole ou digite o conteúdo aqui...';
  }

  return `Digite ${varName.toLowerCase()}...`;
}

/**
 * Validação inline para campos
 */
function validateField(varName: string, value: string): { valid: boolean; message?: string } {
  const normalized = varName.toLowerCase();
  const trimmed = value.trim();

  if (!trimmed) {
    return { valid: false, message: 'Campo obrigatório' };
  }

  // Validações específicas por tipo
  if (normalized.includes('quantidade') || normalized.includes('numero')) {
    if (!/^\d+$/.test(trimmed)) {
      return { valid: false, message: 'Digite apenas números' };
    }
  }

  if (trimmed.length < 2) {
    return { valid: false, message: 'Mínimo 2 caracteres' };
  }

  return { valid: true };
}

/**
 * Gera prompt com contexto dinâmico adaptado
 */
function generateAdaptedPrompt(content: string, values: Record<string, string>): string {
  let result = content;

  // Substituir variáveis
  for (const [varName, value] of Object.entries(values)) {
    if (value.trim()) {
      result = result.split(`[${varName}]`).join(value);
    }
  }

  // Adicionar contexto dinâmico baseado nas variáveis preenchidas
  const contextParts: string[] = [];

  const tema = values['TEMA'] || values['TÓPICO'] || values['ASSUNTO'];
  const especialidade = values['ESPECIALIDADE'] || values['ÁREA'];
  const nivel = values['NÍVEL'] || values['DIFICULDADE'];
  const contexto = values['CONTEXTO CLÍNICO'] || values['CONTEXTO'];

  if (tema && especialidade) {
    contextParts.push(`Foco específico: ${tema} dentro da área de ${especialidade}.`);
  }

  if (nivel) {
    const nivelMap: Record<string, string> = {
      'básico': 'Use linguagem acessível e explicações detalhadas.',
      'intermediário': 'Assuma conhecimento prévio dos conceitos fundamentais.',
      'avançado': 'Inclua detalhes técnicos e literatura recente.',
      'residência': 'Nível de profundidade para prova de residência médica.',
    };
    const nivelLower = nivel.toLowerCase();
    if (nivelMap[nivelLower]) {
      contextParts.push(nivelMap[nivelLower]);
    }
  }

  if (contexto) {
    contextParts.push(`Cenário clínico: ${contexto}.`);
  }

  // Inserir contexto adaptado se houver
  if (contextParts.length > 0) {
    const adaptiveContext = `\n\n**ADAPTAÇÃO CONTEXTUAL**\n${contextParts.join(' ')}`;

    // Inserir antes das instruções finais ou no final
    const insertPoint = result.indexOf('**FORMATO DE SAÍDA') ||
                        result.indexOf('**OUTPUT') ||
                        result.indexOf('**ENTREGA') ||
                        result.length;

    result = result.slice(0, insertPoint) + adaptiveContext + '\n\n' + result.slice(insertPoint);
  }

  return result;
}

/**
 * Gerencia histórico de variáveis no localStorage
 */
function getHistory(): VariableHistory {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveToHistory(varName: string, value: string) {
  if (!value.trim()) return;

  try {
    const history = getHistory();
    const varHistory = history[varName] || [];

    // Remover duplicatas e adicionar no início
    const filtered = varHistory.filter(v => v.toLowerCase() !== value.toLowerCase());
    const updated = [value, ...filtered].slice(0, 10); // Máximo 10 itens

    history[varName] = updated;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Silenciar erros de localStorage
  }
}

export function PromptCustomizer({ prompt, open, onOpenChange }: PromptCustomizerProps) {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [showHistoryFor, setShowHistoryFor] = useState<string | null>(null);

  const firstInputRef = useRef<HTMLInputElement>(null);

  // Reset ao abrir/mudar prompt
  useEffect(() => {
    if (open) {
      setVariableValues({});
      setTouched({});
      setShowHistoryFor(null);
      // Foco no primeiro campo
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [open, prompt.id]);

  const variables = useMemo(() => extractVariables(prompt.content), [prompt.content]);
  const history = useMemo(() => getHistory(), [open]);

  const validationResults = useMemo(() => {
    const results: Record<string, { valid: boolean; message?: string }> = {};
    for (const varName of variables) {
      results[varName] = validateField(varName, variableValues[varName] || '');
    }
    return results;
  }, [variables, variableValues]);

  const pendingCount = useMemo(() => {
    return variables.filter(v => !variableValues[v]?.trim()).length;
  }, [variables, variableValues]);

  const isReady = pendingCount === 0;
  const progress = variables.length > 0 ? ((variables.length - pendingCount) / variables.length) * 100 : 100;

  // Gerar prompt final com adaptação dinâmica
  const processedContent = useMemo(() => {
    return generateAdaptedPrompt(prompt.content, variableValues);
  }, [prompt.content, variableValues]);

  const handleVariableChange = useCallback((varName: string, value: string) => {
    setVariableValues(prev => ({ ...prev, [varName]: value }));
    setTouched(prev => ({ ...prev, [varName]: true }));
  }, []);

  const handleBlur = useCallback((varName: string) => {
    const value = variableValues[varName];
    if (value?.trim()) {
      saveToHistory(varName, value.trim());
    }
  }, [variableValues]);

  const handleSelectFromHistory = useCallback((varName: string, value: string) => {
    setVariableValues(prev => ({ ...prev, [varName]: value }));
    setTouched(prev => ({ ...prev, [varName]: true }));
    setShowHistoryFor(null);
  }, []);

  const handleCopyPrompt = async () => {
    try {
      // Salvar todos os valores no histórico
      for (const [varName, value] of Object.entries(variableValues)) {
        if (value?.trim()) {
          saveToHistory(varName, value.trim());
        }
      }

      await navigator.clipboard.writeText(processedContent);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
      toast({ title: 'Prompt copiado!' });
    } catch {
      toast({ title: 'Erro ao copiar', variant: 'destructive' });
    }
  };

  const handleOpenAI = (aiName: string) => {
    if (!isReady) {
      toast({
        title: 'Complete os campos',
        description: `Falta preencher ${pendingCount} campo(s)`,
        variant: 'destructive',
      });
      return;
    }

    const aiUrls: Record<string, string> = {
      chatgpt: 'https://chat.openai.com',
      claude: 'https://claude.ai/new',
      gemini: 'https://gemini.google.com/app',
    };

    // Salvar histórico
    for (const [varName, value] of Object.entries(variableValues)) {
      if (value?.trim()) {
        saveToHistory(varName, value.trim());
      }
    }

    navigator.clipboard.writeText(processedContent).then(() => {
      toast({ title: 'Prompt copiado!', description: `Cole com Ctrl+V no ${aiName}` });
    });

    window.open(aiUrls[aiName.toLowerCase()] || aiUrls.chatgpt, '_blank', 'noopener,noreferrer');
  };

  const handleReset = () => {
    setVariableValues({});
    setTouched({});
    toast({ title: 'Campos limpos' });
  };

  // Verificar se é campo de texto longo
  const isLongTextField = (varName: string) => {
    const normalized = varName.toLowerCase();
    return normalized.includes('texto') ||
           normalized.includes('conteudo') ||
           normalized.includes('artigo') ||
           normalized.includes('material');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {prompt.title}
              </DialogTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {variables.length > 0
                  ? `Preencha os ${variables.length} campo(s) abaixo`
                  : 'Este prompt está pronto para uso'
                }
              </p>
            </div>

            {variables.length > 0 && (
              <div className="flex flex-col items-end gap-1">
                <Badge
                  className={`
                    ${isReady
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-amber-500 hover:bg-amber-600'
                    }
                  `}
                >
                  {isReady ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Pronto
                    </>
                  ) : (
                    `${variables.length - pendingCount}/${variables.length}`
                  )}
                </Badge>

                {/* Barra de progresso */}
                <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${isReady ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Formulário de Variáveis */}
        {variables.length > 0 && (
          <div className="px-6 py-4 border-b bg-white dark:bg-gray-950 space-y-4 max-h-[300px] overflow-y-auto">
            {variables.map((varName, index) => {
              const value = variableValues[varName] || '';
              const validation = validationResults[varName];
              const isTouched = touched[varName];
              const showError = isTouched && !validation.valid;
              const isLong = isLongTextField(varName);
              const varHistory = history[varName] || [];

              return (
                <div key={varName} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor={`var-${varName}`}
                      className="text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      {varName}
                    </Label>

                    {/* Botão de histórico */}
                    {varHistory.length > 0 && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowHistoryFor(showHistoryFor === varName ? null : varName)}
                          className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <History className="w-3 h-3" />
                          Recentes
                        </button>

                        {/* Dropdown de histórico */}
                        {showHistoryFor === varName && (
                          <div className="absolute right-0 top-6 z-50 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1">
                            <div className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                              <span>Valores recentes</span>
                              <button
                                onClick={() => setShowHistoryFor(null)}
                                className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            {varHistory.map((historyValue, i) => (
                              <button
                                key={i}
                                onClick={() => handleSelectFromHistory(varName, historyValue)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 truncate"
                              >
                                {historyValue}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    {isLong ? (
                      <Textarea
                        id={`var-${varName}`}
                        value={value}
                        onChange={(e) => handleVariableChange(varName, e.target.value)}
                        onBlur={() => handleBlur(varName)}
                        placeholder={getPlaceholder(varName)}
                        className={`min-h-[100px] text-sm resize-none transition-colors ${
                          showError
                            ? 'border-red-300 dark:border-red-700 focus:border-red-500'
                            : value.trim()
                              ? 'border-emerald-300 dark:border-emerald-700'
                              : ''
                        }`}
                      />
                    ) : (
                      <Input
                        ref={index === 0 ? firstInputRef : undefined}
                        id={`var-${varName}`}
                        value={value}
                        onChange={(e) => handleVariableChange(varName, e.target.value)}
                        onBlur={() => handleBlur(varName)}
                        placeholder={getPlaceholder(varName)}
                        className={`text-sm transition-colors ${
                          showError
                            ? 'border-red-300 dark:border-red-700 focus:border-red-500'
                            : value.trim()
                              ? 'border-emerald-300 dark:border-emerald-700'
                              : ''
                        }`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            // Focar próximo campo
                            const nextIndex = index + 1;
                            if (nextIndex < variables.length) {
                              const nextInput = document.getElementById(`var-${variables[nextIndex]}`);
                              nextInput?.focus();
                            }
                          }
                        }}
                      />
                    )}

                    {/* Indicador de status */}
                    {value.trim() && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        {validation.valid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Mensagem de erro */}
                  {showError && validation.message && (
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validation.message}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Preview do Prompt */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-[150px]">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Preview do Prompt
            </h4>
            {isReady && (
              <Badge variant="outline" className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                Contexto adaptado
              </Badge>
            )}
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-800 max-h-[200px] overflow-y-auto">
              {processedContent}
            </div>
          </div>
        </div>

        {/* Footer com ações */}
        <div className="px-6 py-4 border-t bg-gray-50 dark:bg-gray-900/50 space-y-4">
          {/* Botão principal */}
          <Button
            onClick={handleCopyPrompt}
            disabled={!isReady}
            className={`
              w-full h-11 text-base font-medium
              ${isReady
                ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700'
                : ''
              }
            `}
          >
            {copiedPrompt ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 mr-2" />
                {isReady ? 'Copiar Prompt' : `Preencha ${pendingCount} campo(s)`}
              </>
            )}
          </Button>

          {/* Ações secundárias */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-gray-500 hover:text-gray-700"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Limpar
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 mr-1">Abrir em:</span>
              {['ChatGPT', 'Claude', 'Gemini'].map(ai => (
                <Button
                  key={ai}
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenAI(ai)}
                  disabled={!isReady}
                  className="h-8 px-3 text-xs"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {ai}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

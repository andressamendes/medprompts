/**
 * PromptCustomizer - Interface Simplificada
 * Apenas campos necessários + botão copiar
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
  CheckCircle2,
  History,
  X,
} from 'lucide-react';
import type { Prompt } from '@/types/prompt';
import { extractVariables } from '@/lib/promptVariables';

const HISTORY_KEY = 'medprompts_variable_history';

interface PromptCustomizerProps {
  prompt: Prompt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface VariableHistory {
  [varName: string]: string[];
}

function getPlaceholder(varName: string): string {
  const normalized = varName.toLowerCase();

  if (normalized.includes('tema') || normalized.includes('topico') || normalized.includes('assunto')) {
    return 'Ex: Insuficiência cardíaca';
  }
  if (normalized.includes('especialidade') || normalized.includes('area')) {
    return 'Ex: Cardiologia';
  }
  if (normalized.includes('nivel') || normalized.includes('dificuldade')) {
    return 'Ex: Avançado';
  }
  if (normalized.includes('contexto')) {
    return 'Ex: Emergência';
  }
  if (normalized.includes('data') || normalized.includes('prazo')) {
    return 'Ex: 15/03/2025';
  }
  if (normalized.includes('quantidade') || normalized.includes('numero')) {
    return 'Ex: 10';
  }
  if (normalized.includes('texto') || normalized.includes('conteudo') || normalized.includes('artigo')) {
    return 'Cole o conteúdo aqui...';
  }

  return `Digite ${varName.toLowerCase()}...`;
}

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
    const filtered = varHistory.filter(v => v.toLowerCase() !== value.toLowerCase());
    history[varName] = [value, ...filtered].slice(0, 8);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Silenciar erros
  }
}

export function PromptCustomizer({ prompt, open, onOpenChange }: PromptCustomizerProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [historyOpen, setHistoryOpen] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValues({});
      setCopied(false);
      setHistoryOpen(null);
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [open, prompt.id]);

  const variables = useMemo(() =>
    extractVariables(prompt.content).map(v => v.name)
  , [prompt.content]);
  const history = useMemo(() => getHistory(), [open]);

  const filledCount = useMemo(() =>
    variables.filter(v => values[v]?.trim()).length
  , [variables, values]);

  const isComplete = filledCount === variables.length;

  const processedContent = useMemo(() => {
    let result = prompt.content;
    for (const [varName, value] of Object.entries(values)) {
      if (value.trim()) {
        result = result.split(`[${varName}]`).join(value);
      }
    }
    return result;
  }, [prompt.content, values]);

  const handleChange = useCallback((varName: string, value: string) => {
    setValues(prev => ({ ...prev, [varName]: value }));
  }, []);

  const handleBlur = useCallback((varName: string) => {
    const value = values[varName];
    if (value?.trim()) saveToHistory(varName, value.trim());
  }, [values]);

  const handleCopy = async () => {
    // Salvar histórico
    for (const [varName, value] of Object.entries(values)) {
      if (value?.trim()) saveToHistory(varName, value.trim());
    }

    try {
      await navigator.clipboard.writeText(processedContent);
      setCopied(true);
      toast({ title: '✅ Prompt copiado!' });

      // Fechar modal após 1.5s
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch {
      toast({ title: 'Erro ao copiar', variant: 'destructive' });
    }
  };

  const isLongField = (varName: string) => {
    const n = varName.toLowerCase();
    return n.includes('texto') || n.includes('conteudo') || n.includes('artigo') || n.includes('material');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0">
        {/* Header simples */}
        <DialogHeader className="px-5 pt-5 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold pr-8">
            {prompt.title}
          </DialogTitle>
          {variables.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Preencha {variables.length === 1 ? 'o campo' : `os ${variables.length} campos`} abaixo
            </p>
          )}
        </DialogHeader>

        {/* Campos */}
        {variables.length > 0 ? (
          <div className="px-5 py-4 space-y-4 max-h-[50vh] overflow-y-auto">
            {variables.map((varName, index) => {
              const value = values[varName] || '';
              const isLong = isLongField(varName);
              const varHistory = history[varName] || [];

              return (
                <div key={varName} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`field-${varName}`} className="text-sm font-medium">
                      {varName}
                    </Label>

                    {varHistory.length > 0 && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setHistoryOpen(historyOpen === varName ? null : varName)}
                          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                        >
                          <History className="w-3 h-3" />
                          Recentes
                        </button>

                        {historyOpen === varName && (
                          <div className="absolute right-0 top-6 z-50 w-56 bg-white dark:bg-gray-900 border rounded-lg shadow-lg py-1">
                            <div className="px-3 py-1.5 text-xs text-gray-500 border-b flex justify-between items-center">
                              <span>Valores anteriores</span>
                              <button onClick={() => setHistoryOpen(null)} className="p-0.5 hover:bg-gray-100 rounded">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            {varHistory.map((h, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  handleChange(varName, h);
                                  setHistoryOpen(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 truncate"
                              >
                                {h}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {isLong ? (
                    <Textarea
                      id={`field-${varName}`}
                      value={value}
                      onChange={(e) => handleChange(varName, e.target.value)}
                      onBlur={() => handleBlur(varName)}
                      placeholder={getPlaceholder(varName)}
                      className="min-h-[80px] resize-none"
                    />
                  ) : (
                    <Input
                      ref={index === 0 ? firstInputRef : undefined}
                      id={`field-${varName}`}
                      value={value}
                      onChange={(e) => handleChange(varName, e.target.value)}
                      onBlur={() => handleBlur(varName)}
                      placeholder={getPlaceholder(varName)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const next = document.getElementById(`field-${variables[index + 1]}`);
                          if (next) next.focus();
                          else if (isComplete) handleCopy();
                        }
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-5 py-6 text-center text-gray-500">
            Este prompt está pronto para uso
          </div>
        )}

        {/* Footer simples */}
        <div className="px-5 py-4 border-t bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            {variables.length > 0 && (
              <Badge variant={isComplete ? "default" : "secondary"} className="shrink-0">
                {isComplete ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Pronto
                  </>
                ) : (
                  `${filledCount}/${variables.length}`
                )}
              </Badge>
            )}

            <Button
              onClick={handleCopy}
              disabled={variables.length > 0 && !isComplete}
              className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Prompt
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

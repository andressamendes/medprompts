/**
 * PromptCustomizer - Interface Limpa de Personalização
 * Foco na simplicidade e usabilidade
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import {
  Copy,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  PenLine,
  ArrowRight,
} from 'lucide-react';
import { preparePromptForExecution } from '@/lib/contextual';
import type { Prompt } from '@/types/prompt';

interface PromptCustomizerProps {
  prompt: Prompt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function PromptCustomizer({ prompt, open, onOpenChange }: PromptCustomizerProps) {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [editingVariable, setEditingVariable] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [currentVarIndex, setCurrentVarIndex] = useState(0);

  const editInputRef = useRef<HTMLInputElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset ao abrir/mudar prompt
  useEffect(() => {
    if (open) {
      setVariableValues({});
      setEditingVariable(null);
      setCurrentVarIndex(0);
    }
  }, [open, prompt.id]);

  // Foco automático no input
  useEffect(() => {
    if (editingVariable) {
      setTimeout(() => {
        editInputRef.current?.focus();
        editTextareaRef.current?.focus();
      }, 100);
    }
  }, [editingVariable]);

  const variables = useMemo(() => extractVariables(prompt.content), [prompt.content]);

  const pendingVariables = useMemo(() => {
    return variables.filter(v => !variableValues[v]?.trim());
  }, [variables, variableValues]);

  const isReady = pendingVariables.length === 0;
  const progress = variables.length > 0 ? ((variables.length - pendingVariables.length) / variables.length) * 100 : 100;

  // Gerar prompt final
  const processedContent = useMemo(() => {
    let content = prompt.content;
    for (const [varName, value] of Object.entries(variableValues)) {
      if (value.trim()) {
        content = content.split(`[${varName}]`).join(value);
      }
    }
    return content;
  }, [prompt.content, variableValues]);

  const handleVariableChange = (varName: string, value: string) => {
    setVariableValues(prev => ({ ...prev, [varName]: value }));
  };

  const handleNextVariable = () => {
    setEditingVariable(null);
    if (currentVarIndex < pendingVariables.length - 1) {
      setCurrentVarIndex(prev => prev + 1);
      setTimeout(() => {
        setEditingVariable(pendingVariables[currentVarIndex + 1]);
      }, 150);
    }
  };

  const handleCopyPrompt = async () => {
    try {
      const readyPrompt = preparePromptForExecution(processedContent);
      await navigator.clipboard.writeText(readyPrompt);
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
        description: `Falta preencher ${pendingVariables.length} campo(s)`,
        variant: 'destructive',
      });
      return;
    }

    const aiUrls: Record<string, string> = {
      chatgpt: 'https://chat.openai.com',
      claude: 'https://claude.ai/new',
      gemini: 'https://gemini.google.com/app',
    };

    const readyPrompt = preparePromptForExecution(processedContent);
    navigator.clipboard.writeText(readyPrompt).then(() => {
      toast({ title: 'Prompt copiado!', description: `Cole com Ctrl+V no ${aiName}` });
    });

    window.open(aiUrls[aiName.toLowerCase()] || aiUrls.chatgpt, '_blank', 'noopener,noreferrer');
  };

  const handleReset = () => {
    setVariableValues({});
    setCurrentVarIndex(0);
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

  // Renderizar variável clicável
  const renderVariable = (varName: string, key: string) => {
    const value = variableValues[varName];
    const isFilled = value?.trim();
    const isLong = isLongTextField(varName);

    return (
      <Popover
        key={key}
        open={editingVariable === varName}
        onOpenChange={(open: boolean) => setEditingVariable(open ? varName : null)}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`
              inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium
              transition-all duration-200 cursor-pointer
              ${isFilled
                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800'
                : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50'
              }
            `}
          >
            {isFilled ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="max-w-[200px] truncate">{value}</span>
              </>
            ) : (
              <>
                <PenLine className="w-3.5 h-3.5" />
                <span>[{varName}]</span>
              </>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-0 shadow-xl border-0"
          align="start"
          sideOffset={8}
        >
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {varName}
              </label>
              {isFilled && (
                <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                  Preenchido
                </Badge>
              )}
            </div>

            {isLong ? (
              <Textarea
                ref={editTextareaRef}
                value={value || ''}
                onChange={(e) => handleVariableChange(varName, e.target.value)}
                placeholder={getPlaceholder(varName)}
                className="min-h-[120px] text-sm resize-none"
              />
            ) : (
              <Input
                ref={editInputRef}
                value={value || ''}
                onChange={(e) => handleVariableChange(varName, e.target.value)}
                placeholder={getPlaceholder(varName)}
                className="text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && value?.trim()) {
                    handleNextVariable();
                  }
                }}
              />
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => setEditingVariable(null)}
              >
                Fechar
              </Button>
              {pendingVariables.length > 1 && !isFilled && (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={handleNextVariable}
                  disabled={!value?.trim()}
                >
                  Próximo
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // Renderizar conteúdo do prompt
  const renderPromptContent = () => {
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    const regex = /\[([A-Za-zÀ-ÖØ-öø-ÿ0-9_\-\s]+)\]/g;
    let match;
    let matchCount = 0;

    while ((match = regex.exec(prompt.content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(prompt.content.substring(lastIndex, match.index));
      }
      parts.push(renderVariable(match[1], `var-${matchCount++}`));
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < prompt.content.length) {
      parts.push(prompt.content.substring(lastIndex));
    }

    return parts;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0">
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
                  ? 'Clique nos campos destacados para personalizar'
                  : 'Este prompt não possui campos editáveis'
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
                    `${variables.length - pendingVariables.length}/${variables.length}`
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

        {/* Conteúdo do Prompt */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {renderPromptContent()}
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
                {isReady ? 'Copiar Prompt' : `Preencha ${pendingVariables.length} campo(s)`}
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

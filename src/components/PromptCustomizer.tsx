import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  Sparkles,
  Copy,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  extractVariables,
  fillPromptVariables,
  validateVariables,
  countFilledVariables,
} from '@/lib/promptVariables';
import type { Prompt } from '@/types/prompt';

interface PromptCustomizerProps {
  prompt: Prompt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PromptCustomizer({ prompt, open, onOpenChange }: PromptCustomizerProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Extrair variáveis do prompt
  const variables = useMemo(() => extractVariables(prompt.content), [prompt.content]);

  // Prompt personalizado
  const customizedPrompt = useMemo(() => {
    if (variables.length === 0) return prompt.content;
    return fillPromptVariables(prompt.content, values);
  }, [prompt.content, values, variables]);

  // Estatísticas de preenchimento
  const fillStats = useMemo(() => {
    return countFilledVariables(variables, values);
  }, [variables, values]);

  // Validação
  const validation = useMemo(() => {
    return validateVariables(variables, values);
  }, [variables, values]);

  // Carregar valores salvos do localStorage
  useEffect(() => {
    if (open) {
      const savedKey = `prompt_values_${prompt.id}`;
      const saved = localStorage.getItem(savedKey);
      if (saved) {
        try {
          setValues(JSON.parse(saved));
        } catch (e) {
          console.warn('Erro ao carregar valores salvos:', e);
        }
      }
    }
  }, [open, prompt.id]);

  // Auto-save no localStorage
  useEffect(() => {
    if (Object.keys(values).length > 0) {
      const savedKey = `prompt_values_${prompt.id}`;
      localStorage.setItem(savedKey, JSON.stringify(values));
    }
  }, [values, prompt.id]);

  const handleValueChange = (varName: string, value: string) => {
    setValues(prev => ({ ...prev, [varName]: value }));
  };

  const handleReset = () => {
    setValues({});
    const savedKey = `prompt_values_${prompt.id}`;
    localStorage.removeItem(savedKey);
    toast({ title: '🔄 Campos resetados' });
  };

  const handleCopyCustomized = async () => {
    const { valid, errors } = validation;

    if (!valid) {
      toast({
        title: '❌ Campos obrigatórios',
        description: errors[0],
        variant: 'destructive',
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(customizedPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
      toast({ title: '✅ Prompt personalizado copiado!' });
    } catch (error) {
      toast({
        title: '❌ Erro ao copiar',
        description: 'Não foi possível copiar o prompt',
        variant: 'destructive',
      });
    }
  };

  const handleOpenAI = (aiName: string) => {
    const { valid } = validation;

    if (!valid) {
      toast({
        title: '❌ Preencha todos os campos',
        description: 'Alguns campos obrigatórios estão vazios',
        variant: 'destructive',
      });
      return;
    }

    const encodedPrompt = encodeURIComponent(customizedPrompt);
    let url = '';

    switch (aiName.toLowerCase()) {
      case 'chatgpt':
        url = `https://chat.openai.com/?q=${encodedPrompt}`;
        break;
      case 'claude':
        url = `https://claude.ai/new?q=${encodedPrompt}`;
        break;
      case 'perplexity':
        url = `https://www.perplexity.ai/?q=${encodedPrompt}`;
        break;
      case 'gemini':
        url = `https://gemini.google.com/?q=${encodedPrompt}`;
        break;
      default:
        url = `https://chat.openai.com/?q=${encodedPrompt}`;
    }

    window.open(url, '_blank');
    toast({ title: `🚀 Abrindo ${aiName}...` });
  };

  // Se não tem variáveis, não mostra o customizer
  if (variables.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-indigo-600" />
                Personalizar Prompt
              </DialogTitle>
              <DialogDescription className="text-base">
                {prompt.title}
              </DialogDescription>
            </div>

            {/* Progress Badge */}
            <Badge
              variant={fillStats.percentage === 100 ? 'default' : 'secondary'}
              className="text-sm px-3 py-1"
            >
              {fillStats.percentage === 100 ? (
                <CheckCircle2 className="w-4 h-4 mr-1" />
              ) : (
                <AlertCircle className="w-4 h-4 mr-1" />
              )}
              {fillStats.filled}/{fillStats.total} campos
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Formulário de variáveis */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Preencha os campos abaixo:
            </h3>

            {variables.map((variable) => (
              <div key={variable.name} className="space-y-2">
                <Label htmlFor={variable.name} className="flex items-center gap-2">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    [{variable.name}]
                  </span>
                  {variable.required && (
                    <span className="text-red-500 text-xs">*obrigatório</span>
                  )}
                </Label>

                {variable.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {variable.description}
                  </p>
                )}

                {variable.type === 'textarea' ? (
                  <Textarea
                    id={variable.name}
                    value={values[variable.name] || ''}
                    onChange={e => handleValueChange(variable.name, e.target.value)}
                    placeholder={variable.example || `Digite ${variable.name.toLowerCase()}...`}
                    className="min-h-[100px]"
                    maxLength={variable.maxLength}
                  />
                ) : (
                  <Input
                    id={variable.name}
                    type={variable.type}
                    value={values[variable.name] || ''}
                    onChange={e => handleValueChange(variable.name, e.target.value)}
                    placeholder={variable.example || `Digite ${variable.name.toLowerCase()}...`}
                    maxLength={variable.maxLength}
                  />
                )}

                {variable.example && (
                  <p className="text-xs text-gray-500 italic">
                    Exemplo: {variable.example}
                  </p>
                )}

                {variable.maxLength && (
                  <p className="text-xs text-gray-500 text-right">
                    {(values[variable.name] || '').length}/{variable.maxLength}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Preview */}
          <div className="space-y-2 border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Preview do Prompt:
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg max-h-[300px] overflow-y-auto">
              <pre className="text-xs whitespace-pre-wrap font-mono text-gray-800 dark:text-gray-200">
                {customizedPrompt}
              </pre>
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button
              onClick={handleCopyCustomized}
              disabled={!validation.valid}
              className="flex-1"
            >
              {copiedPrompt ? (
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

            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetar
            </Button>
          </div>

          {/* Abrir em IAs */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Abrir diretamente em:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenAI('ChatGPT')}
                disabled={!validation.valid}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                ChatGPT
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenAI('Claude')}
                disabled={!validation.valid}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Claude
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenAI('Perplexity')}
                disabled={!validation.valid}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Perplexity
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenAI('Gemini')}
                disabled={!validation.valid}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Gemini
              </Button>
            </div>
          </div>

          {/* Validation Errors */}
          {!validation.valid && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-200 font-semibold mb-1">
                Campos pendentes:
              </p>
              <ul className="text-xs text-red-700 dark:text-red-300 list-disc list-inside">
                {validation.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

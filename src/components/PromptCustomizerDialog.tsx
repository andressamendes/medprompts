import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Prompt } from '@/types/prompt';
import { Copy, Wand2, RotateCcw, ExternalLink } from 'lucide-react';
import { useState, useMemo } from 'react';

interface PromptCustomizerDialogProps {
  prompt: Prompt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * PromptCustomizerDialog - Modal para personalizar prompts com variáveis
 *
 * Detecta automaticamente variáveis no formato [VARIAVEL] e cria campos
 * de input para o usuário preencher. Gera preview do prompt personalizado.
 */
export function PromptCustomizerDialog({ prompt, open, onOpenChange }: PromptCustomizerDialogProps) {
  const [copied, setCopied] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});

  // Detecta variáveis no formato [VARIAVEL] no conteúdo do prompt
  // NOTA: Hooks devem ser chamados incondicionalmente (antes de qualquer return)
  const promptContent = prompt?.content ?? '';

  const detectedVariables = useMemo(() => {
    if (!promptContent) return [];

    const regex = /\[([A-ZÀ-Ú\s]+)\]/g;
    const matches = promptContent.match(regex);
    if (!matches) return [];

    // Remove duplicatas e formata
    const unique = Array.from(new Set(matches));
    return unique.map(v => ({
      key: v.replace(/[[\]]/g, ''),
      placeholder: v,
      label: v.replace(/[[\]]/g, '').toLowerCase().replace(/_/g, ' ')
    }));
  }, [promptContent]);

  // Gera o prompt personalizado substituindo as variáveis
  const customizedPrompt = useMemo(() => {
    if (!promptContent) return '';

    let result = promptContent;
    detectedVariables.forEach(({ placeholder, key }) => {
      const value = variables[key] || placeholder;
      result = result.replace(new RegExp(`\\[${key}\\]`, 'g'), value);
    });
    return result;
  }, [promptContent, variables, detectedVariables]);

  // Early return APÓS os hooks
  if (!prompt) return null;

  const handleVariableChange = (key: string, value: string) => {
    setVariables(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setVariables({});
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(customizedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar prompt:', error);
    }
  };

  const openInAI = (ai: 'chatgpt' | 'claude' | 'perplexity') => {
    const urls = {
      chatgpt: `https://chat.openai.com/?q=${encodeURIComponent(customizedPrompt)}`,
      claude: 'https://claude.ai/new',
      perplexity: 'https://www.perplexity.ai/'
    };

    // Para Claude e Perplexity, copiar automaticamente
    if (ai !== 'chatgpt') {
      navigator.clipboard.writeText(customizedPrompt);
    }

    window.open(urls[ai], '_blank');
  };

  const hasVariables = detectedVariables.length > 0;
  const allVariablesFilled = detectedVariables.every(v => variables[v.key]?.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Personalizar Prompt
          </DialogTitle>
          <p className="text-muted-foreground mt-2">{prompt.title}</p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Informações do prompt */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{prompt.category}</Badge>
            <Badge variant="outline">{prompt.estimatedTime} min</Badge>
            {hasVariables && (
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {detectedVariables.length} {detectedVariables.length === 1 ? 'variável' : 'variáveis'}
              </Badge>
            )}
          </div>

          {/* Formulário de variáveis */}
          {hasVariables ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Preencha as variáveis
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-gray-600 dark:text-gray-400"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {detectedVariables.map(({ key, label, placeholder }) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="text-sm font-medium capitalize">
                      {label}
                    </Label>
                    <Input
                      id={key}
                      placeholder={`Digite ${label}...`}
                      value={variables[key] || ''}
                      onChange={(e) => handleVariableChange(key, e.target.value)}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Substitui: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{placeholder}</code>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Este prompt não possui variáveis para personalizar.
                Você pode copiá-lo diretamente ou abrir em uma IA.
              </p>
            </div>
          )}

          {/* Preview do prompt personalizado */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Preview do Prompt
              </h3>
              {hasVariables && !allVariablesFilled && (
                <Badge variant="outline" className="text-amber-600 dark:text-amber-400">
                  Variáveis pendentes
                </Badge>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800 max-h-64 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed text-gray-800 dark:text-gray-200">
                {customizedPrompt}
              </pre>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col gap-3">
            {/* Botão copiar */}
            <Button
              onClick={handleCopy}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copiado!' : 'Copiar Prompt Personalizado'}
            </Button>

            {/* Botões das IAs */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => openInAI('chatgpt')}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="w-3 h-3 mr-2" />
                ChatGPT
              </Button>
              <Button
                onClick={() => openInAI('claude')}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="w-3 h-3 mr-2" />
                Claude
              </Button>
              <Button
                onClick={() => openInAI('perplexity')}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="w-3 h-3 mr-2" />
                Perplexity
              </Button>
            </div>
          </div>

          {/* Dica de uso */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Dica:</strong> Preencha as variáveis com informações específicas
              do seu caso de uso para obter resultados mais precisos da IA.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

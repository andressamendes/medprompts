import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Prompt } from '@/types/prompt';
import { Clock, BookOpen, Star, Copy, ExternalLink, Sparkles, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { PromptCustomizer } from './PromptCustomizer';
import { toast } from '@/hooks/use-toast';

interface PromptDialogProps {
  prompt: Prompt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PromptDialog({ prompt, open, onOpenChange }: PromptDialogProps) {
  const [copied, setCopied] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);

  if (!prompt) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      toast({ title: 'Prompt copiado!' });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar prompt:', error);
      toast({ title: 'Erro ao copiar', variant: 'destructive' });
    }
  };

  const openInAI = (aiName: string) => {
    const aiUrls: Record<string, string> = {
      ChatGPT: 'https://chat.openai.com',
      Claude: 'https://claude.ai/new',
      Perplexity: 'https://www.perplexity.ai',
      Gemini: 'https://gemini.google.com/app',
    };

    navigator.clipboard.writeText(prompt.content).catch(() => {});
    const url = aiUrls[aiName] || aiUrls.ChatGPT;
    window.open(url, '_blank');
  };

  const getAIName = (ai: string | { primary: string; reason?: string; alternatives?: string[] } | undefined): string => {
    if (!ai) return '';
    return typeof ai === 'string' ? ai : ai.primary;
  };

  const getAIReason = (ai: string | { primary: string; reason?: string; alternatives?: string[] } | undefined): string => {
    if (!ai || typeof ai === 'string') return '';
    return ai.reason || '';
  };

  const getAIAlternatives = (ai: string | { primary: string; reason?: string; alternatives?: string[] } | undefined): string[] => {
    if (!ai || typeof ai === 'string') return [];
    return ai.alternatives || [];
  };

  const recommendedAI = getAIName(prompt.recommendedAI);
  const reason = getAIReason(prompt.recommendedAI);
  const alternatives = getAIAlternatives(prompt.recommendedAI);

  // Detecta se o prompt tem variáveis personalizáveis [TEMA], [CONTEXTO], etc
  const hasVariables = /\[([A-ZÀ-Ú\s]+)\]/.test(prompt.content);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{prompt.title}</DialogTitle>
            <p className="text-muted-foreground mt-2">{prompt.description}</p>
          </DialogHeader>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {prompt.category === 'estudos' ? 'Estudos' : 'Clínica'}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {prompt.estimatedTime} min
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              {prompt.academicLevel}
            </Badge>
          </div>

          {/* Recomendação de IA */}
          {recommendedAI && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2 mt-4">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    IA Recomendada: <span className="text-blue-600 dark:text-blue-400">{recommendedAI}</span>
                  </p>
                  {reason && (
                    <p className="text-xs text-blue-700 dark:text-blue-300">{reason}</p>
                  )}
                  {alternatives.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Alternativas: {alternatives.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Conteúdo do prompt */}
          <div className="bg-muted/50 rounded-lg p-4 border max-h-[40vh] overflow-y-auto mt-4">
            <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
              {prompt.content}
            </pre>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col gap-3 mt-4">
            {/* Botão principal: Personalizar (se tiver variáveis) */}
            {hasVariables && (
              <Button
                onClick={() => setCustomizerOpen(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                size="lg"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Personalizar e Copiar
              </Button>
            )}

            {/* Botões secundários */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleCopy} className="flex-1" variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>

              <Button
                onClick={() => openInAI(recommendedAI || 'ChatGPT')}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Usar em {recommendedAI || 'ChatGPT'}
              </Button>
            </div>

            {/* Outras IAs */}
            <div className="flex flex-wrap gap-2 justify-center">
              {['ChatGPT', 'Claude', 'Perplexity', 'Gemini'].filter(ai => ai !== recommendedAI).map(ai => (
                <Button
                  key={ai}
                  onClick={() => openInAI(ai)}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  {ai}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal simples de personalização */}
      <PromptCustomizer
        prompt={prompt}
        open={customizerOpen}
        onOpenChange={setCustomizerOpen}
      />
    </>
  );
}

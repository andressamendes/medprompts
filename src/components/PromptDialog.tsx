import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Prompt } from '@/types/prompt';
import { Clock, BookOpen, Star, Copy, ExternalLink, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface PromptDialogProps {
  prompt: Prompt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PromptDialog({ prompt, open, onOpenChange }: PromptDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!prompt) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar prompt:', error);
    }
  };

  const openInChatGPT = () => {
    const url = `https://chat.openai.com/?q=${encodeURIComponent(prompt.content)}`;
    window.open(url, '_blank');
  };

  const openInClaude = () => {
    const url = `https://claude.ai/new`;
    window.open(url, '_blank');
  };

  const openInPerplexity = () => {
    const url = `https://www.perplexity.ai/`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{prompt.title}</DialogTitle>
          <p className="text-muted-foreground mt-2">{prompt.description}</p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Badges de informação */}
          <div className="flex flex-wrap gap-2">
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
            {prompt.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          {/* NOVA SEÇÃO: Recomendação de IA */}
          {prompt.recommendedAI && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    🤖 IA Recomendada: <span className="text-blue-600 dark:text-blue-400">{prompt.recommendedAI.primary}</span>
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    {prompt.recommendedAI.reason}
                  </p>
                  {prompt.recommendedAI.alternatives && prompt.recommendedAI.alternatives.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Alternativas: {prompt.recommendedAI.alternatives.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pré-requisitos */}
          {prompt.prerequisites && prompt.prerequisites.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">
                📋 Pré-requisitos
              </p>
              <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
                {prompt.prerequisites.map((prereq, index) => (
                  <li key={index}>{prereq}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Conteúdo do prompt */}
          <div className="bg-muted/50 rounded-lg p-4 border">
            <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
              {prompt.content}
            </pre>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleCopy} className="flex-1" variant="default">
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copiado!' : 'Copiar Prompt'}
            </Button>
            
            <Button onClick={openInChatGPT} variant="outline" className="flex-1">
              <ExternalLink className="w-4 h-4 mr-2" />
              ChatGPT
            </Button>
            
            <Button onClick={openInClaude} variant="outline" className="flex-1">
              <ExternalLink className="w-4 h-4 mr-2" />
              Claude
            </Button>
            
            <Button onClick={openInPerplexity} variant="outline" className="flex-1">
              <ExternalLink className="w-4 h-4 mr-2" />
              Perplexity
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

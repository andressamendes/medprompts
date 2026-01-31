import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Prompt } from '@/types/prompt';
import { Clock, BookOpen, Star, Copy, ExternalLink, Sparkles, Wand2, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { PromptCustomizerDialog } from './PromptCustomizerDialog';
import { PromptCustomizationPanel } from './PromptCustomizationPanel';
import { toast } from '@/hooks/use-toast';

interface PromptDialogProps {
  prompt: Prompt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PromptDialog({ prompt, open, onOpenChange }: PromptDialogProps) {
  const [copied, setCopied] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('view');

  if (!prompt) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      toast({ title: 'Prompt original copiado!' });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar prompt:', error);
      toast({ title: 'Erro ao copiar', variant: 'destructive' });
    }
  };

  const handleCustomizedExport = (_content: string, isValid: boolean) => {
    if (isValid) {
      toast({
        title: 'Prompt customizado exportado!',
        description: 'Os placeholders editáveis foram preservados.',
      });
    }
  };

  const openInAI = (aiName: string) => {
    // URLs das IAs (sem query params - não funcionam de forma confiável)
    const aiUrls: Record<string, string> = {
      ChatGPT: 'https://chat.openai.com',
      Claude: 'https://claude.ai/new',
      Perplexity: 'https://www.perplexity.ai',
      Gemini: 'https://gemini.google.com/app',
    };

    // Copiar prompt para clipboard primeiro
    navigator.clipboard.writeText(prompt.content).catch(() => {});

    const url = aiUrls[aiName] || aiUrls.ChatGPT;
    window.open(url, '_blank');
  };

  // Helper para extrair nome da IA
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

  // Detecta se o prompt tem variáveis personalizáveis
  const hasVariables = /\[([A-ZÀ-Ú\s]+)\]/.test(prompt.content);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{prompt.title}</DialogTitle>
          <p className="text-muted-foreground mt-2">{prompt.description}</p>
        </DialogHeader>

        {/* Badges de informação */}
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

        {/* Seção de Recomendação de IA */}
        {recommendedAI && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3 mt-4">
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  IA Recomendada: <span className="text-blue-600 dark:text-blue-400">{recommendedAI}</span>
                </p>
                {reason && (
                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    {reason}
                  </p>
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

        {/* Tabs: Visualizar / Customizar */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="view" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Visualizar
            </TabsTrigger>
            <TabsTrigger value="customize" className="flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Customizar
            </TabsTrigger>
          </TabsList>

          {/* Tab: Visualizar Prompt Original */}
          <TabsContent value="view" className="space-y-4 mt-4">
            {/* Conteúdo do prompt */}
            <div className="bg-muted/50 rounded-lg p-4 border max-h-[40vh] overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
                {prompt.content}
              </pre>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col gap-3">
              {/* Botão de personalização rápida (se tiver variáveis) */}
              {hasVariables && (
                <Button
                  onClick={() => setCustomizerOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Preencher Variáveis Rapidamente
                </Button>
              )}

              {/* Botões padrão */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleCopy} className="flex-1" variant="default">
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copiado!' : 'Copiar Original'}
                </Button>

                <Button
                  onClick={() => openInAI('ChatGPT')}
                  variant={recommendedAI === 'ChatGPT' ? 'default' : 'outline'}
                  className="flex-1"
                >
                  {recommendedAI === 'ChatGPT' && <Star className="w-4 h-4 mr-2 fill-current" />}
                  <ExternalLink className="w-4 h-4 mr-2" />
                  ChatGPT
                </Button>

                <Button
                  onClick={() => openInAI('Claude')}
                  variant={recommendedAI === 'Claude' ? 'default' : 'outline'}
                  className="flex-1"
                >
                  {recommendedAI === 'Claude' && <Star className="w-4 h-4 mr-2 fill-current" />}
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Claude
                </Button>

                <Button
                  onClick={() => openInAI('Perplexity')}
                  variant={recommendedAI === 'Perplexity' ? 'default' : 'outline'}
                  className="flex-1"
                >
                  {recommendedAI === 'Perplexity' && <Star className="w-4 h-4 mr-2 fill-current" />}
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Perplexity
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Customizar Prompt */}
          <TabsContent value="customize" className="mt-4">
            <PromptCustomizationPanel
              prompt={prompt}
              onExport={handleCustomizedExport}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>

      {/* Modal de personalização */}
      <PromptCustomizerDialog
        prompt={prompt}
        open={customizerOpen}
        onOpenChange={setCustomizerOpen}
      />
    </>
  );
}

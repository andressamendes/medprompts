import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Prompt } from '@/types';
import { Clock, GraduationCap, Tag, Copy, Check, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PromptDialog } from './PromptDialog';
import { useLogger } from '@/utils/logger';
import { usePromptHistory } from '@/contexts/PromptHistoryContext';
import { useToast } from '@/hooks/use-toast';

interface PromptCardProps {
  prompt: Prompt;
}

export function PromptCard({ prompt }: PromptCardProps) {
  const logger = useLogger();
  const { addToHistory, history } = usePromptHistory();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [renderTime] = useState(Date.now());
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Estatísticas de uso do prompt
  const promptStats = history.find(h => h.id === prompt.id);
  const viewCount = promptStats?.viewCount || 0;

  // Log quando o card é renderizado
  useEffect(() => {
    logger.debug('PromptCard renderizado', {
      promptId: prompt.id,
      promptTitle: prompt.title,
      category: prompt.category,
      academicLevel: prompt.academicLevel,
      tags: prompt.tags,
      renderTimestamp: renderTime,
    });
  }, [prompt.id, prompt.title, prompt.category, prompt.academicLevel, prompt.tags, renderTime, logger]);

  const categoryColors: Record<string, string> = {
    estudos: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    clinica: 'bg-green-100 text-green-800 hover:bg-green-200',
    pesquisa: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    produtividade: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  };

  const handleOpenDialog = () => {
    const viewTime = Date.now() - renderTime;
    
    addToHistory({
      id: prompt.id,
      title: prompt.title,
      category: prompt.category,
    });

    logger.info('Prompt visualizado - Dialog aberto', {
      action: 'open_dialog',
      promptId: prompt.id,
      promptTitle: prompt.title,
      category: prompt.category,
      academicLevel: prompt.academicLevel,
      estimatedTime: prompt.estimatedTime,
      tagsCount: prompt.tags.length,
      timeToClick: viewTime,
      userMetrics: {
        cardViewDuration: viewTime,
        clickedAt: new Date().toISOString(),
      },
    });
    
    setOpen(true);
  };

  const handleCloseDialog = (isOpen: boolean) => {
    if (!isOpen && open) {
      logger.info('Prompt Dialog fechado', {
        action: 'close_dialog',
        promptId: prompt.id,
        promptTitle: prompt.title,
      });
    }
    setOpen(isOpen);
  };

  const handleCopyPrompt = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      
      toast({
        title: "Prompt copiado!",
        description: "O prompt foi copiado para a área de transferência.",
      });

      logger.info('Prompt copiado', {
        action: 'copy_prompt',
        promptId: prompt.id,
        promptTitle: prompt.title,
        promptLength: prompt.content.length,
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o prompt.",
      });

      logger.error('Erro ao copiar prompt', error as Error);
    }
  };

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
    
    logger.debug('Preview expandido/recolhido', {
      action: expanded ? 'collapse_preview' : 'expand_preview',
      promptId: prompt.id,
    });
  };

  // Extrai primeiras 3 linhas do prompt para preview
  const getPreviewLines = () => {
    const lines = prompt.content.split('\n').filter((line: string) => line.trim());
    return expanded ? lines.slice(0, 5) : lines.slice(0, 2);
  };

  const previewLines = getPreviewLines();
  const hasMoreLines = prompt.content.split('\n').filter((line: string) => line.trim()).length > 2;

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <CardTitle className="text-xl font-bold leading-tight">
              {prompt.title}
            </CardTitle>
            <div className="flex gap-2">
              <Badge
                variant="secondary"
                className={categoryColors[prompt.category] || 'bg-gray-100 text-gray-800'}
              >
                {prompt.category}
              </Badge>
              {viewCount > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {viewCount}x
                </Badge>
              )}
            </div>
          </div>
          <CardDescription className="text-sm line-clamp-2">
            {prompt.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 space-y-3">
          {/* Preview do Prompt */}
          <div className="bg-muted/50 rounded-md p-3 text-sm space-y-1">
            {previewLines.map((line: string, index: number) => (
              <p key={index} className="text-muted-foreground">
                {line.substring(0, 80)}{line.length > 80 ? '...' : ''}
              </p>
            ))}
            {hasMoreLines && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleExpanded}
                className="w-full mt-2 text-xs"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-3 h-3 mr-1" />
                    Mostrar menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3 mr-1" />
                    Ver mais
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {prompt.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs flex items-center gap-1"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </Badge>
            ))}
            {prompt.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{prompt.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Metadados */}
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              <span>{prompt.academicLevel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>~{prompt.estimatedTime} min</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCopyPrompt}
            className="flex-1"
            disabled={copied}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copiar
              </>
            )}
          </Button>
          <Button
            className="flex-1"
            onClick={handleOpenDialog}
          >
            Ver Completo
          </Button>
        </CardFooter>
      </Card>

      <PromptDialog
        prompt={prompt}
        open={open}
        onOpenChange={handleCloseDialog}
      />
    </>
  );
}

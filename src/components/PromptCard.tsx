import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Prompt } from '@/types';
import { Clock, GraduationCap, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PromptDialog } from './PromptDialog';
import { logger } from '@/utils/logger';

interface PromptCardProps {
  prompt: Prompt;
}

export function PromptCard({ prompt }: PromptCardProps) {
  const [open, setOpen] = useState(false);
  const [renderTime] = useState(Date.now());

  // Log quando o card é renderizado
  useEffect(() => {
    logger.debug('PromptCard renderizado', {
      component: 'PromptCard',
      promptId: prompt.id,
      promptTitle: prompt.title,
      category: prompt.category,
      academicLevel: prompt.academicLevel,
      tags: prompt.tags,
      renderTimestamp: renderTime,
    });
  }, [prompt.id, prompt.title, prompt.category, prompt.academicLevel, prompt.tags, renderTime]);

  const categoryColors: Record<string, string> = {
    estudos: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    clinica: 'bg-green-100 text-green-800 hover:bg-green-200',
    pesquisa: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    produtividade: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  };

  const handleOpenDialog = () => {
    const viewTime = Date.now() - renderTime;

    logger.info('Prompt visualizado - Dialog aberto', {
      component: 'PromptCard',
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
        component: 'PromptCard',
        action: 'close_dialog',
        promptId: prompt.id,
        promptTitle: prompt.title,
      });
    }
    setOpen(isOpen);
  };

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <CardTitle className="text-xl font-bold leading-tight">
              {prompt.title}
            </CardTitle>
            <Badge
              variant="secondary"
              className={categoryColors[prompt.category] || 'bg-gray-100 text-gray-800'}
            >
              {prompt.category}
            </Badge>
          </div>
          <CardDescription className="text-sm line-clamp-2">
            {prompt.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1">
          <div className="space-y-3">
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
          </div>
        </CardContent>

        <CardFooter>
          <Button
            className="w-full"
            onClick={handleOpenDialog}
          >
            Ver Prompt Completo
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

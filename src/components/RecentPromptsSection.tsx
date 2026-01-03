import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye, Trash2, TrendingUp } from 'lucide-react';
import { usePromptHistory } from '@/contexts/PromptHistoryContext';
import { prompts } from '@/data/prompts-data';
import { useState } from 'react';
import { PromptDialog } from './PromptDialog';

export function RecentPromptsSection() {
  const { getRecentPrompts, getMostViewed, clearHistory } = usePromptHistory();
  const [view, setView] = useState<'recent' | 'popular'>('recent');
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);

  const displayedHistory = view === 'recent' 
    ? getRecentPrompts(5) 
    : getMostViewed(5);

  const selectedPrompt = selectedPromptId
    ? prompts.find(p => p.id === selectedPromptId)
    : undefined;

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes} min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days} dias atrás`;
    return new Date(timestamp).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short' 
    });
  };

  if (displayedHistory.length === 0) {
    return null; // Não mostra seção se não há histórico
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {view === 'recent' ? (
                  <>
                    <Clock className="w-5 h-5" />
                    Visualizados Recentemente
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    Mais Populares
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {view === 'recent' 
                  ? 'Seus últimos prompts visualizados'
                  : 'Prompts que você mais usa'
                }
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={view === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('recent')}
              >
                Recentes
              </Button>
              <Button
                variant={view === 'popular' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('popular')}
              >
                Populares
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {displayedHistory.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => setSelectedPromptId(entry.id)}
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{entry.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {entry.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimestamp(entry.timestamp)}
                  </span>
                  {entry.viewCount > 1 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {entry.viewCount}x
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="w-full text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Histórico
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedPrompt && (
        <PromptDialog
          prompt={selectedPrompt}
          open={!!selectedPromptId}
          onOpenChange={(open) => !open && setSelectedPromptId(null)}
        />
      )}
    </>
  );
}

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, RotateCcw } from 'lucide-react';
import { loadProgress, type PromptHistoryItem } from '@/lib/gamification';
import { prompts } from '@/data/prompts-data';
import { PromptDialog } from './PromptDialog';

export function HistorySection() {
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);

  useEffect(() => {
    const progress = loadProgress();
    setHistory(progress.history);

    // Atualizar quando houver mudanças
    const handleUpdate = () => {
      const updatedProgress = loadProgress();
      setHistory(updatedProgress.history);
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('progressUpdated', handleUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('progressUpdated', handleUpdate as EventListener);
    };
  }, []);

  if (history.length === 0) {
    return null;
  }

  const selectedPrompt = selectedPromptId 
    ? prompts.find(p => p.id === selectedPromptId) 
    : null;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffDays === 1) return 'Ontem';
    return `Há ${diffDays} dias`;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Histórico de Uso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={`${item.promptId}-${item.timestamp}`}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {item.promptTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(item.timestamp)}
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-2">
                  <Badge variant="secondary" className="text-xs">
                    +{item.xpEarned} XP
                  </Badge>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedPromptId(item.promptId)}
                    className="flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Usar
                  </Button>
                </div>
              </div>
            ))}
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

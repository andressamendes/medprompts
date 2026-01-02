import { Button } from '@/components/ui/button';
import { ExternalLink, Sparkles, Search } from 'lucide-react';

interface IntegrationButtonsProps {
  promptContent: string;
  promptTitle: string;
}

export function IntegrationButtons({ promptContent, promptTitle }: IntegrationButtonsProps) {
  const handleNotebookLM = () => {
    // NotebookLM não tem API direta, então abrimos a página principal
    const notebookUrl = 'https://notebooklm.google.com/';
    window.open(notebookUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePerplexity = () => {
    // Perplexity aceita query via URL
    const query = encodeURIComponent(`${promptTitle}\n\n${promptContent}`);
    const perplexityUrl = `https://www.perplexity.ai/?q=${query}`;
    window.open(perplexityUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-3 pt-4 border-t">
      <p className="text-sm font-medium text-muted-foreground">
        🤖 Usar com IA:
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleNotebookLM}
          className="w-full"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Abrir NotebookLM
          <ExternalLink className="w-3 h-3 ml-2" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePerplexity}
          className="w-full"
        >
          <Search className="w-4 h-4 mr-2" />
          Buscar no Perplexity
          <ExternalLink className="w-3 h-3 ml-2" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        💡 <strong>Dica:</strong> O prompt já foi copiado automaticamente. Cole no chat da IA!
      </p>
    </div>
  );
}

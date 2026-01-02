import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Brain, Search, Copy, CheckCircle2 } from 'lucide-react';
import { mnemonics, type Mnemonic } from '@/data/mnemonics-data';
import { useToast } from '@/hooks/use-toast';
import { updateChallengeProgress } from '@/lib/weekly-challenge';

export function MnemonicsSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredMnemonics = mnemonics.filter(mne => 
    mne.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mne.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mne.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCopy = (mnemonic: Mnemonic) => {
    const text = `${mnemonic.title}\n\n${mnemonic.mnemonic}\n\n${mnemonic.meaning.join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(mnemonic.id);

    // Atualizar desafio semanal
    const { tasksCompleted } = updateChallengeProgress('mnemonic', 1);
    
    toast({
      title: '✅ Mnemônico copiado!',
      description: tasksCompleted.length > 0 
        ? `${tasksCompleted[0].title} - +${tasksCompleted[0].xpReward} XP`
        : 'Memorize e pratique!',
    });

    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = Array.from(new Set(mnemonics.map(m => m.category)));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Mnemônicos Médicos
          </span>
          <Badge variant="secondary">{filteredMnemonics.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar mnemônicos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categorias */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Badge
              key={category}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => setSearchQuery(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Grid de Mnemônicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
          {filteredMnemonics.map((mnemonic) => (
            <Card key={mnemonic.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm">{mnemonic.title}</h3>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {mnemonic.category}
                    </Badge>
                  </div>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-sm font-medium text-purple-900">
                    "{mnemonic.mnemonic}"
                  </p>
                </div>

                <div className="space-y-1">
                  {mnemonic.meaning.map((item, idx) => (
                    <p key={idx} className="text-xs text-muted-foreground">
                      {item}
                    </p>
                  ))}
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground italic mb-2">
                    {mnemonic.context}
                  </p>
                  
                  <Button
                    onClick={() => handleCopy(mnemonic)}
                    size="sm"
                    variant="outline"
                    className="w-full"
                    disabled={copiedId === mnemonic.id}
                  >
                    {copiedId === mnemonic.id ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMnemonics.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum mnemônico encontrado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

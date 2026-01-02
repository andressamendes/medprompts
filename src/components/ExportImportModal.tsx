import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Upload, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { loadProgress } from '@/lib/gamification';
import { loadProfile } from '@/lib/profile';
import { loadUserBadges } from '@/lib/badges';
import { loadDailyMissions } from '@/lib/daily-missions';
import { loadWeeklyChallengeState } from '@/lib/weekly-challenge';
import { loadPomodoroState } from '@/lib/pomodoro';

interface ExportImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportImportModal({ open, onOpenChange }: ExportImportModalProps) {
  const [importData, setImportData] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Exportar todos os dados
  const handleExport = () => {
    try {
      const allData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        profile: loadProfile(),
        progress: loadProgress(),
        badges: loadUserBadges(),
        missions: loadDailyMissions(),
        weeklyChallenge: loadWeeklyChallengeState(),
        pomodoro: loadPomodoroState(),
      };

      const jsonString = JSON.stringify(allData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `medprompts-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: '✅ Backup criado!',
        description: 'Seus dados foram exportados com sucesso.',
      });
    } catch (error) {
      toast({
        title: '❌ Erro ao exportar',
        description: 'Não foi possível criar o backup.',
      });
    }
  };

  // Copiar dados para área de transferência
  const handleCopy = () => {
    try {
      const allData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        profile: loadProfile(),
        progress: loadProgress(),
        badges: loadUserBadges(),
        missions: loadDailyMissions(),
        weeklyChallenge: loadWeeklyChallengeState(),
        pomodoro: loadPomodoroState(),
      };

      const jsonString = JSON.stringify(allData, null, 2);
      navigator.clipboard.writeText(jsonString);
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      toast({
        title: '✅ Copiado!',
        description: 'Dados copiados para área de transferência.',
      });
    } catch (error) {
      toast({
        title: '❌ Erro ao copiar',
        description: 'Não foi possível copiar os dados.',
      });
    }
  };

  // Importar dados
  const handleImport = () => {
    try {
      if (!importData.trim()) {
        toast({
          title: '⚠️ Dados vazios',
          description: 'Cole os dados do backup no campo acima.',
        });
        return;
      }

      const data = JSON.parse(importData);

      // Validar estrutura básica
      if (!data.version || !data.profile || !data.progress) {
        throw new Error('Formato de backup inválido');
      }

      // Salvar dados importados
      if (data.profile) localStorage.setItem('medprompts_profile', JSON.stringify(data.profile));
      if (data.progress) localStorage.setItem('medprompts_progress', JSON.stringify(data.progress));
      if (data.badges) localStorage.setItem('medprompts_user_badges', JSON.stringify(data.badges));
      if (data.missions) localStorage.setItem('medprompts_daily_missions', JSON.stringify(data.missions));
      if (data.weeklyChallenge) localStorage.setItem('medprompts_weekly_challenge', JSON.stringify(data.weeklyChallenge));
      if (data.pomodoro) localStorage.setItem('medprompts_pomodoro', JSON.stringify(data.pomodoro));

      toast({
        title: '✅ Dados importados!',
        description: 'Recarregue a página para ver as mudanças.',
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      toast({
        title: '❌ Erro ao importar',
        description: 'Formato de backup inválido.',
      });
    }
  };

  // Importar de arquivo
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Backup e Restauração</DialogTitle>
          <DialogDescription>
            Exporte seus dados para fazer backup ou importe dados de outro dispositivo
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Exportar</TabsTrigger>
            <TabsTrigger value="import">Importar</TabsTrigger>
          </TabsList>

          {/* Tab de Exportação */}
          <TabsContent value="export" className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">O que será exportado:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Perfil e configurações</li>
                    <li>Progresso e XP</li>
                    <li>Badges conquistados</li>
                    <li>Missões e desafios</li>
                    <li>Estatísticas do Pomodoro</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleExport}
                className="w-full"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Backup (JSON)
              </Button>

              <Button
                onClick={handleCopy}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar para Área de Transferência
                  </>
                )}
              </Button>
            </div>

            <div className="p-4 bg-gray-50 border rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Dica:</strong> Faça backups regulares para não perder seu progresso!
              </p>
            </div>
          </TabsContent>

          {/* Tab de Importação */}
          <TabsContent value="import" className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-900">
                  <p className="font-medium mb-1">⚠️ Atenção:</p>
                  <p>A importação irá <strong>substituir todos os dados atuais</strong>. Faça um backup antes!</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cole os dados do backup ou carregue um arquivo:
                </label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder='{"version": "1.0", "profile": {...}, ...}'
                  className="w-full h-40 p-3 border rounded-lg font-mono text-xs resize-none"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                  id="file-import"
                />
                <label htmlFor="file-import" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Carregar Arquivo
                    </span>
                  </Button>
                </label>

                <Button
                  onClick={handleImport}
                  disabled={!importData.trim()}
                  className="flex-1"
                >
                  Importar Dados
                </Button>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Dica:</strong> A página será recarregada automaticamente após a importação.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

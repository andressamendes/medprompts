import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  downloadBackup,
  importBackup,
  validateBackup,
  clearAllData,
  type MedPromptsBackup,
} from '@/lib/export-import';

interface ExportImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportImportModal({ open, onOpenChange }: ExportImportModalProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleExport = () => {
    try {
      downloadBackup();
      toast({
        title: '✅ Backup criado!',
        description: 'Arquivo JSON baixado com sucesso.',
      });
    } catch (error) {
      toast({
        title: '❌ Erro ao exportar',
        description: 'Não foi possível criar o backup.',
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (!validateBackup(data)) {
          toast({
            title: '❌ Arquivo inválido',
            description: 'O arquivo selecionado não é um backup válido.',
          });
          return;
        }

        const result = importBackup(data as MedPromptsBackup);

        if (result.success) {
          toast({
            title: '✅ Backup restaurado!',
            description: `Importado: ${result.imported.join(', ')}`,
          });
          onOpenChange(false);
          
          // Recarregar página após 1 segundo
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          toast({
            title: '❌ Erro ao importar',
            description: result.message,
          });
        }
      } catch (error) {
        toast({
          title: '❌ Erro ao ler arquivo',
          description: 'O arquivo não pôde ser processado.',
        });
      }
    };

    reader.readAsText(file);
    
    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearData = () => {
    clearAllData();
    toast({
      title: '🗑️ Dados apagados',
      description: 'Todos os dados foram removidos.',
    });
    setShowClearConfirm(false);
    onOpenChange(false);
    
    // Recarregar página após 500ms
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Dados</DialogTitle>
          <DialogDescription>
            Faça backup ou restaure seus dados
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!showClearConfirm ? (
            <>
              {/* Exportar */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Exportar Backup</h3>
                <p className="text-sm text-muted-foreground">
                  Salve todos os seus dados (perfil, XP, badges, missões e histórico)
                </p>
                <Button onClick={handleExport} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Backup (.json)
                </Button>
              </div>

              {/* Importar */}
              <div className="space-y-2 pt-4 border-t">
                <h3 className="font-semibold text-sm">Importar Backup</h3>
                <p className="text-sm text-muted-foreground">
                  Restaure seus dados de um arquivo de backup anterior
                </p>
                <Button onClick={handleImportClick} variant="outline" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Carregar Backup
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Limpar dados */}
              <div className="space-y-2 pt-4 border-t">
                <h3 className="font-semibold text-sm text-red-600">Zona de Perigo</h3>
                <p className="text-sm text-muted-foreground">
                  Apagar todos os dados permanentemente
                </p>
                <Button
                  onClick={() => setShowClearConfirm(true)}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Apagar Todos os Dados
                </Button>
              </div>
            </>
          ) : (
            // Confirmação de limpeza
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-red-900">Tem certeza?</p>
                  <p className="text-sm text-red-700">
                    Esta ação é <strong>irreversível</strong>. Todos os seus dados serão
                    apagados permanentemente:
                  </p>
                  <ul className="text-sm text-red-700 list-disc list-inside space-y-1 mt-2">
                    <li>Perfil e configurações</li>
                    <li>XP e nível</li>
                    <li>Badges conquistados</li>
                    <li>Missões e histórico</li>
                    <li>Sessões Pomodoro</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowClearConfirm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleClearData}
                  variant="destructive"
                  className="flex-1"
                >
                  Sim, apagar tudo
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

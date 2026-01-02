import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, BookOpen, Calendar } from 'lucide-react';

export function HistorySection() {
  return (
    <Card className="border-2 border-amber-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-amber-500" />
          Histórico de Estudos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium mb-1">Nenhum registro ainda</p>
          <p className="text-sm">
            Seu histórico de flashcards e sessões de estudo aparecerá aqui
          </p>
        </div>

        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">
                Recursos em breve
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Estatísticas detalhadas, gráficos de progresso e histórico completo
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

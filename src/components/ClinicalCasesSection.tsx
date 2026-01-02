import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stethoscope, Play } from 'lucide-react';

export function ClinicalCasesSection() {
  return (
    <Card className="border-2 border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-red-500" />
          Casos Clínicos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium mb-1">Nenhum caso disponível</p>
          <p className="text-sm mb-4">
            Casos clínicos interativos estarão disponíveis em breve
          </p>
          <Button variant="outline" disabled>
            <Play className="w-4 h-4 mr-2" />
            Iniciar Caso Clínico
          </Button>
        </div>

        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-900 mb-1">
            🩺 Em Desenvolvimento
          </p>
          <p className="text-xs text-red-700">
            Resolva casos clínicos baseados em situações reais, tome decisões e receba feedback imediato
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

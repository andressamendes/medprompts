import { loadProgress } from '@/lib/gamification';

export function StreakHeatmap() {
  const progress = loadProgress();
  const today = new Date();

  // Gerar últimos 90 dias
  const generateHeatmapData = () => {
    const days: { date: Date; value: number }[] = [];
    
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simular atividade (em produção, vem do histórico real)
      const isActive = Math.random() > 0.3;
      const value = isActive ? Math.floor(Math.random() * 5) + 1 : 0;
      
      days.push({ date, value });
    }
    
    return days;
  };

  const heatmapData = generateHeatmapData();

  // Agrupar por semanas
  const weeks: { date: Date; value: number }[][] = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  const getColorClass = (value: number) => {
    if (value === 0) return 'bg-gray-100';
    if (value === 1) return 'bg-green-200';
    if (value === 2) return 'bg-green-300';
    if (value === 3) return 'bg-green-400';
    if (value === 4) return 'bg-green-500';
    return 'bg-green-600';
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div>
      <h3 className="font-semibold mb-4">Calendário de Atividade</h3>
      
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1">
          {/* Labels dos dias da semana */}
          <div className="flex gap-1 pl-8">
            {weeks[0]?.map((day, idx) => (
              <div key={idx} className="w-3 text-xs text-center text-muted-foreground">
                {day.date.toLocaleDateString('pt-BR', { weekday: 'narrow' })}
              </div>
            ))}
          </div>

          {/* Semanas */}
          <div className="flex gap-1">
            <div className="flex flex-col justify-around text-xs text-muted-foreground pr-2">
              {weekDays.map((day, idx) => (
                <div key={idx} className="h-3 flex items-center">
                  {idx % 2 === 0 ? day : ''}
                </div>
              ))}
            </div>

            <div className="flex gap-1">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((day, dayIdx) => (
                    <div
                      key={dayIdx}
                      className={`w-3 h-3 rounded-sm ${getColorClass(day.value)} transition-colors cursor-pointer hover:ring-2 hover:ring-primary`}
                      title={`${day.date.toLocaleDateString('pt-BR')} - ${day.value} atividades`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <span>Menos</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4, 5].map((val) => (
            <div
              key={val}
              className={`w-3 h-3 rounded-sm ${getColorClass(val)}`}
            />
          ))}
        </div>
        <span>Mais</span>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          🔥 <strong>Streak atual:</strong> {progress.streak} dias consecutivos!
        </p>
      </div>
    </div>
  );
}

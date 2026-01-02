import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
// import não necessário - removido

ChartJS.register(ArcElement, Tooltip, Legend);

export function CategoryStats() {

  // Dados simulados por categoria (em produção, viria do histórico)
  const categoryData = {
    labels: [
      'Raciocínio Clínico',
      'Revisão',
      'Diagnóstico',
      'Fisiopatologia',
      'Anatomia',
      'Outros',
    ],
    datasets: [
      {
        data: [25, 20, 18, 15, 12, 10],
        backgroundColor: [
          'rgba(37, 99, 235, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(107, 114, 128, 0.8)',
        ],
        borderColor: [
          'rgb(37, 99, 235)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
          'rgb(107, 114, 128)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} prompts (${percentage}%)`;
          },
        },
      },
    },
  };

  const topCategories = [
    { name: 'Raciocínio Clínico', count: 25, color: 'bg-blue-500' },
    { name: 'Revisão', count: 20, color: 'bg-green-500' },
    { name: 'Diagnóstico', count: 18, color: 'bg-yellow-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Uso por Categoria</h3>
        <div className="h-[300px]">
          <Doughnut data={categoryData} options={options} />
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Top 3 Categorias</h3>
        <div className="space-y-2">
          {topCategories.map((category, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-sm font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-sm text-muted-foreground">{category.count} prompts</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${category.color}`}
                    style={{ width: `${(category.count / 25) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { loadProgress } from '@/lib/gamification';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface XPChartProps {
  timeRange: '7d' | '30d' | 'all';
}

export function XPChart({ timeRange }: XPChartProps) {
  const progress = loadProgress();

  // Gerar dados simulados baseados no progresso atual
  const generateData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const labels: string[] = [];
    const data: number[] = [];

    const today = new Date();
    const currentXP = progress.xp;
    const xpPerDay = Math.floor(currentXP / days);

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dateStr = date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
      
      labels.push(dateStr);
      
      // Simular crescimento com variação
      const baseXP = xpPerDay * (days - i);
      const variation = Math.random() * 50 - 25;
      data.push(Math.max(0, Math.floor(baseXP + variation)));
    }

    return { labels, data };
  };

  const { labels, data: xpData } = generateData();

  const chartData = {
    labels,
    datasets: [
      {
        label: 'XP Acumulado',
        data: xpData,
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: 'white',
        bodyColor: 'white',
        callbacks: {
          label: (context: any) => `XP: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="h-[300px]">
      <Line data={chartData} options={options} />
    </div>
  );
}

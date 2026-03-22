import { Chart } from '@/components/ui/composed/Chart';

export default function ProfitChartCard() {
  const data = {
    labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT'],
    datasets: [
      {
        label: 'Profit',
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, '#E8583A');
          gradient.addColorStop(1, '#ff8a71');
          return gradient;
        },
        borderRadius: 4,
        data: [45, 60, 40, 75, 50, 65, 55, 90, 60, 70],
        barThickness: 16,
        maxBarThickness: 20
      }
    ]
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#1a1a1a',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 10 },
        padding: 10,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false
        },
        ticks: {
          font: {
            size: 10,
            weight: 'bold'
          },
          color: '#8a7f7a',
          padding: 10
        }
      },
      y: {
        display: false,
        min: 0,
        suggestedMax: 100
      }
    },
    layout: {
      padding: {
        top: 10,
        bottom: 0
      }
    }
  };

  return (
    <div className="bg-white rounded-4xl p-8 border border-border-subtle shadow-soft h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-sm font-black text-foreground uppercase tracking-wider mb-1">Yearly Profit</h2>
          <p className="text-[10px] font-bold text-success">+ 28% VS LAST YEAR</p>
        </div>
        <button 
          type="button"
          aria-label="View yearly profit details"
          className="w-8 h-8 rounded-full bg-surface-subtle flex items-center justify-center border border-border-subtle cursor-pointer hover:bg-surface-elevated transition-colors"
        >
          <i className="pi pi-arrow-up-right text-muted text-xs" aria-hidden="true"></i>
        </button>
      </div>

      <div className="h-full w-full">
        <Chart 
          type="bar" 
          data={data} 
          options={options} 
          className="p-0! bg-transparent! border-none! shadow-none! h-full w-full" 
        />
      </div>
    </div>
  );
}

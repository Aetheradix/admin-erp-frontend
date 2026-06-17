import { Chart } from '@/components/ui/composed/Chart';
import { motion } from 'framer-motion';
import { ArrowUpRight, Maximize2 } from 'lucide-react';

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
          gradient.addColorStop(0, 'rgba(232, 88, 58, 0)');
          gradient.addColorStop(0.2, 'rgba(232, 88, 58, 0.4)');
          gradient.addColorStop(1, '#E8583A');
          return gradient;
        },
        hoverBackgroundColor: '#E8583A',
        borderRadius: 6,
        data: [45, 60, 40, 75, 50, 65, 55, 90, 60, 70],
        barThickness: 12,
        maxBarThickness: 16
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
        titleFont: { size: 11, weight: 'bold', family: 'Plus Jakarta Sans' },
        bodyFont: { size: 10, family: 'Plus Jakarta Sans' },
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => ` $${context.raw}k Profit`
        }
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
            size: 9,
            weight: '700',
            family: 'Plus Jakarta Sans'
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
        top: 20,
        bottom: 0
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-3xl p-8 border border-border-subtle shadow-soft h-full flex flex-col group hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Growth Analytics</h2>
            <div className="px-1.5 py-0.5 rounded-md bg-success/10 border border-success/20">
              <span className="text-[8px] font-black text-success">+12.5%</span>
            </div>
          </div>
          <h3 className="text-2xl font-black text-foreground tracking-tight">Yearly Profit</h3>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Expand chart"
            className="w-9 h-9 rounded-2xl bg-surface-subtle flex items-center justify-center border border-border-subtle cursor-pointer hover:bg-surface-elevated transition-all"
          >
            <Maximize2 size={14} className="text-muted" />
          </button>
          <button
            type="button"
            aria-label="View report"
            className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 cursor-pointer hover:bg-primary-hover transition-all group/btn"
          >
            <ArrowUpRight size={14} className="text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[240px] w-full relative">
        {/* Subtle grid lines for depth */}
        <div className="absolute inset-0 flex flex-col justify-between opacity-[0.03] pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-full h-px bg-foreground" />
          ))}
        </div>

        <Chart
          type="bar"
          data={data}
          options={options}
          className="p-0! bg-transparent! border-none! shadow-none! h-full w-full relative z-10"
        />
      </div>

      <div className="mt-8 pt-8 border-t border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-muted uppercase tracking-widest mb-0.5">Projected</span>
            <span className="text-sm font-black text-foreground">$1.2M</span>
          </div>
          <div className="w-px h-8 bg-border-subtle" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-muted uppercase tracking-widest mb-0.5">Realized</span>
            <span className="text-sm font-black text-foreground">$842k</span>
          </div>
        </div>
        <div className="h-2 w-24 bg-surface-subtle rounded-full overflow-hidden">
          <div className="h-full w-[70%] bg-primary rounded-full transition-all duration-1000" />
        </div>
      </div>
    </motion.div>
  );
}

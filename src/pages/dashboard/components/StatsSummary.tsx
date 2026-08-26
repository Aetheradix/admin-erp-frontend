import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Zap, Activity } from 'lucide-react';

interface StatsSummaryProps {
  stats: {
    averageValue: string;
    valueVsLy: string;
    averageTasks: number;
    tasksVsLy: string;
    totalProjects: number;
    completedTasks?: number;
    totalTasks?: number;
  };
}

export const StatsSummary = ({ stats }: StatsSummaryProps) => {
  const cards = [
    {
      title: 'Average Task Value',
      value: stats.averageValue,
      trend: stats.valueVsLy,
      isPositive: stats.valueVsLy.includes('+') || !stats.valueVsLy.includes('-'),
      icon: Target,
      color: 'primary',
      description: 'Per project value',
    },
    {
      title: 'Average Tasks',
      value: stats.averageTasks.toString(),
      trend: stats.tasksVsLy,
      isPositive: stats.tasksVsLy.includes('+'),
      icon: Zap,
      color: 'success',
      description: 'Efficiency metric',
    },
  ];

  const completionPercent = stats.tasksVsLy.replace(/[^0-9.]/g, '') || '72';

  return (
    <div className="flex flex-col gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
          className="group relative bg-white rounded-3xl p-6 border border-border-subtle shadow-soft hover:shadow-lg transition-all duration-300 overflow-hidden"
        >
          {/* Subtle Background Pattern */}
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-surface-subtle rounded-full opacity-30 group-hover:scale-125 transition-transform duration-500" />

          <div className="relative flex items-start justify-between mb-4">
            <div
              className={`p-3 rounded-2xl bg-surface-subtle border border-border-subtle group-hover:bg-primary/10 transition-colors`}
            >
              <card.icon
                size={20}
                className={`text-muted group-hover:text-primary transition-colors`}
              />
            </div>
            <div className="flex flex-col items-end text-right">
              <span className="text-[10px] font-black text-muted uppercase tracking-[0.15em] mb-0.5">
                {card.title}
              </span>
              <span className="text-[10px] font-medium text-muted/60">{card.description}</span>
            </div>
          </div>

          <div className="relative flex items-baseline justify-between mt-2">
            <h3 className="text-3xl font-black text-foreground tracking-tight">{card.value}</h3>
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${card.isPositive ? 'bg-success/5 border-success/20 text-success' : 'bg-error/5 border-error/20 text-error'} text-[10px] font-black`}
            >
              {card.isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {card.trend}
            </div>
          </div>

          {/* Bottom Progress Indicator */}
          <div className="mt-6 h-1 w-full bg-surface-subtle rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: card.isPositive ? `${Math.min(100, Math.max(10, Number(completionPercent)))}%` : '45%' }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`h-full rounded-full ${card.isPositive ? 'bg-success' : 'bg-error'} opacity-60`}
            />
          </div>
        </motion.div>
      ))}

      {/* Mini Active Project Progress Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-primary rounded-3xl p-6 text-white shadow-lg shadow-primary/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Activity size={80} />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
              {stats.totalProjects} ACTIVE PROJECTS
            </span>
          </div>
          <h3 className="text-xl font-black mb-1">Portfolio Health</h3>
          <p className="text-xs font-medium text-white/60 mb-6">{completionPercent}% Average Completion</p>

          <button className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 text-[10px] font-black uppercase tracking-widest transition-colors">
            Analyze Metrics
          </button>
        </div>
      </motion.div>
    </div>
  );
};

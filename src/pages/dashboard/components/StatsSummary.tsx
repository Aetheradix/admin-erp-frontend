import { motion } from 'framer-motion';

interface StatsSummaryProps {
  stats: {
    averageValue: string;
    valueVsLy: string;
    averageTasks: number;
    tasksVsLy: string;
    totalProjects: number;
  };
}

export const StatsSummary = ({ stats }: StatsSummaryProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-white rounded-4xl p-8 border border-border-subtle shadow-soft"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-sm font-black text-foreground uppercase tracking-wider">Projects Output</h2>
        <div 
          role="button"
          tabIndex={0}
          aria-label="View detailed project output report"
          className="w-8 h-8 rounded-full bg-surface-subtle flex items-center justify-center border border-border-subtle cursor-pointer"
        >
          <i className="pi pi-arrow-up-right text-muted text-xs" aria-hidden="true"></i>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div>
          <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Average Tasks Value</p>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-foreground">{stats.averageValue}</span>
            <span className="text-[10px] font-bold text-error">{stats.valueVsLy}</span>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Average Tasks / Project</p>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-foreground">{stats.averageTasks}</span>
            <span className="text-[10px] font-bold text-success">{stats.tasksVsLy}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

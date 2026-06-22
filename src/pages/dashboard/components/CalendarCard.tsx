import { Calendar } from '@/components/ui/primitives/Calendar';
import { MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CalendarCard() {
  // Mock data for highlighted dates
  const highlightedDates = [2, 3, 10, 14, 22, 24];

  const dateTemplate = (date: { day: number }) => {
    const isHighlighted = highlightedDates.includes(date.day);

    if (isHighlighted) {
      return (
        <div className="relative flex items-center justify-center w-9 h-9 rounded-2xl bg-primary/10 border border-primary/20 group hover:bg-primary transition-colors duration-300">
          <span className="text-foreground group-hover:text-white font-black text-xs transition-colors">{date.day}</span>
          <div className="absolute -bottom-1 w-1 h-1 bg-primary group-hover:bg-white rounded-full transition-colors"></div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center w-9 h-9 rounded-2xl hover:bg-surface-subtle transition-colors">
        <span className="text-muted font-bold text-xs">{date.day}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-border-subtle shadow-soft h-full flex flex-col group hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1">Timebox</h2>
          <h3 className="text-2xl font-black text-foreground tracking-tight">Calendar</h3>
        </div>
        <button
          type="button"
          aria-label="Calendar options"
          className="w-10 h-10 rounded-2xl bg-surface-subtle flex items-center justify-center border border-border-subtle cursor-pointer hover:bg-surface-elevated transition-all"
        >
          <MoreHorizontal size={18} className="text-muted" aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="dashboard-calendar-container"
        >
          <Calendar
            value={new Date()}
            inline
            showWeek={false}
            className="w-full border-none!"
            dateTemplate={dateTemplate}
          />
        </motion.div>
      </div>

      <div className="mt-8 pt-8 border-t border-border-subtle">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black text-muted uppercase tracking-widest">Active Cycle</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-black text-success uppercase">Sprint 24</span>
          </div>
        </div>

        <div className="bg-surface-subtle rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white flex flex-col items-center justify-center border border-border-subtle shadow-sm">
            <span className="text-[8px] font-black text-muted leading-none uppercase">Jun</span>
            <span className="text-sm font-black text-foreground leading-none mt-1">11</span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-foreground mb-0.5">Stakeholder Review</p>
            <p className="text-[10px] font-medium text-muted">14:00 - 15:30 • Zoom</p>
          </div>
        </div>
      </div>
    </div>
  );
}

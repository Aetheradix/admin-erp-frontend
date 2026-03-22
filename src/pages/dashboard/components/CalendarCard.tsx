import { Calendar } from 'primereact/calendar';
import { motion } from 'framer-motion';

export default function CalendarCard() {
  // Mock data for highlighted dates
  const highlightedDates = [2, 3, 10, 14, 22, 24];
  
  const dateTemplate = (date: any) => {
    const isHighlighted = highlightedDates.includes(date.day);
    
    if (isHighlighted) {
      return (
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-primary/40 bg-primary/5">
          <span className="text-foreground font-bold text-sm">{date.day}</span>
          <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"></div>
        </div>
      );
    }

    return <span className="text-muted font-medium text-sm">{date.day}</span>;
  };

  return (
    <div className="bg-white rounded-4xl p-8 border border-border-subtle shadow-soft h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-foreground">Calendar</h2>
          <p className="text-xs font-medium text-muted tracking-tight">Active Cycle</p>
        </div>
        <button 
          type="button"
          aria-label="Calendar options"
          className="w-8 h-8 rounded-full bg-surface-subtle flex items-center justify-center border border-border-subtle cursor-pointer hover:bg-surface-elevated transition-colors"
        >
          <i className="pi pi-ellipsis-h text-muted" aria-hidden="true"></i>
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="dashboard-calendar-container"
      >
        <Calendar 
          value={new Date()} 
          inline 
          showWeek={false}
          className="w-full border-none"
          dateTemplate={dateTemplate}
        />
      </motion.div>
    </div>
  );
}

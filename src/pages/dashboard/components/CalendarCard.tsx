import { Calendar } from '@/components/ui/primitives/Calendar';
import { MoreHorizontal, Calendar as CalendarIcon, Tag, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGetEventsQuery } from '@/store/api/eventSlice';
import type { ERPEvent } from '@/types/models';
import { useNavigate } from 'react-router-dom';

export default function CalendarCard() {
  const navigate = useNavigate();
  const { data: events = [] } = useGetEventsQuery();

  // Create a map of day -> events list for current month
  const eventsByDay = events.reduce((acc: Record<number, ERPEvent[]>, event: ERPEvent) => {
    if (!event.date) return acc;
    const d = new Date(event.date);
    if (!isNaN(d.getTime())) {
      const dayNum = d.getDate();
      if (!acc[dayNum]) acc[dayNum] = [];
      acc[dayNum].push(event);
    }
    return acc;
  }, {});

  // Find nearest upcoming event
  const upcomingEvent = events.length > 0 ? events[0] : null;

  const dateTemplate = (date: { day: number; month: number; year: number }) => {
    const dayEvents = eventsByDay[date.day] || [];
    const hasEvents = dayEvents.length > 0;

    if (hasEvents) {
      const primaryEvent = dayEvents[0];
      return (
        <div className="relative group/tooltip flex items-center justify-center w-9 h-9 rounded-2xl bg-primary/10 border border-primary/30 hover:bg-primary transition-all duration-300 cursor-pointer">
          <span className="text-primary group-hover/tooltip:text-white font-black text-xs transition-colors">
            {date.day}
          </span>
          <div className="absolute -bottom-1 w-1.5 h-1.5 bg-primary group-hover/tooltip:bg-white rounded-full transition-colors animate-pulse" />

          {/* Hover Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-zinc-900 text-white text-xs rounded-2xl shadow-2xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 z-50 flex flex-col gap-1.5 border border-zinc-700/50">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
              <span className="font-black text-[10px] uppercase text-primary tracking-wider">
                {primaryEvent.category || 'Event'}
              </span>
              <span className="text-[10px] text-zinc-400 font-semibold">
                {dayEvents.length > 1 ? `+${dayEvents.length - 1} more` : ''}
              </span>
            </div>
            <p className="font-bold text-white text-xs leading-snug line-clamp-2">
              {primaryEvent.title}
            </p>
            {primaryEvent.time && (
              <div className="flex items-center gap-1 text-[10px] text-zinc-300">
                <Clock size={10} className="text-primary" />
                <span>{primaryEvent.time}</span>
              </div>
            )}
            {primaryEvent.location && (
              <div className="flex items-center gap-1 text-[10px] text-zinc-300">
                <MapPin size={10} className="text-primary" />
                <span className="truncate">{primaryEvent.location}</span>
              </div>
            )}
            {primaryEvent.tags && primaryEvent.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-0.5">
                {primaryEvent.tags.slice(0, 2).map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-zinc-800 text-[9px] text-zinc-300 font-semibold"
                  >
                    <Tag size={8} /> #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
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
          <h2 className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1">
            Timebox
          </h2>
          <h3 className="text-2xl font-black text-foreground tracking-tight">Calendar</h3>
        </div>
        <button
          type="button"
          aria-label="Calendar options"
          onClick={() => navigate('/events')}
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
          <span className="text-[10px] font-black text-muted uppercase tracking-widest">
            Upcoming Event
          </span>
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="text-[10px] font-black text-primary hover:underline uppercase"
          >
            View All
          </button>
        </div>

        {upcomingEvent ? (
          <div
            onClick={() => navigate('/events')}
            className="bg-surface-subtle rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-primary/5 transition-colors border border-border-subtle"
          >
            <div className="w-10 h-10 rounded-xl bg-white flex flex-col items-center justify-center border border-border-subtle shadow-sm">
              <span className="text-[8px] font-black text-primary leading-none uppercase">
                {upcomingEvent.date
                  ? new Date(upcomingEvent.date).toLocaleString('default', { month: 'short' })
                  : 'Event'}
              </span>
              <span className="text-sm font-black text-foreground leading-none mt-1">
                {upcomingEvent.date ? new Date(upcomingEvent.date).getDate() : '•'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-foreground mb-0.5 truncate">
                {upcomingEvent.title}
              </p>
              <p className="text-[10px] font-medium text-muted truncate">
                {upcomingEvent.time || 'All Day'} • {upcomingEvent.location || 'Company HQ'}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-surface-subtle rounded-2xl p-4 flex items-center gap-3 text-muted">
            <CalendarIcon size={18} />
            <span className="text-xs font-medium">No upcoming events scheduled</span>
          </div>
        )}
      </div>
    </div>
  );
}

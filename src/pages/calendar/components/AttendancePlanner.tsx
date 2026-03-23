import { Clock, MapPin, Users, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { useGetEventsQuery } from '@/store/api/eventApiSlice';

interface AttendancePlannerProps {
  selectedDate: Date;
}

export function AttendancePlanner({ selectedDate }: AttendancePlannerProps) {
  const { data: events = [], isLoading } = useGetEventsQuery();
  const dateStr = selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  const dailyTotalEvents = events.filter((event: any) => {
    const eventDate = new Date(event.event_date);
    return eventDate.toDateString() === selectedDate.toDateString();
  });

  const dailyEvents = dailyTotalEvents.slice(0, 3);

  return (
    <div className="flex flex-col gap-6 bg-white p-8 rounded-[40px] border border-border-subtle shadow-soft h-full transition-all duration-500 hover:shadow-lg">
      <div className="flex items-center justify-between border-b border-border-subtle/50 pb-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-black text-foreground">Daily Planner</h3>
          <span className="text-xs font-bold text-primary uppercase tracking-widest">{dateStr}</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
          <CalendarIcon size={20} />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-4 py-3 bg-surface-subtle rounded-2xl border border-border-subtle/50">
          <Sparkles size={16} className="text-primary animate-pulse" />
          <span className="text-xs font-black text-foreground uppercase tracking-wider">Scheduled Events</span>
        </div>

        <div className="flex flex-col gap-4">
          {dailyEvents.map((event) => (
            <div key={event.id} className="group relative pl-6 border-l-2 border-primary/30 hover:border-primary transition-all duration-300">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">{event.time}</span>
                  <span className="text-[10px] font-bold text-muted bg-surface-subtle px-2 py-0.5 rounded-md">{event.category}</span>
                </div>
                <h4 className="text-sm font-black text-foreground group-hover:text-primary transition-colors cursor-pointer line-clamp-1">
                  {event.title}
                </h4>
                <div className="flex items-center gap-3 text-[10px] text-muted font-bold">
                  <div className="flex items-center gap-1">
                    <MapPin size={10} />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={10} />
                    <span>{event.attendees} going</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {dailyTotalEvents.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3 opacity-40">
              <Clock size={32} />
              <p className="text-xs font-bold">{isLoading ? 'Syncing schedule...' : 'No events scheduled for this day.'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Action */}
      <div className="mt-auto pt-6 border-t border-border-subtle/50">
        <div className="bg-surface-subtle p-4 rounded-2xl border border-dashed border-border-strong flex flex-col gap-3">
          <span className="text-[10px] font-black text-muted uppercase tracking-widest">Workspace Tip</span>
          <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
            Planning your week ahead increases productivity by 25%. Don't forget to mark your WFH days!
          </p>
        </div>
      </div>
    </div>
  );
}

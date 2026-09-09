import { useState, useRef, useEffect } from 'react';
import { Bell, Calendar, Clock, MapPin, ChevronRight, CheckCheck } from 'lucide-react';
import { useGetEventsQuery } from '@/store/api/eventSlice';
import { useNavigate } from 'react-router-dom';
import type { ERPEvent } from '@/types/models';

export function EventNotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: events = [] } = useGetEventsQuery();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = events.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative w-13! h-13! rounded-pill! bg-surface-subtle! border border-border-subtle! hover:bg-surface-elevated! transition-all duration-150 flex items-center justify-center group cursor-pointer"
      >
        <Bell size={18} className="text-muted group-hover:rotate-12 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-white animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-border-subtle overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-4 bg-surface-subtle border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                Company Events ({events.length})
              </h4>
            </div>
            <button
              type="button"
              onClick={() => navigate('/events')}
              className="text-[10px] font-black text-primary hover:underline flex items-center gap-0.5"
            >
              View All <ChevronRight size={10} />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border-subtle/50">
            {events.length > 0 ? (
              events.slice(0, 5).map((event: ERPEvent) => (
                <div
                  key={event.id}
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/events');
                  }}
                  className="p-4 hover:bg-surface-subtle/80 transition-colors cursor-pointer flex gap-3 group"
                >
                  <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Calendar size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-black text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-md">
                        {event.category || 'Event'}
                      </span>
                      {event.date && (
                        <span className="text-[10px] font-semibold text-muted">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                    <h5 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {event.title}
                    </h5>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted">
                      {event.time && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {event.time}
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin size={10} /> {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted flex flex-col items-center gap-2">
                <CheckCheck size={24} className="text-muted/60" />
                <p className="text-xs font-medium">No upcoming company events</p>
              </div>
            )}
          </div>

          <div className="p-3 bg-surface-subtle border-t border-border-subtle text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/events');
              }}
              className="text-xs font-bold text-foreground hover:text-primary transition-colors"
            >
              Open Event Planner
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

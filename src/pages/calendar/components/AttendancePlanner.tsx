import { useState } from 'react';
import {
  Clock,
  MapPin,
  Users,
  Calendar as CalendarIcon,
  Sparkles,
  Home,
} from 'lucide-react';
import { useGetEventsQuery } from '@/store/api/eventApiSlice';
import type { ERPEvent, AttendanceRequest } from '@/types/models';
import { parseDateOnly } from '@/utils/date';

interface AttendancePlannerProps {
  selectedDate: Date;
  requests?: AttendanceRequest[];
  isAdmin?: boolean;
  onApprove?: (id: string | number, comment?: string) => Promise<boolean | void>;
  onReject?: (id: string | number, comment?: string) => Promise<boolean | void>;
  onRequestClick?: (request: AttendanceRequest) => void;
}

export function AttendancePlanner({
  selectedDate,
  requests = [],
  isAdmin = false,
  onApprove,
  onReject,
  onRequestClick,
}: AttendancePlannerProps) {
  const { data: events = [], isLoading } = useGetEventsQuery();
  const [processingId, setProcessingId] = useState<string | number | null>(null);

  const dateStr = selectedDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Scheduled events on selected date
  const dailyTotalEvents = events.filter((event: ERPEvent) => {
    const eventDate = new Date(event.event_date);
    return eventDate.toDateString() === selectedDate.toDateString();
  });
  const dailyEvents = dailyTotalEvents.slice(0, 3);

  // WFH and Leave requests on selected date
  const dailyRequests = requests.filter((req) => {
    if (!req.start_date) return false;
    const start = parseDateOnly(req.start_date);
    const end = parseDateOnly(req.end_date || req.start_date);
    if (!start || !end) return false;

    const sel = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    sel.setHours(0, 0, 0, 0);

    return sel >= start && sel <= end;
  });

  const handleQuickApprove = async (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    if (!onApprove) return;
    setProcessingId(id);
    try {
      await onApprove(id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleQuickReject = async (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    if (!onReject) return;
    setProcessingId(id);
    try {
      await onReject(id);
    } finally {
      setProcessingId(null);
    }
  };

  const hasAnyActivity = dailyRequests.length > 0 || dailyTotalEvents.length > 0;

  return (
    <div className="flex flex-col gap-6 bg-white p-7 rounded-[40px] border border-border-subtle shadow-soft h-full transition-all duration-500 hover:shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle/50 pb-5">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-xl font-black text-foreground">Daily Planner</h3>
          <span className="text-xs font-bold text-primary uppercase tracking-widest">
            {dateStr}
          </span>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <CalendarIcon size={20} />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* WFH & Leave Requests Section */}
        {dailyRequests.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-surface-subtle rounded-2xl border border-border-subtle/50">
              <span className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <Home size={14} className="text-primary" />
                Work Requests ({dailyRequests.length})
              </span>
              <span className="text-[10px] font-bold text-muted">Daily Presence</span>
            </div>

            <div className="flex flex-col gap-3">
              {dailyRequests.map((req) => {
                const isPending = (req.status || '').toLowerCase() === 'pending';
                const isApproved = (req.status || '').toLowerCase() === 'approved';
                const isProcessing = processingId === req.id;

                return (
                  <div
                    key={req.id}
                    onClick={() => onRequestClick?.(req)}
                    className="p-3.5 rounded-2xl border border-border-subtle bg-surface-subtle/40 hover:bg-white hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="text-xs font-black text-foreground">
                          {req.username || 'Employee'}
                        </h5>
                        <p className="text-[10px] text-muted font-medium">{req.type}</p>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 ${
                          isPending
                            ? 'bg-amber-500/15 text-amber-700 border border-amber-500/30'
                            : isApproved
                              ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-700 border border-rose-500/30'
                        }`}>
                        {req.status}
                      </span>
                    </div>

                    {req.reason && (
                      <p className="text-[11px] font-medium text-foreground/80 italic line-clamp-2">
                        "{req.reason}"
                      </p>
                    )}

                    {/* Quick Approve/Reject buttons for admin if pending */}
                    {isAdmin && isPending && (
                      <div className="flex items-center gap-2 pt-2 border-t border-border-subtle/40 mt-1">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={(e) => handleQuickReject(e, req.id)}
                          className="flex-1 py-1.5 rounded-xl text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer">
                          Reject
                        </button>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={(e) => handleQuickApprove(e, req.id)}
                          className="flex-1 py-1.5 rounded-xl text-[10px] font-black text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer">
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scheduled Events Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-surface-subtle rounded-2xl border border-border-subtle/50">
            <Sparkles size={14} className="text-primary animate-pulse" />
            <span className="text-xs font-black text-foreground uppercase tracking-wider">
              Scheduled Events ({dailyTotalEvents.length})
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {dailyEvents.map((event) => (
              <div
                key={event.id}
                className="group relative pl-4 border-l-2 border-primary/30 hover:border-primary transition-all duration-300">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                      {event.time}
                    </span>
                    <span className="text-[10px] font-bold text-muted bg-surface-subtle px-2 py-0.5 rounded-md">
                      {event.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-foreground group-hover:text-primary transition-colors cursor-pointer line-clamp-1">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-3 text-[10px] text-muted font-bold">
                    <div className="flex items-center gap-1">
                      <MapPin size={10} />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={10} />
                      <span>{event.attendees} going</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {!hasAnyActivity && (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-3 opacity-40">
                <Clock size={32} />
                <p className="text-xs font-bold">
                  {isLoading ? 'Syncing schedule...' : 'No events or requests for this day.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Footer Tip */}
      <div className="mt-auto pt-4 border-t border-border-subtle/50">
        <div className="bg-surface-subtle p-3.5 rounded-2xl border border-dashed border-border-strong/40 flex flex-col gap-1.5">
          <span className="text-[9px] font-black text-muted uppercase tracking-widest">
            Workspace Tip
          </span>
          <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
            Planning your week ahead increases productivity. Check pending team approvals regularly!
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Building2,
  Calendar as CalendarIcon,
  Sun,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { AttendanceRecord, AttendanceRequest } from '@/types/models';
import { formatDate, parseDateOnly } from '@/utils/date';

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
  requests?: AttendanceRequest[];
  onDateSelect: (date: Date) => void;
  onRequestClick?: (request: AttendanceRequest) => void;
  selectedDate?: Date;
}

interface HoverTooltipData {
  request: AttendanceRequest;
  x: number;
  y: number;
  showBelow: boolean;
}

export function AttendanceCalendar({
  records,
  requests = [],
  onDateSelect,
  onRequestClick,
  selectedDate,
}: AttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredTooltip, setHoveredTooltip] = useState<HoverTooltipData | null>(null);

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const numDays = daysInMonth(currentMonth.getMonth(), currentMonth.getFullYear());
  const offset = firstDayOfMonth(currentMonth.getMonth(), currentMonth.getFullYear());

  const getDayRecord = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return records.find((r) => r.date && (r.date === dateStr || r.date.startsWith(dateStr)));
  };

  const getDayRequests = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    d.setHours(0, 0, 0, 0);

    return requests.filter((req) => {
      if (!req.start_date) return false;
      const start = parseDateOnly(req.start_date);
      const end = parseDateOnly(req.end_date || req.start_date);
      if (!start || !end) return false;

      return d >= start && d <= end;
    });
  };

  const getDayTypeIcon = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('home')) return <Home size={11} className="shrink-0" />;
    if (lower.includes('leave') || lower.includes('day off'))
      return <CalendarIcon size={11} className="shrink-0" />;
    if (lower.includes('holiday')) return <Sun size={11} className="shrink-0" />;
    return <Building2 size={11} className="shrink-0" />;
  };

  const getStatusStyles = (status?: string) => {
    switch ((status || '').toLowerCase()) {
      case 'pending':
        return {
          card: 'bg-amber-500/10 text-amber-800 border-amber-300/80 hover:bg-amber-500/20 hover:border-amber-400',
          dot: 'bg-amber-500 animate-pulse',
          label: 'Pending',
        };
      case 'approved':
        return {
          card: 'bg-emerald-500/10 text-emerald-800 border-emerald-300/80 hover:bg-emerald-500/20 hover:border-emerald-400',
          dot: 'bg-emerald-500',
          label: 'Approved',
        };
      case 'rejected':
        return {
          card: 'bg-rose-500/10 text-rose-800 border-rose-300/80 hover:bg-rose-500/20 hover:border-rose-400',
          dot: 'bg-rose-500',
          label: 'Rejected',
        };
      default:
        return {
          card: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15',
          dot: 'bg-primary',
          label: status || 'Active',
        };
    }
  };

  return (
    <div className="bg-white rounded-[40px] border border-border-subtle shadow-soft overflow-hidden animate-in fade-in duration-700 relative">
      {/* Calendar Header */}
      <div className="p-8 flex items-center justify-between border-b border-border-subtle/50">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-foreground">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs font-bold text-muted uppercase tracking-widest italic">
              Attendance & Approval Journey
            </span>
            <div className="flex items-center gap-2 text-[10px] font-black pl-3 border-l border-border-subtle">
              <span className="flex items-center gap-1 text-amber-600">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Pending
              </span>
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Approved
              </span>
              <span className="flex items-center gap-1 text-rose-600">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Rejected
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-12 h-12 rounded-2xl bg-surface-subtle hover:bg-surface-elevated flex items-center justify-center transition-all cursor-pointer">
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="w-12 h-12 rounded-2xl bg-surface-subtle hover:bg-surface-elevated flex items-center justify-center transition-all cursor-pointer">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 border-b border-border-subtle/30">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-4 text-center text-[10px] font-black text-muted uppercase tracking-widest bg-surface-subtle/30">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {Array.from({ length: offset }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="h-32 border-r border-b border-border-subtle/10 bg-surface-subtle/10"
          />
        ))}

        {Array.from({ length: numDays }).map((_, i) => {
          const day = i + 1;
          const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const isSelected =
            selectedDate &&
            cellDate.getDate() === selectedDate.getDate() &&
            cellDate.getMonth() === selectedDate.getMonth() &&
            cellDate.getFullYear() === selectedDate.getFullYear();

          const dayRecord = getDayRecord(day);
          const dayRequests = getDayRequests(day);

          return (
            <div
              key={day}
              onClick={() => onDateSelect(cellDate)}
              className={cn(
                'min-h-[136px] border-r border-b border-border-subtle/20 p-2.5 transition-all duration-300 hover:bg-primary/5 cursor-pointer relative group flex flex-col justify-between',
                isSelected && 'bg-primary/5 ring-2 ring-primary/40 ring-inset'
              )}>
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-colors',
                    isSelected
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-foreground group-hover:text-primary'
                  )}>
                  {day}
                </span>

                {dayRequests.length > 0 && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-surface-subtle text-muted">
                    {dayRequests.length} {dayRequests.length === 1 ? 'req' : 'reqs'}
                  </span>
                )}
              </div>

              {/* Items in Cell */}
              <div className="flex flex-col gap-1.5 my-1">
                {dayRequests.slice(0, 2).map((req) => {
                  const statusInfo = getStatusStyles(req.status);
                  return (
                    <div
                      key={req.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestClick?.(req);
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const showBelow = rect.top < 240;
                        setHoveredTooltip({
                          request: req,
                          x: Math.min(
                            Math.max(rect.left + rect.width / 2, 160),
                            window.innerWidth - 160
                          ),
                          y: showBelow ? rect.bottom + 8 : rect.top - 8,
                          showBelow,
                        });
                      }}
                      onMouseLeave={() => setHoveredTooltip(null)}
                      className={cn(
                        'flex flex-col gap-0.5 px-2 py-1 rounded-xl border text-[9px] font-black transition-all shadow-2xs',
                        statusInfo.card
                      )}>
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 truncate">
                          {getDayTypeIcon(req.type)}
                          <span className="truncate">
                            {req.username ? req.username.split(' ')[0] : req.type}
                          </span>
                        </div>
                        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', statusInfo.dot)} />
                      </div>
                      <div className="flex items-center justify-between text-[8px] opacity-80">
                        <span className="truncate uppercase font-bold">{req.type}</span>
                        <span className="capitalize">{statusInfo.label}</span>
                      </div>
                    </div>
                  );
                })}

                {dayRequests.length > 2 && (
                  <span className="text-[9px] font-black text-primary text-center">
                    +{dayRequests.length - 2} more
                  </span>
                )}

                {dayRequests.length === 0 && dayRecord && (
                  <div className="flex items-center gap-1 p-1.5 rounded-xl bg-surface-subtle text-[9px] font-bold text-muted border border-border-subtle/40">
                    <Building2 size={10} className="text-primary shrink-0" />
                    <span className="truncate">{dayRecord.type}</span>
                  </div>
                )}
              </div>

              <div className="h-1" />
            </div>
          );
        })}
      </div>

      {/* Floating Hover Tooltip: fixed coordinates with dynamic flip so it is NEVER clipped */}
      {hoveredTooltip && (
        <div
          style={{
            position: 'fixed',
            left: `${hoveredTooltip.x}px`,
            top: `${hoveredTooltip.y}px`,
            transform: hoveredTooltip.showBelow ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
            zIndex: 9999,
          }}
          className="w-72 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-border-subtle shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-border-subtle/50">
            <div>
              <h5 className="text-xs font-black text-foreground">
                {hoveredTooltip.request.username || 'Attendance Request'}
              </h5>
              <p className="text-[10px] text-muted font-medium">
                {hoveredTooltip.request.department || hoveredTooltip.request.email || 'Team Member'}
              </p>
            </div>
            <span
              className={cn(
                'px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider',
                getStatusStyles(hoveredTooltip.request.status).card
              )}>
              {hoveredTooltip.request.status}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 text-[11px]">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <CalendarIcon size={12} className="text-primary shrink-0" />
              <span>
                {formatDate(hoveredTooltip.request.start_date)}
                {hoveredTooltip.request.end_date &&
                formatDate(hoveredTooltip.request.end_date) !==
                  formatDate(hoveredTooltip.request.start_date)
                  ? ` to ${formatDate(hoveredTooltip.request.end_date)}`
                  : ''}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-muted">
              <span className="font-black uppercase text-[9px]">Type:</span>
              <span className="font-bold text-foreground">{hoveredTooltip.request.type}</span>
            </div>

            <div className="mt-1 p-2 rounded-xl bg-surface-subtle border border-border-subtle/50">
              <span className="text-[9px] font-black uppercase tracking-wider text-muted block mb-0.5">
                Reason
              </span>
              <p className="text-[10px] font-medium text-foreground italic line-clamp-3">
                "{hoveredTooltip.request.reason || 'No description provided.'}"
              </p>
            </div>

            {hoveredTooltip.request.approver_name && (
              <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold mt-1">
                <ShieldCheck size={12} />
                <span>Approved by {hoveredTooltip.request.approver_name}</span>
              </div>
            )}

            {hoveredTooltip.request.admin_comment && (
              <div className="flex items-center gap-1 text-[10px] text-rose-700 font-bold mt-1">
                <AlertCircle size={12} />
                <span>Note: "{hoveredTooltip.request.admin_comment}"</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

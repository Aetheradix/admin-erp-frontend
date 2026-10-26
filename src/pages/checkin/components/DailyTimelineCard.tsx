import React from 'react';
import {
  Clock,
  LogIn,
  LogOut,
  Coffee,
  Calendar as CalendarIcon,
  AlertTriangle,
  Zap,
  MapPin,
  Home,
  Building,
  MessageSquare,
} from 'lucide-react';
import { formatFullDate } from '@/utils/date';
import {
  formatHoursAndMinutes,
  formatMinutes,
  type DayDetailedRecord,
} from '../utils/attendanceUtils';

interface DailyTimelineCardProps {
  selectedDate: Date;
  record?: DayDetailedRecord;
}

export const DailyTimelineCard: React.FC<DailyTimelineCardProps> = ({ selectedDate, record }) => {
  const isWeekend = record?.status === 'Weekend';
  const isHoliday = record?.status === 'Holiday';
  const isLeave = record?.status === 'On Leave';

  return (
    <div className="bg-surface-elevated rounded-[40px] p-6 sm:p-8 border border-border-subtle shadow-xl flex flex-col gap-6 transition-all hover:shadow-2xl h-full">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-5">
        <div>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest block">
            Daily Timeline
          </span>
          <h3 className="text-xl font-black text-foreground mt-0.5">
            {formatFullDate(selectedDate)}
          </h3>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
          <CalendarIcon size={20} />
        </div>
      </div>

      {/* Non-working day callouts */}
      {isWeekend && (
        <div className="py-12 flex flex-col items-center justify-center text-center gap-3 bg-surface-subtle/50 rounded-3xl border border-dashed border-border-subtle p-6">
          <CalendarIcon size={36} className="text-muted/60" />
          <h4 className="text-sm font-black text-foreground">Weekend Off</h4>
          <p className="text-xs font-medium text-muted">
            No attendance activity logged for weekend days.
          </p>
        </div>
      )}

      {isHoliday && (
        <div className="py-12 flex flex-col items-center justify-center text-center gap-3 bg-purple-500/5 rounded-3xl border border-dashed border-purple-500/20 p-6">
          <CalendarIcon size={36} className="text-purple-500" />
          <h4 className="text-sm font-black text-purple-600 dark:text-purple-400">
            Official Holiday
          </h4>
          <p className="text-xs font-medium text-muted">{record.notes || 'Company Holiday'}</p>
        </div>
      )}

      {isLeave && (
        <div className="py-12 flex flex-col items-center justify-center text-center gap-3 bg-blue-500/5 rounded-3xl border border-dashed border-blue-500/20 p-6">
          <CalendarIcon size={36} className="text-blue-500" />
          <h4 className="text-sm font-black text-blue-600 dark:text-blue-400">On Approved Leave</h4>
          <p className="text-xs font-medium text-muted">
            {record.notes || 'Casual / Medical Leave'}
          </p>
        </div>
      )}

      {/* Normal Attendance Day Details */}
      {!isWeekend && !isHoliday && !isLeave && record && (
        <div className="flex flex-col gap-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-subtle p-4 rounded-2xl border border-border-subtle">
              <span className="text-[9px] font-black text-muted uppercase tracking-widest block">
                Net Working
              </span>
              <span className="text-lg font-black text-primary block mt-1">
                {formatHoursAndMinutes(record.netWorkingHours)}
              </span>
              <span className="text-[9px] font-bold text-muted mt-0.5 block">
                Gross: {formatHoursAndMinutes(record.grossWorkingHours)}
              </span>
            </div>

            <div className="bg-surface-subtle p-4 rounded-2xl border border-border-subtle">
              <span className="text-[9px] font-black text-muted uppercase tracking-widest block">
                Total Break
              </span>
              <span className="text-lg font-black text-amber-500 block mt-1">
                {formatMinutes(record.totalBreakMinutes)}
              </span>
              <span className="text-[9px] font-bold text-muted mt-0.5 block">
                {record.breaks.length} break session{record.breaks.length === 1 ? '' : 's'}
              </span>
            </div>

            {record.isLate && (
              <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 col-span-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertTriangle size={16} />
                  <span className="text-xs font-black uppercase">Late Arrival</span>
                </div>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                  +{record.lateMinutes} mins late
                </span>
              </div>
            )}

            {record.overtimeHours > 0 && (
              <div className="bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20 col-span-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <Zap size={16} />
                  <span className="text-xs font-black uppercase">Overtime</span>
                </div>
                <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                  +{record.overtimeHours} hours
                </span>
              </div>
            )}
          </div>

          {/* Visual Activity Timeline */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black text-muted uppercase tracking-widest">
              Chronological Timeline
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-subtle">
              {/* Check In Event */}
              {record.checkIn && (
                <div className="relative flex items-start gap-3 group">
                  <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full text-white flex items-center justify-center shadow-sm ${
                    record.isLate ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}>
                    <LogIn size={11} />
                  </div>
                  <div className={`flex-1 p-3 rounded-2xl border ${
                    record.isLate
                      ? 'bg-amber-500/5 border-amber-500/25'
                      : 'bg-surface-subtle border-border-subtle'
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-foreground">First Check-In</span>
                        {record.isLate && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider">
                            <AlertTriangle size={9} />
                            LATE CHECK-IN · +{record.lateMinutes}m
                          </span>
                        )}
                      </div>
                      <span className={`text-xs font-black shrink-0 ${
                        record.isLate ? 'text-amber-500' : 'text-emerald-500'
                      }`}>{record.checkIn}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold mt-1">
                      {record.is_wfh || record.work_mode === 'wfh' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 font-bold">
                          <Home size={10} /> Work From Home
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-bold">
                          <Building size={10} /> In-Office
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-muted">
                        <MapPin size={10} className="text-primary" /> {record.check_in_location || record.location || 'Office HQ'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Breaks */}
              {record.breaks.map((b) => {
                const isOverTime = b.isOverTime || (b.maxAllowedMinutes != null && b.durationMinutes > b.maxAllowedMinutes);
                const overBy = b.maxAllowedMinutes != null ? b.durationMinutes - b.maxAllowedMinutes : 0;
                return (
                  <div key={b.id} className="relative flex items-start gap-3 group">
                    {/* Timeline dot — red if over limit */}
                    <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full text-white flex items-center justify-center shadow-sm ${
                      isOverTime ? 'bg-red-500' : 'bg-amber-500'
                    }`}>
                      <Coffee size={11} />
                    </div>

                    <div className={`flex-1 p-3 rounded-2xl border transition-all ${
                      isOverTime
                        ? 'bg-red-500/5 border-red-500/25'
                        : 'bg-surface-subtle border-border-subtle'
                    }`}>
                      {/* Header row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-foreground">{b.label}</span>
                          {isOverTime && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-500 text-white text-[9px] font-black uppercase tracking-wider">
                              <AlertTriangle size={9} />
                              OVER LIMIT {overBy > 0 ? `+${overBy}m` : ''}
                            </span>
                          )}
                          {b.maxAllowedMinutes && !isOverTime && (
                            <span className="text-[9px] font-bold text-muted">
                              (Limit: {b.maxAllowedMinutes}m)
                            </span>
                          )}
                        </div>
                        <span className={`text-xs font-black shrink-0 ${isOverTime ? 'text-red-500' : 'text-amber-500'}`}>
                          {formatMinutes(b.durationMinutes)}
                        </span>
                      </div>

                      {/* Time range */}
                      <span className="text-[10px] font-bold text-muted mt-1 block">
                        {b.startTime} – {b.endTime}
                      </span>

                      {/* Employee Remark — white bg, bold text, icon */}
                      {b.remark && (
                        <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-xl bg-white dark:bg-surface-elevated border border-border-subtle shadow-sm">
                          <MessageSquare size={12} className={`shrink-0 mt-0.5 ${isOverTime ? 'text-red-500' : 'text-amber-500'}`} />
                          <span className="text-[11px] font-black text-foreground">{b.remark}</span>
                        </div>
                      )}

                      {/* Over-time advisory */}
                      {isOverTime && overBy > 0 && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <AlertTriangle size={10} className="text-red-400 shrink-0" />
                          <p className="text-[9px] font-black text-red-400">
                            Returned {overBy} min late from break — marked for review
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Check Out Event */}
              {record.checkOut && (
                <div className="relative flex items-start gap-3 group">
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-600 text-white flex items-center justify-center shadow-sm">
                    <LogOut size={11} />
                  </div>
                  <div className="flex-1 bg-surface-subtle p-3 rounded-2xl border border-border-subtle">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-foreground">Last Check-Out</span>
                      <span className="text-xs font-black text-muted">{record.checkOut}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-muted mt-1">
                      <span>Completed Shift</span>
                      {record.check_out_location && (
                        <span className="inline-flex items-center gap-1 text-muted">
                          <MapPin size={10} /> {record.check_out_location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fallback when no record is available for date */}
      {!isWeekend && !isHoliday && !isLeave && !record && (
        <div className="py-12 flex flex-col items-center justify-center text-center gap-3 opacity-60">
          <Clock size={36} />
          <p className="text-xs font-bold text-muted">
            No attendance activity logged for this date.
          </p>
        </div>
      )}
    </div>
  );
};

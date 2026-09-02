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
    CheckCircle2,
} from 'lucide-react';
import { formatFullDate } from '@/utils/date';
import { formatHoursAndMinutes, formatMinutes, type DayDetailedRecord } from '../utils/attendanceUtils';

interface DailyTimelineCardProps {
    selectedDate: Date;
    record?: DayDetailedRecord;
}

export const DailyTimelineCard: React.FC<DailyTimelineCardProps> = ({
    selectedDate,
    record,
}) => {
    const isWeekend = record?.status === 'Weekend';
    const isHoliday = record?.status === 'Holiday';
    const isLeave = record?.status === 'On Leave';

    return (
        <div className="bg-surface-elevated rounded-[40px] p-6 sm:p-8 border border-border-subtle shadow-xl flex flex-col gap-6 transition-all hover:shadow-2xl h-full">
            {/* Header Info */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-5">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest block">Daily Timeline</span>
                    <h3 className="text-xl font-black text-foreground mt-0.5">{formatFullDate(selectedDate)}</h3>
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
                    <p className="text-xs font-medium text-muted">No attendance activity logged for weekend days.</p>
                </div>
            )}

            {isHoliday && (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-3 bg-purple-500/5 rounded-3xl border border-dashed border-purple-500/20 p-6">
                    <CalendarIcon size={36} className="text-purple-500" />
                    <h4 className="text-sm font-black text-purple-600 dark:text-purple-400">Official Holiday</h4>
                    <p className="text-xs font-medium text-muted">{record.notes || 'Company Holiday'}</p>
                </div>
            )}

            {isLeave && (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-3 bg-blue-500/5 rounded-3xl border border-dashed border-blue-500/20 p-6">
                    <CalendarIcon size={36} className="text-blue-500" />
                    <h4 className="text-sm font-black text-blue-600 dark:text-blue-400">On Approved Leave</h4>
                    <p className="text-xs font-medium text-muted">{record.notes || 'Casual / Medical Leave'}</p>
                </div>
            )}

            {/* Normal Attendance Day Details */}
            {!isWeekend && !isHoliday && !isLeave && record && (
                <div className="flex flex-col gap-6">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-surface-subtle p-4 rounded-2xl border border-border-subtle">
                            <span className="text-[9px] font-black text-muted uppercase tracking-widest block">Net Working</span>
                            <span className="text-lg font-black text-primary block mt-1">
                                {formatHoursAndMinutes(record.netWorkingHours)}
                            </span>
                            <span className="text-[9px] font-bold text-muted mt-0.5 block">
                                Gross: {formatHoursAndMinutes(record.grossWorkingHours)}
                            </span>
                        </div>

                        <div className="bg-surface-subtle p-4 rounded-2xl border border-border-subtle">
                            <span className="text-[9px] font-black text-muted uppercase tracking-widest block">Total Break</span>
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
                        <h4 className="text-xs font-black text-muted uppercase tracking-widest">Chronological Timeline</h4>

                        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-subtle">
                            {/* Check In Event */}
                            {record.checkIn && (
                                <div className="relative flex items-start gap-3 group">
                                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                                        <LogIn size={11} />
                                    </div>
                                    <div className="flex-1 bg-surface-subtle p-3 rounded-2xl border border-border-subtle">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black text-foreground">First Check-In</span>
                                            <span className="text-xs font-black text-emerald-500">{record.checkIn}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted mt-1">
                                            <MapPin size={10} /> {record.location || 'Main Office'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Breaks */}
                            {record.breaks.map((b) => (
                                <div key={b.id} className="relative flex items-start gap-3 group">
                                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm">
                                        <Coffee size={11} />
                                    </div>
                                    <div className="flex-1 bg-surface-subtle p-3 rounded-2xl border border-border-subtle">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black text-foreground">{b.label}</span>
                                            <span className="text-xs font-black text-amber-500">{formatMinutes(b.durationMinutes)}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-muted mt-1 block">
                                            {b.startTime} – {b.endTime}
                                        </span>
                                    </div>
                                </div>
                            ))}

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
                                        <span className="text-[10px] font-bold text-muted mt-1 block">Completed Shift</span>
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
                    <p className="text-xs font-bold text-muted">No attendance activity logged for this date.</p>
                </div>
            )}
        </div>
    );
};

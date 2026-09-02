import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Calendar as CalendarIcon, Sun, Home, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { DayDetailedRecord } from '../utils/attendanceUtils';

interface AttendanceCalendarGridProps {
    currentMonth: Date;
    onChangeMonth: (newMonth: Date) => void;
    records: DayDetailedRecord[];
    selectedDate: Date;
    onSelectDate: (date: Date, record?: DayDetailedRecord) => void;
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const AttendanceCalendarGrid: React.FC<AttendanceCalendarGridProps> = ({
    currentMonth,
    onChangeMonth,
    records,
    selectedDate,
    onSelectDate,
}) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOffset = new Date(year, month, 1).getDay();

    const handlePrevMonth = () => onChangeMonth(new Date(year, month - 1, 1));
    const handleNextMonth = () => onChangeMonth(new Date(year, month + 1, 1));

    const getRecordForDay = (day: number): DayDetailedRecord | undefined => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return records.find((r) => r.date === dateStr);
    };

    const getStatusBadgeStyle = (status?: string) => {
        switch (status) {
            case 'Present':
                return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'Late':
                return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
            case 'Absent':
                return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
            case 'On Leave':
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
            case 'Holiday':
                return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
            case 'Half Day':
                return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20';
            case 'Weekend':
                return 'bg-surface-subtle text-muted/60 border-transparent';
            default:
                return 'bg-surface-subtle text-muted border-transparent';
        }
    };

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'Present':
                return <CheckCircle2 size={10} />;
            case 'Late':
                return <AlertTriangle size={10} />;
            case 'Absent':
                return <AlertTriangle size={10} />;
            case 'On Leave':
                return <CalendarIcon size={10} />;
            case 'Holiday':
                return <Sun size={10} />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-surface-elevated rounded-[40px] border border-border-subtle shadow-xl overflow-hidden flex flex-col transition-all hover:shadow-2xl">
            {/* Calendar Header */}
            <div className="p-6 sm:p-8 flex items-center justify-between border-b border-border-subtle">
                <div>
                    <h3 className="text-2xl font-black text-foreground tracking-tight">
                        {MONTH_NAMES[month]} {year}
                    </h3>
                    <p className="text-xs font-bold text-muted mt-0.5">Click any day to view complete shift timeline</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrevMonth}
                        className="w-11 h-11 rounded-2xl bg-surface-subtle hover:bg-surface-elevated flex items-center justify-center text-foreground border border-border-subtle transition-all active:scale-95 cursor-pointer"
                        title="Previous Month"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="w-11 h-11 rounded-2xl bg-surface-subtle hover:bg-surface-elevated flex items-center justify-center text-foreground border border-border-subtle transition-all active:scale-95 cursor-pointer"
                        title="Next Month"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Weekday Header Bar */}
            <div className="grid grid-cols-7 border-b border-border-subtle/50 bg-surface-subtle/40">
                {WEEK_DAYS.map((day) => (
                    <div
                        key={day}
                        className="py-3 text-center text-[10px] font-black text-muted uppercase tracking-widest"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 auto-rows-fr">
                {/* Leading empty cells for offset */}
                {Array.from({ length: firstDayOffset }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-28 sm:h-32 border-r border-b border-border-subtle/20 bg-surface-subtle/10" />
                ))}

                {/* Days of month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const cellDate = new Date(year, month, dayNum);
                    const record = getRecordForDay(dayNum);
                    const isSelected =
                        selectedDate.getFullYear() === year &&
                        selectedDate.getMonth() === month &&
                        selectedDate.getDate() === dayNum;
                    const isToday =
                        new Date().getFullYear() === year &&
                        new Date().getMonth() === month &&
                        new Date().getDate() === dayNum;

                    return (
                        <div
                            key={dayNum}
                            onClick={() => onSelectDate(cellDate, record)}
                            className={cn(
                                'h-28 sm:h-32 border-r border-b border-border-subtle/20 p-2 sm:p-3 transition-all cursor-pointer relative group flex flex-col justify-between',
                                isSelected ? 'bg-primary/10 ring-2 ring-primary ring-inset z-10' : 'hover:bg-surface-subtle/80',
                                isToday && !isSelected ? 'bg-primary/5' : ''
                            )}
                        >
                            {/* Day Number & Today indicator */}
                            <div className="flex items-center justify-between">
                                <span
                                    className={cn(
                                        'text-sm font-black transition-colors',
                                        isSelected ? 'text-primary' : isToday ? 'text-primary font-black' : 'text-foreground'
                                    )}
                                >
                                    {dayNum}
                                </span>
                                {isToday && (
                                    <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md bg-primary text-white">
                                        Today
                                    </span>
                                )}
                            </div>

                            {/* Status Badge Content */}
                            {record && (
                                <div className="flex flex-col gap-1 mt-auto">
                                    <div
                                        className={cn(
                                            'px-2 py-1 rounded-xl border text-[9px] font-black uppercase tracking-tighter flex items-center justify-between gap-1 transition-transform group-hover:scale-[1.02]',
                                            getStatusBadgeStyle(record.status)
                                        )}
                                    >
                                        <div className="flex items-center gap-1 truncate">
                                            {getStatusIcon(record.status)}
                                            <span className="truncate">{record.status}</span>
                                        </div>
                                        {record.isLate && <span className="text-[8px] font-bold">+{record.lateMinutes}m</span>}
                                    </div>

                                    {record.checkIn && (
                                        <div className="text-[8px] font-bold text-muted tracking-tight truncate pl-1 flex items-center gap-1">
                                            <Clock size={8} />
                                            <span>{record.checkIn}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend Footer */}
            <div className="p-4 sm:p-5 bg-surface-subtle/50 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3 text-[10px] font-bold text-muted">
                <span className="uppercase tracking-widest font-black">Status Legend:</span>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span>Present</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span>Late</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span>Absent</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span>On Leave</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        <span>Holiday</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-muted/50" />
                        <span>Weekend</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

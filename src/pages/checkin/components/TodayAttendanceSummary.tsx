import React from 'react';
import { Button } from '@/components/ui/primitives/Button';
import {
    LogIn,
    LogOut,
    Coffee,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Hourglass,
    Activity,
    Smile,
    Meh,
    Frown,
} from 'lucide-react';
import { formatTime, formatFullDate } from '@/utils/date';
import type { AttendanceStatus } from '@/types/models';

interface TodayAttendanceSummaryProps {
    time: Date;
    status?: AttendanceStatus | null;
    selectedMood: number | null;
    isLoading: boolean;
    isSubmittingMood: boolean;
    isBreakLoading: boolean;
    handleAttendance: () => void;
    handleBreak: () => void;
    logMood: (score: number, label: string) => void;
    liveWorkingTime: string;
    checkInTimeDisplay: string;
    checkOutTimeDisplay: string;
    totalBreakDisplay: string;
    netWorkingDisplay: string;
    isLate: boolean;
    lateDurationDisplay: string;
    shiftTimingDisplay: string;
}

const MOODS = [
    { value: 1, icon: Frown, label: 'Awful' },
    { value: 2, icon: Frown, label: 'Bad' },
    { value: 3, icon: Meh, label: 'Okay' },
    { value: 4, icon: Smile, label: 'Good' },
    { value: 5, icon: Smile, label: 'Great' },
];

export const TodayAttendanceSummary: React.FC<TodayAttendanceSummaryProps> = ({
    time,
    status,
    selectedMood,
    isLoading,
    isSubmittingMood,
    isBreakLoading,
    handleAttendance,
    handleBreak,
    logMood,
    liveWorkingTime,
    checkInTimeDisplay,
    checkOutTimeDisplay,
    totalBreakDisplay,
    netWorkingDisplay,
    isLate,
    lateDurationDisplay,
    shiftTimingDisplay,
}) => {
    const isCheckedIn = status?.status === 'checked-in';
    const isOnBreak = !!status?.onBreak;

    const getStatusBadge = () => {
        if (isOnBreak) {
            return (
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-black text-xs uppercase tracking-widest animate-pulse">
                    <Coffee size={14} /> ON BREAK
                </span>
            );
        }
        if (isCheckedIn) {
            return (
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-black text-xs uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> IN OFFICE
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-surface-subtle border border-border-subtle text-muted font-black text-xs uppercase tracking-widest">
                <LogOut size={14} /> CHECKED OUT
            </span>
        );
    };

    return (
        <div className="bg-surface-elevated rounded-[36px] p-6 sm:p-8 border border-border-subtle shadow-xl relative overflow-hidden flex flex-col gap-6 transition-all hover:shadow-2xl">
            {/* Top Header Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border-subtle/60 pb-5">
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm shrink-0">
                        <Clock size={22} />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h2 className="text-lg font-black text-foreground tracking-tight">Today's Attendance</h2>
                            {getStatusBadge()}
                        </div>
                        <p className="text-xs font-bold text-muted mt-0.5">{formatFullDate(time)}</p>
                    </div>
                </div>

                {/* Live Real-Time Digital Clock */}
                <div className="flex flex-col items-start sm:items-end shrink-0">
                    <span className="text-2xl sm:text-3xl font-black tracking-tighter text-foreground">
                        {formatTime(time)}
                    </span>
                    <span className="text-[9px] font-black text-primary/80 uppercase tracking-widest">
                        Real-Time Clock
                    </span>
                </div>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left Column: Action Control Hub */}
                <div className="lg:col-span-4 flex flex-col justify-between gap-4 bg-surface-subtle/50 p-5 rounded-[28px] border border-border-subtle">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted">Quick Actions</span>
                        <span className="text-[10px] font-bold text-muted">Shift: <strong className="text-foreground">{shiftTimingDisplay}</strong></span>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            variant={isCheckedIn ? 'ghost' : 'primary'}
                            aria-label={isCheckedIn ? 'Check Out' : 'Check In'}
                            className={`w-full h-14 rounded-2xl! text-sm shadow-lg ${isCheckedIn ? 'border-2 border-border-strong! hover:bg-surface-elevated' : 'shadow-primary/30'
                                } flex items-center justify-center gap-2.5 active:scale-95 transition-all cursor-pointer`}
                            onClick={handleAttendance}
                            loading={isLoading}
                            disabled={isLoading || isOnBreak}
                        >
                            {isCheckedIn ? <LogOut size={18} /> : <LogIn size={18} />}
                            <span className="font-black tracking-wider uppercase">
                                {isCheckedIn ? 'Check Out' : 'Check In'}
                            </span>
                        </Button>

                        <Button
                            variant={isOnBreak ? 'ghost' : 'secondary'}
                            aria-label={isOnBreak ? 'End Break' : 'Take Break'}
                            className={`w-full h-12 rounded-2xl! text-xs shadow-sm ${isOnBreak
                                    ? 'border-2 border-amber-500/40! text-amber-500 bg-amber-500/5'
                                    : 'bg-surface-elevated border border-border-subtle hover:border-primary/40'
                                } flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer`}
                            onClick={handleBreak}
                            loading={isBreakLoading}
                            disabled={isBreakLoading || !isCheckedIn}
                        >
                            <Coffee size={16} className={isOnBreak ? 'text-amber-500' : 'text-muted'} />
                            <span className="font-black tracking-wider uppercase">
                                {isOnBreak ? 'End Break' : 'Take Break'}
                            </span>
                        </Button>
                    </div>

                    {/* Integrated Mood Selector */}
                    <div className="pt-3 border-t border-border-subtle/50">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-black text-muted uppercase tracking-wider">How are you feeling today?</span>
                            {selectedMood && (
                                <span className="text-[9px] font-bold text-success flex items-center gap-1">
                                    <CheckCircle2 size={11} /> Saved
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between gap-1">
                            {MOODS.map((m) => (
                                <button
                                    key={m.value}
                                    onClick={() => logMood(m.value, m.label)}
                                    disabled={isSubmittingMood}
                                    title={`Feeling ${m.label}`}
                                    className={`flex-1 flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all border ${selectedMood === m.value
                                            ? 'bg-primary/10 border-primary/30 text-primary shadow-sm'
                                            : 'bg-surface-subtle border-transparent hover:bg-surface-elevated text-muted'
                                        }`}
                                >
                                    <m.icon size={15} />
                                    <span className="text-[8px] font-bold uppercase">{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Live Shift Metrics Cards (8 Cols) */}
                <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                    {/* Card 1: Check-in Time */}
                    <div className="bg-surface-subtle p-4 rounded-[22px] border border-border-subtle flex flex-col justify-between">
                        <div className="flex items-center justify-between text-muted">
                            <span className="text-[10px] font-black uppercase tracking-wider">Check In</span>
                            <LogIn size={15} className="text-primary" />
                        </div>
                        <div className="mt-2.5">
                            <span className="text-lg font-black text-foreground block">{checkInTimeDisplay}</span>
                            <span className="text-[9px] font-bold text-muted mt-0.5 block">First Punch Today</span>
                        </div>
                    </div>

                    {/* Card 2: Check-out Time */}
                    <div className="bg-surface-subtle p-4 rounded-[22px] border border-border-subtle flex flex-col justify-between">
                        <div className="flex items-center justify-between text-muted">
                            <span className="text-[10px] font-black uppercase tracking-wider">Check Out</span>
                            <LogOut size={15} className="text-muted" />
                        </div>
                        <div className="mt-2.5">
                            <span className="text-lg font-black text-foreground block">{checkOutTimeDisplay}</span>
                            <span className="text-[9px] font-bold text-muted mt-0.5 block">Last Punch Today</span>
                        </div>
                    </div>

                    {/* Card 3: Late Status */}
                    <div className="bg-surface-subtle p-4 rounded-[22px] border border-border-subtle flex flex-col justify-between">
                        <div className="flex items-center justify-between text-muted">
                            <span className="text-[10px] font-black uppercase tracking-wider">Punctuality</span>
                            {isLate ? <AlertTriangle size={15} className="text-warning" /> : <CheckCircle2 size={15} className="text-success" />}
                        </div>
                        <div className="mt-2.5">
                            {isLate ? (
                                <div>
                                    <span className="text-sm font-black text-warning block">LATE</span>
                                    <span className="text-[9px] font-bold text-warning/80 mt-0.5 block">{lateDurationDisplay}</span>
                                </div>
                            ) : (
                                <div>
                                    <span className="text-sm font-black text-success block">ON TIME</span>
                                    <span className="text-[9px] font-bold text-muted mt-0.5 block">Shift Window</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card 4: Live Session Timer */}
                    <div className="bg-surface-subtle p-4 rounded-[22px] border border-border-subtle flex flex-col justify-between">
                        <div className="flex items-center justify-between text-muted">
                            <span className="text-[10px] font-black uppercase tracking-wider">Current Session</span>
                            <Activity size={15} className="text-info" />
                        </div>
                        <div className="mt-2.5">
                            <span className="text-lg font-black text-foreground block">{liveWorkingTime}</span>
                            <span className="text-[9px] font-bold text-muted mt-0.5 block">Live Clock Elapsed</span>
                        </div>
                    </div>

                    {/* Card 5: Total Break */}
                    <div className="bg-surface-subtle p-4 rounded-[22px] border border-border-subtle flex flex-col justify-between">
                        <div className="flex items-center justify-between text-muted">
                            <span className="text-[10px] font-black uppercase tracking-wider">Total Break</span>
                            <Coffee size={15} className="text-amber-500" />
                        </div>
                        <div className="mt-2.5">
                            <span className="text-lg font-black text-foreground block">{totalBreakDisplay}</span>
                            <span className="text-[9px] font-bold text-muted mt-0.5 block">Cumulative Breaks</span>
                        </div>
                    </div>

                    {/* Card 6: Net Working Time */}
                    <div className="bg-surface-subtle p-4 rounded-[22px] border border-border-subtle flex flex-col justify-between bg-primary/5 border-primary/20">
                        <div className="flex items-center justify-between text-primary">
                            <span className="text-[10px] font-black uppercase tracking-wider">Net Working</span>
                            <Hourglass size={15} className="text-primary" />
                        </div>
                        <div className="mt-2.5">
                            <span className="text-lg font-black text-primary block">{netWorkingDisplay}</span>
                            <span className="text-[9px] font-bold text-primary/80 mt-0.5 block">Gross minus Breaks</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

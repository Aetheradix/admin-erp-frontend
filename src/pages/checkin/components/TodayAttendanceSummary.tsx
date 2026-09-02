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
    { value: 1, icon: Frown, label: 'Awful', color: 'text-error' },
    { value: 2, icon: Frown, label: 'Bad', color: 'text-warning' },
    { value: 3, icon: Meh, label: 'Okay', color: 'text-info' },
    { value: 4, icon: Smile, label: 'Good', color: 'text-success' },
    { value: 5, icon: Smile, label: 'Great', color: 'text-primary' },
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
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-black text-xs uppercase tracking-widest animate-pulse">
                    <Coffee size={14} /> ON BREAK
                </span>
            );
        }
        if (isCheckedIn) {
            return (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-black text-xs uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> IN OFFICE
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface-subtle border border-border-subtle text-muted font-black text-xs uppercase tracking-widest">
                <LogOut size={14} /> CHECKED OUT
            </span>
        );
    };

    return (
        <div className="bg-surface-elevated rounded-[40px] p-8 sm:p-10 border border-border-subtle shadow-xl relative overflow-hidden flex flex-col gap-8 transition-all hover:shadow-2xl">
            {/* Background Decorative Gradient Radial */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            {/* Top Header Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border-subtle/60 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                        <Clock size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-black text-foreground tracking-tight">Today's Attendance</h2>
                            {getStatusBadge()}
                        </div>
                        <p className="text-xs font-bold text-muted mt-1 tracking-wide">{formatFullDate(time)}</p>
                    </div>
                </div>

                {/* Live Real-Time Digital Clock */}
                <div className="flex flex-col items-start sm:items-end">
                    <span className="text-3xl font-black tracking-tighter text-foreground">
                        {formatTime(time)}
                    </span>
                    <span className="text-[10px] font-black text-primary/80 uppercase tracking-widest">
                        Real-time Clock
                    </span>
                </div>
            </div>

            {/* Main Grid: Clock Actions & Live Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Left Column: Action Control Hub (5 Cols) */}
                <div className="lg:col-span-5 flex flex-col justify-between gap-5 bg-surface-subtle/50 p-6 rounded-[32px] border border-border-subtle">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-widest text-muted">Attendance Actions</span>
                        <span className="text-[11px] font-bold text-muted">Shift: <strong className="text-foreground">{shiftTimingDisplay}</strong></span>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button
                            variant={isCheckedIn ? 'ghost' : 'primary'}
                            aria-label={isCheckedIn ? 'Check Out' : 'Check In'}
                            className={`w-full h-16 rounded-[22px]! text-base shadow-xl ${isCheckedIn ? 'border-2 border-border-strong! hover:bg-surface-elevated' : 'shadow-primary/30'
                                } flex items-center justify-center gap-3 active:scale-95 transition-all cursor-pointer`}
                            onClick={handleAttendance}
                            loading={isLoading}
                            disabled={isLoading || isOnBreak}
                        >
                            {isCheckedIn ? <LogOut size={20} /> : <LogIn size={20} />}
                            <span className="font-black tracking-widest uppercase">
                                {isCheckedIn ? 'Check Out' : 'Check In'}
                            </span>
                        </Button>

                        <Button
                            variant={isOnBreak ? 'ghost' : 'secondary'}
                            aria-label={isOnBreak ? 'End Break' : 'Take Break'}
                            className={`w-full h-14 rounded-[22px]! text-sm shadow-md ${isOnBreak ? 'border-2 border-amber-500/40! text-amber-500 bg-amber-500/5' : 'bg-surface-elevated border border-border-subtle hover:border-primary/40'
                                } flex items-center justify-center gap-3 active:scale-95 transition-all cursor-pointer`}
                            onClick={handleBreak}
                            loading={isBreakLoading}
                            disabled={isBreakLoading || !isCheckedIn}
                        >
                            <Coffee size={18} className={isOnBreak ? 'text-amber-500' : 'text-muted'} />
                            <span className="font-black tracking-widest uppercase">
                                {isOnBreak ? 'End Break' : 'Take Break'}
                            </span>
                        </Button>
                    </div>

                    {/* Integrated Mood Selector */}
                    <div className="pt-3 border-t border-border-subtle/50">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-muted uppercase tracking-widest">Employee Mood</span>
                            {selectedMood && (
                                <span className="text-[10px] font-bold text-success flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Logged
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between gap-1.5">
                            {MOODS.map((m) => (
                                <button
                                    key={m.value}
                                    onClick={() => logMood(m.value, m.label)}
                                    disabled={isSubmittingMood}
                                    title={`Feeling ${m.label}`}
                                    className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl transition-all border ${selectedMood === m.value
                                        ? 'bg-primary/10 border-primary/30 text-primary shadow-sm'
                                        : 'bg-surface-subtle border-transparent hover:bg-surface-elevated text-muted'
                                        }`}
                                >
                                    <m.icon size={16} />
                                    <span className="text-[8px] font-bold uppercase">{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Live Shift Metrics Matrix (7 Cols) */}
                <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {/* Card 1: Check-in Time */}
                    <div className="bg-surface-subtle p-5 rounded-[24px] border border-border-subtle flex flex-col justify-between">
                        <div className="flex items-center justify-between text-muted">
                            <span className="text-[10px] font-black uppercase tracking-wider">Check In</span>
                            <LogIn size={16} className="text-primary" />
                        </div>
                        <div className="mt-3">
                            <span className="text-xl font-black text-foreground block">{checkInTimeDisplay}</span>
                            <span className="text-[10px] font-bold text-muted mt-0.5 block">First Punch Today</span>
                        </div>
                    </div>

                    {/* Card 2: Check-out Time */}
                    <div className="bg-surface-subtle p-5 rounded-[24px] border border-border-subtle flex flex-col justify-between">
                        <div className="flex items-center justify-between text-muted">
                            <span className="text-[10px] font-black uppercase tracking-wider">Check Out</span>
                            <LogOut size={16} className="text-muted" />
                        </div>
                        <div className="mt-3">
                            <span className="text-xl font-black text-foreground block">{checkOutTimeDisplay}</span>
                            <span className="text-[10px] font-bold text-muted mt-0.5 block">Last Punch Today</span>
                        </div>
                    </div>

                    {/* Card 3: Late Status */}
                    <div className="bg-surface-subtle p-5 rounded-[24px] border border-border-subtle flex flex-col justify-between">
                        <div className="flex items-center justify-between text-muted">
                            <span className="text-[10px] font-black uppercase tracking-wider">Punctuality</span>
                            {isLate ? <AlertTriangle size={16} className="text-warning" /> : <CheckCircle2 size={16} className="text-success" />}
                        </div>
                        <div className="mt-3">
                            {isLate ? (
                                <div>
                                    <span className="text-sm font-black text-warning block">LATE</span>
                                    <span className="text-[10px] font-bold text-warning/80 mt-0.5 block">{lateDurationDisplay}</span>
                                </div>
                            ) : (
                                <div>
                                    <span className="text-sm font-black text-success block">ON TIME</span>
                                    <span className="text-[10px] font-bold text-muted mt-0.5 block">Within Shift Window</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card 4: Live Session Timer */}
                    <div className="bg-surface-subtle p-5 rounded-[24px] border border-border-subtle flex flex-col justify-between">
                        <div className="flex items-center justify-between text-muted">
                            <span className="text-[10px] font-black uppercase tracking-wider">Current Session</span>
                            <Activity size={16} className="text-info" />
                        </div>
                        <div className="mt-3">
                            <span className="text-xl font-black text-foreground block">{liveWorkingTime}</span>
                            <span className="text-[10px] font-bold text-muted mt-0.5 block">Live Clock Elapsed</span>
                        </div>
                    </div>

                    {/* Card 5: Total Break */}
                    <div className="bg-surface-subtle p-5 rounded-[24px] border border-border-subtle flex flex-col justify-between">
                        <div className="flex items-center justify-between text-muted">
                            <span className="text-[10px] font-black uppercase tracking-wider">Total Break</span>
                            <Coffee size={16} className="text-amber-500" />
                        </div>
                        <div className="mt-3">
                            <span className="text-xl font-black text-foreground block">{totalBreakDisplay}</span>
                            <span className="text-[10px] font-bold text-muted mt-0.5 block">Cumulative Breaks</span>
                        </div>
                    </div>

                    {/* Card 6: Net Working Time */}
                    <div className="bg-surface-subtle p-5 rounded-[24px] border border-border-subtle flex flex-col justify-between bg-primary/5 border-primary/20">
                        <div className="flex items-center justify-between text-primary">
                            <span className="text-[10px] font-black uppercase tracking-wider">Net Working</span>
                            <Hourglass size={16} className="text-primary" />
                        </div>
                        <div className="mt-3">
                            <span className="text-xl font-black text-primary block">{netWorkingDisplay}</span>
                            <span className="text-[10px] font-bold text-primary/80 mt-0.5 block">Gross minus Breaks</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

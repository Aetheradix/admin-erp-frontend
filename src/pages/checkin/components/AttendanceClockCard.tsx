import React from 'react';
import { Button } from '@/components/ui/primitives/Button';
import { LogIn, LogOut, Coffee } from 'lucide-react';
import { MoodSelector } from './MoodSelector';
import { formatTime, formatFullDate } from '@/utils/date';
import type { AttendanceStatus } from '@/types/models';

interface AttendanceClockCardProps {
    time: Date;
    status?: AttendanceStatus | null;
    selectedMood: number | null;
    isLoading: boolean;
    isSubmittingMood: boolean;
    isBreakLoading: boolean;
    handleAttendance: () => void;
    handleBreak: () => void;
    logMood: (score: number, label: string) => void;
}

export const AttendanceClockCard: React.FC<AttendanceClockCardProps> = ({
    time,
    status,
    selectedMood,
    isLoading,
    isSubmittingMood,
    isBreakLoading,
    handleAttendance,
    handleBreak,
    logMood,
}) => {
    return (
        <div className="bg-surface-elevated rounded-[48px] p-12 border border-border-subtle shadow-xl relative overflow-hidden flex flex-col items-center justify-center w-full max-w-2xl transform transition-all hover:shadow-2xl">
            <div className="absolute top-8 left-10 flex items-center gap-3">
                <div className="w-2 h-8 bg-primary rounded-full" />
                <div>
                    <h2 className="text-sm font-black text-foreground tracking-wide">Current Status</h2>
                    <p className="text-xs font-bold text-muted mt-0.5">{formatFullDate(time)}</p>
                </div>
            </div>

            <div className="absolute top-8 right-10 bg-surface-subtle px-4 py-2 rounded-2xl border border-border-subtle">
                <span
                    className={`text-[11px] font-black tracking-widest uppercase ${status?.status === 'checked-in' ? 'text-success' : 'text-muted'
                        }`}
                >
                    {status?.status === 'checked-in' ? 'IN OFFICE' : 'NOT IN'}
                </span>
            </div>

            <div className="flex flex-col items-center mt-12 mb-8">
                <div className="text-7xl font-black tracking-tighter text-foreground mb-2">
                    {formatTime(time)}
                </div>
                <p className="text-sm font-black text-primary/80 tracking-widest uppercase">
                    Real-time Clock
                </p>
            </div>

            <div className="w-full flex flex-col gap-4">
                <Button
                    variant={status?.status === 'checked-in' ? 'ghost' : 'primary'}
                    aria-label={status?.status === 'checked-in' ? 'Check out' : 'Check in'}
                    className={`w-full h-16 rounded-[24px]! text-lg shadow-xl ${status?.status === 'checked-in' ? 'border-2 border-border-strong!' : 'shadow-primary/30'
                        } flex items-center justify-center gap-4 active:scale-95 transition-all cursor-pointer`}
                    onClick={handleAttendance}
                    loading={isLoading}
                    disabled={isLoading}
                >
                    {status?.status === 'checked-in' ? <LogOut size={24} /> : <LogIn size={24} />}
                    <span className="font-black tracking-widest uppercase">
                        {status?.status === 'checked-in' ? 'Check Out' : 'Check In'}
                    </span>
                </Button>

                <Button
                    variant={status?.onBreak ? 'ghost' : 'primary'}
                    aria-label={status?.onBreak ? 'End Break' : 'Start Break'}
                    className={`w-full h-16 rounded-[24px]! text-lg shadow-xl ${status?.onBreak ? 'border-2 border-border-strong!' : 'shadow-primary/30'
                        } flex items-center justify-center gap-4 active:scale-95 transition-all cursor-pointer`}
                    onClick={handleBreak}
                    loading={isBreakLoading}
                    disabled={isBreakLoading || status?.status !== 'checked-in'}
                >
                    {status?.onBreak ? <LogIn size={24} /> : <Coffee size={24} />}
                    <span className="font-black tracking-widest uppercase">
                        {status?.onBreak ? 'End Break' : 'Take Break'}
                    </span>
                </Button>
            </div>

            <div className="w-full mt-10">
                <MoodSelector
                    selectedMood={selectedMood}
                    isSubmittingMood={isSubmittingMood}
                    onMoodSelect={logMood}
                />
            </div>

            <div className="mt-10 grid grid-cols-2 gap-8 w-full border-t border-border-subtle pt-8">
                <div className="flex flex-col items-center border-r border-border-subtle">
                    <p className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Shift</p>
                    <p className="text-sm font-black text-foreground">09:00 AM – 06:00 PM</p>
                </div>
                <div className="flex flex-col items-center">
                    <p className="text-xs font-bold text-muted uppercase tracking-widest mb-2">System</p>
                    <p className="text-sm font-black text-foreground">
                        {status?.status === 'checked-in' ? 'Active' : 'Offline'}
                    </p>
                </div>
            </div>
        </div>
    );
};

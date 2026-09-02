import React from 'react';
import {
    CheckCircle2,
    Clock,
    AlertTriangle,
    Calendar as CalendarIcon,
    TrendingUp,
    Coffee,
    Zap,
} from 'lucide-react';
import type { MonthAttendanceSummary } from '../utils/attendanceUtils';

interface AttendanceInsightsProps {
    summary: MonthAttendanceSummary;
    selectedMonthName: string;
}

export const AttendanceInsights: React.FC<AttendanceInsightsProps> = ({
    summary,
    selectedMonthName,
}) => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
                <div>
                    <h3 className="text-lg font-black text-foreground tracking-tight">Attendance Insights</h3>
                    <p className="text-xs font-bold text-muted">Monthly performance for {selectedMonthName}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black">
                    <TrendingUp size={14} />
                    <span>{summary.attendancePercentage}% Attendance Rate</span>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI 1: Present Days */}
                <div className="bg-surface-elevated p-5 rounded-[28px] border border-border-subtle shadow-soft flex flex-col justify-between transition-all hover:border-primary/30">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-muted uppercase tracking-widest">Days Present</span>
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-foreground">{summary.presentDays}</span>
                            <span className="text-xs font-bold text-muted">days</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-500 mt-1 block">
                            {summary.attendancePercentage}% of working days
                        </span>
                    </div>
                </div>

                {/* KPI 2: Late Days */}
                <div className="bg-surface-elevated p-5 rounded-[28px] border border-border-subtle shadow-soft flex flex-col justify-between transition-all hover:border-warning/30">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-muted uppercase tracking-widest">Late Arrival</span>
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                            <AlertTriangle size={20} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-foreground">{summary.lateDays}</span>
                            <span className="text-xs font-bold text-muted">instances</span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-500 mt-1 block">
                            {summary.lateDays === 0 ? 'Perfect punctuality!' : `${summary.lateDays} delayed check-ins`}
                        </span>
                    </div>
                </div>

                {/* KPI 3: Avg Working Hours */}
                <div className="bg-surface-elevated p-5 rounded-[28px] border border-border-subtle shadow-soft flex flex-col justify-between transition-all hover:border-info/30">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-muted uppercase tracking-widest">Avg Daily Hours</span>
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                            <Clock size={20} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-foreground">{summary.avgWorkingHours}</span>
                        </div>
                        <span className="text-[10px] font-bold text-muted mt-1 block flex items-center gap-1">
                            <Coffee size={12} className="text-amber-500 inline" /> Avg Break: {summary.avgBreakMinutes}m
                        </span>
                    </div>
                </div>

                {/* KPI 4: Overtime */}
                <div className="bg-surface-elevated p-5 rounded-[28px] border border-border-subtle shadow-soft flex flex-col justify-between transition-all hover:border-purple-500/30">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-muted uppercase tracking-widest">Total Overtime</span>
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
                            <Zap size={20} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-foreground">{summary.totalOvertimeHours}h</span>
                        </div>
                        <span className="text-[10px] font-bold text-purple-500 mt-1 block">
                            {summary.totalOvertimeHours > 0 ? 'Overtime logged this month' : 'Standard shift hours'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

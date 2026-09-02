import React from 'react';
import {
    CheckCircle2,
    Clock,
    AlertTriangle,
    TrendingUp,
    Coffee,
    Zap,
} from 'lucide-react';
import type { MonthAttendanceSummary } from '../utils/attendanceUtils';

interface AttendanceInsightsProps {
    summary: MonthAttendanceSummary;
    selectedMonthName: string;
    variant?: 'full' | 'sidebar';
}

export const AttendanceInsights: React.FC<AttendanceInsightsProps> = ({
    summary,
    selectedMonthName,
    variant = 'full',
}) => {
    const gridClasses =
        variant === 'sidebar'
            ? 'grid grid-cols-1 sm:grid-cols-2 gap-3.5'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4';

    return (
        <div className="bg-surface-elevated rounded-[36px] p-6 border border-border-subtle shadow-xl flex flex-col gap-5">
            <div className="flex items-center justify-between gap-2 border-b border-border-subtle/60 pb-4">
                <div>
                    <h3 className="text-base font-black text-foreground tracking-tight">Attendance Insights</h3>
                    <p className="text-[11px] font-bold text-muted mt-0.5">{selectedMonthName} Performance</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-xs font-black shrink-0">
                    <TrendingUp size={14} />
                    <span>{summary.attendancePercentage}% Rate</span>
                </div>
            </div>

            <div className={gridClasses}>
                {/* KPI 1: Present Days */}
                <div className="bg-surface-subtle p-4.5 rounded-[24px] border border-border-subtle flex flex-col justify-between transition-all hover:border-primary/30">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-muted uppercase tracking-wider">Days Present</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shrink-0">
                            <CheckCircle2 size={16} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-black text-foreground">{summary.presentDays}</span>
                            <span className="text-xs font-bold text-muted">days</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-500 mt-1 block">
                            {summary.attendancePercentage}% of work days
                        </span>
                    </div>
                </div>

                {/* KPI 2: Late Days */}
                <div className="bg-surface-subtle p-4.5 rounded-[24px] border border-border-subtle flex flex-col justify-between transition-all hover:border-warning/30">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-muted uppercase tracking-wider">Late Arrival</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shrink-0">
                            <AlertTriangle size={16} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-black text-foreground">{summary.lateDays}</span>
                            <span className="text-xs font-bold text-muted">instances</span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-500 mt-1 block truncate">
                            {summary.lateDays === 0 ? 'On time all month' : `${summary.lateDays} delayed check-ins`}
                        </span>
                    </div>
                </div>

                {/* KPI 3: Avg Working Hours */}
                <div className="bg-surface-subtle p-4.5 rounded-[24px] border border-border-subtle flex flex-col justify-between transition-all hover:border-info/30">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-muted uppercase tracking-wider">Avg Daily Hours</span>
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20 shrink-0">
                            <Clock size={16} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-black text-foreground">{summary.avgWorkingHours}</span>
                        </div>
                        <span className="text-[10px] font-bold text-muted mt-1 block flex items-center gap-1">
                            <Coffee size={12} className="text-amber-500 inline shrink-0" /> Break: {summary.avgBreakMinutes}m
                        </span>
                    </div>
                </div>

                {/* KPI 4: Overtime */}
                <div className="bg-surface-subtle p-4.5 rounded-[24px] border border-border-subtle flex flex-col justify-between transition-all hover:border-purple-500/30">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-muted uppercase tracking-wider">Total Overtime</span>
                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20 shrink-0">
                            <Zap size={16} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-black text-foreground">{summary.totalOvertimeHours}h</span>
                        </div>
                        <span className="text-[10px] font-bold text-purple-500 mt-1 block truncate">
                            {summary.totalOvertimeHours > 0 ? 'Overtime logged' : 'Standard hours'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

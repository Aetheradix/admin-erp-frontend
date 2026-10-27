import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Info,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Home,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { useGetAttendanceHeatmapQuery } from '@/store/api/dashboardSlice';
import type { HeatmapCell } from '@/types/dashboard';

interface AttendanceHeatmapCardProps {
  currentStreak?: number;
  longestStreak?: number;
  monthlyPresentDays?: number;
  wfhDaysThisMonth?: number;
  leavesThisMonth?: number;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string; ring: string }> = {
  present: {
    bg: 'bg-emerald-500 hover:bg-emerald-600',
    text: 'text-emerald-700',
    label: 'Present',
    ring: 'ring-emerald-400/50',
  },
  late: {
    bg: 'bg-amber-400 hover:bg-amber-500',
    text: 'text-amber-700',
    label: 'Late Arrival',
    ring: 'ring-amber-400/50',
  },
  wfh: {
    bg: 'bg-indigo-500 hover:bg-indigo-600',
    text: 'text-indigo-700',
    label: 'Work From Home',
    ring: 'ring-indigo-400/50',
  },
  leave: {
    bg: 'bg-purple-500 hover:bg-purple-600',
    text: 'text-purple-700',
    label: 'Approved Leave',
    ring: 'ring-purple-400/50',
  },
  holiday: {
    bg: 'bg-cyan-500 hover:bg-cyan-600',
    text: 'text-cyan-700',
    label: 'Public Holiday',
    ring: 'ring-cyan-400/50',
  },
  incomplete: {
    bg: 'bg-rose-400 hover:bg-rose-500',
    text: 'text-rose-700',
    label: 'Incomplete / Missed Out',
    ring: 'ring-rose-400/50',
  },
  weekend: {
    bg: 'bg-zinc-200/80 dark:bg-zinc-800 hover:bg-zinc-300',
    text: 'text-zinc-500',
    label: 'Weekly Off',
    ring: 'ring-zinc-300/50',
  },
  absent: {
    bg: 'bg-red-200/90 dark:bg-red-950 hover:bg-red-300',
    text: 'text-red-600',
    label: 'Absent',
    ring: 'ring-red-300/50',
  },
  future: {
    bg: 'bg-zinc-100/60 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800',
    text: 'text-zinc-400',
    label: 'Upcoming',
    ring: '',
  },
};

export const AttendanceHeatmapCard: React.FC<AttendanceHeatmapCardProps> = ({
  currentStreak: propCurrentStreak,
  longestStreak: propLongestStreak,
  monthlyPresentDays,
  wfhDaysThisMonth,
  leavesThisMonth,
}) => {
  const navigate = useNavigate();
  // Default to 5 (last 6 months) to span wide monitors nicely
  const [monthsBack, setMonthsBack] = useState<number>(5);
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  const { data: heatmapData, isLoading, isError, refetch } = useGetAttendanceHeatmapQuery(monthsBack);

  const streakCount = propCurrentStreak !== undefined ? propCurrentStreak : (heatmapData?.streaks?.currentStreak || 0);
  const maxStreak = propLongestStreak !== undefined ? propLongestStreak : (heatmapData?.streaks?.longestStreak || 0);
  const presentDays = monthlyPresentDays !== undefined ? monthlyPresentDays : (heatmapData?.summary?.totalPresent || 0);
  const wfhDays = wfhDaysThisMonth !== undefined ? wfhDaysThisMonth : (heatmapData?.summary?.totalWfh || 0);
  const leaveDays = leavesThisMonth !== undefined ? leavesThisMonth : (heatmapData?.summary?.totalLeave || 0);
  const lateDays = heatmapData?.summary?.totalLate || 0;

  // Calculate total logged working hours from backend heatmap cells
  const totalLoggedHours = React.useMemo(() => {
    if (!heatmapData?.cells) return 0;
    return heatmapData.cells.reduce((sum, c) => sum + (Number(c.workingHours) || 0), 0);
  }, [heatmapData?.cells]);

  // Group cells into week columns
  const weekColumns = React.useMemo(() => {
    if (!heatmapData?.cells || heatmapData.cells.length === 0) return [];

    const weeks: HeatmapCell[][] = [];
    let currentWeek: HeatmapCell[] = [];

    // Pad first week with empty placeholder cells if starting mid-week
    const firstCell = heatmapData.cells[0];
    const leadingPadCount = firstCell.dayOfWeek;
    for (let p = 0; p < leadingPadCount; p++) {
      currentWeek.push({
        date: `pad-pre-${p}`,
        day: 0,
        month: 0,
        year: 0,
        dayOfWeek: p,
        status: 'future',
        workingHours: 0,
        checkInTime: null,
        checkOutTime: null,
        tooltip: '',
        workMode: 'office',
      });
    }

    heatmapData.cells.forEach((cell) => {
      currentWeek.push(cell);
      if (cell.dayOfWeek === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      // Pad end of last week
      while (currentWeek.length < 7) {
        currentWeek.push({
          date: `pad-post-${currentWeek.length}`,
          day: 0,
          month: 0,
          year: 0,
          dayOfWeek: currentWeek.length,
          status: 'future',
          workingHours: 0,
          checkInTime: null,
          checkOutTime: null,
          tooltip: '',
          workMode: 'office',
        });
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [heatmapData?.cells]);

  // Compute month headers across the columns with exact pixel coordinates
  const monthHeaders = React.useMemo(() => {
    if (weekColumns.length === 0) return [];
    const headers: { monthName: string; colIndex: number }[] = [];
    let lastMonth = -1;

    weekColumns.forEach((week, colIdx) => {
      const validDay = week.find((c) => c.month > 0);
      if (validDay && validDay.month !== lastMonth) {
        const monthDate = new Date(validDay.year, validDay.month - 1, 1);
        headers.push({
          monthName: monthDate.toLocaleDateString('en-US', { month: 'short' }),
          colIndex: colIdx,
        });
        lastMonth = validDay.month;
      }
    });

    return headers;
  }, [weekColumns]);

  const handleCellClick = (cell: HeatmapCell) => {
    if (cell.day === 0 || cell.status === 'future') return;
    navigate(`/checkin?date=${cell.date}`);
  };

  return (
    <div className="bg-surface-elevated rounded-3xl p-5 sm:p-6 border border-border-subtle shadow-soft hover:shadow-md transition-all duration-300 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">
              Attendance Velocity
            </span>
            <div className="bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border border-orange-500/20">
              <Flame size={10} />
              <span>Consecutive Streaks</span>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Attendance Heatmap & Consistency
          </h2>
          <p className="text-xs font-medium text-muted mt-0.5">
            Activity tracking working days, streaks, WFH, and leaves across rolling cycles
          </p>
        </div>

        {/* Month range switcher */}
        <div className="flex items-center gap-2 bg-surface-subtle p-1 rounded-2xl border border-border-subtle">
          <button
            onClick={() => setMonthsBack((prev) => Math.min(6, prev + 1))}
            disabled={monthsBack >= 6}
            className="p-1 rounded-xl hover:bg-surface-elevated text-muted hover:text-foreground disabled:opacity-40 transition-colors cursor-pointer"
            title="Expand range">
            <ChevronLeft size={15} />
          </button>
          <span className="text-[10.5px] font-black text-foreground px-2">
            Last {monthsBack + 1} Months
          </span>
          <button
            onClick={() => setMonthsBack((prev) => Math.max(2, prev - 1))}
            disabled={monthsBack <= 2}
            className="p-1 rounded-xl hover:bg-surface-elevated text-muted hover:text-foreground disabled:opacity-40 transition-colors cursor-pointer"
            title="Contract range">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Streak and Summary KPI Strip (6 Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-3.5 rounded-2xl bg-surface-subtle/80 border border-border-subtle mb-5">
        {/* Current Streak */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-600 flex items-center justify-center shrink-0">
            <Flame size={16} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[8.5px] font-black uppercase tracking-wider text-muted block leading-none">
              Current Streak
            </span>
            <span className="text-base font-black text-foreground leading-tight mt-0.5 block">
              {streakCount} {streakCount === 1 ? 'Day' : 'Days'}
            </span>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
            <Sparkles size={15} />
          </div>
          <div>
            <span className="text-[8.5px] font-black uppercase tracking-wider text-muted block leading-none">
              Longest Streak
            </span>
            <span className="text-base font-black text-foreground leading-tight mt-0.5 block">
              {maxStreak} Days
            </span>
          </div>
        </div>

        {/* Present Days */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={15} />
          </div>
          <div>
            <span className="text-[8.5px] font-black uppercase tracking-wider text-muted block leading-none">
              Present Days
            </span>
            <span className="text-base font-black text-foreground leading-tight mt-0.5 block">
              {presentDays} Days
            </span>
          </div>
        </div>

        {/* WFH Days */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-600 flex items-center justify-center shrink-0">
            <Home size={15} />
          </div>
          <div>
            <span className="text-[8.5px] font-black uppercase tracking-wider text-indigo-600 block leading-none">
              WFH Days
            </span>
            <span className="text-base font-black text-foreground leading-tight mt-0.5 block">
              {wfhDays} Days
            </span>
          </div>
        </div>

        {/* Leaves Taken */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-600 flex items-center justify-center shrink-0">
            <Calendar size={15} />
          </div>
          <div>
            <span className="text-[8.5px] font-black uppercase tracking-wider text-muted block leading-none">
              Leaves Taken
            </span>
            <span className="text-base font-black text-foreground leading-tight mt-0.5 block">
              {leaveDays} Days
            </span>
          </div>
        </div>

        {/* Late Check-ins */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={15} />
          </div>
          <div>
            <span className="text-[8.5px] font-black uppercase tracking-wider text-muted block leading-none">
              Late Check-Ins
            </span>
            <span className="text-base font-black text-foreground leading-tight mt-0.5 block">
              {lateDays} Days
            </span>
          </div>
        </div>
      </div>

      {/* Main Heatmap Matrix + Side Analytics Panel */}
      {isLoading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-xs font-bold text-muted uppercase tracking-wider">
              Loading attendance matrix...
            </span>
          </div>
        </div>
      ) : isError ? (
        <div className="h-36 flex flex-col items-center justify-center text-center p-6 bg-red-50/50 rounded-2xl border border-red-200">
          <AlertCircle size={24} className="text-red-500 mb-2" />
          <p className="text-xs font-bold text-red-700">Failed to load attendance records</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-[11px] font-black text-red-600 underline cursor-pointer">
            Retry Connection
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-5 items-stretch">
          {/* Left / Main Matrix Area */}
          <div className="flex-1 overflow-x-auto pb-1">
            <div className="min-w-[620px]">
              {/* Month Labels Row aligned to columns */}
              <div className="relative h-5 mb-1 pl-7">
                {monthHeaders.map((header) => (
                  <span
                    key={`${header.monthName}-${header.colIndex}`}
                    style={{ left: `${header.colIndex * 19 + 28}px` }}
                    className="absolute text-[10px] font-black text-muted uppercase tracking-wider">
                    {header.monthName}
                  </span>
                ))}
              </div>

              {/* Matrix Body with Day of Week Labels */}
              <div className="flex gap-2">
                {/* Day of Week Labels */}
                <div className="flex flex-col justify-between py-0.5 text-[9px] font-bold text-muted/70 w-5">
                  <span>Sun</span>
                  <span>Tue</span>
                  <span>Thu</span>
                  <span>Sat</span>
                </div>

                {/* Heatmap Grid Columns */}
                <div className="flex gap-1 flex-1">
                  {weekColumns.map((week, wIdx) => (
                    <div key={`week-${wIdx}`} className="flex flex-col gap-1">
                      {week.map((cell, dIdx) => {
                        if (cell.day === 0) {
                          return <div key={`pad-${wIdx}-${dIdx}`} className="w-3.5 h-3.5 opacity-0" />;
                        }

                        const style = STATUS_STYLES[cell.status] || STATUS_STYLES.absent;
                        const isHovered = hoveredCell?.date === cell.date;

                        return (
                          <div
                            key={cell.date}
                            onMouseEnter={() => setHoveredCell(cell)}
                            onMouseLeave={() => setHoveredCell(null)}
                            onClick={() => handleCellClick(cell)}
                            className={`w-3.5 h-3.5 rounded-[3.5px] ${style.bg} transition-all duration-150 cursor-pointer relative ${
                              isHovered ? `scale-150 ring-2 ${style.ring} z-20 shadow-md` : ''
                            }`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Quick Consistency & Hours Analytics Card (Eliminates horizontal dead space) */}
          <div className="lg:w-64 shrink-0 p-4 rounded-2xl bg-surface-subtle border border-border-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9.5px] font-black uppercase tracking-wider text-muted flex items-center gap-1">
                  <TrendingUp size={12} className="text-primary" />
                  <span>Cycle Velocity</span>
                </span>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {streakCount >= 2 ? 'CONSISTENT' : 'ON TRACK'}
                </span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">
                    Logged Work Duration
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-black text-foreground">
                      {totalLoggedHours > 0 ? totalLoggedHours.toFixed(1) : (presentDays * 8.5).toFixed(0)}
                    </span>
                    <span className="text-[10px] font-bold text-muted">hours in period</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[10px]">
                  <span className="text-muted font-medium">Work Distribution</span>
                  <span className="font-bold text-foreground">
                    {presentDays} Office · {wfhDays} WFH
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkin')}
              className="mt-3 w-full py-1.5 px-3 rounded-xl bg-surface-elevated hover:bg-surface-subtle border border-border-subtle text-[10px] font-black text-primary uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs">
              <span>View Attendance Log</span>
              <ArrowUpRight size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Hover Tooltip Preview Bar */}
      <div className="mt-4 p-2.5 sm:p-3 rounded-2xl bg-surface-subtle border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-h-[42px]">
        {hoveredCell && hoveredCell.day > 0 ? (
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${STATUS_STYLES[hoveredCell.status]?.bg || 'bg-zinc-400'}`}
            />
            <span className="text-xs font-black text-foreground">
              {new Date(hoveredCell.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="text-xs text-muted font-medium">·</span>
            <span
              className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_STYLES[hoveredCell.status]?.text || 'text-muted'} bg-surface-elevated border border-border-subtle`}>
              {STATUS_STYLES[hoveredCell.status]?.label || hoveredCell.status}
            </span>
            {hoveredCell.workingHours > 0 && (
              <span className="text-xs font-bold text-foreground">
                ({hoveredCell.workingHours} hrs worked)
              </span>
            )}
            {hoveredCell.checkInTime && (
              <span className="text-[11px] text-muted">
                In: {new Date(hoveredCell.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {hoveredCell.checkOutTime && (
              <span className="text-[11px] text-muted">
                · Out: {new Date(hoveredCell.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <span className="text-[10px] font-bold text-primary ml-1 flex items-center gap-0.5">
              Click to view details <ArrowUpRight size={11} />
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted font-medium">
            <Info size={14} className="text-muted/70" />
            <span>Hover over any calendar cell to view working details. Click to navigate.</span>
          </div>
        )}

        <button
          onClick={() => navigate('/checkin')}
          className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer shrink-0">
          <span>Full Records</span>
          <ArrowUpRight size={12} />
        </button>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3.5 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2.5 text-[9.5px] font-bold text-muted">
        <span className="uppercase tracking-wider">Legend:</span>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-[3px] bg-emerald-500" />
            <span>Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-[3px] bg-amber-400" />
            <span>Late Arrival</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-[3px] bg-indigo-500" />
            <span>WFH</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-[3px] bg-purple-500" />
            <span>Leave</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-[3px] bg-cyan-500" />
            <span>Holiday</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-[3px] bg-rose-400" />
            <span>Incomplete</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-[3px] bg-red-200" />
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-[3px] bg-zinc-200" />
            <span>Weekend</span>
          </div>
        </div>
      </div>
    </div>
  );
};

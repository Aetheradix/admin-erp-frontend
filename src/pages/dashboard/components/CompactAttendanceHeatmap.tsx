import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useGetAttendanceHeatmapQuery } from '@/store/api/dashboardSlice';
import type { HeatmapCell } from '@/types/dashboard';

const STATUS_COLORS: Record<string, { bg: string; label: string }> = {
  present: { bg: 'bg-emerald-500 hover:bg-emerald-600', label: 'Present' },
  late: { bg: 'bg-amber-400 hover:bg-amber-500', label: 'Late' },
  wfh: { bg: 'bg-indigo-500 hover:bg-indigo-600', label: 'WFH' },
  leave: { bg: 'bg-purple-500 hover:bg-purple-600', label: 'Leave' },
  holiday: { bg: 'bg-cyan-500 hover:bg-cyan-600', label: 'Holiday' },
  incomplete: { bg: 'bg-rose-400 hover:bg-rose-500', label: 'Incomplete' },
  weekend: { bg: 'bg-zinc-200/90 hover:bg-zinc-300', label: 'Weekend' },
  absent: { bg: 'bg-red-200 hover:bg-red-300', label: 'Absent' },
  future: { bg: 'bg-zinc-100/70 border border-dashed border-zinc-200', label: 'Upcoming' },
};

export const CompactAttendanceHeatmap: React.FC = () => {
  const navigate = useNavigate();
  const [monthsBack, setMonthsBack] = useState<number>(4);
  const [hoveredCell, setHoveredCell] = useState<{
    cell: HeatmapCell;
    x: number;
    y: number;
  } | null>(null);

  const { data: heatmapData, isLoading } = useGetAttendanceHeatmapQuery(monthsBack);

  const totalLoggedHours = useMemo(() => {
    if (!heatmapData?.cells) return 0;
    return heatmapData.cells.reduce((sum, c) => sum + (Number(c.workingHours) || 0), 0);
  }, [heatmapData?.cells]);

  const weekColumns = useMemo(() => {
    if (!heatmapData?.cells || heatmapData.cells.length === 0) return [];
    const weeks: HeatmapCell[][] = [];
    let currentWeek: HeatmapCell[] = [];

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

  const monthHeaders = useMemo(() => {
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-[12px] p-4 border border-border-subtle shadow-2xs animate-pulse">
        <div className="h-4 w-40 bg-surface-subtle rounded mb-3" />
        <div className="h-24 bg-surface-subtle rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[12px] p-4 border border-border-subtle shadow-2xs hover:border-border transition-all duration-200 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-foreground tracking-tight flex items-center gap-1.5">
            <TrendingUp size={13} className="text-primary" />
            Attendance Activity Heatmap
          </span>
          <span className="text-[10px] text-muted font-bold">
            • {totalLoggedHours > 0 ? `${Math.round(totalLoggedHours)} hrs logged` : 'Daily presence'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] text-muted">
            <button
              type="button"
              onClick={() => setMonthsBack((p) => Math.min(6, p + 1))}
              disabled={monthsBack >= 6}
              className="p-1 rounded-md hover:bg-surface-subtle disabled:opacity-30 cursor-pointer"
              title="Expand range">
              <ChevronLeft size={13} />
            </button>
            <span className="font-bold">{monthsBack + 1}M</span>
            <button
              type="button"
              onClick={() => setMonthsBack((p) => Math.max(2, p - 1))}
              disabled={monthsBack <= 2}
              className="p-1 rounded-md hover:bg-surface-subtle disabled:opacity-30 cursor-pointer"
              title="Shrink range">
              <ChevronRight size={13} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/checkin')}
            className="flex items-center gap-1 text-[10px] font-bold text-muted hover:text-primary transition-colors cursor-pointer">
            <span>Details</span>
            <ArrowUpRight size={11} />
          </button>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto no-scrollbar pb-1">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex text-[9px] font-extrabold text-muted mb-1 h-3.5 relative">
            {monthHeaders.map((h, i) => (
              <span
                key={i}
                style={{ left: `${h.colIndex * 13}px` }}
                className="absolute uppercase tracking-wider">
                {h.monthName}
              </span>
            ))}
          </div>

          {/* Grid rows */}
          <div className="flex gap-[3px]">
            {/* Day of week labels */}
            <div className="flex flex-col gap-[3px] pr-1.5 text-[8px] font-extrabold text-muted uppercase select-none pt-0.5">
              <span className="h-[10px] leading-[10px]">S</span>
              <span className="h-[10px] leading-[10px]">M</span>
              <span className="h-[10px] leading-[10px]">T</span>
              <span className="h-[10px] leading-[10px]">W</span>
              <span className="h-[10px] leading-[10px]">T</span>
              <span className="h-[10px] leading-[10px]">F</span>
              <span className="h-[10px] leading-[10px]">S</span>
            </div>

            {/* Week Columns */}
            {weekColumns.map((week, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-[3px]">
                {week.map((cell, dayIdx) => {
                  const style = STATUS_COLORS[cell.status] || STATUS_COLORS.future;
                  const isInteractive = cell.day > 0 && cell.status !== 'future';

                  return (
                    <div
                      key={dayIdx}
                      onClick={() => handleCellClick(cell)}
                      onMouseEnter={(e) => {
                        if (!isInteractive) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredCell({
                          cell,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`w-[10px] h-[10px] rounded-[2.5px] transition-all duration-150 ${style.bg} ${
                        isInteractive ? 'cursor-pointer hover:scale-125' : 'pointer-events-none'
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredCell && (
        <div
          style={{
            position: 'fixed',
            left: `${hoveredCell.x}px`,
            top: `${hoveredCell.y - 8}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999,
          }}
          className="bg-zinc-900 text-white text-[10px] font-medium p-2.5 rounded-xl shadow-xl border border-zinc-700/80 pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3 font-bold border-b border-zinc-800 pb-1">
            <span>{new Date(hoveredCell.cell.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span className="text-primary font-black uppercase text-[8px]">{hoveredCell.cell.status}</span>
          </div>
          {hoveredCell.cell.workingHours > 0 && (
            <div className="flex items-center gap-1 text-zinc-300">
              <Clock size={10} className="text-primary" />
              <span>{hoveredCell.cell.workingHours.toFixed(1)} hrs logged</span>
            </div>
          )}
          {hoveredCell.cell.checkInTime && (
            <div className="text-[9px] text-zinc-400">
              In: {new Date(hoveredCell.cell.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              {hoveredCell.cell.checkOutTime ? ` • Out: ${new Date(hoveredCell.cell.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : ''}
            </div>
          )}
        </div>
      )}

      {/* Minimal Bottom Legend */}
      <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-border-subtle/50 text-[9px] text-muted">
        <span className="font-bold">Daily Activity</span>
        <div className="flex items-center gap-2 font-bold">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-[2px] bg-emerald-500" /> Present
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-[2px] bg-indigo-500" /> WFH
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-[2px] bg-amber-400" /> Late
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-[2px] bg-cyan-500" /> Holiday
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-[2px] bg-purple-500" /> Leave
          </span>
        </div>
      </div>
    </div>
  );
};


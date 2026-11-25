import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { useGetAttendanceHeatmapQuery } from '@/store/api/dashboardSlice';
import type { HeatmapCell } from '@/types/dashboard';
import { cn } from '@/utils/cn';
import {
  DASHBOARD_CARD_CLASS,
  DASHBOARD_CARD_SKELETON_CLASS,
  HEATMAP_MONTHS_BACK_DEFAULT,
  HEATMAP_MONTHS_BACK_MAX,
  HEATMAP_MONTHS_BACK_MIN,
} from '../constants';
import type { HeatmapHoverState } from '../types';
import { buildMonthHeaders, buildWeekColumns, sumWorkingHours } from '../utils/heatmap';
import { HeatmapGrid } from './heatmap/HeatmapGrid';
import { HeatmapLegend } from './heatmap/HeatmapLegend';
import { HeatmapTooltip } from './heatmap/HeatmapTooltip';

export function CompactAttendanceHeatmap() {
  const navigate = useNavigate();
  const [monthsBack, setMonthsBack] = useState<number>(HEATMAP_MONTHS_BACK_DEFAULT);
  const [hoveredCell, setHoveredCell] = useState<HeatmapHoverState | null>(null);

  const { data: heatmapData, isLoading } = useGetAttendanceHeatmapQuery(monthsBack);
  const cells = heatmapData?.cells;

  const totalLoggedHours = useMemo(() => sumWorkingHours(cells), [cells]);
  const weekColumns = useMemo(() => buildWeekColumns(cells), [cells]);
  const monthHeaders = useMemo(() => buildMonthHeaders(weekColumns), [weekColumns]);

  const handleCellClick = (cell: HeatmapCell) => {
    if (cell.day === 0 || cell.status === 'future') return;
    navigate(`/checkin?date=${cell.date}`);
  };

  if (isLoading) {
    return (
      <div className={DASHBOARD_CARD_SKELETON_CLASS}>
        <div className="h-4 w-40 bg-surface-subtle rounded mb-3" />
        <div className="h-24 bg-surface-subtle rounded" />
      </div>
    );
  }

  return (
    <div className={cn(DASHBOARD_CARD_CLASS, 'relative')}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-foreground tracking-tight flex items-center gap-1.5">
            <TrendingUp size={13} className="text-primary" />
            Attendance Activity Heatmap
          </span>
          <span className="text-[10px] text-muted font-bold">
            •{' '}
            {totalLoggedHours > 0 ? `${Math.round(totalLoggedHours)} hrs logged` : 'Daily presence'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] text-muted">
            <button
              type="button"
              onClick={() => setMonthsBack((prev) => Math.min(HEATMAP_MONTHS_BACK_MAX, prev + 1))}
              disabled={monthsBack >= HEATMAP_MONTHS_BACK_MAX}
              className="p-1 rounded-md hover:bg-surface-subtle disabled:opacity-30 cursor-pointer"
              title="Expand range"
              aria-label="Expand range">
              <ChevronLeft size={13} />
            </button>
            <span className="font-bold">{monthsBack + 1}M</span>
            <button
              type="button"
              onClick={() => setMonthsBack((prev) => Math.max(HEATMAP_MONTHS_BACK_MIN, prev - 1))}
              disabled={monthsBack <= HEATMAP_MONTHS_BACK_MIN}
              className="p-1 rounded-md hover:bg-surface-subtle disabled:opacity-30 cursor-pointer"
              title="Shrink range"
              aria-label="Shrink range">
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

      <HeatmapGrid
        weeks={weekColumns}
        monthHeaders={monthHeaders}
        onCellClick={handleCellClick}
        onHover={setHoveredCell}
      />

      {hoveredCell && <HeatmapTooltip hovered={hoveredCell} />}

      <HeatmapLegend />
    </div>
  );
}

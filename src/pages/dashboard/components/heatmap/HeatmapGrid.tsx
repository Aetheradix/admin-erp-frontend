import type { KeyboardEvent, MouseEvent } from 'react';
import type { HeatmapCell } from '@/types/dashboard';
import { cn } from '@/utils/cn';
import {
  HEATMAP_COLUMN_WIDTH_PX,
  HEATMAP_STATUS_COLORS,
  HEATMAP_WEEKDAY_LABELS,
} from '../../constants';
import type { HeatmapHoverState, HeatmapMonthHeader } from '../../types';
import { isInteractiveCell } from '../../utils/heatmap';

interface HeatmapGridProps {
  weeks: HeatmapCell[][];
  monthHeaders: HeatmapMonthHeader[];
  onCellClick: (cell: HeatmapCell) => void;
  onHover: (hovered: HeatmapHoverState | null) => void;
}

export function HeatmapGrid({ weeks, monthHeaders, onCellClick, onHover }: HeatmapGridProps) {
  const handleEnter = (cell: HeatmapCell, event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    onHover({ cell, x: rect.left + rect.width / 2, y: rect.top });
  };

  const handleKeyDown = (cell: HeatmapCell, event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onCellClick(cell);
    }
  };

  return (
    <div className="overflow-x-auto no-scrollbar pb-1">
      <div className="inline-block min-w-full">
        <div className="flex text-[9px] font-extrabold text-muted mb-1 h-3.5 relative">
          {monthHeaders.map((header, index) => (
            <span
              key={index}
              style={{ left: `${header.colIndex * HEATMAP_COLUMN_WIDTH_PX}px` }}
              className="absolute uppercase tracking-wider">
              {header.monthName}
            </span>
          ))}
        </div>

        <div className="flex gap-[3px]">
          <div className="flex flex-col gap-[3px] pr-1.5 text-[8px] font-extrabold text-muted uppercase select-none pt-0.5">
            {HEATMAP_WEEKDAY_LABELS.map((label, index) => (
              <span key={index} className="h-[10px] leading-[10px]">
                {label}
              </span>
            ))}
          </div>

          {weeks.map((week, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-[3px]">
              {week.map((cell, dayIndex) => {
                const interactive = isInteractiveCell(cell);
                return (
                  <div
                    key={dayIndex}
                    role={interactive ? 'button' : undefined}
                    tabIndex={interactive ? 0 : undefined}
                    aria-label={interactive ? `${cell.date}: ${cell.status}` : undefined}
                    onClick={() => onCellClick(cell)}
                    onKeyDown={interactive ? (event) => handleKeyDown(cell, event) : undefined}
                    onMouseEnter={interactive ? (event) => handleEnter(cell, event) : undefined}
                    onMouseLeave={() => onHover(null)}
                    className={cn(
                      'w-[10px] h-[10px] rounded-[2.5px] transition-all duration-150',
                      HEATMAP_STATUS_COLORS[cell.status] || HEATMAP_STATUS_COLORS.future,
                      interactive ? 'cursor-pointer hover:scale-125' : 'pointer-events-none'
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

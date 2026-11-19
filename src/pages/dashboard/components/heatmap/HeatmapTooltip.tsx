import { Clock } from 'lucide-react';
import type { HeatmapHoverState } from '../../types';

export function HeatmapTooltip({ hovered }: { hovered: HeatmapHoverState }) {
  const { cell, x, y } = hovered;

  return (
    <div
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y - 8}px`,
        transform: 'translate(-50%, -100%)',
        zIndex: 9999,
      }}
      className="bg-zinc-900 text-white text-[10px] font-medium p-2.5 rounded-xl shadow-xl border border-zinc-700/80 pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-1">
      <div className="flex items-center justify-between gap-3 font-bold border-b border-zinc-800 pb-1">
        <span>
          {new Date(cell.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
        <span className="text-primary font-black uppercase text-[8px]">{cell.status}</span>
      </div>
      {cell.workingHours > 0 && (
        <div className="flex items-center gap-1 text-zinc-300">
          <Clock size={10} className="text-primary" />
          <span>{cell.workingHours.toFixed(1)} hrs logged</span>
        </div>
      )}
      {cell.checkInTime && (
        <div className="text-[9px] text-zinc-400">
          In:{' '}
          {new Date(cell.checkInTime).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
          {cell.checkOutTime
            ? ` • Out: ${new Date(cell.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
            : ''}
        </div>
      )}
    </div>
  );
}
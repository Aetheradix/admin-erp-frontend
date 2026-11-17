import React from 'react';
import { Maximize2, Compass } from 'lucide-react';

interface CanvasControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onCenter: () => void;
}

export const CanvasControls: React.FC<CanvasControlsProps> = React.memo(({
  zoom,
  onZoomIn,
  onZoomOut,
  onFit,
  onCenter,
}) => {
  return (
    <div className="absolute bottom-5 left-5 z-20 flex flex-col gap-2">
      <div className="flex items-center rounded-2xl bg-white/95 border border-slate-200/90 p-1.5 shadow-lg backdrop-blur-md gap-1">
        <button
          type="button"
          onClick={onZoomOut}
          className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center justify-center font-black text-sm transition-colors cursor-pointer"
          title="Zoom out"
          aria-label="Zoom out"
        >
          −
        </button>
        <span className="text-[11px] font-mono font-bold text-slate-600 px-1.5 min-w-[42px] text-center select-none">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={onZoomIn}
          className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center justify-center font-black text-sm transition-colors cursor-pointer"
          title="Zoom in"
          aria-label="Zoom in"
        >
          +
        </button>

        <div className="w-[1px] h-4 bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={onFit}
          className="px-3 h-8 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Fit model view to screen"
        >
          <Maximize2 size={13} />
          <span>Fit</span>
        </button>

        <button
          type="button"
          onClick={onCenter}
          className="px-3 h-8 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Center on selected employee"
        >
          <Compass size={13} />
          <span>Center</span>
        </button>
      </div>
    </div>
  );
});

CanvasControls.displayName = 'CanvasControls';

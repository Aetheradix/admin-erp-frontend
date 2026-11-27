interface OrgCanvasControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
}

export function OrgCanvasControls({ onZoomIn, onZoomOut, onFit }: OrgCanvasControlsProps) {
  return (
    <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2">
      <div className="flex items-center rounded-full bg-white/95 border border-slate-200 p-1 shadow-md backdrop-blur-md">
        <button
          type="button"
          onClick={onZoomOut}
          className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
          title="Zoom out">
          −
        </button>
        <button
          type="button"
          onClick={onZoomIn}
          className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
          title="Zoom in">
          +
        </button>
        <div className="w-px h-4 bg-slate-200 mx-1" />
        <button
          type="button"
          onClick={onFit}
          className="px-2.5 h-7 rounded-full hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
          title="Fit to screen">
          Fit
        </button>
      </div>

      <span className="text-[11px] text-slate-500 font-medium pl-1 select-none">
        Drag to pan · scroll to zoom · click node for details
      </span>
    </div>
  );
}

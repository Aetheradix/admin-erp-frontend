import { HEATMAP_LEGEND } from '../../constants';

export function HeatmapLegend() {
  return (
    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-border-subtle/50 text-[9px] text-muted">
      <span className="font-bold">Daily Activity</span>
      <div className="flex items-center gap-2 font-bold">
        {HEATMAP_LEGEND.map((item) => (
          <span key={item.label} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-[2px] ${item.className}`} /> {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

import { Check } from 'lucide-react';
import type { PermissionItem } from '@/store/api/roleApiSlice';

interface PermissionPickerProps {
  label: string;
  modules: Record<string, PermissionItem[]>;
  selectedIds: number[];
  onToggle: (permId: number) => void;
  onSelectAll?: () => void;
  onClearAll?: () => void;
}

export function PermissionPicker({
  label,
  modules,
  selectedIds,
  onToggle,
  onSelectAll,
  onClearAll,
}: PermissionPickerProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-foreground">{label}</label>
        {onSelectAll && onClearAll && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSelectAll}
              className="text-xs text-primary font-semibold hover:underline">
              Select All
            </button>
            <span className="text-muted-foreground">•</span>
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-muted-foreground font-semibold hover:underline">
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="max-h-64 overflow-y-auto space-y-3 p-3 rounded-xl border border-border/60 bg-muted/20">
        {Object.entries(modules).map(([modName, modPerms]) => (
          <div key={modName} className="space-y-1.5">
            <span className="text-xs font-bold text-foreground capitalize block">{modName}</span>
            <div className="flex flex-wrap gap-2">
              {modPerms.map((p) => {
                const selected = selectedIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onToggle(p.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      selected
                        ? 'bg-primary text-primary-foreground border-primary font-bold'
                        : 'bg-background text-muted-foreground border-border/60 hover:border-border'
                    }`}>
                    {selected && <Check className="w-3 h-3 stroke-[3]" />}
                    {p.action}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

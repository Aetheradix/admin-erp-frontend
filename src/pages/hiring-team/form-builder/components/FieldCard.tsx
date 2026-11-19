import { Eye, Trash2 } from 'lucide-react';
import type { FormFieldConfig } from '@/services/employeeProfileService';

interface FieldCardProps {
  field: FormFieldConfig;
  onToggleRequired: () => void;
  onToggleHidden: () => void;
  onRemove: () => void;
}

export function FieldCard({ field, onToggleRequired, onToggleHidden, onRemove }: FieldCardProps) {
  return (
    <div
      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
        field.hidden
          ? 'bg-surface-subtle border-dashed border-border-subtle opacity-60'
          : 'bg-white border-border-subtle'
      }`}>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-foreground">{field.label}</span>
          {field.required && <span className="text-error font-bold text-xs">*</span>}
          <span className="text-[10px] font-mono text-muted bg-surface-subtle px-1.5 py-0.5 rounded">
            {field.type}
          </span>
        </div>
        <span className="text-[11px] font-mono text-muted">key: {field.key}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onToggleRequired}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
            field.required
              ? 'bg-error/10 text-error'
              : 'bg-surface-subtle text-muted hover:text-foreground'
          }`}
          title="Toggle Required">
          {field.required ? 'Req' : 'Opt'}
        </button>

        <button
          type="button"
          onClick={onToggleHidden}
          className={`p-1.5 rounded-lg text-xs ${
            field.hidden ? 'bg-warning/10 text-warning' : 'text-muted hover:text-foreground'
          }`}
          title={field.hidden ? 'Show Field' : 'Hide Field'}>
          <Eye size={13} />
        </button>

        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg text-muted hover:text-error transition-colors"
          title="Delete Field">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

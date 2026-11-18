import { Plus } from 'lucide-react';
import type { FormSectionConfig } from '@/services/employeeProfileService';
import { FieldCard } from './FieldCard';

interface SectionFieldsProps {
  section: FormSectionConfig;
  onOpenAddField: () => void;
  onToggleFieldRequired: (fieldId: string) => void;
  onToggleFieldHidden: (fieldId: string) => void;
  onRemoveField: (fieldId: string) => void;
}

export function SectionFields({
  section,
  onOpenAddField,
  onToggleFieldRequired,
  onToggleFieldHidden,
  onRemoveField,
}: SectionFieldsProps) {
  return (
    <div className="border-t border-border-subtle p-5 bg-surface-subtle/30 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground uppercase tracking-wider">
          Fields in this section ({section.fields.length})
        </span>
        <button
          type="button"
          onClick={onOpenAddField}
          className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-all flex items-center gap-1 border border-primary/20">
          <Plus size={13} />
          Add Field
        </button>
      </div>

      {section.fields.length === 0 ? (
        <div className="p-4 rounded-2xl bg-white border border-border-subtle text-center text-xs text-muted">
          No custom fields configured for this section yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {section.fields.map((field) => (
            <FieldCard
              key={field.key}
              field={field}
              onToggleRequired={() => onToggleFieldRequired(field.id)}
              onToggleHidden={() => onToggleFieldHidden(field.id)}
              onRemove={() => onRemoveField(field.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import { Plus } from 'lucide-react';
import { Dialog } from '@/components/ui/composed/Dialog';
import { FIELD_TYPE_OPTIONS } from '../constants';
import type { FieldDraft } from '../types';

interface AddFieldDialogProps {
  visible: boolean;
  draft: FieldDraft;
  onChange: (patch: Partial<FieldDraft>) => void;
  onClose: () => void;
  onCreate: () => void;
}

export function AddFieldDialog({ visible, draft, onChange, onClose, onCreate }: AddFieldDialogProps) {
  return (
    <Dialog
      visible={visible}
      onHide={onClose}
      width={480}
      header={<h3 className="text-base font-black text-foreground">Add Custom Field</h3>}>
      <div className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">
            Field Label *
          </label>
          <input
            type="text"
            placeholder="e.g. LinkedIn Profile URL"
            value={draft.label}
            onChange={(e) => onChange({ label: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-border-subtle text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">
              Field Key (Variable Name)
            </label>
            <input
              type="text"
              placeholder="e.g. linkedin_url"
              value={draft.key}
              onChange={(e) => onChange({ key: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border-subtle font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">
              Field Type
            </label>
            <select
              value={draft.type}
              onChange={(e) => onChange({ type: e.target.value as FieldDraft['type'] })}
              className="w-full px-4 py-2.5 rounded-xl border border-border-subtle text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              {FIELD_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">
            Placeholder
          </label>
          <input
            type="text"
            placeholder="e.g. https://linkedin.com/in/username"
            value={draft.placeholder}
            onChange={(e) => onChange({ placeholder: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-border-subtle text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="fieldRequired"
            checked={draft.required}
            onChange={(e) => onChange({ required: e.target.checked })}
            className="rounded text-primary focus:ring-primary"
          />
          <label htmlFor="fieldRequired" className="text-xs font-bold text-foreground cursor-pointer">
            Mark this field as mandatory for profile submission
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border-subtle bg-white text-foreground text-xs font-bold">
            Cancel
          </button>
          <button
            type="button"
            onClick={onCreate}
            className="px-5 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold shadow-xs flex items-center gap-1.5">
            <Plus size={14} />
            Add Field
          </button>
        </div>
      </div>
    </Dialog>
  );
}

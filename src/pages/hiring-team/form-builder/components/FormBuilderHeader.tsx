import { Eye, RotateCcw, Save } from 'lucide-react';
import { PageHeader } from '@/components/ui/composed/PageHeader';

interface FormBuilderHeaderProps {
  isSaving: boolean;
  onReset: () => void;
  onPreview: () => void;
  onSave: () => void;
}

export function FormBuilderHeader({
  isSaving,
  onReset,
  onPreview,
  onSave,
}: FormBuilderHeaderProps) {
  return (
    <PageHeader
      title="Dynamic Form Builder"
      subtitle="Customize sections, fields, validations, and role assignments for employee onboarding."
      back
      actions={
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 rounded-xl border border-border-subtle bg-white hover:bg-surface-subtle text-xs font-bold text-muted hover:text-foreground transition-all flex items-center gap-1.5">
            <RotateCcw size={13} />
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={onPreview}
            className="px-4 py-2 rounded-xl border border-border-subtle bg-white hover:bg-surface-subtle text-xs font-bold text-foreground transition-all flex items-center gap-1.5">
            <Eye size={14} className="text-primary" />
            Preview Form
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50">
            <Save size={14} />
            Publish Configuration
          </button>
        </div>
      }
    />
  );
}

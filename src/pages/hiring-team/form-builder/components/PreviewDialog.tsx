import { Eye, Layers } from 'lucide-react';
import { Dialog } from '@/components/ui/composed/Dialog';
import type { FormSectionConfig } from '@/services/employeeProfileService';
import { SECTION_ICONS } from '../constants';

interface PreviewDialogProps {
  visible: boolean;
  sections: FormSectionConfig[];
  onClose: () => void;
}

export function PreviewDialog({ visible, sections, onClose }: PreviewDialogProps) {
  return (
    <Dialog
      visible={visible}
      onHide={onClose}
      width={750}
      header={
        <div className="flex items-center gap-2">
          <Eye size={18} className="text-primary" />
          <h3 className="text-base font-black text-foreground">Employee Form Preview</h3>
        </div>
      }>
      <div className="space-y-6 pt-2 max-h-[70vh] overflow-y-auto pr-2">
        <p className="text-xs text-muted">
          This is how the onboarding form will look to employees during profile completion based on
          your current configuration:
        </p>

        {sections
          .filter((s) => !s.hidden)
          .map((sec) => {
            const Icon = SECTION_ICONS[sec.id] || Layers;
            return (
              <div
                key={sec.id}
                className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Icon size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      {sec.title} {sec.required && <span className="text-error">*</span>}
                    </h4>
                    <p className="text-[11px] text-muted">{sec.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {sec.fields
                    .filter((f) => !f.hidden)
                    .map((field) => (
                      <div
                        key={field.key}
                        className={field.type === 'textarea' ? 'col-span-2' : ''}>
                        <label className="block text-[11px] font-bold text-foreground mb-1 uppercase tracking-wider">
                          {field.label} {field.required && <span className="text-error">*</span>}
                        </label>
                        <input
                          type="text"
                          disabled
                          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                          className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-white text-xs text-muted cursor-not-allowed"
                        />
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
      </div>
    </Dialog>
  );
}

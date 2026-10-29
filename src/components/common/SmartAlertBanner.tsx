import { AlertTriangle, CheckCircle2, ChevronRight, FileWarning, RotateCcw } from 'lucide-react';
import type { FormSectionConfig } from '@/services/employeeProfileService';

interface SmartAlertBannerProps {
  completionPercentage: number;
  incompleteSections: FormSectionConfig[];
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
  hasRestoredDraft?: boolean;
  onDiscardDraft?: () => void;
  isDirty?: boolean;
  onSaveDirty?: () => void;
}

export function SmartAlertBanner({
  completionPercentage,
  incompleteSections,
  activeSection,
  onSelectSection,
  hasRestoredDraft,
  onDiscardDraft,
  isDirty,
  onSaveDirty,
}: SmartAlertBannerProps) {
  // If 100% complete and no drafts/dirty changes, hide alert
  if (completionPercentage >= 100 && !hasRestoredDraft && !isDirty) {
    return (
      <div className="mx-8 mb-6 p-4 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-success/20 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} className="text-success" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-success">
              Profile 100% Complete & Verified
            </div>
            <p className="text-xs text-success/80 mt-0.5">
              All required fields and documents have been provided. You can update any section at any time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 1. Unsaved Changes Alert
  if (isDirty) {
    return (
      <div className="mx-8 mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 animate-in fade-in duration-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Unsaved Changes in Current Section
            </div>
            <p className="text-xs text-amber-600/90 dark:text-amber-400/90 mt-0.5">
              You have modified fields that have not been permanently saved.
            </p>
          </div>
        </div>
        {onSaveDirty && (
          <button
            onClick={onSaveDirty}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-sm hover:bg-amber-700 transition-all shrink-0">
            Save Now
          </button>
        )}
      </div>
    );
  }

  // 2. Draft Restored Alert
  if (hasRestoredDraft) {
    return (
      <div className="mx-8 mb-6 p-4 rounded-2xl bg-info/10 border border-info/30 flex items-center justify-between gap-4 animate-in fade-in duration-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-info/20 flex items-center justify-center shrink-0">
            <RotateCcw size={18} className="text-info" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-info">
              Unsaved Draft Auto-Restored
            </div>
            <p className="text-xs text-info/90 mt-0.5">
              We recovered your previous in-progress entries so you don't have to re-enter them.
            </p>
          </div>
        </div>
        {onDiscardDraft && (
          <button
            onClick={onDiscardDraft}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-info/30 bg-white text-info text-xs font-bold hover:bg-info/10 transition-all shrink-0">
            Discard Draft
          </button>
        )}
      </div>
    );
  }

  // 3. Incomplete Sections Warning
  if (incompleteSections.length > 0) {
    const nextIncomplete =
      incompleteSections.find((s) => s.id !== activeSection) || incompleteSections[0];

    return (
      <div className="mx-8 mb-6 p-4 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 md:mt-0">
            <FileWarning size={18} className="text-primary" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-foreground">
              Profile Completion: {completionPercentage}% — Action Required
            </div>
            <p className="text-xs text-muted mt-0.5">
              {incompleteSections.length}{' '}
              {incompleteSections.length === 1 ? 'section remains' : 'sections remain'} incomplete:{' '}
              <span className="font-semibold text-foreground">
                {incompleteSections.map((s) => s.label).join(', ')}
              </span>
            </p>
          </div>
        </div>

        {nextIncomplete && nextIncomplete.id !== activeSection && (
          <button
            onClick={() => onSelectSection(nextIncomplete.id)}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all shrink-0">
            Complete {nextIncomplete.label}
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    );
  }

  return null;
}


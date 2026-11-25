import { AlertCircle, CheckCircle2, Clock, FileText, ListChecks } from 'lucide-react';
import {
  calculateCompletionPercentage,
  type FormSectionConfig,
  type ProfileCompletionData,
} from '@/services/employeeProfileService';
import { SECTION_ICON_MAP } from '../../constants';
import { buildQuickSummary } from '../../utils';
import type { ReviewTab } from '../../types';

interface OverviewTabProps {
  profile: ProfileCompletionData;
  formConfig: FormSectionConfig[];
  onNavigate: (tab: ReviewTab) => void;
}

export function OverviewTab({ profile, formConfig, onNavigate }: OverviewTabProps) {
  const pct = calculateCompletionPercentage(profile, formConfig);

  return (
    <div className="space-y-5">
      {/* Completion progress */}
      <div className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-foreground">Overall Profile Completion</span>
          <span className="text-xl font-black text-primary">{pct}%</span>
        </div>
        <div className="h-2.5 w-full bg-white rounded-full overflow-hidden border border-border-subtle">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Section-by-section status */}
      <div>
        <div className="text-xs font-bold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <ListChecks size={13} />
          Section Completion Status
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {formConfig
            .filter((s) => !s.hidden)
            .sort((a, b) => a.order - b.order)
            .map((section) => {
              const SectionIcon = SECTION_ICON_MAP[section.id] || FileText;
              const done = !!profile.completedSections?.[section.id];
              return (
                <div
                  key={section.id}
                  onClick={() => onNavigate(section.id as ReviewTab)}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all hover:shadow-xs ${
                    done
                      ? 'bg-success/5 border-success/25'
                      : 'bg-surface-subtle border-border-subtle'
                  }`}>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${done ? 'bg-success/15' : 'bg-surface-subtle border border-border-subtle'}`}>
                    <SectionIcon size={15} className={done ? 'text-success' : 'text-muted'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-foreground">{section.label}</div>
                    <div className="text-[10px] text-muted">{section.description}</div>
                  </div>
                  <div className="shrink-0">
                    {done ? (
                      <CheckCircle2 size={16} className="text-success" />
                    ) : (
                      <Clock size={16} className="text-muted" />
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Key data summary */}
      <div>
        <div className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
          Quick Data Summary
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {buildQuickSummary(profile).map((item) => (
            <div
              key={item.label}
              className="p-3 rounded-xl bg-surface-subtle border border-border-subtle">
              <div className="text-[10px] font-bold text-muted uppercase mb-0.5">{item.label}</div>
              <div className="text-xs font-semibold text-foreground">{item.value || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Review notes if any */}
      {profile.reviewNotes && (
        <div className="p-4 rounded-2xl bg-warning/5 border border-warning/20">
          <div className="text-[10px] font-bold text-warning uppercase mb-1 flex items-center gap-1.5">
            <AlertCircle size={11} />
            Revision Notes (sent to employee)
          </div>
          <div className="text-xs text-foreground">{profile.reviewNotes}</div>
        </div>
      )}
    </div>
  );
}

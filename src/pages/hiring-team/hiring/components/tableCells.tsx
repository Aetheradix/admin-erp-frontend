import { CheckCircle2, KeyRound, User } from 'lucide-react';
import {
  calculateCompletionPercentage,
  type FormSectionConfig,
  type ProfileCompletionData,
} from '@/services/employeeProfileService';

export function EmployeeCell({ record }: { record: ProfileCompletionData }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0 border border-border-subtle">
        {record.profilePictureUrl ? (
          <img src={record.profilePictureUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <User size={18} className="text-primary" />
        )}
      </div>
      <div>
        <div className="font-bold text-foreground text-sm">
          {record.personal?.fullName || 'Unnamed Employee'}
        </div>
        <div className="text-xs text-muted">{record.userEmail}</div>
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          {record.role && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
              {record.role}
            </span>
          )}
          {record.department && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface-subtle text-muted border border-border-subtle">
              {record.department}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function CompletionCell({
  record,
  formConfig,
}: {
  record: ProfileCompletionData;
  formConfig: FormSectionConfig[];
}) {
  const pct = calculateCompletionPercentage(record, formConfig);
  const totalSections = formConfig.filter((s) => !s.hidden).length;
  const completedCount = formConfig.filter(
    (s) => !s.hidden && record.completedSections?.[s.id]
  ).length;

  return (
    <div className="w-36">
      <div className="flex justify-between items-center text-xs mb-1">
        <span className="font-semibold text-foreground">{pct}%</span>
        <span className="text-[10px] text-muted">
          {completedCount}/{totalSections} secs
        </span>
      </div>
      <div className="h-1.5 w-full bg-surface-subtle rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            pct === 100 ? 'bg-success' : pct > 50 ? 'bg-primary' : 'bg-warning'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Mini section dots */}
      <div className="flex gap-1 mt-1.5">
        {formConfig
          .filter((s) => !s.hidden)
          .map((section) => (
            <div
              key={section.id}
              title={section.label}
              className={`w-2 h-2 rounded-full transition-colors ${
                record.completedSections?.[section.id]
                  ? 'bg-success'
                  : 'bg-surface-subtle border border-border-subtle'
              }`}
            />
          ))}
      </div>
    </div>
  );
}

export function EmployeeIdCell({ employeeId }: { employeeId?: string }) {
  if (!employeeId) {
    return <span className="text-xs text-muted italic">Not Assigned</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
      <KeyRound size={12} />
      {employeeId}
    </span>
  );
}

export function ApprovedBadge() {
  return (
    <span className="px-2.5 py-1 rounded-xl bg-success/10 text-success text-[11px] font-bold flex items-center gap-1 border border-success/20">
      <CheckCircle2 size={12} />
      Approved
    </span>
  );
}

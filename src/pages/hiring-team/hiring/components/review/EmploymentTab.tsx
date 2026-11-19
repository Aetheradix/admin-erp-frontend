import type { ProfileCompletionData } from '@/services/employeeProfileService';

interface EmploymentTabProps {
  profile: ProfileCompletionData;
}

export function EmploymentTab({ profile }: EmploymentTabProps) {
  return (
    <div className="space-y-3">
      {profile.employment && profile.employment.length > 0 ? (
        profile.employment.map((emp, i) => (
          <div
            key={emp.id || i}
            className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-bold text-foreground">{emp.designation}</div>
                <div className="text-xs text-muted">{emp.employer}</div>
              </div>
              <span className="text-[11px] font-mono text-muted">
                {emp.startDate} — {emp.isCurrent ? 'Present' : emp.endDate}
              </span>
            </div>
            {emp.salary && <div className="text-xs text-muted">Salary: {emp.salary}</div>}
            {emp.responsibilities && (
              <div className="text-xs text-muted border-t border-border-subtle pt-2">
                {emp.responsibilities}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-xs text-muted italic p-4 bg-surface-subtle rounded-xl text-center">
          No previous employment recorded.
        </div>
      )}
    </div>
  );
}

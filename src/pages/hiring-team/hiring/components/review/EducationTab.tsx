import type { ProfileCompletionData } from '@/services/employeeProfileService';

interface EducationTabProps {
  profile: ProfileCompletionData;
}

export function EducationTab({ profile }: EducationTabProps) {
  return (
    <div className="space-y-3">
      {profile.education && profile.education.length > 0 ? (
        profile.education.map((edu, i) => (
          <div
            key={edu.id || i}
            className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-1">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-bold text-foreground">
                  {edu.degree}
                  {edu.field ? ` in ${edu.field}` : ''}
                </div>
                <div className="text-xs text-muted">{edu.institution}</div>
              </div>
              <span className="text-[11px] font-mono text-muted">
                {edu.startYear} – {edu.endYear}
              </span>
            </div>
            {edu.grade && (
              <div className="text-xs text-muted">Grade / Percentage: {edu.grade}</div>
            )}
          </div>
        ))
      ) : (
        <div className="text-xs text-muted italic p-4 bg-surface-subtle rounded-xl text-center">
          No education history recorded.
        </div>
      )}
    </div>
  );
}

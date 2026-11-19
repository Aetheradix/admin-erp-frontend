import { useState } from 'react';
import type { FormSectionConfig, ProfileCompletionData } from '@/services/employeeProfileService';
import { OnboardingProfileRow } from './OnboardingProfileRow';

interface OnboardingProgressPanelProps {
  profiles: ProfileCompletionData[];
  formConfig: FormSectionConfig[];
}

// Onboarding Progress Panel — shows each employee's section-by-section status
export function OnboardingProgressPanel({ profiles, formConfig }: OnboardingProgressPanelProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const onboardingProfiles = profiles.filter(
    (p) =>
      p.status === 'in_progress' ||
      p.status === 'incomplete' ||
      p.status === 'submitted' ||
      p.status === 'changes_required'
  );

  if (onboardingProfiles.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-muted italic">
        No employees currently in the onboarding process.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {onboardingProfiles.map((profile) => {
        const isExpanded = expanded === profile.userId;
        return (
          <OnboardingProfileRow
            key={profile.userId}
            profile={profile}
            formConfig={formConfig}
            expanded={isExpanded}
            onToggle={() => setExpanded(isExpanded ? null : profile.userId)}
          />
        );
      })}
    </div>
  );
}

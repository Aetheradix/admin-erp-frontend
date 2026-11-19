import { TrendingUp } from 'lucide-react';
import type { FormSectionConfig, ProfileCompletionData } from '@/services/employeeProfileService';
import { OnboardingProgressPanel } from './OnboardingProgressPanel';

interface OnboardingPanelProps {
  profiles: ProfileCompletionData[];
  formConfig: FormSectionConfig[];
  onboardingCount: number;
}

export function OnboardingPanel({ profiles, formConfig, onboardingCount }: OnboardingPanelProps) {
  return (
    <div className="bg-white rounded-3xl border border-border-subtle overflow-hidden shadow-xs">
      <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-warning" />
          <h2 className="text-sm font-black text-foreground">Live Onboarding Progress</h2>
          <span className="text-[10px] font-bold text-muted bg-surface-subtle border border-border-subtle px-2 py-0.5 rounded-full">
            {onboardingCount} employees
          </span>
        </div>
        <div className="text-xs text-muted">Click any row to see filled section details</div>
      </div>
      <div className="p-5">
        <OnboardingProgressPanel profiles={profiles} formConfig={formConfig} />
      </div>
    </div>
  );
}

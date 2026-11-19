import { OVERVIEW_TAB, ONBOARDING_TABS } from '../../constants';
import type { ReviewTab } from '../../types';
import type { ProfileCompletionData } from '@/services/employeeProfileService';

interface ReviewTabNavProps {
  profile: ProfileCompletionData;
  activeTab: ReviewTab;
  onChange: (tab: ReviewTab) => void;
}

const REVIEW_TABS = [OVERVIEW_TAB, ...ONBOARDING_TABS];

export function ReviewTabNav({ profile, activeTab, onChange }: ReviewTabNavProps) {
  return (
    <div className="flex items-center gap-2 border-b border-border-subtle pb-3 overflow-x-auto">
      {REVIEW_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        // Mark completion status for non-overview tabs
        const isDone = tab.id !== 'overview' && profile.completedSections?.[tab.id];
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all relative ${
              isActive
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-subtle text-muted hover:text-foreground'
            }`}>
            <Icon size={14} />
            {tab.label}
            {tab.id !== 'overview' && (
              <span
                className={`w-1.5 h-1.5 rounded-full ${isDone ? 'bg-success' : 'bg-muted/40'} ${isActive ? 'bg-white/50' : ''}`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

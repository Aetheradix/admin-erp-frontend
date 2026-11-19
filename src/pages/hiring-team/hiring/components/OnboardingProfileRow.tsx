import { ChevronDown, ChevronUp, User } from 'lucide-react';
import { calculateCompletionPercentage } from '@/services/employeeProfileService';
import type { FormSectionConfig, ProfileCompletionData } from '@/services/employeeProfileService';
import { STATUS_MAP } from '../constants';
import { OnboardingProfileDetail } from './OnboardingProfileDetail';

interface OnboardingProfileRowProps {
  profile: ProfileCompletionData;
  formConfig: FormSectionConfig[];
  expanded: boolean;
  onToggle: () => void;
}

export function OnboardingProfileRow({
  profile,
  formConfig,
  expanded,
  onToggle,
}: OnboardingProfileRowProps) {
  const pct = calculateCompletionPercentage(profile, formConfig);
  const conf = STATUS_MAP[profile.status] || STATUS_MAP.incomplete;
  const Icon = conf.icon;
  const totalSections = formConfig.filter((s) => !s.hidden).length;
  const completedCount = formConfig.filter(
    (s) => !s.hidden && profile.completedSections?.[s.id]
  ).length;

  return (
    <div className="border border-border-subtle rounded-2xl overflow-hidden bg-white hover:shadow-sm transition-all">
      {/* Row header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left group">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-primary/10 border border-border-subtle flex items-center justify-center shrink-0 overflow-hidden">
            {profile.profilePictureUrl ? (
              <img src={profile.profilePictureUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={16} className="text-primary" />
            )}
          </div>

          {/* Name + email */}
          <div className="min-w-0">
            <div className="text-sm font-bold text-foreground truncate">
              {profile.personal?.fullName || profile.userEmail}
            </div>
            <div className="text-[11px] text-muted truncate">{profile.userEmail}</div>
          </div>

          {/* Status badge */}
          <span
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${conf.bg} shrink-0`}
            style={{ lineHeight: '1' }}>
            <Icon size={10} style={{ display: 'block', flexShrink: 0 }} />
            <span>{conf.label}</span>
          </span>

          {/* Progress bar */}
          <div className="hidden lg:flex items-center gap-3 flex-1 max-w-xs">
            <div className="flex-1 h-1.5 bg-surface-subtle rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  pct === 100 ? 'bg-success' : pct > 50 ? 'bg-primary' : 'bg-warning'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-bold text-foreground shrink-0">{pct}%</span>
            <span className="text-[10px] text-muted shrink-0">
              {completedCount}/{totalSections} sections
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-3">
          <span className="text-[11px] text-muted hidden md:block">
            Updated{' '}
            {profile.lastSavedAt ? new Date(profile.lastSavedAt).toLocaleDateString() : '—'}
          </span>
          {expanded ? (
            <ChevronUp
              size={16}
              className="text-muted group-hover:text-foreground transition-colors"
            />
          ) : (
            <ChevronDown
              size={16}
              className="text-muted group-hover:text-foreground transition-colors"
            />
          )}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && <OnboardingProfileDetail profile={profile} formConfig={formConfig} />}
    </div>
  );
}

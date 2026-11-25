import { ListChecks } from 'lucide-react';
import type { FormSectionConfig, ProfileCompletionData } from '@/services/employeeProfileService';
import { SectionBadge } from './SectionBadge';

interface OnboardingProfileDetailProps {
  profile: ProfileCompletionData;
  formConfig: FormSectionConfig[];
}

export function OnboardingProfileDetail({ profile, formConfig }: OnboardingProfileDetailProps) {
  return (
    <div className="border-t border-border-subtle px-5 py-4 bg-surface-subtle/50 space-y-4">
      {/* Section completion grid */}
      <div>
        <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <ListChecks size={11} />
          Section Completion Status
        </div>
        <div className="flex flex-wrap gap-2">
          {formConfig
            .filter((s) => !s.hidden)
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <SectionBadge
                key={section.id}
                sectionId={section.id}
                sectionLabel={section.label}
                completed={!!profile.completedSections?.[section.id]}
              />
            ))}
        </div>
      </div>

      {/* Quick data highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-white border border-border-subtle">
          <div className="text-[10px] font-bold text-muted uppercase mb-1">Full Name</div>
          <div className="text-xs font-semibold text-foreground">
            {profile.personal?.fullName || '—'}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-white border border-border-subtle">
          <div className="text-[10px] font-bold text-muted uppercase mb-1">Contact</div>
          <div className="text-xs font-semibold text-foreground">
            {profile.personal?.contactNumber || '—'}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-white border border-border-subtle">
          <div className="text-[10px] font-bold text-muted uppercase mb-1">Bank</div>
          <div className="text-xs font-semibold text-foreground">
            {profile.bank?.bankName || '—'}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-white border border-border-subtle">
          <div className="text-[10px] font-bold text-muted uppercase mb-1">Documents</div>
          <div className="text-xs font-semibold text-foreground">
            {profile.documents?.length ? `${profile.documents.length} uploaded` : 'None yet'}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-white border border-border-subtle">
          <div className="text-[10px] font-bold text-muted uppercase mb-1">PAN</div>
          <div className="text-xs font-mono font-semibold text-foreground">
            {profile.identity?.panNumber || '—'}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-white border border-border-subtle">
          <div className="text-[10px] font-bold text-muted uppercase mb-1">Aadhaar</div>
          <div className="text-xs font-mono font-semibold text-foreground">
            {profile.identity?.aadhaarNumber
              ? `•••• ${profile.identity.aadhaarNumber.slice(-4)}`
              : '—'}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-white border border-border-subtle">
          <div className="text-[10px] font-bold text-muted uppercase mb-1">Employment Entries</div>
          <div className="text-xs font-semibold text-foreground">
            {profile.employment?.length ? `${profile.employment.length} entries` : 'None'}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-white border border-border-subtle">
          <div className="text-[10px] font-bold text-muted uppercase mb-1">Education Entries</div>
          <div className="text-xs font-semibold text-foreground">
            {profile.education?.length ? `${profile.education.length} entries` : 'None'}
          </div>
        </div>
      </div>

      {/* Review notes if present */}
      {profile.reviewNotes && (
        <div className="p-3 rounded-xl bg-warning/5 border border-warning/20">
          <div className="text-[10px] font-bold text-warning uppercase mb-1">
            Pending Revision Notes
          </div>
          <div className="text-xs text-foreground">{profile.reviewNotes}</div>
        </div>
      )}
    </div>
  );
}

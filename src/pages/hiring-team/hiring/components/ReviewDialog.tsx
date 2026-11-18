import { User } from 'lucide-react';
import { Dialog } from '@/components/ui/composed/Dialog';
import type { FormSectionConfig, ProfileCompletionData } from '@/services/employeeProfileService';
import { STATUS_MAP } from '../constants';
import type { ReviewTab } from '../types';
import { ReviewTabNav } from './review/ReviewTabNav';
import { OverviewTab } from './review/OverviewTab';
import { PersonalTab } from './review/PersonalTab';
import { BankTab } from './review/BankTab';
import { IdentityTab } from './review/IdentityTab';
import { EmploymentTab } from './review/EmploymentTab';
import { EducationTab } from './review/EducationTab';
import { CertificationsTab } from './review/CertificationsTab';
import { ReviewActionBar } from './review/ReviewActionBar';

interface ReviewDialogProps {
  visible: boolean;
  profile: ProfileCompletionData | null;
  formConfig: FormSectionConfig[];
  activeTab: ReviewTab;
  canAssignId: boolean;
  onTabChange: (tab: ReviewTab) => void;
  onClose: () => void;
  onRequestRevisions: () => void;
  onApprove: () => void;
  onOpenAssignId: () => void;
}

export function ReviewDialog({
  visible,
  profile,
  formConfig,
  activeTab,
  canAssignId,
  onTabChange,
  onClose,
  onRequestRevisions,
  onApprove,
  onOpenAssignId,
}: ReviewDialogProps) {
  const statusConf = profile ? STATUS_MAP[profile.status] ?? STATUS_MAP.incomplete : null;

  return (
    <Dialog
      visible={visible}
      onHide={onClose}
      width={900}
      header={
        <div className="flex items-center justify-between pr-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center">
              {profile?.profilePictureUrl ? (
                <img src={profile.profilePictureUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={20} className="text-primary" />
              )}
            </div>
            <div>
              <h3 className="text-base font-black text-foreground">
                {profile?.personal?.fullName || 'Employee Profile'}
              </h3>
              <p className="text-xs text-muted">{profile?.userEmail}</p>
            </div>
          </div>
          {profile && statusConf && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusConf.bg}`}>
              {statusConf.label}
            </span>
          )}
        </div>
      }>
      {profile && (
        <div className="space-y-6 pt-2">
          <ReviewTabNav profile={profile} activeTab={activeTab} onChange={onTabChange} />

          {activeTab === 'overview' && (
            <OverviewTab profile={profile} formConfig={formConfig} onNavigate={onTabChange} />
          )}
          {activeTab === 'personal' && <PersonalTab profile={profile} />}
          {activeTab === 'bank' && <BankTab profile={profile} />}
          {activeTab === 'identity' && <IdentityTab profile={profile} />}
          {activeTab === 'employment' && <EmploymentTab profile={profile} />}
          {activeTab === 'education' && <EducationTab profile={profile} />}
          {activeTab === 'certifications' && <CertificationsTab profile={profile} />}

          <ReviewActionBar
            profile={profile}
            canAssignId={canAssignId}
            onRequestRevisions={onRequestRevisions}
            onApprove={onApprove}
            onOpenAssignId={onOpenAssignId}
          />
        </div>
      )}
    </Dialog>
  );
}

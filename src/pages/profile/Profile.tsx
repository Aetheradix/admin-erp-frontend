import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Dialog } from '@/components/ui/composed/Dialog';
import { useProfile } from './hooks/useProfile';
import { AdminElevationRequest } from '../staff/components/AdminElevationRequest';
import { ProfileHeader, type TabType } from './components/ProfileHeader';
import { ProfileInfoTab } from './components/ProfileInfoTab';
import { OrganizationTab } from './components/OrganizationTab';
import { OverviewTab } from './components/OverviewTab';
import { ProfileForm } from './components/ProfileForm';
import { ChangePasswordModal } from '@/components/auth/ChangePasswordModal';
import {
  getEmployeeProfile,
  getFormConfiguration,
  calculateCompletionPercentage,
  getIncompleteRequiredSections,
} from '@/services/employeeProfileService';
import { FileCheck, ShieldCheck, KeyRound, ChevronRight } from 'lucide-react';

const Profile = () => {
  const {
    user,
    isEditing,
    setIsEditing,
    showElevationDialog,
    setShowElevationDialog,
    handleEditSave,
    addRole,
    removeRole,
    handleAutoApproveToggle,
    isUpdatingAutoApprove,
    isLoadingAutoApprove,
  } = useProfile();

  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileRefresh, setProfileRefresh] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setProfileRefresh((p) => p + 1);
    window.addEventListener('aether_employee_profiles_updated', handleUpdate);
    window.addEventListener('auth_user_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('aether_employee_profiles_updated', handleUpdate);
      window.removeEventListener('auth_user_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const empProfile = useMemo(() => {
    if (!user) return null;
    // Try email first (most profiles are stored by email), fallback to numeric id
    const byEmail = user.email ? getEmployeeProfile(user.email) : null;
    return byEmail ?? (user.id ? getEmployeeProfile(user.id) : null);
  }, [user?.id, user?.email, profileRefresh]);

  const effectiveUser = useMemo(() => {
    let id = (user.employeeId && user.employeeId !== 'N/A' && user.employeeId !== 'NA')
      ? user.employeeId
      : (empProfile?.employeeId && empProfile.employeeId !== 'N/A' && empProfile.employeeId !== 'NA')
        ? empProfile.employeeId
        : null;

    // Last resort: check staff list directly
    if (!id) {
      try {
        const staffStr = localStorage.getItem('aether_staff_list');
        if (staffStr) {
          const list = JSON.parse(staffStr);
          const found = list.find((s: any) =>
            (user.email && s.email?.toLowerCase() === user.email.toLowerCase()) ||
            (user.id && String(s.id) === String(user.id))
          );
          if (found && (found.employee_code || found.employee_id || found.employeeId)) {
            id = found.employee_code || found.employee_id || found.employeeId;
          }
        }
      } catch {}
    }

    return {
      ...user,
      employeeId: id || 'N/A',
    };
  }, [user, empProfile?.employeeId]);

  const formConfig = useMemo(() => getFormConfiguration(), []);

  const completionPct = useMemo(() => {
    return calculateCompletionPercentage(empProfile, formConfig);
  }, [empProfile, formConfig]);

  const incompleteSections = useMemo(() => {
    return getIncompleteRequiredSections(empProfile, formConfig);
  }, [empProfile, formConfig]);

  return (
    <div className="flex flex-col gap-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto w-full">
      <PageHeader
        title="User Profile"
        description="View and edit your personal details, contact matrix, and organizational hierarchy."
        primaryAction={
          !isEditing
            ? {
                label: 'Edit Profile',
                onClick: () => setIsEditing(true),
                icon: 'pi pi-user-edit',
                className:
                  'px-6! py-3! rounded-2xl! font-bold! tracking-wide! shadow-md! shadow-primary/20!',
              }
            : undefined
        }
      />

      {/* Onboarding & Profile Verification Widget */}
      <div className="p-6 rounded-3xl bg-surface-subtle border border-border-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
            {completionPct === 100 ? <ShieldCheck size={24} /> : <FileCheck size={24} />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-black text-foreground">
                Employee Verification & Profile Completion
              </h4>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  empProfile?.status === 'id_assigned' || empProfile?.status === 'approved'
                    ? 'bg-success/10 text-success border-success/20'
                    : empProfile?.status === 'submitted'
                    ? 'bg-info/10 text-info border-info/20'
                    : empProfile?.status === 'changes_required'
                    ? 'bg-warning/10 text-warning border-warning/20'
                    : 'bg-primary/10 text-primary border-primary/20'
                }`}
              >
                {empProfile?.status ? empProfile.status.replace('_', ' ').toUpperCase() : 'INCOMPLETE'}
              </span>
              {empProfile?.employeeId && (
                <span className="text-[11px] font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md border border-primary/15 flex items-center gap-1">
                  <KeyRound size={11} />
                  ID: {empProfile.employeeId}
                </span>
              )}
            </div>
            <p className="text-xs text-muted mt-1">
              {completionPct === 100
                ? 'All mandatory onboarding fields and documents have been submitted.'
                : `${incompleteSections.length} mandatory section${
                    incompleteSections.length === 1 ? '' : 's'
                  } pending verification (${incompleteSections.map((s) => s.label).join(', ')}).`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-foreground">{completionPct}% Completed</div>
            <div className="w-28 h-1.5 bg-border-subtle rounded-full overflow-hidden mt-1">
              <div
                className={`h-full ${
                  completionPct === 100 ? 'bg-success' : 'bg-primary'
                } transition-all duration-500`}
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>

          <Link
            to="/profile-completion"
            className="px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold shadow-xs transition-all flex items-center gap-2 shrink-0"
          >
            <span>{completionPct === 100 ? 'View Details' : 'Complete Profile'}</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Header Container & Navigation Tabs */}
      <ProfileHeader
        user={effectiveUser}
        isEditing={isEditing}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onStartEdit={() => setIsEditing(true)}
        onChangePassword={() => setShowPasswordModal(true)}
        onAddRole={addRole}
        onRemoveRole={removeRole}
      />

      {/* Main Tab Content / Form View */}
      {isEditing ? (
        <div className="bg-surface-elevated rounded-3xl border border-border-subtle p-8 shadow-soft">
          <ProfileForm
            initialData={effectiveUser}
            onSave={handleEditSave}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <>
          {activeTab === 'profile' && (
            <ProfileInfoTab
              user={effectiveUser}
              isEditing={isEditing}
              onStartEdit={() => setIsEditing(true)}
              onElevationClick={() => setShowElevationDialog(true)}
            />
          )}

          {activeTab === 'organization' && <OrganizationTab user={effectiveUser} />}

          {activeTab === 'overview' && <OverviewTab user={effectiveUser} />}
        </>
      )}

      {/* Elevation Dialog */}
      <Dialog
        visible={showElevationDialog}
        onHide={() => setShowElevationDialog(false)}
        header="Request Admin Rights Elevation"
        style={{ width: '450px' }}>
        <AdminElevationRequest onSuccess={() => setShowElevationDialog(false)} />
      </Dialog>

      <div className="flex items-center gap-3">
        <span className="font-medium">Auto Approve</span>

        <button
          type="button"
          onClick={handleAutoApproveToggle}
          disabled={isUpdatingAutoApprove || isLoadingAutoApprove}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            user.autoApprove ? 'bg-primary' : 'bg-gray-300'
          } ${
            isUpdatingAutoApprove || isLoadingAutoApprove ? 'cursor-not-allowed opacity-50' : ''
          }`}
          aria-pressed={user.autoApprove}
          aria-label="Toggle auto approve">
          <span
            className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              user.autoApprove ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>

        <span className="text-sm text-muted-foreground">{user.autoApprove ? 'True' : 'False'}</span>
      </div>

      <ChangePasswordModal
        visible={showPasswordModal}
        onHide={() => setShowPasswordModal(false)}
        requireCurrentPassword={true}
      />
    </div>
  );
};

export default Profile;

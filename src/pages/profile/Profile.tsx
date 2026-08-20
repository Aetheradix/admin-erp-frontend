import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Dialog } from '@/components/ui/composed/Dialog';
import { useProfile } from './hooks/useProfile';
import { AdminElevationRequest } from '../staff/components/AdminElevationRequest';

import { ProfileHeader, type TabType } from './components/ProfileHeader';
import { ProfileInfoTab } from './components/ProfileInfoTab';
import { OrganizationTab } from './components/OrganizationTab';
import { OverviewTab } from './components/OverviewTab';
import { ProfileForm } from './components/ProfileForm';

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

      {/* Header Container & Navigation Tabs */}
      <ProfileHeader
        user={user}
        isEditing={isEditing}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onStartEdit={() => setIsEditing(true)}
        onAddRole={addRole}
        onRemoveRole={removeRole}
      />

      {/* Main Tab Content / Form View */}
      {isEditing ? (
        <div className="bg-surface-elevated rounded-3xl border border-border-subtle p-8 shadow-soft">
          <ProfileForm
            initialData={user}
            onSave={handleEditSave}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <>
          {activeTab === 'profile' && (
            <ProfileInfoTab
              user={user}
              isEditing={isEditing}
              onStartEdit={() => setIsEditing(true)}
              onElevationClick={() => setShowElevationDialog(true)}
            />
          )}

          {activeTab === 'organization' && <OrganizationTab user={user} />}

          {activeTab === 'overview' && <OverviewTab user={user} />}
        </>
      )}

      {/* Elevation Dialog */}
      <Dialog
        visible={showElevationDialog}
        onHide={() => setShowElevationDialog(false)}
        header="Request Admin Rights Elevation"
        style={{ width: '450px' }}
      >
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
          aria-label="Toggle auto approve"
        >
          <span
            className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              user.autoApprove ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>

        <span className="text-sm text-muted-foreground">{user.autoApprove ? 'True' : 'False'}</span>
      </div>
    </div>
  );
};

export default Profile;

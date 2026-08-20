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
  } = useProfile();

  const [activeTab, setActiveTab] = useState<TabType>('profile');

  return (
    <div className="flex flex-col gap-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto w-full">
      <PageHeader
        title="User Profile"
        description="View and edit your personal details, contact matrix, and organizational hierarchy."
        primaryAction={!isEditing ? {
          label: 'Edit Profile',
          onClick: () => setIsEditing(true),
          icon: 'pi pi-user-edit',
          className: 'px-6! py-3! rounded-2xl! font-bold! tracking-wide! shadow-md! shadow-primary/20!',
        } : undefined}
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

          {activeTab === 'organization' && (
            <OrganizationTab user={user} />
          )}

          {activeTab === 'overview' && (
            <OverviewTab user={user} />
          )}
        </>
      )}

      {/* Elevation Dialog */}
      <Dialog
        visible={showElevationDialog}
        onHide={() => setShowElevationDialog(false)}
        header="Request Admin Rights Elevation"
        style={{ width: '450px' }}
      >
        <AdminElevationRequest
          onSuccess={() => setShowElevationDialog(false)}
        />
      </Dialog>
    </div>
  );
};

export default Profile;

import { useMemo } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Tabs } from '@/components/ui/primitives/Tabs';
import { ConfirmDialog } from '@/components/ui/composed/ConfirmDialog';
import { BranchesPage } from './BranchesPage';
import { OrganizationHierarchyView } from './components/OrganizationHierarchyView';
import { useGetAllOfficesQuery } from '@/store/api/attendanceSlice';
import { useGetUsersQuery } from '@/store/api/userSlice';
import { useGetOrganizationHierarchyQuery } from '@/store/api/organizationApiSlice';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { ORGANIZATION_TABS } from './company/constants';
import type { OrganizationTab } from './company/types';
import { useOrganizationTabs } from './company/hooks/useOrganizationTabs';
import { useCompanyProfile } from './company/hooks/useCompanyProfile';
import { useDocumentVault } from './company/hooks/useDocumentVault';
import { OverviewTab } from './company/components/OverviewTab';
import { WhatWeDoTab } from './company/components/WhatWeDoTab';
import { PoliciesTab } from './company/components/PoliciesTab';
import { DocumentVaultTab } from './company/components/DocumentVaultTab';
import { EditCompanyProfileModal } from './company/components/EditCompanyProfileModal';
import { UploadDocumentModal } from './company/components/UploadDocumentModal';

export type { CompanyDocument, CompanyInfoState, PolicyItem } from './company/types';

export function OrganizationPage() {
  const { isSuperadmin: isAuthSuper, roles } = useAuth();
  const { can, isSuperadmin: isPermSuper } = usePermission();
  const canManageOrg =
    isAuthSuper ||
    isPermSuper ||
    can('organization:manage') ||
    Boolean(
      roles?.some((role) => {
        const normalized = String(role)
          .toLowerCase()
          .replace(/[\s_-]/g, '');
        return normalized.includes('admin') || normalized.includes('hr');
      })
    );

  const {
    activeTab,
    setActiveTab,
    autoOpenHQ,
    autoOpenCreate,
    clearAutoOpen,
    openHeadquarters,
    openCreateLocation,
  } = useOrganizationTabs();

  const { data: offices = [] } = useGetAllOfficesQuery();
  const { data: users = [], isLoading: isLoadingUsers } = useGetUsersQuery();
  const { data: hierarchyData } = useGetOrganizationHierarchyQuery();

  const totalEmployeesCount = useMemo(() => {
    if (users.length > 0) return users.length;
    if (hierarchyData?.data?.stats?.totalEmployees) return hierarchyData.data.stats.totalEmployees;
    if (hierarchyData?.data?.flatUsers?.length) return hierarchyData.data.flatUsers.length;
    return 0;
  }, [users, hierarchyData]);

  const hqOffice = useMemo(() => {
    return offices.find((office) => office.is_hq || office.isHq) || offices[0];
  }, [offices]);

  const profile = useCompanyProfile({ hqOffice, totalEmployeesCount });
  const vault = useDocumentVault(canManageOrg);

  const handleAddLocation = () => {
    profile.closeEditModal();
    openCreateLocation();
  };

  const handleTabChange = (tab: string) => setActiveTab(tab as OrganizationTab);

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Company Profile & Governance"
        description="Unified organizational intelligence: corporate identity, policies, compliance vault, and regional branches."
        breadcrumbs={[{ label: 'Home', url: '/' }, { label: 'Organization' }]}
        primaryAction={
          canManageOrg
            ? {
                label: 'Edit Profile',
                onClick: profile.openEditModal,
                icon: 'pi pi-pencil',
              }
            : undefined
        }
      />

      <div className="bg-white rounded-2xl border border-border-subtle shadow-soft p-3">
        <Tabs items={ORGANIZATION_TABS} activeItem={activeTab} onItemChange={handleTabChange} />
      </div>

      {activeTab === 'Overview' && (
        <OverviewTab
          companyInfo={profile.companyInfo}
          hqOffice={hqOffice}
          officesCount={offices.length}
          totalEmployeesCount={totalEmployeesCount}
          policiesCount={vault.policies.length}
          documentsCount={vault.documents.length}
          isLoadingProfile={profile.isLoadingProfile}
          isLoadingUsers={isLoadingUsers}
          onOpenEdit={profile.openEditModal}
          onOpenHeadquarters={openHeadquarters}
        />
      )}

      {activeTab === 'Organization Hierarchy' && (
        <div className="flex flex-col gap-8">
          <OrganizationHierarchyView />
        </div>
      )}

      {activeTab === 'What We Do' && <WhatWeDoTab companyInfo={profile.companyInfo} />}

      {activeTab === 'Company Policies' && <PoliciesTab policies={vault.policies} />}

      {activeTab === 'Document Vault' && (
        <DocumentVaultTab
          visibleDocuments={vault.visibleDocuments}
          canManageOrg={canManageOrg}
          onUpload={vault.openUploadModal}
          onToggleVisibility={vault.toggleVisibility}
          onDeleteRequest={vault.requestDelete}
        />
      )}

      {activeTab === 'Offices & Branches' && (
        <BranchesPage
          autoOpenHQ={autoOpenHQ}
          autoOpenCreate={autoOpenCreate}
          onClearAutoOpen={clearAutoOpen}
        />
      )}

      <EditCompanyProfileModal
        visible={profile.showEditProfileModal}
        onHide={profile.closeEditModal}
        editForm={profile.editForm}
        setEditForm={profile.setEditForm}
        offices={offices}
        phoneError={profile.phoneError}
        setPhoneError={profile.setPhoneError}
        isSaving={profile.isUpdatingProfile}
        onSave={profile.saveProfile}
        onAddLocation={handleAddLocation}
      />

      <UploadDocumentModal
        visible={vault.showUploadModal}
        onHide={vault.closeUploadModal}
        form={vault.uploadDocForm}
        setForm={vault.setUploadDocForm}
        selectedFile={vault.selectedFile}
        setSelectedFile={vault.setSelectedFile}
        isUploading={vault.isUploading}
        onSubmit={vault.submitUpload}
      />

      <ConfirmDialog
        visible={!!vault.deleteDocId}
        onHide={vault.closeDeleteConfirm}
        header="Delete Document from Vault"
        message="Are you sure you want to delete this document? Any active employee links to this file will be permanently invalidated."
        accept={vault.confirmDelete}
        reject={vault.closeDeleteConfirm}
      />
    </div>
  );
}

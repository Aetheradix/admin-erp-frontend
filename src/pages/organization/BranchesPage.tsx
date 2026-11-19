import { useEffect, useState } from 'react';
import { useBranchesAccess } from './branches/hooks/useBranchesAccess';
import { useOfficeDirectory } from './branches/hooks/useOfficeDirectory';
import { useOfficeModal } from './branches/hooks/useOfficeModal';
import { useOfficeDelete } from './branches/hooks/useOfficeDelete';
import { BranchesHeader } from './branches/components/BranchesHeader';
import { OfficesGrid } from './branches/components/OfficesGrid';
import { GeofenceLogsTable } from './branches/components/GeofenceLogsTable';
import { OfficeFormDialog } from './branches/components/OfficeFormDialog';
import { DeleteOfficeDialog } from './branches/components/DeleteOfficeDialog';
import type { BranchesPageProps, BranchesSubTab } from './branches/types';

export type { BranchesPageProps } from './branches/types';

export function BranchesPage({ autoOpenHQ, autoOpenCreate, onClearAutoOpen }: BranchesPageProps = {}) {
  const canManage = useBranchesAccess();
  const [activeSubTab, setActiveSubTab] = useState<BranchesSubTab>('offices');

  const directory = useOfficeDirectory(activeSubTab);
  const officeModal = useOfficeModal();
  const officeDelete = useOfficeDelete();

  const { offices, isLoadingOffices } = directory;
  const { openCreate, openEdit } = officeModal;

  // Handle auto-open Global HQ modal or Create modal if redirected from Company Profile
  useEffect(() => {
    if (autoOpenCreate && !isLoadingOffices) {
      openCreate();
      onClearAutoOpen?.();
    } else if (autoOpenHQ && !isLoadingOffices) {
      const hq = offices.find((o) => o.is_hq || o.isHq) || offices[0];
      if (hq) {
        openEdit(hq, { is_hq: true });
      } else {
        openCreate({ name: 'Global Headquarters', is_hq: true });
      }
      onClearAutoOpen?.();
    }
  }, [autoOpenHQ, autoOpenCreate, isLoadingOffices, offices, onClearAutoOpen, openCreate, openEdit]);

  return (
    <div className="flex flex-col gap-6 pb-20 animate-in fade-in duration-500">
      <BranchesHeader
        officeCount={offices.length}
        activeSubTab={activeSubTab}
        onSubTabChange={setActiveSubTab}
        canManage={canManage}
        isLoadingOffices={isLoadingOffices}
        onRefreshOffices={() => directory.refetchOffices()}
        onAddOffice={() => officeModal.openCreate()}
      />

      {activeSubTab === 'offices' && (
        <OfficesGrid
          offices={offices}
          isLoading={isLoadingOffices}
          canManage={canManage}
          onCreate={() => officeModal.openCreate()}
          onEdit={(office) => officeModal.openEdit(office)}
          onDelete={officeDelete.setDeleteConfirmId}
        />
      )}

      {activeSubTab === 'logs' && (
        <GeofenceLogsTable
          logs={directory.geofenceLogs}
          isLoading={directory.isLoadingLogs}
          onRefresh={() => directory.refetchLogs()}
        />
      )}

      <OfficeFormDialog
        visible={officeModal.showModal}
        editingOffice={officeModal.editingOffice}
        formData={officeModal.formData}
        setFormData={officeModal.setFormData}
        isDetectingLocation={officeModal.isDetectingLocation}
        isCreating={officeModal.isCreating}
        isUpdating={officeModal.isUpdating}
        searchQuery={officeModal.searchQuery}
        setSearchQuery={officeModal.setSearchQuery}
        searchResults={officeModal.searchResults}
        isSearching={officeModal.isSearching}
        showSuggestions={officeModal.showSuggestions}
        setShowSuggestions={officeModal.setShowSuggestions}
        onClearSearch={officeModal.clearSearch}
        onHide={officeModal.closeModal}
        onSubmit={officeModal.handleSubmit}
        onSelectLocation={officeModal.handleSelectLocation}
        onDetectLocation={officeModal.handleDetectLocation}
      />

      <DeleteOfficeDialog
        visible={officeDelete.deleteConfirmId !== null}
        isDeleting={officeDelete.isDeleting}
        onHide={officeDelete.closeDeleteConfirm}
        onConfirm={() => {
          if (officeDelete.deleteConfirmId) officeDelete.handleDelete(officeDelete.deleteConfirmId);
        }}
      />
    </div>
  );
}

export default BranchesPage;

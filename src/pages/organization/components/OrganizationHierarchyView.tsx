import { usePermission } from '@/hooks/usePermission';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import { ChangeManagerModal } from './ChangeManagerModal';
import { BulkHandoverModal } from './BulkHandoverModal';
import { ReplaceManagerModal } from './ReplaceManagerModal';
import { OffboardRollupModal } from './OffboardRollupModal';
import { MatrixManagerModal } from './MatrixManagerModal';
import { HierarchyReorgStudio } from './HierarchyReorgStudio';
import { HierarchyAuditTrailView } from './HierarchyAuditTrailView';
import { OrgEmployeeDrawer } from './OrgEmployeeDrawer';
import { OrgAddEmployeeModal } from './OrgAddEmployeeModal';
import { OrgRemoveConfirmModal } from './OrgRemoveConfirmModal';
import { useHierarchyTree } from './hierarchy/useHierarchyTree';
import { useHierarchyModals } from './hierarchy/useHierarchyModals';
import { HierarchyHeader } from './hierarchy/HierarchyHeader';
import { HierarchyToolbar } from './hierarchy/HierarchyToolbar';
import { DepartmentFilterChips } from './hierarchy/DepartmentFilterChips';
import { HierarchyMapView } from './hierarchy/HierarchyMapView';
import { HierarchyListView } from './hierarchy/HierarchyListView';
import { DepartmentsTable } from './hierarchy/DepartmentsTable';
import { EditManagerDialog } from './hierarchy/EditManagerDialog';
import { EditDepartmentDialog } from './hierarchy/EditDepartmentDialog';

export function OrganizationHierarchyView() {
  const { can, isSuperadmin } = usePermission();
  const canManageHierarchy = isSuperadmin || can('organization:manage');

  const tree = useHierarchyTree();
  const modals = useHierarchyModals(tree.refetch);

  const {
    isLoading,
    rootUsers,
    flatUsers,
    departments,
    stats,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedDepartment,
    setSelectedDepartment,
    selectedEmployee,
    setSelectedEmployee,
    expandedNodes,
    setExpandedNodes,
    hiddenCount,
    setHiddenCount,
    unassignedCount,
    departmentFilters,
    toggleNode,
    handleExpandAll,
    handleCollapseAll,
    filteredTree,
    handleExportJson,
  } = tree;

  const {
    editManagerModal,
    setEditManagerModal,
    editDeptModal,
    setEditDeptModal,
    addEmployeeModal,
    removeEmployeeModal,
    changeManagerModal,
    bulkHandoverModal,
    setBulkHandoverModal,
    replaceManagerModal,
    setReplaceManagerModal,
    offboardRollupModal,
    setOffboardRollupModal,
    matrixModal,
    isUpdatingManager,
    isUpdatingDept,
    closeAddEmployee,
    openRemoveEmployee,
    closeRemoveEmployee,
    openEditManager,
    closeEditManager,
    openEditDepartment,
    closeEditDepartment,
    openChangeManager,
    closeChangeManager,
    openMatrixManager,
    closeMatrixManager,
    saveManager,
    saveDepartment,
  } = modals;

  const handleAddDirectReport = (user: HierarchyNodeUser) => modals.openAddEmployee(user.id);
  const handleRemoveUser = (user: HierarchyNodeUser) => openRemoveEmployee(user);
  const handleMapSelectUser = (user: HierarchyNodeUser) => {
    if (user.id !== -999) setSelectedEmployee(user);
  };

  return (
    <div className="space-y-4">
      {/* ── HEADER & WORKSPACE TOOLBAR ── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <HierarchyHeader
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            stats={stats}
            flatUsersCount={flatUsers.length}
            departmentFiltersCount={departmentFilters.length}
            hiddenCount={hiddenCount}
            unassignedCount={unassignedCount}
            canManageHierarchy={canManageHierarchy}
          />

          <HierarchyToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onExpandAll={handleExpandAll}
            onCollapseAll={handleCollapseAll}
            onExport={handleExportJson}
            onAddEmployee={() => modals.openAddEmployee(selectedEmployee?.id ?? null)}
            onRefresh={() => tree.refetch()}
            isLoading={isLoading}
            canManageHierarchy={canManageHierarchy}
          />
        </div>

        {(viewMode === 'map' || viewMode === 'list') && departmentFilters.length > 0 && (
          <DepartmentFilterChips
            departmentFilters={departmentFilters}
            totalEmployees={flatUsers.length}
            selectedDepartment={selectedDepartment}
            onSelectDepartment={setSelectedDepartment}
          />
        )}
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      {viewMode === 'map' && (
        <HierarchyMapView
          isLoading={isLoading}
          rootUsers={rootUsers}
          flatUsers={flatUsers}
          searchQuery={searchQuery}
          selectedDepartment={selectedDepartment}
          selectedUserId={selectedEmployee?.id ?? null}
          onSelectUser={handleMapSelectUser}
          onAddDirectReport={handleAddDirectReport}
          onRemoveUser={handleRemoveUser}
          expandedNodes={expandedNodes}
          onToggleNode={toggleNode}
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          onHiddenCountChange={setHiddenCount}
        />
      )}

      {viewMode === 'list' && (
        <HierarchyListView
          isLoading={isLoading}
          filteredTree={filteredTree}
          canManageHierarchy={canManageHierarchy}
          onSelectEmployee={setSelectedEmployee}
          onEditManager={openEditManager}
        />
      )}

      {viewMode === 'departments' && (
        <DepartmentsTable
          departments={departments}
          isLoading={isLoading}
          canManageHierarchy={canManageHierarchy}
          onConfigureLeadership={openEditDepartment}
        />
      )}

      {viewMode === 'reorg' && (
        <HierarchyReorgStudio
          onOpenFlowA={openChangeManager}
          onOpenFlowB1={() => setBulkHandoverModal(true)}
          onOpenFlowB2={() => setReplaceManagerModal(true)}
          onOpenFlowB3={() => setOffboardRollupModal(true)}
          onOpenFlowC={openMatrixManager}
          stats={stats}
        />
      )}

      {viewMode === 'audit' && <HierarchyAuditTrailView flatUsers={flatUsers} />}

      {/* ── CONTEXTUAL EMPLOYEE PROFILE DRAWER ── */}
      <OrgEmployeeDrawer
        user={selectedEmployee}
        open={Boolean(selectedEmployee)}
        onClose={() => setSelectedEmployee(null)}
        flatUsers={flatUsers}
        onSelectUser={setSelectedEmployee}
        onAddDirectReport={handleAddDirectReport}
        onRemoveUser={handleRemoveUser}
        onChangeManager={(user) => {
          setSelectedEmployee(null);
          openEditManager(user);
        }}
        onMatrixManager={(user) => {
          setSelectedEmployee(null);
          openMatrixManager(user);
        }}
        canManage={canManageHierarchy}
      />

      {/* ── ADD EMPLOYEE MODAL ── */}
      <OrgAddEmployeeModal
        open={addEmployeeModal.open}
        onClose={closeAddEmployee}
        preselectedManagerId={addEmployeeModal.preselectedManagerId}
        flatUsers={flatUsers}
        departments={departments}
        onSuccess={async (newId) => {
          const res = await tree.refetch();
          const updatedFlat = res.data?.data?.flatUsers || [];
          if (newId) {
            const found = updatedFlat.find((user) => user.id === newId);
            if (found) {
              const managerId = found.reporting_manager_id;
              if (managerId) {
                setExpandedNodes((prev) => ({ ...prev, [managerId]: true }));
              }
              setSelectedEmployee(found);
            }
          }
        }}
      />

      {/* ── REMOVE EMPLOYEE CONFIRM MODAL ── */}
      <OrgRemoveConfirmModal
        open={removeEmployeeModal.open}
        onClose={closeRemoveEmployee}
        user={removeEmployeeModal.user}
        flatUsers={flatUsers}
        onSuccess={() => {
          setSelectedEmployee(null);
          tree.refetch();
        }}
      />

      <EditManagerDialog
        state={editManagerModal}
        setState={setEditManagerModal}
        flatUsers={flatUsers}
        isUpdating={isUpdatingManager}
        onSave={saveManager}
        onClose={closeEditManager}
      />

      <EditDepartmentDialog
        state={editDeptModal}
        setState={setEditDeptModal}
        flatUsers={flatUsers}
        departments={departments}
        isUpdating={isUpdatingDept}
        onSave={saveDepartment}
        onClose={closeEditDepartment}
      />

      {/* ── ENTERPRISE REORG MODALS ── */}
      <ChangeManagerModal
        open={changeManagerModal.open}
        onClose={closeChangeManager}
        selectedUser={changeManagerModal.user}
        flatUsers={flatUsers}
        onSuccess={tree.refetch}
      />

      <BulkHandoverModal
        open={bulkHandoverModal}
        onClose={() => setBulkHandoverModal(false)}
        flatUsers={flatUsers}
        onSuccess={tree.refetch}
      />

      <ReplaceManagerModal
        open={replaceManagerModal}
        onClose={() => setReplaceManagerModal(false)}
        flatUsers={flatUsers}
        onSuccess={tree.refetch}
      />

      <OffboardRollupModal
        open={offboardRollupModal}
        onClose={() => setOffboardRollupModal(false)}
        flatUsers={flatUsers}
        onSuccess={tree.refetch}
      />

      <MatrixManagerModal
        open={matrixModal.open}
        onClose={closeMatrixManager}
        preselectedUserId={matrixModal.userId}
        flatUsers={flatUsers}
        onSuccess={tree.refetch}
      />
    </div>
  );
}

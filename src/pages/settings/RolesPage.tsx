import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { useRolesData } from './roles/hooks/useRolesData';
import { useRolesPageState } from './roles/hooks/useRolesPageState';
import { useRoleForm } from './roles/hooks/useRoleForm';
import { usePermissionMatrix } from './roles/hooks/usePermissionMatrix';
import { useUserRoleAssignment } from './roles/hooks/useUserRoleAssignment';
import { RolesHeader } from './roles/components/RolesHeader';
import { RolesStats } from './roles/components/RolesStats';
import { RolesTabNav } from './roles/components/RolesTabNav';
import { RoleDirectoryTable } from './roles/components/RoleDirectoryTable';
import { PermissionMatrixView } from './roles/components/PermissionMatrixView';
import { RbacAuditTable } from './roles/components/RbacAuditTable';
import { UserRoleAssignmentsView } from './roles/components/UserRoleAssignmentsView';
import { CreateRoleDialog } from './roles/components/CreateRoleDialog';
import { EditRoleDialog } from './roles/components/EditRoleDialog';
import { DeleteRoleDialog } from './roles/components/DeleteRoleDialog';
import { ManageUserRolesDialog } from './roles/components/ManageUserRolesDialog';
import { buildAvailableRoleOptions, filterAssignableUsers } from './roles/utils';

export function RolesPage() {
  const { user: currentAuthUser, updateUser } = useAuth();
  const { can, isSuperadmin } = usePermission();

  const data = useRolesData();
  const state = useRolesPageState();
  const roleForm = useRoleForm();
  const matrix = usePermissionMatrix();
  const assignment = useUserRoleAssignment({
    currentAuthUser,
    updateUser,
    roles: data.roles,
    usersData: data.usersData,
    userParam: state.userParam,
    refetchUsers: data.refetchUsers,
    refetchAudit: data.refetchAudit,
  });

  const currentMatrixRole = useMemo(() => {
    if (data.roles.length === 0) return null;
    if (state.selectedRoleForMatrix) {
      return data.roles.find((r) => r.id === state.selectedRoleForMatrix) || data.roles[0];
    }
    return data.roles[0];
  }, [data.roles, state.selectedRoleForMatrix]);

  const availableRoleOptions = useMemo(
    () => buildAvailableRoleOptions(data.roles),
    [data.roles]
  );

  const filteredUsers = useMemo(
    () => filterAssignableUsers(data.usersData ?? [], state.userSearchText),
    [data.usersData, state.userSearchText]
  );

  const canCreate = can('role:create');
  const canEdit = can('role:edit');
  const canDelete = can('role:delete');

  const handleRefresh = () => {
    data.refetchRoles();
    if (state.activeTab === 'audit') data.refetchAudit();
  };

  const handleOpenMatrix = (roleId: number) => {
    state.setSelectedRoleForMatrix(roleId);
    state.setActiveTab('matrix');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <RolesHeader canCreateRole={canCreate} onRefresh={handleRefresh} onCreate={roleForm.openCreateModal} />

      <RolesStats
        totalRoles={data.roles.length}
        systemRoles={data.roles.filter((r) => r.is_system).length}
        customRoles={data.roles.filter((r) => !r.is_system).length}
        permissionCount={data.permissions.length}
      />

      <RolesTabNav
        activeTab={state.activeTab}
        roleCount={data.roles.length}
        onChange={state.setActiveTab}
      />

      {state.activeTab === 'roles' && (
        <RoleDirectoryTable
          roles={data.roles}
          isLoading={data.rolesLoading}
          totalPermissions={data.permissions.length}
          canEdit={canEdit}
          canDelete={canDelete}
          onOpenMatrix={(role) => handleOpenMatrix(role.id)}
          onEdit={roleForm.openEditModal}
          onDelete={roleForm.openDeleteModal}
        />
      )}

      {state.activeTab === 'matrix' && (
        <PermissionMatrixView
          roles={data.roles}
          modules={data.modules}
          currentMatrixRole={currentMatrixRole}
          canEdit={canEdit}
          isSuperadmin={isSuperadmin}
          onSelectRole={state.setSelectedRoleForMatrix}
          onTogglePermission={(permId) => matrix.togglePermission(currentMatrixRole, permId)}
          onToggleModule={(modulePerms) => matrix.toggleModule(currentMatrixRole, modulePerms)}
        />
      )}

      {state.activeTab === 'assignments' && (
        <UserRoleAssignmentsView
          users={filteredUsers}
          isLoading={data.usersLoading}
          search={state.userSearchText}
          onSearchChange={state.setUserSearchText}
          onRefresh={data.refetchUsers}
          currentAuthUser={currentAuthUser}
          roles={data.roles}
          onManageRoles={assignment.openManageRoles}
        />
      )}

      {state.activeTab === 'audit' && (
        <RbacAuditTable auditLogs={data.auditLogs} isLoading={data.auditLoading} />
      )}

      <CreateRoleDialog
        visible={roleForm.createModalVisible}
        formData={roleForm.formData}
        setFormData={roleForm.setFormData}
        modules={data.modules}
        permissions={data.permissions}
        isCreating={roleForm.isCreating}
        onSubmit={roleForm.handleCreateSubmit}
        onClose={roleForm.closeCreateModal}
      />

      <EditRoleDialog
        visible={roleForm.editModalVisible}
        targetRole={roleForm.targetRole}
        formData={roleForm.formData}
        setFormData={roleForm.setFormData}
        modules={data.modules}
        isUpdating={roleForm.isUpdating}
        onSubmit={roleForm.handleEditSubmit}
        onClose={roleForm.closeEditModal}
      />

      <DeleteRoleDialog
        visible={roleForm.deleteModalVisible}
        targetRole={roleForm.targetRole}
        isDeleting={roleForm.isDeleting}
        onConfirm={roleForm.handleDeleteSubmit}
        onClose={roleForm.closeDeleteModal}
      />

      <ManageUserRolesDialog
        visible={assignment.manageRolesModalVisible}
        targetUser={assignment.targetUser}
        selectedRoleNames={assignment.selectedUserRoleNames}
        onSelectionChange={assignment.setSelectedUserRoleNames}
        availableRoleOptions={availableRoleOptions}
        roles={data.roles}
        previewPermissions={assignment.previewPermissions}
        isSaving={assignment.isUpdatingStaff}
        onSave={assignment.saveUserRoles}
        onClose={assignment.closeManageRoles}
      />
    </div>
  );
}

export default RolesPage;

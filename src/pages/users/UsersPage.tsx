import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { useUsersAccess } from './hooks/useUsersAccess';
import { useUsersData } from './hooks/useUsersData';
import { useInviteFlow } from './hooks/useInviteFlow';
import { useResendInvitation } from './hooks/useResendInvitation';
import { useUserEdit } from './hooks/useUserEdit';
import { useUserActions } from './hooks/useUserActions';
import { UsersToolbar } from './components/UsersToolbar';
import { UserTable } from './components/UserTable';
import { InvitationsTable } from './components/InvitationsTable';
import { SystemAuditTable } from './components/SystemAuditTable';
import { InviteUserDialog } from './components/InviteUserDialog';
import { InviteResultDialog } from './components/InviteResultDialog';
import { EditUserDialog } from './components/EditUserDialog';
import { ConfirmActionDialog } from './components/ConfirmActionDialog';
import { countInvitations, filterInvitationRecords, filterUserRecords } from './utils';
import type { InvitationStatusFilter, UsersTab } from './types';

export type { UserRecord } from './types';
// eslint-disable-next-line react-refresh/only-export-components
export { getDepartmentBadgeClass, getRoleBadgeClass } from './utils';
// eslint-disable-next-line react-refresh/only-export-components
export { initialUsers } from './hooks/useUsersData';

export function UsersPage() {
  const { currentAuthUser, updateUser, isAuthorizedAdmin } = useUsersAccess();
  const data = useUsersData();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<UsersTab>('All Users');
  const [invitationFilter, setInvitationFilter] = useState<InvitationStatusFilter>('all');

  const invite = useInviteFlow({
    currentAuthUser,
    availableRoles: data.availableRoles,
    availableDepartments: data.availableDepartments,
    setLocalUsers: data.setLocalUsers,
    refetchAll: data.refetchAll,
  });

  const resend = useResendInvitation({
    refetchInvitations: data.refetchInvitations,
    refetchAuditLogs: data.refetchAuditLogs,
  });

  const edit = useUserEdit({
    roles: data.roles,
    currentAuthUser,
    updateUser,
    setLocalUsers: data.setLocalUsers,
    refetchUsers: data.refetchUsers,
  });

  const actions = useUserActions({
    currentAuthUser,
    setLocalUsers: data.setLocalUsers,
    refetchUsers: data.refetchUsers,
    refetchInvitations: data.refetchInvitations,
    refetchAuditLogs: data.refetchAuditLogs,
  });

  const filteredUsers = useMemo(
    () => filterUserRecords(data.mergedUsers, activeTab, search),
    [data.mergedUsers, activeTab, search]
  );
  const filteredInvitations = useMemo(
    () => filterInvitationRecords(data.invitations, invitationFilter, search),
    [data.invitations, invitationFilter, search]
  );
  const invitationCounts = useMemo(() => countInvitations(data.invitations), [data.invitations]);

  const isAuditTab = activeTab === 'Invite Audit Log' || activeTab === 'System Audit Trail';

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Users & Access Management"
        description="Invite new employees, configure role-based access, track invitation audit logs, and oversee account lifecycles."
        breadcrumbs={[{ label: 'Home', url: '/' }, { label: 'Users' }]}
        primaryAction={{
          label: 'Invite User',
          onClick: invite.openInviteForm,
          icon: 'pi pi-user-plus',
        }}
      />

      <UsersToolbar
        search={search}
        onSearchChange={setSearch}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'Invite Audit Log' && (
        <InvitationsTable
          invitations={filteredInvitations}
          counts={invitationCounts}
          filter={invitationFilter}
          onFilterChange={setInvitationFilter}
          currentAuthUser={currentAuthUser}
          onResend={resend.handleResendInvitation}
          onRevoke={(record) => actions.openConfirm({ type: 'revoke_invitation', targetInvitation: record })}
        />
      )}

      {activeTab === 'System Audit Trail' && <SystemAuditTable auditLogs={data.auditLogs} />}

      {!isAuditTab && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-border-subtle shadow-soft overflow-hidden">
          <UserTable
            users={filteredUsers}
            isLoading={data.isUsersLoading}
            isAuthorizedAdmin={isAuthorizedAdmin}
            onEdit={edit.handleOpenEditUser}
            onConfirm={(type, targetUser) => actions.openConfirm({ type, targetUser })}
          />
        </motion.div>
      )}

      <InviteUserDialog
        visible={invite.showForm}
        form={invite.form}
        setForm={invite.setForm}
        availableRoles={data.availableRoles}
        availableDepartments={data.availableDepartments}
        isSubmitting={invite.isSubmittingInvite}
        onSubmit={invite.handleInviteSubmit}
        onHide={invite.closeInviteForm}
      />

      <InviteResultDialog
        visible={invite.inviteResult.open}
        result={invite.inviteResult}
        copiedLink={invite.copiedLink}
        copiedPass={invite.copiedPass}
        onCopyLink={invite.handleCopyLink}
        onCopyPass={invite.handleCopyPass}
        onHide={invite.closeInviteResult}
      />

      <EditUserDialog
        visible={edit.editUserModal.open}
        state={edit.editUserModal}
        setState={edit.setEditUserModal}
        roles={data.roles}
        mergedUsers={data.mergedUsers}
        availableRoles={data.availableRoles}
        availableDepartments={data.availableDepartments}
        onSave={edit.handleSaveUserEdit}
        onClose={edit.closeEditUser}
      />

      <ConfirmActionDialog
        confirmModal={actions.confirmModal}
        onAccept={actions.handleExecuteStatusChange}
        onClose={actions.closeConfirm}
      />
    </div>
  );
}

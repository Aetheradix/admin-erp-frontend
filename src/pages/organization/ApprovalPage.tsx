import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePendingUsers } from '../settings/hooks/usePendingUsers';
import type { User } from '@/types/auth';
import type { UserRole } from '@/config/navItems';

function ApprovalPage() {
  const userroles: UserRole[] = ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin', 'Employee'];

  const {
    pendingUsers,
    logs,
    isLoading,
    isApproving,
    isRejecting,
    isSendingInvite,
    handleApproveUser,
    handleRejectUser,
    handleSendInvite,
  } = usePendingUsers();

  const [selectedRoles, setSelectedRoles] = useState<Record<number, UserRole>>({});

  // Invitation State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Employee');
  const [inviteStatus, setInviteStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleRoleChange = (userId: number, role: UserRole) => {
    setSelectedRoles((prev) => ({
      ...prev,
      [userId]: role,
    }));
  };

  const handleSubmitInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviteStatus(null);
    const success = await handleSendInvite(inviteEmail, inviteRole);

    if (success) {
      setInviteStatus({
        type: 'success',
        message: `Temporary credentials & login link sent to ${inviteEmail}`,
      });
      setInviteEmail('');
    } else {
      setInviteStatus({
        type: 'error',
        message: 'Failed to send invitation email. Please try again.',
      });
    }
  };

  if (isLoading) {
    return <div className="p-6 text-xs text-muted-foreground">Loading approval data...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* SECTION 1: INVITATION EMAIL DISPATCH */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-soft p-6">
        <h2 className="text-lg font-black text-foreground">Invite New User</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Send an automated email with temporary credentials and first-time login instructions
          directly to the recipient.
        </p>

        <form onSubmit={handleSubmitInvite} className="flex flex-col md:flex-row gap-3">
          <input
            type="email"
            placeholder="Recipient Email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            className="flex-1 text-xs border border-border-subtle rounded-lg px-3 py-2 outline-none focus:border-foreground"
          />

          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as UserRole)}
            className="text-xs border border-border-subtle rounded-lg px-3 py-2 outline-none"
          >
            {userroles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={isSendingInvite}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-foreground text-background hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isSendingInvite ? 'Sending Email...' : 'Send Invitation'}
          </button>
        </form>

        {inviteStatus && (
          <div
            className={`mt-4 p-3 rounded-xl border text-xs font-medium ${
              inviteStatus.type === 'success'
                ? 'bg-green-500/10 text-green-700 border-green-500/20'
                : 'bg-red-500/10 text-red-700 border-red-500/20'
            }`}
          >
            {inviteStatus.message}
          </div>
        )}
      </div>

      {/* SECTION 2: PENDING USERS APPROVAL SECTION */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-soft overflow-hidden">
        <div className="p-6 border-b border-border-subtle">
          <h2 className="text-lg font-black text-foreground">Pending Users</h2>
          <p className="text-xs text-muted-foreground">Approve or reject new user registrations.</p>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {pendingUsers.length === 0 ? (
            <div className="text-center text-sm text-muted py-6">No pending users found</div>
          ) : (
            pendingUsers.map((user: User) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border-subtle hover:bg-surface-subtle/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={user.image_url || '/avatar.png'}
                    className="w-12 h-12 rounded-full object-cover border"
                  />

                  <div>
                    <h3 className="font-bold text-foreground">{user.username}</h3>
                    <p className="text-xs text-muted">{user.email}</p>
                    <p className="text-xs text-muted">
                      {user.department} • {user.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={selectedRoles[user.id] ?? ''}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                    className="text-xs border rounded-lg px-3 py-2"
                  >
                    <option value="">Select Role</option>
                    {userroles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <button
                      disabled={isApproving}
                      onClick={() => {
                        const role = selectedRoles[user.id];
                        if (!role) {
                          alert('Please select a role before approving');
                          return;
                        }
                        handleApproveUser(user.id, role);
                      }}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500 hover:text-white transition-all disabled:opacity-50"
                    >
                      Approve
                    </button>

                    <button
                      disabled={isRejecting}
                      onClick={() => handleRejectUser(user.id)}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 3: APPROVAL/REJECTION AUDIT LOG TABLE */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-soft overflow-hidden">
        <div className="p-6 border-b border-border-subtle">
          <h2 className="text-lg font-black text-foreground">Approval Logs</h2>
          <p className="text-xs text-muted-foreground">
            Audit history of approved and rejected user accounts.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-subtle/30 text-xs text-muted-foreground font-semibold">
                <th className="p-4">Target User</th>
                <th className="p-4">Action</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Action By</th>
                <th className="p-4">Date & Time</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border-subtle text-xs">
              {!Array.isArray(logs) || logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">
                    No approval logs available.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-subtle/40 transition-all">
                    <td className="p-4">
                      <div className="font-bold text-foreground">
                        {log.targetUser?.name ?? 'N/A'}
                      </div>
                      <div className="text-muted-foreground text-[11px]">
                        {log.targetUser?.email}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          log.action === 'APPROVED'
                            ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                            : 'bg-red-500/10 text-red-600 border border-red-500/20'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-foreground">
                      {log.assignedRole ? log.assignedRole : '—'}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-foreground">
                        {log.actionBy?.name ?? 'System'}
                      </div>
                      <div className="text-muted-foreground text-[11px]">{log.actionBy?.email}</div>
                    </td>
                    <td className="p-4 text-muted-foreground">{log.timestamp}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

export default ApprovalPage;

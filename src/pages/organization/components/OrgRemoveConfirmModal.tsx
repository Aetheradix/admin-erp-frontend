import React from 'react';
import { Modal, message } from 'antd';
import { AlertTriangle, UserMinus, ShieldAlert } from 'lucide-react';
import { useOffboardRollupMutation } from '@/store/api/organizationApiSlice';
import { useDeleteUserMutation } from '@/store/api/userSlice';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';

interface OrgRemoveConfirmModalProps {
  open: boolean;
  onClose: () => void;
  user: HierarchyNodeUser | null;
  flatUsers: HierarchyNodeUser[];
  onSuccess: () => void;
}

export const OrgRemoveConfirmModal: React.FC<OrgRemoveConfirmModalProps> = ({
  open,
  onClose,
  user,
  flatUsers,
  onSuccess,
}) => {
  const [offboardRollup, { isLoading: isOffboarding }] = useOffboardRollupMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  if (!user) return null;

  const directReportsCount = user.directReports?.length || 0;
  const manager = flatUsers.find((u) => u.id === user.reporting_manager_id);
  const managerName = manager?.username || 'the upper executive';

  const handleConfirm = async () => {
    try {
      if (directReportsCount > 0) {
        // Roll up direct reports to parent manager, then offboard
        await offboardRollup({
          terminatingUserId: user.id,
          reason: `Removed via Organization Map - direct reports rolled up to ${managerName}`,
        }).unwrap();
      } else {
        // Direct leaf deletion
        await deleteUser(user.id).unwrap();
      }

      message.success(`Employee ${user.username} has been successfully removed.`);
      onClose();
      onSuccess();
    } catch (err: any) {
      console.error('Failed to remove employee:', err);
      message.error(err?.data?.message || err?.message || 'Failed to remove employee.');
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleConfirm}
      confirmLoading={isOffboarding || isDeleting}
      okText="Remove Employee"
      okButtonProps={{
        danger: true,
        className: 'font-bold bg-red-600! hover:bg-red-700!',
      }}
      cancelButtonProps={{ className: 'font-semibold' }}
      title={
        <div className="flex items-center gap-2 text-red-600 font-bold text-base">
          <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
            <UserMinus size={18} />
          </div>
          <span>Remove Employee</span>
        </div>
      }
      centered
      destroyOnClose
      width={460}
    >
      <div className="py-3 space-y-4">
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-3">
          <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
          <div className="text-xs text-red-900 dark:text-red-200 space-y-1">
            <p className="font-bold text-sm">
              Confirm removal of {user.username}?
            </p>
            <p className="leading-relaxed">
              This action will remove the employee from the organization hierarchy and company staff directory.
            </p>
          </div>
        </div>

        {directReportsCount > 0 ? (
          <div className="p-3.5 rounded-xl bg-surface-subtle border border-border-subtle flex items-start gap-3">
            <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div className="text-xs space-y-1">
              <span className="font-bold text-foreground block">
                Automatic Team Rollup ({directReportsCount} Direct Reports)
              </span>
              <p className="text-muted-foreground leading-relaxed">
                All {directReportsCount} direct reports will be safely reassigned to report directly to{' '}
                <strong className="text-foreground">{managerName}</strong> to preserve organizational continuity.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            This employee currently has no direct reports assigned.
          </p>
        )}
      </div>
    </Modal>
  );
};


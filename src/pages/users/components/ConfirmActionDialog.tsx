import { ConfirmDialog } from '@/components/ui/composed/ConfirmDialog';
import type { ConfirmModalState } from '../types';

interface ConfirmActionDialogProps {
  confirmModal: ConfirmModalState;
  onAccept: () => void;
  onClose: () => void;
}

function buildHeader(type: ConfirmModalState['type']): string {
  if (type === 'revoke_invitation') return 'Revoke User Invitation';
  if (type === 'offboard') return 'Confirm User Offboarding';
  if (type === 'reactivate') return 'Reactivate User Account';
  return 'Delete User Record';
}

export function ConfirmActionDialog({ confirmModal, onAccept, onClose }: ConfirmActionDialogProps) {
  const { type, targetUser, targetInvitation } = confirmModal;

  const message =
    type === 'revoke_invitation' ? (
      <div className="space-y-2">
        <p>
          Are you sure you want to revoke the invitation for{' '}
          <strong className="text-foreground">{targetInvitation?.email}</strong>?
        </p>
        <p className="text-xs text-muted">
          The onboarding security token will be immediately invalidated and recorded as{' '}
          <span className="text-error font-semibold">Revoked</span> in the audit log.
        </p>
      </div>
    ) : type === 'offboard' ? (
      <div className="space-y-2">
        <p>
          Are you sure you want to offboard{' '}
          <strong className="text-foreground">{targetUser?.name}</strong>?
        </p>
        <p className="text-xs text-muted">
          Their active session will be terminated and their account marked as{' '}
          <span className="text-error font-semibold">Inactive</span>.
        </p>
      </div>
    ) : type === 'reactivate' ? (
      <div className="space-y-2">
        <p>
          Reactivate login access for{' '}
          <strong className="text-foreground">{targetUser?.name}</strong>?
        </p>
        <p className="text-xs text-muted">
          The user will be able to log back into the ERP with their assigned permissions.
        </p>
      </div>
    ) : (
      <div className="space-y-2">
        <p>
          Are you sure you want to permanently delete{' '}
          <strong className="text-foreground">{targetUser?.name}</strong>?
        </p>
        <p className="text-xs text-error font-medium">
          This action is irreversible and removes the user from the staff database.
        </p>
      </div>
    );

  return (
    <ConfirmDialog
      visible={confirmModal.open}
      onHide={onClose}
      header={buildHeader(type)}
      message={message}
      accept={onAccept}
      reject={onClose}
    />
  );
}

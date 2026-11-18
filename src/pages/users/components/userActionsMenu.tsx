import { Edit3, Trash2, UserCheck, UserX } from 'lucide-react';
import type { MenuProps } from 'antd';
import type { ConfirmActionType, UserRecord } from '../types';

interface UserActionsMenuParams {
  isAuthorizedAdmin: boolean;
  onEdit: (record: UserRecord) => void;
  onConfirm: (type: ConfirmActionType, targetUser: UserRecord) => void;
}

export function buildUserActionsMenu(
  record: UserRecord,
  { isAuthorizedAdmin, onEdit, onConfirm }: UserActionsMenuParams
): MenuProps['items'] {
  const isInactive = record.status === 'Inactive';
  const items: MenuProps['items'] = [];

  if (isAuthorizedAdmin) {
    items.push({
      key: 'edit',
      icon: <Edit3 size={14} className="text-primary" />,
      label: <span className="text-foreground font-semibold">Edit User Profile</span>,
      onClick: () => onEdit(record),
    });
    items.push({ type: 'divider' });
  }

  if (isInactive) {
    items.push({
      key: 'reactivate',
      icon: <UserCheck size={14} className="text-success" />,
      label: <span className="text-success font-semibold">Reactivate Account</span>,
      onClick: () => onConfirm('reactivate', record),
    });
  } else {
    items.push({
      key: 'offboard',
      icon: <UserX size={14} className="text-error" />,
      label: <span className="text-error font-semibold">Offboard / Disable</span>,
      onClick: () => onConfirm('offboard', record),
    });
  }

  items.push({ type: 'divider' });
  items.push({
    key: 'delete',
    icon: <Trash2 size={14} className="text-muted" />,
    label: <span className="text-muted font-medium">Delete Record</span>,
    onClick: () => onConfirm('delete', record),
  });

  return items;
}

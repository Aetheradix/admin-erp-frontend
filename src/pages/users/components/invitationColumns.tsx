import type { ColumnsType } from 'antd/es/table';
import type { User } from '@/types/auth';
import type { InvitationRecord } from '@/services/auditService';
import { getDepartmentBadgeClass, getRoleBadgeClass } from '../utils';
import { InvitationActions, InvitationExpiration, InvitationStatusBadge } from './InvitationCells';

interface InvitationColumnHandlers {
  currentAuthUser: User | null;
  onCopyLink: (record: InvitationRecord) => void;
  onResend: (record: InvitationRecord) => void;
  onRevoke: (record: InvitationRecord) => void;
}

export function buildInvitationColumns({
  currentAuthUser,
  onCopyLink,
  onResend,
  onRevoke,
}: InvitationColumnHandlers): ColumnsType<InvitationRecord> {
  return [
    {
      title: 'Invited User',
      key: 'invitedUser',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            {record.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">{record.name}</span>
            <span className="text-xs text-muted font-mono">{record.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Assigned Role & Dept',
      key: 'roleDept',
      render: (_, record) => (
        <div className="flex flex-col gap-1.5">
          <span
            className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border w-fit ${getRoleBadgeClass(
              record.role
            )}`}>
            {record.role}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-semibold border w-fit ${getDepartmentBadgeClass(
              record.department
            )}`}>
            {record.department}
          </span>
        </div>
      ),
    },
    {
      title: 'Invited By (Admin)',
      key: 'invitedBy',
      render: (_, record) => {
        const invName =
          record.invitedBy?.name || (currentAuthUser?.username || 'Administrator').trim();
        const invEmail =
          record.invitedBy?.email || currentAuthUser?.email || 'admin@aetheradix.com';
        const invRole = record.invitedBy?.role || currentAuthUser?.role || 'SuperAdmin';

        return (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground">{invName}</span>
            <span className="text-[11px] text-muted">{invEmail}</span>
            <span className="text-[10px] text-primary/80 font-semibold">{invRole}</span>
          </div>
        );
      },
    },
    {
      title: 'Sent Date & Time',
      dataIndex: 'invitedAt',
      key: 'invitedAt',
      render: (ts: string) => (
        <div className="flex flex-col text-xs">
          <span className="font-semibold text-foreground">{new Date(ts).toLocaleDateString()}</span>
          <span className="text-[11px] text-muted">
            {new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => <InvitationStatusBadge status={record.status} />,
    },
    {
      title: 'Expiration / Details',
      key: 'expiration',
      render: (_, record) => <InvitationExpiration record={record} />,
    },
    {
      title: 'Audit Actions',
      key: 'actions',
      render: (_, record) => (
        <InvitationActions
          record={record}
          onCopyLink={onCopyLink}
          onResend={onResend}
          onRevoke={onRevoke}
        />
      ),
    },
  ];
}

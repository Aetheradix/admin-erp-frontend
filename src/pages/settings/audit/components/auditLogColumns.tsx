import { Clock, Shield, Terminal, User } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import type { AuditLogEntry, InvitationRecord } from '@/services/auditService';
import type { User as AuthUser } from '@/types/auth';
import { CATEGORY_ICONS, STATUS_COLORS } from '../constants';
import type { AuditActorInfo } from '../types';
import { findMatchingInvitation, resolveActorRole } from '../utils';

interface AuditColumnHandlers {
  currentAuthUser: AuthUser | null;
  actor: AuditActorInfo;
  invitations: InvitationRecord[];
  onView: (record: AuditLogEntry) => void;
}

export function buildAuditColumns({
  currentAuthUser,
  actor,
  invitations,
  onView,
}: AuditColumnHandlers): ColumnsType<AuditLogEntry> {
  const getActorRole = (record: AuditLogEntry) =>
    resolveActorRole(record, invitations, currentAuthUser, actor);
  const getMatchingInvitation = (record: AuditLogEntry) =>
    findMatchingInvitation(record, invitations);

  return [
    {
      title: 'Activity / Event',
      key: 'action',
      render: (_, record) => {
        const Icon = CATEGORY_ICONS[record.category] || Terminal;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Icon size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">{record.action}</span>
              {record.details && (
                <span className="text-[11px] text-muted line-clamp-1 max-w-xs">
                  {record.details}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Actor (Admin / Initiator)',
      key: 'actor',
      render: (_, record) => {
        const inv = getMatchingInvitation(record);
        const role = getActorRole(record);
        const isAdminAction = record.category === 'invitation' || record.category === 'admin';
        const isSelf =
          currentAuthUser &&
          (record.userEmail?.toLowerCase() === currentAuthUser.email?.toLowerCase() ||
            record.user === currentAuthUser.username);
        const displayName = isSelf
          ? actor.name
          : isAdminAction && inv?.invitedBy?.name
            ? inv.invitedBy.name
            : record.user || actor.name;
        const displayEmail = isSelf
          ? actor.email
          : isAdminAction && inv?.invitedBy?.email
            ? inv.invitedBy.email
            : record.userEmail || actor.email;
        const displayRole = isAdminAction && inv?.invitedBy?.role ? inv.invitedBy.role : role;

        return (
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                isAdminAction ? 'bg-primary/10 text-primary' : 'bg-surface-subtle text-muted'
              }`}>
              {isAdminAction ? <Shield size={14} /> : <User size={14} />}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-foreground">{displayName}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {displayRole}
                </span>
              </div>
              <span className="text-[10px] text-muted font-mono">{displayEmail}</span>
              {inv?.invitedBy && (
                <div className="inline-flex items-center gap-1 text-[9.5px] text-muted mt-1 bg-surface-subtle/80 px-2 py-0.5 rounded border border-border-subtle w-fit">
                  <span>Invited by:</span>
                  <strong className="text-foreground">{inv.invitedBy.name}</strong>
                  <span className="px-1 py-0.2 rounded text-[8.5px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    {inv.invitedBy.role}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Target (Invitee / Entity)',
      key: 'target',
      render: (_, record) => {
        const inv = getMatchingInvitation(record);
        const adminName = inv?.invitedBy?.name || actor.name;
        const adminRole = inv?.invitedBy?.role || actor.role;

        return (
          <div className="flex flex-col gap-1 max-w-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 bg-surface-subtle border border-border-subtle rounded-lg text-xs font-semibold text-foreground tracking-wide">
                {inv?.name || record.target}
              </span>
              {inv?.role && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
                  Role: {inv.role}
                </span>
              )}
            </div>
            {record.targetEmail && (
              <span className="text-[10px] text-muted font-mono truncate">
                {record.targetEmail} {inv?.department ? `• ${inv.department}` : ''}
              </span>
            )}
            {/* Explicit Admin Name Badge */}
            <div className="inline-flex items-center gap-1 text-[9.5px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md border border-primary/15 w-fit">
              <Shield size={10} className="shrink-0" />
              <span>Admin:</span>
              <strong className="text-foreground">{adminName}</strong>
              <span className="text-[8.5px] text-primary/80 uppercase">({adminRole})</span>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (ts: string | undefined) => (
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Clock size={12} />
          <span>{ts ? new Date(ts).toLocaleString() : 'Just now'}</span>
        </div>
      ),
    },
    {
      title: 'Origin IP',
      dataIndex: 'ip',
      key: 'ip',
      render: (ip: string) => <span className="text-[11px] font-mono text-muted/70">{ip}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
            STATUS_COLORS[status] || 'text-muted border-border-subtle'
          }`}>
          {status}
        </span>
      ),
    },
    {
      title: 'Details',
      key: 'view',
      width: 80,
      render: (_, record) => (
        <button
          onClick={() => onView(record)}
          className="text-xs font-bold text-primary hover:underline cursor-pointer">
          View
        </button>
      ),
    },
  ];
}

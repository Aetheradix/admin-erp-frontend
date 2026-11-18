import { UserPlus, Shield } from 'lucide-react';
import { Modal } from 'antd';
import type { AuditLogEntry, InvitationRecord } from '@/services/auditService';
import type { User as AuthUser } from '@/types/auth';
import { INVITATION_STATUS_BADGE, STATUS_COLORS } from '../constants';
import type { AuditActorInfo } from '../types';
import { findMatchingInvitation, resolveActorRole } from '../utils';

interface AuditDetailModalProps {
  log: AuditLogEntry | null;
  invitations: InvitationRecord[];
  currentAuthUser: AuthUser | null;
  actor: AuditActorInfo;
  onClose: () => void;
}

export function AuditDetailModal({
  log,
  invitations,
  currentAuthUser,
  actor,
  onClose,
}: AuditDetailModalProps) {
  const inv = log ? findMatchingInvitation(log, invitations) : undefined;
  const actorRole = log ? resolveActorRole(log, invitations, currentAuthUser, actor) : '';

  return (
    <Modal
      open={!!log}
      onCancel={onClose}
      footer={null}
      title={
        <div className="flex items-center gap-2 text-base font-black text-foreground pt-2">
          <Shield size={18} className="text-primary" />
          <span>Audit Event Details</span>
        </div>
      }
      className="rounded-2xl overflow-hidden">
      {log && (
        <div className="flex flex-col gap-5 pt-3 text-xs">
          <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle space-y-2">
            <div className="flex justify-between">
              <span className="text-muted font-semibold">Event ID:</span>
              <span className="font-mono text-foreground font-bold">{log.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted font-semibold">Action:</span>
              <span className="font-bold text-foreground">{log.action}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted font-semibold">Category:</span>
              <span className="font-bold text-primary uppercase text-[10px]">{log.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted font-semibold">Outcome:</span>
              <span
                className={`font-black uppercase text-[10px] px-2 py-0.5 rounded ${STATUS_COLORS[log.status]}`}>
                {log.status}
              </span>
            </div>
          </div>

          {/* Rich Admin & Invitee Attribution Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 via-surface-subtle to-white border border-primary/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                <UserPlus size={14} />
                Admin & Invitee Attribution
              </span>
              {inv?.status && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${INVITATION_STATUS_BADGE[inv.status]}`}>
                  Status: {inv.status}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Admin Block */}
              <div className="p-3 rounded-xl bg-white border border-border-subtle space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted block">
                  Admin / Initiator
                </span>
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  {inv?.invitedBy?.name || log.user}
                  <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[9px] font-black uppercase border border-primary/20">
                    {inv?.invitedBy?.role || actorRole}
                  </span>
                </div>
                <div className="text-[11px] text-muted font-mono truncate">
                  {inv?.invitedBy?.email || log.userEmail}
                </div>
              </div>

              {/* Invitee Block */}
              <div className="p-3 rounded-xl bg-white border border-border-subtle space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted block">
                  Invitee (Target User)
                </span>
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  {inv?.name || log.target}
                  {inv?.role && (
                    <span className="px-1.5 py-0.2 rounded bg-surface-subtle border border-border-subtle text-[9px] font-black uppercase">
                      {inv.role}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-muted font-mono truncate">
                  {inv?.email || log.targetEmail || log.target}
                </div>
                {inv?.department && (
                  <div className="text-[10px] text-muted">Department: {inv.department}</div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted">
              Audit Record Details
            </span>
            <div className="p-3 rounded-xl border border-border-subtle space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted">Initiated By:</span>
                <span className="font-semibold text-foreground">
                  {log.user} ({log.userEmail})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Target Resource:</span>
                <span className="font-semibold text-foreground">{log.target}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Origin IP Address:</span>
                <span className="font-mono text-muted">{log.ip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Timestamp:</span>
                <span className="text-foreground">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {log.details && (
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                Description / Event Log
              </span>
              <p className="p-3 rounded-xl bg-surface-subtle text-foreground/90 leading-relaxed border border-border-subtle">
                {log.details}
              </p>
            </div>
          )}

          {log.changes && log.changes.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                Recorded Attribute Changes
              </span>
              <div className="rounded-xl border border-border-subtle overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-subtle/60 border-b border-border-subtle font-bold text-muted text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">Field</th>
                      <th className="p-2.5">Previous Value</th>
                      <th className="p-2.5">New Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {log.changes.map((ch, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold text-foreground">{ch.field}</td>
                        <td className="p-2.5 text-error font-medium line-through">
                          {String(ch.from || '(empty)')}
                        </td>
                        <td className="p-2.5 text-success font-semibold">
                          {String(ch.to || '(empty)')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

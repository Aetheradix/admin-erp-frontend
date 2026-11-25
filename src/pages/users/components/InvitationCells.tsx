import { useState } from 'react';
import { Ban, CheckCircle2, Copy, RefreshCw } from 'lucide-react';
import { Tooltip } from 'antd';
import type { InvitationRecord } from '@/services/auditService';

export function InvitationStatusBadge({ status }: { status: InvitationRecord['status'] }) {
  if (status === 'accepted') {
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-success/10 text-success border border-success/20 inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-success" /> Accepted & Active
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-warning/10 text-warning border border-warning/20 inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" /> Pending
      </span>
    );
  }
  if (status === 'expired') {
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-surface-subtle text-muted border border-border-subtle inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-muted" /> Expired
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-error/10 text-error border border-error/20 inline-flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-error" /> Revoked
    </span>
  );
}

export function InvitationExpiration({ record }: { record: InvitationRecord }) {
  const [now] = useState(() => Date.now());

  if (record.status === 'accepted') {
    return (
      <span className="text-xs text-success font-medium">
        Completed on{' '}
        {record.acceptedAt ? new Date(record.acceptedAt).toLocaleDateString() : 'Active'}
      </span>
    );
  }
  if (record.status === 'revoked') {
    return (
      <span className="text-xs text-error font-medium">
        Revoked by {record.revokedBy?.name || 'Admin'}
      </span>
    );
  }
  const isPast = now > new Date(record.expiresAt).getTime();
  return (
    <div className="flex flex-col text-xs">
      <span className={isPast ? 'text-error font-semibold' : 'text-foreground'}>
        {new Date(record.expiresAt).toLocaleDateString()}
      </span>
      <span className="text-[10px] text-muted">
        {isPast ? 'Expired token' : 'Valid for 7 days'}
      </span>
    </div>
  );
}

interface InvitationActionsProps {
  record: InvitationRecord;
  onCopyLink: (record: InvitationRecord) => void;
  onResend: (record: InvitationRecord) => void;
  onRevoke: (record: InvitationRecord) => void;
}

export function InvitationActions({
  record,
  onCopyLink,
  onResend,
  onRevoke,
}: InvitationActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {record.status === 'pending' && (
        <Tooltip title="Copy Onboarding URL">
          <button
            onClick={() => onCopyLink(record)}
            className="p-1.5 rounded-lg bg-surface-subtle hover:bg-primary/10 hover:text-primary transition-colors text-muted cursor-pointer"
            aria-label="Copy Onboarding URL">
            <Copy size={14} />
          </button>
        </Tooltip>
      )}

      {(record.status === 'pending' || record.status === 'expired') && (
        <Tooltip title={record.status === 'expired' ? 'Renew 7-Day Invitation' : 'Resend Invite'}>
          <button
            onClick={() => onResend(record)}
            className="p-1.5 rounded-lg bg-surface-subtle hover:bg-success/10 hover:text-success transition-colors text-muted cursor-pointer"
            aria-label="Resend or Renew Invitation">
            <RefreshCw size={14} />
          </button>
        </Tooltip>
      )}

      {record.status === 'pending' && (
        <Tooltip title="Revoke & Invalidate Token">
          <button
            onClick={() => onRevoke(record)}
            className="p-1.5 rounded-lg bg-surface-subtle hover:bg-error/10 hover:text-error transition-colors text-muted cursor-pointer"
            aria-label="Revoke Invitation">
            <Ban size={14} />
          </button>
        </Tooltip>
      )}

      {record.status === 'accepted' && (
        <span className="text-[11px] text-muted font-semibold flex items-center gap-1">
          <CheckCircle2 size={13} className="text-success" /> Active
        </span>
      )}
    </div>
  );
}

import { History } from 'lucide-react';
import { motion } from 'framer-motion';
import { message, Table } from 'antd';
import type { User } from '@/types/auth';
import type { InvitationRecord } from '@/services/auditService';
import { INVITATION_FILTERS } from '../constants';
import type { InvitationCounts, InvitationStatusFilter } from '../types';
import { buildOnboardingUrl } from '../utils';
import { buildInvitationColumns } from './invitationColumns';

interface InvitationsTableProps {
  invitations: InvitationRecord[];
  counts: InvitationCounts;
  filter: InvitationStatusFilter;
  onFilterChange: (filter: InvitationStatusFilter) => void;
  currentAuthUser: User | null;
  onResend: (record: InvitationRecord) => void;
  onRevoke: (record: InvitationRecord) => void;
}

export function InvitationsTable({
  invitations,
  counts,
  filter,
  onFilterChange,
  currentAuthUser,
  onResend,
  onRevoke,
}: InvitationsTableProps) {
  const handleCopyLink = (record: InvitationRecord) => {
    navigator.clipboard.writeText(buildOnboardingUrl(record.email, record.token));
    message.success('Onboarding link copied to clipboard!');
  };

  const columns = buildInvitationColumns({
    currentAuthUser,
    onCopyLink: handleCopyLink,
    onResend,
    onRevoke,
  });

  const countsById: Record<InvitationStatusFilter, number> = {
    all: counts.all,
    pending: counts.pending,
    accepted: counts.accepted,
    expired: counts.expired,
    revoked: counts.revoked,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-border-subtle shadow-soft overflow-hidden p-6 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <History size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              User Invitation Audit Log & Status Tracker
            </h3>
            <p className="text-xs text-muted">
              Audit trail tracking who invited users, issuance date/time, token expirations, and
              status transitions (Pending, Accepted, Expired, Revoked).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {INVITATION_FILTERS.map((st) => (
            <button
              key={st.id}
              onClick={() => onFilterChange(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filter === st.id
                  ? 'bg-foreground text-background shadow-sm'
                  : 'bg-surface-subtle text-muted hover:text-foreground'
              }`}>
              <span>{st.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filter === st.id
                    ? 'bg-background/20 text-background'
                    : 'bg-border-subtle text-muted'
                }`}>
                {countsById[st.id]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Table
        scroll={{ x: 'max-content' }}
        columns={columns}
        dataSource={invitations}
        rowKey="id"
        pagination={{ pageSize: 8 }}
        className="premium-table"
        locale={{
          emptyText: (
            <div className="py-12 text-center text-muted text-sm">
              No invitations match the selected criteria.
            </div>
          ),
        }}
      />
    </motion.div>
  );
}

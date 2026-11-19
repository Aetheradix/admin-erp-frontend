import { Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { Table } from 'antd';
import type { AuditLogEntry, InvitationRecord } from '@/services/auditService';
import type { User as AuthUser } from '@/types/auth';
import type { AuditActorInfo } from '../types';
import { buildAuditColumns } from './auditLogColumns';

interface AuditStreamTableProps {
  logs: AuditLogEntry[];
  currentAuthUser: AuthUser | null;
  actor: AuditActorInfo;
  invitations: InvitationRecord[];
  onView: (record: AuditLogEntry) => void;
}

export function AuditStreamTable({
  logs,
  currentAuthUser,
  actor,
  invitations,
  onView,
}: AuditStreamTableProps) {
  const columns = buildAuditColumns({ currentAuthUser, actor, invitations, onView });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl border border-border-subtle shadow-soft overflow-hidden">
      <div className="p-6 pb-4 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal size={18} className="text-primary" />
          <span className="text-sm font-black text-foreground uppercase tracking-wider">
            System Activity Stream
          </span>
        </div>
        <span className="text-xs font-bold text-muted">
          {logs.length} {logs.length === 1 ? 'event' : 'events'} recorded
        </span>
      </div>

      <Table
        scroll={{ x: 'max-content' }}
        columns={columns}
        dataSource={logs}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        className="premium-table"
        locale={{
          emptyText: (
            <div className="py-12 text-center text-muted text-sm">
              No audit entries match the selected filters.
            </div>
          ),
        }}
      />
    </motion.div>
  );
}

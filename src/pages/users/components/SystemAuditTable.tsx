import { Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { AuditLogEntry } from '@/services/auditService';

interface SystemAuditTableProps {
  auditLogs: AuditLogEntry[];
}

export function SystemAuditTable({ auditLogs }: SystemAuditTableProps) {
  const columns: ColumnsType<AuditLogEntry> = [
    {
      title: 'Action / Event',
      dataIndex: 'action',
      key: 'action',
      render: (text: string) => <span className="text-xs font-bold text-foreground">{text}</span>,
    },
    {
      title: 'Initiated By',
      key: 'user',
      render: (_, r) => (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-foreground">{r.user}</span>
          <span className="text-[10px] text-muted">{r.userEmail}</span>
        </div>
      ),
    },
    {
      title: 'Target Entity',
      dataIndex: 'target',
      key: 'target',
      render: (text: string) => (
        <span className="px-2.5 py-1 rounded bg-surface-subtle border border-border-subtle text-xs font-medium text-foreground">
          {text}
        </span>
      ),
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (ts: string) => (
        <div className="flex items-center gap-1 text-xs text-muted">
          <Clock size={12} />
          <span>{new Date(ts).toLocaleString()}</span>
        </div>
      ),
    },
    {
      title: 'Outcome',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Success' ? 'success' : status === 'Warning' ? 'warning' : 'error'}>
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-border-subtle shadow-soft overflow-hidden p-6 flex flex-col gap-6">
      <div className="flex items-center gap-3 pb-6 border-b border-border-subtle">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">
            Platform Activity & Security Audit Trail
          </h3>
          <p className="text-xs text-muted">
            Historical security log tracking profile edits, password changes, approvals, and
            administrative modifications.
          </p>
        </div>
      </div>

      <Table
        scroll={{ x: 'max-content' }}
        columns={columns}
        dataSource={auditLogs}
        rowKey="id"
        pagination={{ pageSize: 8 }}
        className="premium-table"
        locale={{
          emptyText: (
            <div className="py-12 text-center text-muted text-sm">
              No platform activity records found.
            </div>
          ),
        }}
      />
    </motion.div>
  );
}

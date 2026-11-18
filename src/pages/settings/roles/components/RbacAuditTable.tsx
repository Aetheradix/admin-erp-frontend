import { motion } from 'framer-motion';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { RbacAuditLogItem } from '@/store/api/roleApiSlice';

interface RbacAuditTableProps {
  auditLogs: RbacAuditLogItem[];
  isLoading: boolean;
}

export function RbacAuditTable({ auditLogs, isLoading }: RbacAuditTableProps) {
  const columns: ColumnsType<RbacAuditLogItem> = [
    {
      title: 'Action',
      dataIndex: 'action_type',
      key: 'action_type',
      render: (action: string) => {
        let color = 'default';
        if (action.includes('CREATED') || action.includes('ASSIGNED')) color = 'green';
        if (action.includes('UPDATED')) color = 'blue';
        if (action.includes('DELETED') || action.includes('REVOKED')) color = 'red';
        return (
          <Tag color={color} className="font-mono text-xs font-bold uppercase rounded-md border-0">
            {action}
          </Tag>
        );
      },
    },
    {
      title: 'Actor (Initiator)',
      dataIndex: 'actor_name',
      key: 'actor_name',
      render: (name: string, record) => (
        <div>
          <span className="font-semibold text-foreground text-xs block">
            {name || 'System / Migration'}
          </span>
          <span className="text-[11px] text-muted-foreground">{record.actor_email}</span>
        </div>
      ),
    },
    {
      title: 'Target Entity',
      key: 'target',
      render: (_, record) => (
        <div className="text-xs">
          {record.target_role_name && (
            <span className="font-medium text-primary">Role: {record.target_role_name}</span>
          )}
          {record.target_user_name && (
            <span className="font-medium text-foreground block">
              User: {record.target_user_name} ({record.target_user_email})
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'IP & Source',
      dataIndex: 'ip_address',
      key: 'ip_address',
      render: (ip: string) => (
        <span className="text-xs font-mono text-muted-foreground">{ip || 'Internal / Local'}</span>
      ),
    },
    {
      title: 'Timestamp',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => (
        <span className="text-xs text-muted-foreground">{new Date(date).toLocaleString()}</span>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
      <Table
        scroll={{ x: 'max-content' }}
        columns={columns}
        dataSource={auditLogs}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 15 }}
        className="w-full"
      />
    </motion.div>
  );
}

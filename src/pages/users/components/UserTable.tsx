import { MoreHorizontal } from 'lucide-react';
import { Dropdown, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ConfirmActionType, UserRecord } from '../types';
import { DepartmentBadge, RoleBadge, RoleBadgeList, UserStatusBadge } from './UserBadges';
import { buildUserActionsMenu } from './userActionsMenu';

interface UserTableProps {
  users: UserRecord[];
  isLoading: boolean;
  isAuthorizedAdmin: boolean;
  onEdit: (record: UserRecord) => void;
  onConfirm: (type: ConfirmActionType, targetUser: UserRecord) => void;
}

export function UserTable({
  users,
  isLoading,
  isAuthorizedAdmin,
  onEdit,
  onConfirm,
}: UserTableProps) {
  const columns: ColumnsType<UserRecord> = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-black ring-2 ring-primary/20">
            {record.avatar}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">{record.name}</span>
            <span className="text-xs text-muted">{record.email}</span>
            {record.contactNo && (
              <span className="text-[11px] text-muted/70">{record.contactNo}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string, record) =>
        record.roles && record.roles.length > 0 ? (
          <RoleBadgeList roles={record.roles} />
        ) : (
          <RoleBadge role={role} />
        ),
    },
    {
      title: 'Reporting Manager',
      key: 'reportingManager',
      render: (_, record) =>
        record.reportingManagerName ? (
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
            {record.reportingManagerName}
          </span>
        ) : (
          <span className="text-xs text-muted/60 italic">None (Root)</span>
        ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (text: string) => <DepartmentBadge department={text} />,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <UserStatusBadge status={status} />,
    },
    {
      title: 'Actions',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: buildUserActionsMenu(record, { isAuthorizedAdmin, onEdit, onConfirm }),
          }}
          trigger={['click']}>
          <button className="p-2 rounded-lg hover:bg-surface-subtle text-muted hover:text-foreground transition-colors border border-transparent hover:border-border-subtle">
            <MoreHorizontal size={16} />
          </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <Table
      scroll={{ x: 'max-content' }}
      columns={columns}
      dataSource={users}
      rowKey="id"
      loading={isLoading}
      pagination={{ pageSize: 10 }}
      className="premium-table"
    />
  );
}

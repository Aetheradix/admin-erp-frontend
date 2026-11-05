import React, { useState } from 'react';
import {
  Table,
  Tag,
  Select,
  DatePicker,
  Button,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  RefreshCw,
  ArrowRight,
  UserCheck,
  UserMinus,
  Users,
  Network,
  GitCommit,
  Building2,
} from 'lucide-react';
import {
  useGetHierarchyAuditTrailQuery,
  type HierarchyAuditLogItem,
  type HierarchyNodeUser,
} from '@/store/api/organizationApiSlice';

interface HierarchyAuditTrailViewProps {
  flatUsers: HierarchyNodeUser[];
}

const ACTION_TYPE_OPTIONS = [
  { value: '', label: 'All Action Types' },
  { value: 'ASSIGN', label: 'ASSIGN (Change Manager)' },
  { value: 'REPORTING_HIERARCHY_UPDATED', label: 'REPORTING_HIERARCHY_UPDATED' },
  { value: 'BULK_HANDOVER', label: 'BULK_HANDOVER (Team Transfer)' },
  { value: 'REPLACE', label: 'REPLACE (Succession)' },
  { value: 'OFFBOARD_ROLLUP', label: 'OFFBOARD_ROLLUP (Auto Grandparent)' },
  { value: 'MATRIX_ASSIGN', label: 'MATRIX_ASSIGN (Dotted Line)' },
  { value: 'MATRIX_REMOVE', label: 'MATRIX_REMOVE (Remove Dotted Line)' },
  { value: 'DEPARTMENT_HIERARCHY_UPDATED', label: 'DEPARTMENT_HIERARCHY_UPDATED' },
];

export const HierarchyAuditTrailView: React.FC<HierarchyAuditTrailViewProps> = ({
  flatUsers,
}) => {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [selectedActionType, setSelectedActionType] = useState<string>('');
  const [selectedTargetUser, setSelectedTargetUser] = useState<number | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(
    null
  );

  const queryParams = {
    page,
    limit: pageSize,
    actionType: selectedActionType || undefined,
    targetUserId: selectedTargetUser || undefined,
    startDate: dateRange?.[0] ? dateRange[0].format('YYYY-MM-DD') : undefined,
    endDate: dateRange?.[1] ? dateRange[1].format('YYYY-MM-DD') : undefined,
  };

  const { data, isLoading, isFetching, refetch } = useGetHierarchyAuditTrailQuery(queryParams);

  const auditData = data?.data;
  const logs = auditData?.logs || [];
  const total = auditData?.total || 0;

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'ASSIGN':
      case 'REPORTING_HIERARCHY_UPDATED':
        return (
          <Tag color="blue" className="font-bold text-[10px] flex items-center gap-1 w-fit">
            <UserCheck size={10} />
            <span>CHANGE_MGR</span>
          </Tag>
        );
      case 'BULK_HANDOVER':
        return (
          <Tag color="orange" className="font-bold text-[10px] flex items-center gap-1 w-fit">
            <Users size={10} />
            <span>BULK_HANDOVER</span>
          </Tag>
        );
      case 'REPLACE':
        return (
          <Tag color="purple" className="font-bold text-[10px] flex items-center gap-1 w-fit">
            <GitCommit size={10} />
            <span>REPLACE_MGR</span>
          </Tag>
        );
      case 'OFFBOARD_ROLLUP':
        return (
          <Tag color="red" className="font-bold text-[10px] flex items-center gap-1 w-fit">
            <UserMinus size={10} />
            <span>OFFBOARD_ROLLUP</span>
          </Tag>
        );
      case 'MATRIX_ASSIGN':
        return (
          <Tag color="cyan" className="font-bold text-[10px] flex items-center gap-1 w-fit">
            <Network size={10} />
            <span>MATRIX_ADD</span>
          </Tag>
        );
      case 'MATRIX_REMOVE':
        return (
          <Tag color="default" className="font-bold text-[10px] flex items-center gap-1 w-fit">
            <Network size={10} />
            <span>MATRIX_DEL</span>
          </Tag>
        );
      case 'DEPARTMENT_HIERARCHY_UPDATED':
        return (
          <Tag color="gold" className="font-bold text-[10px] flex items-center gap-1 w-fit">
            <Building2 size={10} />
            <span>DEPT_UPDATE</span>
          </Tag>
        );
      default:
        return (
          <Tag color="default" className="font-bold text-[10px]">
            {action}
          </Tag>
        );
    }
  };

  const columns: ColumnsType<HierarchyAuditLogItem> = [
    {
      title: 'Timestamp',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 140,
      render: (val: string) => (
        <div className="text-xs">
          <span className="font-bold text-foreground block">
            {val ? dayjs(val).format('YYYY-MM-DD') : '-'}
          </span>
          <span className="text-[10px] text-muted">
            {val ? dayjs(val).format('HH:mm:ss') : ''}
          </span>
        </div>
      ),
    },
    {
      title: 'Action & Operation',
      dataIndex: 'action_type',
      key: 'action_type',
      width: 160,
      render: (action: string) => getActionBadge(action),
    },
    {
      title: 'Target Employee',
      key: 'target',
      width: 180,
      render: (_, r) => (
        <div className="min-w-0">
          <span className="text-xs font-bold text-foreground block truncate">
            {r.target_user_name || (r.target_user_id ? `User #${r.target_user_id}` : 'N/A')}
          </span>
          {r.target_user_email && (
            <span className="text-[10px] text-muted truncate block">{r.target_user_email}</span>
          )}
        </div>
      ),
    },
    {
      title: 'Structural Transition Details',
      key: 'transition',
      render: (_, r) => {
        if (r.action_type === 'BULK_HANDOVER') {
          return (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-medium text-muted">{r.from_manager_name || `ID:${r.from_manager_id}`}</span>
              <ArrowRight size={12} className="text-primary shrink-0" />
              <span className="font-bold text-foreground">{r.to_manager_name || `ID:${r.to_manager_id}`}</span>
              <Tag color="orange" className="text-[9px] font-bold border-none ml-1">
                {r.affected_count} transferred
              </Tag>
            </div>
          );
        }

        if (r.action_type === 'OFFBOARD_ROLLUP') {
          return (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-rose-500 font-bold">Terminated</span>
              <ArrowRight size={12} className="text-muted shrink-0" />
              <span className="font-medium text-foreground">
                Rolled up to: {r.to_manager_name || 'Grandparent'}
              </span>
              <Tag color="red" className="text-[9px] font-bold border-none ml-1">
                {r.affected_count} reports
              </Tag>
            </div>
          );
        }

        if (r.from_manager_name || r.to_manager_name) {
          return (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted">{r.from_manager_name || 'None'}</span>
              <ArrowRight size={12} className="text-muted shrink-0" />
              <span className="font-bold text-foreground">{r.to_manager_name || 'Top-level'}</span>
            </div>
          );
        }

        return <span className="text-xs text-muted">-</span>;
      },
    },
    {
      title: 'Reason / Justification',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (reason: string | null) => (
        <Tooltip title={reason || 'No justification logged'}>
          <span className="text-xs text-muted italic">
            {reason ? `"${reason}"` : <span className="text-muted/60">No justification</span>}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Actor (Executed By)',
      key: 'actor',
      width: 150,
      render: (_, r) => (
        <div className="text-xs">
          <span className="font-bold text-foreground block">
            {r.actor_name || (r.actor_id ? `User #${r.actor_id}` : 'System / Auto')}
          </span>
          {r.actor_email && <span className="text-[10px] text-muted block">{r.actor_email}</span>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filter Strip */}
      <div className="p-4 rounded-2xl bg-surface border border-border-subtle shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="w-52">
            <Select
              className="w-full text-xs"
              placeholder="Action Type..."
              value={selectedActionType}
              onChange={(v) => {
                setSelectedActionType(v);
                setPage(1);
              }}
              options={ACTION_TYPE_OPTIONS}
            />
          </div>

          <div className="w-56">
            <Select
              showSearch
              allowClear
              placeholder="Filter by target user..."
              className="w-full text-xs"
              value={selectedTargetUser}
              onChange={(v) => {
                setSelectedTargetUser(v);
                setPage(1);
              }}
              filterOption={(input, opt) =>
                (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={flatUsers.map((u) => ({
                value: u.id,
                label: `${u.username} (${u.email})`,
              }))}
            />
          </div>

          <div className="w-64">
            <DatePicker.RangePicker
              className="w-full text-xs"
              value={dateRange}
              onChange={(dates) => {
                setDateRange(dates as any);
                setPage(1);
              }}
              format="YYYY-MM-DD"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(selectedActionType || selectedTargetUser || dateRange) && (
            <Button
              size="small"
              onClick={() => {
                setSelectedActionType('');
                setSelectedTargetUser(undefined);
                setDateRange(null);
                setPage(1);
              }}>
              Reset Filters
            </Button>
          )}

          <Button
            icon={<RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />}
            onClick={() => refetch()}
            className="flex items-center gap-1 text-xs">
            Refresh
          </Button>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-surface rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={isLoading || isFetching}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
            showSizeChanger: true,
            pageSizeOptions: ['10', '15', '30', '50'],
            showTotal: (tot) => `Total ${tot} audit entries`,
          }}
          size="middle"
        />
      </div>
    </div>
  );
};


import { Building2, GitBranch } from 'lucide-react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Button } from '@/components/ui/primitives/Button';
import type { DepartmentHierarchyItem } from '@/store/api/organizationApiSlice';

interface DepartmentsTableProps {
  departments: DepartmentHierarchyItem[];
  isLoading: boolean;
  canManageHierarchy: boolean;
  onConfigureLeadership: (department: DepartmentHierarchyItem) => void;
}

export function DepartmentsTable({
  departments,
  isLoading,
  canManageHierarchy,
  onConfigureLeadership,
}: DepartmentsTableProps) {
  const columns: ColumnsType<DepartmentHierarchyItem> = [
    {
      title: 'Department',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
            <Building2 size={16} />
          </div>
          <div>
            <span className="font-bold text-foreground block">{record.department_name}</span>
            {record.parent_department_name && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <GitBranch size={10} /> Parent: {record.parent_department_name}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Department Head',
      key: 'head',
      render: (_, record) => (
        <div className="flex items-center gap-2.5">
          {record.head_name ? (
            <>
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center text-xs">
                {record.head_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">{record.head_name}</span>
                <span className="text-[10px] text-muted-foreground">{record.head_email}</span>
              </div>
            </>
          ) : (
            <span className="text-xs text-muted-foreground italic">No Head Designated</span>
          )}
        </div>
      ),
    },
    {
      title: 'Headcount',
      key: 'count',
      render: (_, record) => (
        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-surface-subtle text-foreground border border-border-subtle">
          {record.member_count} {record.member_count === 1 ? 'member' : 'members'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) =>
        canManageHierarchy ? (
          <Button
            variant="outline"
            size="small"
            onClick={() => onConfigureLeadership(record)}
            className="text-xs">
            Configure Leadership
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="rounded-2xl bg-surface-elevated border border-border-subtle shadow-soft overflow-hidden p-3">
      <Table
        scroll={{ x: 'max-content' }}
        columns={columns}
        dataSource={departments}
        rowKey="id"
        loading={isLoading}
        pagination={false}
        className="premium-table"
      />
    </div>
  );
}

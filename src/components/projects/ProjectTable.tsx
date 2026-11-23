import React from 'react';
import { Table, Button, Tag, Empty, Progress, Popconfirm, Tooltip, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Calendar, Eye, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { StatusTag } from './StatusTag';
import { AssigneeAvatar } from './AssigneeAvatar';
import type { BackendProject } from '@/store/api/projectApiSlice';

interface ProjectTableProps {
  projects: BackendProject[];
  loading?: boolean;
  onOpenProject: (project: BackendProject) => void;
  onEditProject?: (project: BackendProject) => void;
  onDeleteProject?: (projectId: number) => void;
  onStatusChange?: (projectId: number, newStatus: string) => void;
  className?: string;
}

const isOverdue = (p: BackendProject) => {
  const date = p.end_date || p.deadline;
  return (
    !!date &&
    new Date(date) < new Date() &&
    p.project_status?.toLowerCase() !== 'completed' &&
    p.project_status?.toLowerCase() !== 'cancelled'
  );
};

const STATUS_OPTIONS = [
  { value: 'Planning', label: 'Planning' },
  { value: 'Active', label: 'Active' },
  { value: 'On Hold', label: 'On Hold' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  loading = false,
  onOpenProject,
  onEditProject,
  onDeleteProject,
  onStatusChange,
  className = '',
}) => {
  const columns: ColumnsType<BackendProject> = [
    {
      title: 'Project',
      dataIndex: 'project_name',
      key: 'project_name',
      sorter: (a, b) => (a.project_name || '').localeCompare(b.project_name || ''),
      render: (_text, record) => (
        <div
          onClick={() => onOpenProject(record)}
          className="cursor-pointer group flex flex-col gap-0.5 min-w-[160px]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10 shrink-0">
              {record.project_key || 'PRJ'}
            </span>
            <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {record.project_name || 'Untitled Project'}
            </span>
          </div>
          {record.project_description && (
            <span className="text-[11px] text-muted line-clamp-1 pl-0.5">
              {record.project_description}
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department_name',
      key: 'department_name',
      render: (dept) =>
        dept ? (
          <Tag color="geekblue" className="text-xs m-0 rounded-md">
            {dept}
          </Tag>
        ) : (
          <span className="text-muted text-xs">—</span>
        ),
    },
    {
      title: 'Owner',
      dataIndex: 'owner_name',
      key: 'owner_name',
      render: (name) => <AssigneeAvatar name={name} size={24} showName />,
    },
    {
      title: 'Manager',
      dataIndex: 'project_manager_name',
      key: 'project_manager_name',
      render: (name) => <AssigneeAvatar name={name} size={24} showName />,
    },
    {
      title: 'Progress',
      key: 'progress',
      width: 140,
      sorter: (a, b) => {
        const pa = a.progress ?? (a.task_count ? Math.round(((a.completed_task_count ?? 0) / a.task_count) * 100) : 0);
        const pb = b.progress ?? (b.task_count ? Math.round(((b.completed_task_count ?? 0) / b.task_count) * 100) : 0);
        return pa - pb;
      },
      render: (_, record) => {
        const pct =
          record.progress ??
          (record.task_count
            ? Math.round(((record.completed_task_count ?? 0) / record.task_count) * 100)
            : 0);
        const color = pct >= 100 ? '#52c41a' : pct >= 60 ? '#1677ff' : pct >= 30 ? '#faad14' : '#ff4d4f';
        return (
          <div className="w-32">
            <Progress
              percent={pct}
              size="small"
              strokeColor={color}
              format={(p) => <span className="text-[10px] font-bold text-muted">{p}%</span>}
            />
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'project_status',
      key: 'project_status',
      render: (status, record) => {
        const computedOverdue = isOverdue(record);
        const displayStatus = computedOverdue ? 'overdue' : status || 'planning';

        if (onStatusChange) {
          return (
            <Select
              size="small"
              value={status || 'Planning'}
              className="w-32"
              variant="borderless"
              onChange={(val) => onStatusChange(record.project_id, val)}
              options={STATUS_OPTIONS}
              labelRender={() => <StatusTag status={displayStatus} />}
              popupMatchSelectWidth={false}
            />
          );
        }
        return <StatusTag status={displayStatus} />;
      },
    },
    {
      title: 'Due Date',
      key: 'due_date',
      sorter: (a, b) => {
        const da = a.end_date || a.deadline || '';
        const db = b.end_date || b.deadline || '';
        return da.localeCompare(db);
      },
      render: (_, record) => {
        const date = record.end_date || record.deadline;
        if (!date) return <span className="text-muted text-xs">—</span>;
        const overdue = isOverdue(record);
        return (
          <span
            className={`flex items-center gap-1.5 text-xs font-medium ${
              overdue ? 'text-red-500' : 'text-muted'
            }`}>
            {overdue ? (
              <AlertCircle size={12} className="text-red-500 shrink-0" />
            ) : (
              <Calendar size={12} className="text-primary shrink-0" />
            )}
            <span>{String(date).split('T')[0]}</span>
          </span>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      width: 100,
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip title="View Project">
            <Button
              type="text"
              size="small"
              icon={<Eye size={14} />}
              onClick={() => onOpenProject(record)}
              className="text-muted hover:text-primary hover:bg-primary/10 rounded-lg"
            />
          </Tooltip>
          {onEditProject && (
            <Tooltip title="Edit Project">
              <Button
                type="text"
                size="small"
                icon={<Pencil size={14} />}
                onClick={() => onEditProject(record)}
                className="text-muted hover:text-blue-500 hover:bg-blue-50 rounded-lg"
              />
            </Tooltip>
          )}
          {onDeleteProject && (
            <Tooltip title="Delete Project">
              <Popconfirm
                title="Delete this project?"
                description="This action cannot be undone."
                onConfirm={() => onDeleteProject(record.project_id)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}>
                <Button
                  type="text"
                  size="small"
                  icon={<Trash2 size={14} />}
                  className="text-muted hover:text-red-500 hover:bg-red-50 rounded-lg"
                />
              </Popconfirm>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={projects}
      rowKey="project_id"
      loading={loading}
      className={`rounded-2xl border border-border-subtle overflow-hidden bg-card ${className}`}
      rowClassName="hover:bg-muted/30 transition-colors"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50'],
        showTotal: (total) => `${total} project${total !== 1 ? 's' : ''}`,
      }}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No projects found"
            className="py-12"
          />
        ),
      }}
    />
  );
};

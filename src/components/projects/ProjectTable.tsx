import React from 'react';
import { Table, Button, Dropdown, Tag, Empty, Progress } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Calendar, MoreVertical, Eye, Edit3, Trash2 } from 'lucide-react';
import { StatusTag } from './StatusTag';
import { AssigneeAvatar } from './AssigneeAvatar';
import type { BackendProject } from '@/store/api/projectApiSlice';

interface ProjectTableProps {
  projects: BackendProject[];
  loading?: boolean;
  onOpenProject: (project: BackendProject) => void;
  onEditProject?: (project: BackendProject) => void;
  onDeleteProject?: (projectId: number) => void;
  className?: string;
}

const HEALTH_COLORS: Record<string, string> = {
  on_track: '#52c41a',
  at_risk: '#faad14',
  off_track: '#ff4d4f',
};

export const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  loading = false,
  onOpenProject,
  onEditProject,
  onDeleteProject,
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
          className="cursor-pointer group flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
              {record.project_key || 'PRJ'}
            </span>
            <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
              {record.project_name || 'Untitled Project'}
            </span>
          </div>
          {record.project_description && (
            <span className="text-[11px] text-muted line-clamp-1">
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
      render: (dept) => (dept ? <Tag color="blue" className="text-xs m-0">{dept}</Tag> : <span className="text-muted text-xs">—</span>),
    },
    {
      title: 'Owner',
      dataIndex: 'owner_name',
      key: 'owner_name',
      render: (name) => <AssigneeAvatar name={name} size={22} showName />,
    },
    {
      title: 'Project Manager',
      dataIndex: 'project_manager_name',
      key: 'project_manager_name',
      render: (name) => <AssigneeAvatar name={name} size={22} showName />,
    },
    {
      title: 'Progress',
      key: 'progress',
      sorter: (a, b) => {
        const pa = a.task_count ? (a.completed_task_count ?? 0) / a.task_count : 0;
        const pb = b.task_count ? (b.completed_task_count ?? 0) / b.task_count : 0;
        return pa - pb;
      },
      render: (_, record) => {
        const total = record.task_count ?? 0;
        const done = record.completed_task_count ?? 0;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        const color = HEALTH_COLORS[record.health || 'on_track'] || '#1677ff';
        return (
          <div className="w-28">
            <Progress percent={pct} size="small" strokeColor={color} />
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'project_status',
      key: 'project_status',
      render: (status) => <StatusTag status={status || 'planning'} />,
    },
    {
      title: 'Due Date',
      key: 'due_date',
      sorter: (a, b) => {
        const da = a.deadline || a.end_date || '';
        const db = b.deadline || b.end_date || '';
        return da.localeCompare(db);
      },
      render: (_, record) => {
        const date = record.deadline || record.end_date;
        if (!date) return <span className="text-muted text-xs">—</span>;
        return (
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <Calendar size={12} className="text-primary" />
            <span>{String(date).split('T')[0]}</span>
          </span>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'open',
                label: 'Open Details',
                icon: <Eye size={14} />,
                onClick: () => onOpenProject(record),
              },
              ...(onEditProject
                ? [
                    {
                      key: 'edit',
                      label: 'Edit Project',
                      icon: <Edit3 size={14} />,
                      onClick: () => onEditProject(record),
                    },
                  ]
                : []),
              ...(onDeleteProject
                ? [
                    {
                      type: 'divider' as const,
                    },
                    {
                      key: 'delete',
                      label: 'Delete Project',
                      icon: <Trash2 size={14} className="text-destructive" />,
                      danger: true,
                      onClick: () => onDeleteProject(record.project_id),
                    },
                  ]
                : []),
            ],
          }}
          trigger={['click']}>
          <Button type="text" size="small" icon={<MoreVertical size={14} />} />
        </Dropdown>
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
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50'],
        showTotal: (total) => `Total ${total} projects`,
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

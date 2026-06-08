'use client';

import React from 'react';
import { Table, Tag, Card, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import PageHeader from '@/src/components/ui/PageHeader';
import StatusBadge, { StatusType } from '@/src/components/ui/StatusBadge';

const tasks = [
  { id: '1', title: 'Design homepage hero section', assignee: 'Lisa Park', status: 'completed' as const, priority: 'High', dueDate: '2026-03-15' },
  { id: '2', title: 'Create component library', assignee: 'Mike Ross', status: 'in-progress' as const, priority: 'Critical', dueDate: '2026-04-01' },
  { id: '3', title: 'Mobile responsive layouts', assignee: 'Sarah Chen', status: 'in-progress' as const, priority: 'High', dueDate: '2026-04-15' },
  { id: '4', title: 'Animation & micro-interactions', assignee: 'Lisa Park', status: 'pending' as const, priority: 'Medium', dueDate: '2026-05-01' },
  { id: '5', title: 'Cross-browser testing', assignee: 'Ana Martinez', status: 'pending' as const, priority: 'Medium', dueDate: '2026-06-01' },
  { id: '6', title: 'Performance optimization', assignee: 'Tom Baker', status: 'pending' as const, priority: 'High', dueDate: '2026-06-10' },
];

const priorityColors: Record<string, string> = { Critical: 'red', High: 'volcano', Medium: 'gold', Low: 'blue' };

const columns = [
  { title: 'Task', dataIndex: 'title', key: 'title', render: (t: string) => <span style={{ fontWeight: 600 }}>{t}</span> },
  { title: 'Assignee', dataIndex: 'assignee', key: 'assignee' },
  { title: 'Priority', dataIndex: 'priority', key: 'priority', render: (p: string) => <Tag color={priorityColors[p]} style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>{p}</Tag> },
  { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate', render: (d: string) => <span style={{ color: 'var(--muted)', fontSize: 13 }}>{d}</span> },
  { title: 'Status', dataIndex: 'status', key: 'status', render: (s: StatusType) => <StatusBadge status={s} /> },
];

export default function ProjectTasksPage() {
  return (
    <div>
      <PageHeader title="Project Tasks" subtitle="Website Redesign – All tasks" breadcrumbs={[{ title: 'Projects', href: '/projects' }, { title: 'Website Redesign', href: '/projects/p1' }, { title: 'Tasks' }]}
        actions={<Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Add Task</Button>}
      />
      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <Table dataSource={tasks} columns={columns} rowKey="id" pagination={false} />
      </Card>
    </div>
  );
}

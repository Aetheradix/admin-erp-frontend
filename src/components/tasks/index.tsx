'use client';

import React from 'react';
import { Button, Segmented, Tag, Avatar, Card, Table, Input, Space } from 'antd';
import { PlusOutlined, AppstoreOutlined, BarsOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageHeader from '@/src/components/ui/PageHeader';
import StatusBadge from '@/src/components/ui/StatusBadge';
import { useTasks } from './hooks/useTasks';
import { Task } from './types';
import TaskModal from './components/TaskModal';

const kanbanColumns = [
  { key: 'todo', title: 'To Do', color: '#6b635e' },
  { key: 'in-progress', title: 'In Progress', color: '#0284c7' },
  { key: 'review', title: 'Review', color: '#d97706' },
  { key: 'completed', title: 'Done', color: '#059669' },
];

const priorityColors: Record<string, string> = { Critical: 'red', High: 'volcano', Medium: 'gold', Low: 'blue' };

export default function Tasks() {
  const router = useRouter();
  const { tasks, totalTasks, loading, search, setSearch, view, setView, addTask } = useTasks();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const tableColumns = [
    { title: 'Task', dataIndex: 'title', key: 'title', render: (t: string) => <span style={{ fontWeight: 600 }}>{t}</span> },
    { title: 'Project', dataIndex: 'project', key: 'project', render: (p: string) => <Tag style={{ borderRadius: 6, border: 'none' }}>{p}</Tag> },
    { title: 'Assignee', dataIndex: 'assignee', key: 'assignee' },
    { title: 'Priority', dataIndex: 'priority', key: 'priority', render: (p: string) => <Tag color={priorityColors[p]} style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>{p}</Tag> },
    { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate', render: (d: string) => <span style={{ color: 'var(--muted)' }}>{d}</span> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: any) => <StatusBadge status={s === 'todo' ? 'pending' : s === 'review' ? 'pending' : s} label={s === 'todo' ? 'To Do' : s === 'review' ? 'Review' : undefined} /> },
  ];

  return (
    <div>
      <PageHeader title="Tasks" subtitle={`${totalTasks} tasks assigned.`} breadcrumbs={[{ title: 'Tasks' }]}
        actions={<Space><Button icon={<DownloadOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Export</Button><Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: 10, fontWeight: 600 }} onClick={() => setIsModalOpen(true)}>New Task</Button></Space>}
      />

      <TaskModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={addTask}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Input prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />} placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320, borderRadius: 10 }} allowClear />
        <Segmented value={view} onChange={(v) => setView(v as string)} options={[{ value: 'kanban', label: 'Board', icon: <AppstoreOutlined /> }, { value: 'list', label: 'List', icon: <BarsOutlined /> }]} />
      </div>

      {view === 'kanban' ? (
        <div className="kanban-board">
          {kanbanColumns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            return (
              <div className="kanban-column" key={col.key}>
                <div className="kanban-column-header">
                  <span className="kanban-column-title" style={{ color: col.color }}>{col.title}</span>
                  <span className="kanban-column-count">{colTasks.length}</span>
                </div>
                {colTasks.map((task) => (
                  <div className="kanban-card" key={task.id}>
                    <div style={{ marginBottom: 8 }}><span style={{ fontWeight: 600, fontSize: 14 }}>{task.title}</span></div>
                    <Tag style={{ borderRadius: 6, border: 'none', fontSize: 11, marginBottom: 10 }}>{task.project}</Tag>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Tag color={priorityColors[task.priority]} style={{ borderRadius: 6, border: 'none', fontWeight: 600, fontSize: 11 }}>{task.priority}</Tag>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Avatar size={22} style={{ background: 'var(--primary)', fontSize: 9, fontWeight: 700 }}>{task.assignee.split(' ').map(n => n[0]).join('')}</Avatar>
                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
          <Table dataSource={tasks} columns={tableColumns} rowKey="id" pagination={{ pageSize: 10 }} loading={loading} />
        </Card>
      )}
    </div>
  );
}

import React from 'react';
import { Tag } from 'antd';
import StatusBadge from '@/src/components/ui/StatusBadge';

export const kanbanColumns = [
    { key: 'todo', title: 'To Do', color: '#6b635e' },
    { key: 'in-progress', title: 'In Progress', color: '#0284c7' },
    { key: 'review', title: 'Review', color: '#d97706' },
    { key: 'completed', title: 'Done', color: '#059669' },
];

export const priorityColors: Record<string, string> = {
    Critical: 'red',
    High: 'volcano',
    Medium: 'gold',
    Low: 'blue'
};

export const tableColumns = [
    {
        title: 'Task',
        dataIndex: 'title',
        key: 'title',
        render: (t: string) => <span style={{ fontWeight: 600 }}>{t}</span>
    },
    {
        title: 'Project',
        dataIndex: 'project',
        key: 'project',
        render: (p: string) => <Tag style={{ borderRadius: 6, border: 'none' }}>{p}</Tag>
    },
    { title: 'Assignee', dataIndex: 'assignee', key: 'assignee' },
    {
        title: 'Priority',
        dataIndex: 'priority',
        key: 'priority',
        render: (p: string) => (
            <Tag color={priorityColors[p]} style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>
                {p}
            </Tag>
        )
    },
    {
        title: 'Due Date',
        dataIndex: 'dueDate',
        key: 'dueDate',
        render: (d: string) => <span style={{ color: 'var(--muted)' }}>{d}</span>
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (s: any) => (
            <StatusBadge
                status={s === 'todo' ? 'pending' : s === 'review' ? 'pending' : s}
                label={s === 'todo' ? 'To Do' : s === 'review' ? 'Review' : undefined}
            />
        )
    },
];

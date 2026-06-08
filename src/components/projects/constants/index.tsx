import React from 'react';
import { ProjectOutlined } from '@ant-design/icons';
import { Tag, Progress, Button } from 'antd';
import StatusBadge from '@/src/components/ui/StatusBadge';
import { Project } from '../types';

export const priorityColors: Record<string, string> = {
    Critical: 'red',
    High: 'volcano',
    Medium: 'gold',
    Low: 'blue'
};

export const getProjectColumns = (router: { push: (url: string) => void }) => [
    {
        title: 'Project',
        dataIndex: 'name',
        key: 'name',
        render: (name: string) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'var(--primary-soft)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <ProjectOutlined style={{ fontSize: 18 }} />
                </div>
                <span style={{ fontWeight: 600 }}>{name}</span>
            </div>
        ),
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (s: Project['status']) => <StatusBadge status={s} />
    },
    {
        title: 'Priority',
        dataIndex: 'priority',
        key: 'priority',
        render: (p: keyof typeof priorityColors) => (
            <Tag color={priorityColors[p]} style={{ borderRadius: 6, fontWeight: 600, border: 'none' }}>
                {p}
            </Tag>
        )
    },
    {
        title: 'Progress',
        dataIndex: 'progress',
        key: 'progress',
        render: (p: number) => (
            <Progress
                percent={p}
                size="small"
                strokeColor={p === 100 ? '#059669' : 'var(--primary)'}
                style={{ maxWidth: 160 }}
            />
        ),
    },
    { title: 'Team', dataIndex: 'team', key: 'team' },
    {
        title: 'Deadline',
        dataIndex: 'deadline',
        key: 'deadline',
        render: (d: string) => <span style={{ color: 'var(--muted)', fontSize: 13 }}>{d}</span>
    },
    {
        title: '',
        key: 'action',
        render: (_: unknown, r: Project) => (
            <Button
                type="link"
                onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/projects/${r.id}`);
                }}
                style={{ fontWeight: 600 }}
            >
                View →
            </Button>
        )
    },
];

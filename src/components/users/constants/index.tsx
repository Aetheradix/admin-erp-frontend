import React from 'react';
import { Avatar, Tag, Button } from 'antd';
import StatusBadge from '@/src/components/ui/StatusBadge';
import { User } from '../types';

export const getUserColumns = (router: any) => [
    {
        title: 'User',
        dataIndex: 'name',
        key: 'name',
        render: (name: string, r: User) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar
                    style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 12 }}
                    size={36}
                >
                    {r.avatar}
                </Avatar>
                <div>
                    <div style={{ fontWeight: 600 }}>{name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.email}</div>
                </div>
            </div>
        ),
    },
    {
        title: 'Role',
        dataIndex: 'role',
        key: 'role',
        render: (v: string) => (
            <Tag style={{ borderRadius: 6, fontWeight: 600, border: 'none' }} color="blue">
                {v}
            </Tag>
        )
    },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (s: any) => <StatusBadge status={s} />
    },
    {
        title: 'Last Active',
        dataIndex: 'lastActive',
        key: 'lastActive',
        render: (v: string) => <span style={{ color: 'var(--muted)', fontSize: 13 }}>{v}</span>
    },
    {
        title: '',
        key: 'action',
        render: (_: any, r: User) => (
            <Button
                type="link"
                onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/users/${r.id}`);
                }}
                style={{ fontWeight: 600 }}
            >
                View →
            </Button>
        )
    },
];

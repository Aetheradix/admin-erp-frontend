import React from 'react';
import { Tag, Checkbox, Button } from 'antd';
import { SafetyCertificateOutlined, EditOutlined } from '@ant-design/icons';
import { Role, Permissions } from '../types';

export const permissionLabels: (keyof Permissions)[] = [
    'projects',
    'finance',
    'users',
    'settings',
    'reports',
    'inventory'
];

export const getRoleColumns = () => [
    {
        title: 'Role',
        dataIndex: 'name',
        key: 'name',
        render: (n: string, r: Role) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: `${r.color}12`,
                    color: r.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <SafetyCertificateOutlined style={{ fontSize: 18 }} />
                </div>
                <div>
                    <div style={{ fontWeight: 700 }}>{n}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.description}</div>
                </div>
            </div>
        ),
    },
    {
        title: 'Users',
        dataIndex: 'users',
        key: 'users',
        render: (u: number) => (
            <Tag style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>
                {u} users
            </Tag>
        )
    },
    ...permissionLabels.map((p) => ({
        title: p.charAt(0).toUpperCase() + p.slice(1),
        key: p,
        align: 'center' as const,
        render: (_: unknown, r: Role) => <Checkbox checked={r.permissions[p]} disabled />,
    })),
    {
        title: '',
        key: 'action',
        render: () => (
            <Button
                type="text"
                icon={<EditOutlined />}
                style={{ borderRadius: 8 }}
            />
        )
    },
];

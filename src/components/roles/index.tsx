'use client';

import React from 'react';
import { Card, Table, Tag, Button, Checkbox, Typography } from 'antd';
import { PlusOutlined, EditOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import PageHeader from '@/src/components/ui/PageHeader';
import { useRoles } from './hooks/useRoles';
import { Role, Permissions } from './types';

const { Text } = Typography;

const permissionLabels: (keyof Permissions)[] = ['projects', 'finance', 'users', 'settings', 'reports', 'inventory'];

const columns = [
  {
    title: 'Role', dataIndex: 'name', key: 'name', render: (n: string, r: Role) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${r.color}12`, color: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SafetyCertificateOutlined style={{ fontSize: 18 }} /></div>
        <div><div style={{ fontWeight: 700 }}>{n}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.description}</div></div>
      </div>
    ),
  },
  { title: 'Users', dataIndex: 'users', key: 'users', render: (u: number) => <Tag style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>{u} users</Tag> },
  ...permissionLabels.map((p) => ({
    title: p.charAt(0).toUpperCase() + p.slice(1),
    key: p,
    align: 'center' as const,
    render: (_: any, r: Role) => <Checkbox checked={r.permissions[p]} disabled />,
  })),
  { title: '', key: 'action', render: () => <Button type="text" icon={<EditOutlined />} style={{ borderRadius: 8 }} /> },
];

export default function Roles() {
  const { roles, loading } = useRoles();

  return (
    <div>
      <PageHeader title="Roles & Permissions" subtitle="Manage access control for your organization." breadcrumbs={[{ title: 'Settings' }, { title: 'Roles & Permissions' }]}
        actions={<Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: 10, fontWeight: 600 }}>Create Role</Button>}
      />
      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <Table dataSource={roles} columns={columns} rowKey="id" pagination={false} loading={loading} />
      </Card>
    </div>
  );
}

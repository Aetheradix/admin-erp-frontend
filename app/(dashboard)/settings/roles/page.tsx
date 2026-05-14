'use client';

import React from 'react';
import { Card, Table, Tag, Button, Checkbox, Row, Col, Typography, Avatar, Space } from 'antd';
import { PlusOutlined, EditOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import PageHeader from '@/src/components/ui/PageHeader';

const { Text } = Typography;

const roles = [
  { id: '1', name: 'Super Admin', description: 'Full access to all features', users: 2, color: '#e11d48', permissions: { projects: true, finance: true, users: true, settings: true, reports: true, inventory: true } },
  { id: '2', name: 'Admin', description: 'Administrative access with some restrictions', users: 4, color: '#E8583A', permissions: { projects: true, finance: true, users: true, settings: true, reports: true, inventory: true } },
  { id: '3', name: 'Manager', description: 'Team and project management', users: 12, color: '#0284c7', permissions: { projects: true, finance: false, users: true, settings: false, reports: true, inventory: false } },
  { id: '4', name: 'Developer', description: 'Project and task access', users: 45, color: '#7c3aed', permissions: { projects: true, finance: false, users: false, settings: false, reports: false, inventory: false } },
  { id: '5', name: 'Viewer', description: 'Read-only access to assigned resources', users: 28, color: '#6b635e', permissions: { projects: false, finance: false, users: false, settings: false, reports: true, inventory: false } },
];

const permissionLabels = ['projects', 'finance', 'users', 'settings', 'reports', 'inventory'];

const columns = [
  {
    title: 'Role', dataIndex: 'name', key: 'name', render: (n: string, r: any) => (
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
    render: (_: any, r: any) => <Checkbox checked={r.permissions[p]} disabled />,
  })),
  { title: '', key: 'action', render: () => <Button type="text" icon={<EditOutlined />} style={{ borderRadius: 8 }} /> },
];

export default function RolesPage() {
  return (
    <div>
      <PageHeader title="Roles & Permissions" subtitle="Manage access control for your organization." breadcrumbs={[{ title: 'Settings' }, { title: 'Roles & Permissions' }]}
        actions={<Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: 10, fontWeight: 600 }}>Create Role</Button>}
      />
      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <Table dataSource={roles} columns={columns} rowKey="id" pagination={false} />
      </Card>
    </div>
  );
}

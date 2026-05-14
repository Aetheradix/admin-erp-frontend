'use client';

import React, { useState } from 'react';
import { Table, Button, Input, Avatar, Tag, Card, Select, Space } from 'antd';
import { PlusOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageHeader from '@/src/components/ui/PageHeader';
import StatusBadge from '@/src/components/ui/StatusBadge';

const users = [
  { id: 'u1', name: 'John Doe', email: 'john@acme.com', role: 'Admin', department: 'Management', status: 'active' as const, lastActive: '2 min ago', avatar: 'JD' },
  { id: 'u2', name: 'Sarah Chen', email: 'sarah@acme.com', role: 'Team Lead', department: 'Engineering', status: 'active' as const, lastActive: '5 min ago', avatar: 'SC' },
  { id: 'u3', name: 'Marcus Johnson', email: 'marcus@acme.com', role: 'Developer', department: 'Engineering', status: 'active' as const, lastActive: '1 hour ago', avatar: 'MJ' },
  { id: 'u4', name: 'Emily Watson', email: 'emily@acme.com', role: 'HR Manager', department: 'HR', status: 'active' as const, lastActive: '3 hours ago', avatar: 'EW' },
  { id: 'u5', name: 'Alex Rivera', email: 'alex@acme.com', role: 'Sales Lead', department: 'Sales', status: 'inactive' as const, lastActive: '2 days ago', avatar: 'AR' },
  { id: 'u6', name: 'Lisa Park', email: 'lisa@acme.com', role: 'Designer', department: 'Design', status: 'active' as const, lastActive: '30 min ago', avatar: 'LP' },
  { id: 'u7', name: 'David Kim', email: 'david@acme.com', role: 'Finance Manager', department: 'Finance', status: 'active' as const, lastActive: '1 hour ago', avatar: 'DK' },
  { id: 'u8', name: 'Nina Gupta', email: 'nina@acme.com', role: 'Support Lead', department: 'Support', status: 'pending' as const, lastActive: 'Never', avatar: 'NG' },
];

export default function UsersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: 'User', dataIndex: 'name', key: 'name',
      render: (name: string, r: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 12 }} size={36}>{r.avatar}</Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>{name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.email}</div>
          </div>
        </div>
      ),
    },
    { title: 'Role', dataIndex: 'role', key: 'role', render: (v: string) => <Tag style={{ borderRadius: 6, fontWeight: 600, border: 'none' }} color="blue">{v}</Tag> },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: any) => <StatusBadge status={s} /> },
    { title: 'Last Active', dataIndex: 'lastActive', key: 'lastActive', render: (v: string) => <span style={{ color: 'var(--muted)', fontSize: 13 }}>{v}</span> },
    { title: '', key: 'action', render: (_: any, r: any) => <Button type="link" onClick={() => router.push(`/users/${r.id}`)} style={{ fontWeight: 600 }}>View →</Button> },
  ];

  return (
    <div>
      <PageHeader title="Users" subtitle={`${users.length} users in your organization.`} breadcrumbs={[{ title: 'Users' }]}
        actions={<Space><Button icon={<DownloadOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Export</Button><Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: 10, fontWeight: 600 }}>Invite User</Button></Space>}
      />
      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <div style={{ marginBottom: 20 }}>
          <Input prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />} placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320, borderRadius: 10 }} allowClear />
        </div>
        <Table dataSource={filtered} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} onRow={(r) => ({ onClick: () => router.push(`/users/${r.id}`), style: { cursor: 'pointer' } })} />
      </Card>
    </div>
  );
}

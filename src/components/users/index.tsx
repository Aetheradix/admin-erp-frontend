'use client';

import React from 'react';
import { Table, Button, Input, Avatar, Tag, Card, Space } from 'antd';
import { PlusOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageHeader from '@/src/components/ui/PageHeader';
import StatusBadge from '@/src/components/ui/StatusBadge';
import { useUsers } from './hooks/useUsers';
import { User } from './types';

export default function Users() {
  const router = useRouter();
  const { users, totalUsers, loading, search, setSearch } = useUsers();

  const columns = [
    {
      title: 'User', dataIndex: 'name', key: 'name',
      render: (name: string, r: User) => (
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
    { title: '', key: 'action', render: (_: any, r: User) => <Button type="link" onClick={(e) => { e.stopPropagation(); router.push(`/users/${r.id}`); }} style={{ fontWeight: 600 }}>View →</Button> },
  ];

  return (
    <div>
      <PageHeader title="Users" subtitle={`${totalUsers} users in your organization.`} breadcrumbs={[{ title: 'Users' }]}
        actions={<Space><Button icon={<DownloadOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Export</Button><Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: 10, fontWeight: 600 }}>Invite User</Button></Space>}
      />
      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <div style={{ marginBottom: 20 }}>
          <Input prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />} placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320, borderRadius: 10 }} allowClear />
        </div>
        <Table dataSource={users} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} loading={loading} onRow={(r) => ({ onClick: () => router.push(`/users/${r.id}`), style: { cursor: 'pointer' } })} />
      </Card>
    </div>
  );
}

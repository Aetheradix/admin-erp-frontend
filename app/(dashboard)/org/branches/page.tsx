'use client';

import React, { useState } from 'react';
import { Table, Button, Input, Card } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageHeader from '@/src/components/ui/PageHeader';
import StatusBadge from '@/src/components/ui/StatusBadge';

interface Branch {
  id: string;
  name: string;
  location: string;
  manager: string;
  members: number;
  status: 'active' | 'inactive' | 'pending';
}

const branches: Branch[] = [
  { id: 'b1', name: 'San Francisco HQ', location: 'San Francisco, CA', manager: 'John Doe', members: 52, status: 'active' },
  { id: 'b2', name: 'New York Office', location: 'New York, NY', manager: 'Sarah Chen', members: 38, status: 'active' },
  { id: 'b3', name: 'London Branch', location: 'London, UK', manager: 'James Wilson', members: 27, status: 'active' },
  { id: 'b4', name: 'Singapore Office', location: 'Singapore', manager: 'Li Wei', members: 19, status: 'inactive' },
  { id: 'b5', name: 'Berlin Office', location: 'Berlin, Germany', manager: 'Anna Schmidt', members: 15, status: 'active' },
  { id: 'b6', name: 'Mumbai Office', location: 'Mumbai, India', manager: 'Raj Patel', members: 12, status: 'pending' },
];

export default function BranchesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = branches.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.location.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: 'Branch',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Branch) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EnvironmentOutlined style={{ fontSize: 18 }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{record.location}</div>
          </div>
        </div>
      ),
    },
    { title: 'Manager', dataIndex: 'manager', key: 'manager', render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span> },
    { title: 'Members', dataIndex: 'members', key: 'members', render: (v: number) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: Branch['status']) => <StatusBadge status={s} /> },
    {
      title: '',
      key: 'action',
      render: (_: unknown, record: Branch) => (
        <Button type="link" onClick={() => router.push(`/org/branches/${record.id}`)} style={{ fontWeight: 600 }}>
          View →
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Branches"
        subtitle="Manage your organization's locations and offices."
        breadcrumbs={[{ title: 'Organization' }, { title: 'Branches' }]}
        actions={
          <Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: 10, fontWeight: 600 }}>
            Add Branch
          </Button>
        }
      />

      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <div style={{ marginBottom: 20 }}>
          <Input
            prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />}
            placeholder="Search branches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 320, borderRadius: 10 }}
            allowClear
          />
        </div>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          style={{ cursor: 'pointer' }}
          onRow={(record) => ({ onClick: () => router.push(`/org/branches/${record.id}`) })}
        />
      </Card>
    </div>
  );
}

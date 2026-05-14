'use client';

import React, { useState } from 'react';
import { Table, Button, Input, Tag, Card, Space } from 'antd';
import { PlusOutlined, SearchOutlined, FileTextOutlined, DownloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageHeader from '@/src/components/ui/PageHeader';

const reports = [
  { id: 'r1', title: 'Q1 2026 Financial Summary', type: 'Finance', createdBy: 'David Kim', date: '2026-04-01', status: 'Published' },
  { id: 'r2', title: 'Engineering Sprint Report - May', type: 'Operations', createdBy: 'Sarah Chen', date: '2026-05-10', status: 'Published' },
  { id: 'r3', title: 'Monthly Revenue Analysis', type: 'Finance', createdBy: 'David Kim', date: '2026-05-01', status: 'Published' },
  { id: 'r4', title: 'Team Performance Review Q1', type: 'HR', createdBy: 'Emily Watson', date: '2026-04-28', status: 'Draft' },
  { id: 'r5', title: 'Customer Satisfaction Survey', type: 'Support', createdBy: 'Nina Gupta', date: '2026-04-15', status: 'Published' },
  { id: 'r6', title: 'Inventory Audit 2026', type: 'Operations', createdBy: 'John Doe', date: '2026-03-30', status: 'Draft' },
];

const typeColors: Record<string, string> = { Finance: 'green', Operations: 'blue', HR: 'purple', Support: 'cyan' };

export default function ReportsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const filtered = reports.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { title: 'Report', dataIndex: 'title', key: 'title', render: (t: string) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.08)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileTextOutlined /></div>
        <span style={{ fontWeight: 600 }}>{t}</span>
      </div>
    )},
    { title: 'Type', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color={typeColors[t]} style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>{t}</Tag> },
    { title: 'Created By', dataIndex: 'createdBy', key: 'createdBy' },
    { title: 'Date', dataIndex: 'date', key: 'date', render: (d: string) => <span style={{ color: 'var(--muted)', fontSize: 13 }}>{d}</span> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'Published' ? 'green' : 'default'} style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>{s}</Tag> },
    { title: '', key: 'action', render: (_: any, r: any) => <Button type="link" onClick={() => router.push(`/analytics/reports/${r.id}`)} style={{ fontWeight: 600 }}>View →</Button> },
  ];

  return (
    <div>
      <PageHeader title="Reports" subtitle="Saved and generated reports." breadcrumbs={[{ title: 'Analytics', href: '/analytics' }, { title: 'Reports' }]}
        actions={<Space><Button icon={<DownloadOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Export All</Button><Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: 10, fontWeight: 600 }}>Create Report</Button></Space>}
      />
      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <div style={{ marginBottom: 20 }}><Input prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />} placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320, borderRadius: 10 }} allowClear /></div>
        <Table dataSource={filtered} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} onRow={(r) => ({ onClick: () => router.push(`/analytics/reports/${r.id}`), style: { cursor: 'pointer' } })} />
      </Card>
    </div>
  );
}

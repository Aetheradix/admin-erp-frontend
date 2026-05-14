'use client';

import React from 'react';
import { Table, Button, Input, Tag, Card, Space } from 'antd';
import { PlusOutlined, SearchOutlined, FileTextOutlined, DownloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageHeader from '@/src/components/ui/PageHeader';
import { useReports } from './hooks/useReports';
import { typeColors } from './mockData';
import { AnalyticsReport } from './types';

export default function Reports() {
  const router = useRouter();
  const { reports, totalReports, loading, search, setSearch } = useReports();

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
    { title: '', key: 'action', render: (_: any, r: AnalyticsReport) => <Button type="link" onClick={(e) => { e.stopPropagation(); router.push(`/analytics/reports/${r.id}`); }} style={{ fontWeight: 600 }}>View →</Button> },
  ];

  return (
    <div>
      <PageHeader title="Reports" subtitle="Saved and generated reports." breadcrumbs={[{ title: 'Analytics', href: '/analytics' }, { title: 'Reports' }]}
        actions={<Space><Button icon={<DownloadOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Export All</Button><Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: 10, fontWeight: 600 }}>Create Report</Button></Space>}
      />
      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <div style={{ marginBottom: 20 }}><Input prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />} placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320, borderRadius: 10 }} allowClear /></div>
        <Table dataSource={reports} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} loading={loading} onRow={(r) => ({ onClick: () => router.push(`/analytics/reports/${r.id}`), style: { cursor: 'pointer' } })} />
      </Card>
    </div>
  );
}

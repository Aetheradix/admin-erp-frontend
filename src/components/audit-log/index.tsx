'use client';

import React from 'react';
import { Table, Input, Select, Tag, Card, Typography, Button } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import PageHeader from '@/src/components/ui/PageHeader';
import { useAuditLog } from './hooks/useAuditLog';
import { severityConfig } from './mockData';

const { Text } = Typography;

export default function AuditLog() {
  const { logs, loading, search, setSearch, setSeverityFilter } = useAuditLog();

  const columns = [
    { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp', render: (t: string) => <Text style={{ fontSize: 13, fontFamily: 'monospace', color: 'var(--muted)' }}>{t}</Text> },
    { title: 'Action', dataIndex: 'action', key: 'action', render: (a: string) => <span style={{ fontWeight: 600 }}>{a}</span> },
    { title: 'User', dataIndex: 'user', key: 'user' },
    { title: 'Resource', dataIndex: 'resource', key: 'resource', render: (r: string) => <Tag style={{ borderRadius: 6, border: 'none' }}>{r}</Tag> },
    { title: 'IP Address', dataIndex: 'ip', key: 'ip', render: (ip: string) => <Text style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--muted)' }}>{ip}</Text> },
    { title: 'Severity', dataIndex: 'severity', key: 'severity', render: (s: string) => <Tag color={severityConfig[s].color} style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>{severityConfig[s].label}</Tag> },
  ];

  return (
    <div>
      <PageHeader title="Audit Log" subtitle="Track all system events and user actions." breadcrumbs={[{ title: 'Settings' }, { title: 'Audit Log' }]}
        actions={<Button icon={<DownloadOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Export Logs</Button>}
      />
      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <Input prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />} placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 280, borderRadius: 10 }} allowClear />
          <Select placeholder="Severity" allowClear onChange={(v) => setSeverityFilter(v || null)} style={{ width: 140 }} options={[{ value: 'info', label: 'Info' }, { value: 'warning', label: 'Warning' }, { value: 'critical', label: 'Critical' }]} />
        </div>
        <Table dataSource={logs} columns={columns} rowKey="id" pagination={{ pageSize: 10, showTotal: (total) => `${total} events` }} loading={loading} />
      </Card>
    </div>
  );
}

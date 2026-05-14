'use client';

import React, { useState } from 'react';
import { Table, Input, Select, Tag, Card, Typography, DatePicker, Space } from 'antd';
import { SearchOutlined, AuditOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import PageHeader from '@/src/components/ui/PageHeader';

const { Text } = Typography;

const auditLogs = [
  { id: '1', action: 'User Login', user: 'John Doe', resource: 'Auth', ip: '192.168.1.42', timestamp: '2026-05-14 10:12:34', severity: 'info' },
  { id: '2', action: 'Invoice Created', user: 'David Kim', resource: 'Finance', ip: '192.168.1.55', timestamp: '2026-05-14 09:45:12', severity: 'info' },
  { id: '3', action: 'Permission Changed', user: 'John Doe', resource: 'Settings', ip: '192.168.1.42', timestamp: '2026-05-14 09:30:00', severity: 'warning' },
  { id: '4', action: 'User Deleted', user: 'John Doe', resource: 'Users', ip: '192.168.1.42', timestamp: '2026-05-13 17:20:45', severity: 'critical' },
  { id: '5', action: 'Project Updated', user: 'Sarah Chen', resource: 'Projects', ip: '192.168.1.67', timestamp: '2026-05-13 16:15:22', severity: 'info' },
  { id: '6', action: 'Password Reset', user: 'Alex Rivera', resource: 'Auth', ip: '192.168.1.89', timestamp: '2026-05-13 14:50:18', severity: 'warning' },
  { id: '7', action: 'Bulk Export', user: 'David Kim', resource: 'Finance', ip: '192.168.1.55', timestamp: '2026-05-13 11:30:05', severity: 'info' },
  { id: '8', action: 'Integration Connected', user: 'Tom Baker', resource: 'Settings', ip: '192.168.1.72', timestamp: '2026-05-13 10:15:33', severity: 'info' },
  { id: '9', action: 'Role Modified', user: 'John Doe', resource: 'Settings', ip: '192.168.1.42', timestamp: '2026-05-12 16:45:00', severity: 'warning' },
  { id: '10', action: 'Data Import', user: 'Sarah Chen', resource: 'Inventory', ip: '192.168.1.67', timestamp: '2026-05-12 09:20:14', severity: 'info' },
];

const severityConfig: Record<string, { color: string; label: string }> = {
  info: { color: 'blue', label: 'Info' },
  warning: { color: 'gold', label: 'Warning' },
  critical: { color: 'red', label: 'Critical' },
};

const columns = [
  { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp', render: (t: string) => <Text style={{ fontSize: 13, fontFamily: 'monospace', color: 'var(--muted)' }}>{t}</Text> },
  { title: 'Action', dataIndex: 'action', key: 'action', render: (a: string) => <span style={{ fontWeight: 600 }}>{a}</span> },
  { title: 'User', dataIndex: 'user', key: 'user' },
  { title: 'Resource', dataIndex: 'resource', key: 'resource', render: (r: string) => <Tag style={{ borderRadius: 6, border: 'none' }}>{r}</Tag> },
  { title: 'IP Address', dataIndex: 'ip', key: 'ip', render: (ip: string) => <Text style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--muted)' }}>{ip}</Text> },
  { title: 'Severity', dataIndex: 'severity', key: 'severity', render: (s: string) => <Tag color={severityConfig[s].color} style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>{severityConfig[s].label}</Tag> },
];

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);

  const filtered = auditLogs.filter((l) => {
    const matchSearch = l.action.toLowerCase().includes(search.toLowerCase()) || l.user.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = !severityFilter || l.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

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
        <Table dataSource={filtered} columns={columns} rowKey="id" pagination={{ pageSize: 10, showTotal: (total) => `${total} events` }} />
      </Card>
    </div>
  );
}

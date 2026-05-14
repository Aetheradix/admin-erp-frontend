'use client';

import React, { useState } from 'react';
import { Table, Button, Input, Tag, Progress, Avatar, Card, Space, Select } from 'antd';
import { PlusOutlined, SearchOutlined, ProjectOutlined, FilterOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageHeader from '@/src/components/ui/PageHeader';
import StatusBadge from '@/src/components/ui/StatusBadge';

const projects = [
  { id: 'p1', name: 'Website Redesign', status: 'in-progress' as const, progress: 75, team: 'Design', lead: 'Mike Ross', deadline: '2026-06-15', priority: 'High', members: 6 },
  { id: 'p2', name: 'Mobile App v2.0', status: 'in-progress' as const, progress: 45, team: 'Engineering', lead: 'Sarah Chen', deadline: '2026-07-01', priority: 'Critical', members: 12 },
  { id: 'p3', name: 'Q2 Marketing Campaign', status: 'completed' as const, progress: 100, team: 'Marketing', lead: 'Emily Watson', deadline: '2026-05-30', priority: 'Medium', members: 4 },
  { id: 'p4', name: 'Data Migration', status: 'in-progress' as const, progress: 30, team: 'DevOps', lead: 'Tom Baker', deadline: '2026-08-15', priority: 'High', members: 3 },
  { id: 'p5', name: 'Customer Portal', status: 'in-progress' as const, progress: 60, team: 'Product', lead: 'Nina Gupta', deadline: '2026-07-20', priority: 'Medium', members: 8 },
  { id: 'p6', name: 'API v3 Launch', status: 'pending' as const, progress: 10, team: 'Engineering', lead: 'Marcus Johnson', deadline: '2026-09-01', priority: 'High', members: 5 },
  { id: 'p7', name: 'Annual Report', status: 'draft' as const, progress: 0, team: 'Finance', lead: 'David Kim', deadline: '2026-12-31', priority: 'Low', members: 2 },
];

const priorityColors: Record<string, string> = { Critical: 'red', High: 'volcano', Medium: 'gold', Low: 'blue' };

export default function ProjectsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    {
      title: 'Project', dataIndex: 'name', key: 'name',
      render: (name: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ProjectOutlined style={{ fontSize: 18 }} />
          </div>
          <span style={{ fontWeight: 600 }}>{name}</span>
        </div>
      ),
    },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: any) => <StatusBadge status={s} /> },
    { title: 'Priority', dataIndex: 'priority', key: 'priority', render: (p: string) => <Tag color={priorityColors[p]} style={{ borderRadius: 6, fontWeight: 600, border: 'none' }}>{p}</Tag> },
    {
      title: 'Progress', dataIndex: 'progress', key: 'progress',
      render: (p: number) => <Progress percent={p} size="small" strokeColor={p === 100 ? '#059669' : 'var(--primary)'} style={{ maxWidth: 160 }} />,
    },
    { title: 'Team', dataIndex: 'team', key: 'team' },
    { title: 'Deadline', dataIndex: 'deadline', key: 'deadline', render: (d: string) => <span style={{ color: 'var(--muted)', fontSize: 13 }}>{d}</span> },
    { title: '', key: 'action', render: (_: any, r: any) => <Button type="link" onClick={() => router.push(`/projects/${r.id}`)} style={{ fontWeight: 600 }}>View →</Button> },
  ];

  return (
    <div>
      <PageHeader title="Projects" subtitle={`${projects.length} projects across your organization.`} breadcrumbs={[{ title: 'Projects' }]}
        actions={<Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: 10, fontWeight: 600 }}>New Project</Button>}
      />
      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <div style={{ marginBottom: 20 }}>
          <Input prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />} placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320, borderRadius: 10 }} allowClear />
        </div>
        <Table dataSource={filtered} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} onRow={(r) => ({ onClick: () => router.push(`/projects/${r.id}`), style: { cursor: 'pointer' } })} />
      </Card>
    </div>
  );
}

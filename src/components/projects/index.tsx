'use client';

import React from 'react';
import { Table, Button, Input, Tag, Progress, Card } from 'antd';
import { PlusOutlined, SearchOutlined, ProjectOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageHeader from '@/src/components/ui/PageHeader';
import StatusBadge from '@/src/components/ui/StatusBadge';
import { useProjects } from './hooks/useProjects';
import { Project } from './types';

const priorityColors: Record<string, string> = { Critical: 'red', High: 'volcano', Medium: 'gold', Low: 'blue' };

export default function Projects() {
  const router = useRouter();
  const { projects, totalProjects, loading, search, setSearch } = useProjects();

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
    { title: '', key: 'action', render: (_: any, r: Project) => <Button type="link" onClick={(e) => { e.stopPropagation(); router.push(`/projects/${r.id}`); }} style={{ fontWeight: 600 }}>View →</Button> },
  ];

  return (
    <div>
      <PageHeader title="Projects" subtitle={`${totalProjects} projects across your organization.`} breadcrumbs={[{ title: 'Projects' }]}
        actions={<Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: 10, fontWeight: 600 }}>New Project</Button>}
      />
      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <div style={{ marginBottom: 20 }}>
          <Input prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />} placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320, borderRadius: 10 }} allowClear />
        </div>
        <Table dataSource={projects} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} loading={loading} onRow={(r) => ({ onClick: () => router.push(`/projects/${r.id}`), style: { cursor: 'pointer' } })} />
      </Card>
    </div>
  );
}

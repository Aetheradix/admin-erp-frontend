'use client';

import React from 'react';
import { Table, Button, Input, Card } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { PageHeader, AppContainer } from '@/src/components/ui';
import { useProjects } from './hooks/useProjects';
import { getProjectColumns } from './constants';

export default function Projects() {
  const router = useRouter();
  const { projects, totalProjects, loading, search, setSearch } = useProjects();

  const columns = getProjectColumns(router);

  return (
    <AppContainer fluid>
      <PageHeader
        title="Projects"
        subtitle={`${totalProjects} projects across your organization.`}
        breadcrumbs={[{ title: 'Projects' }]}
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            style={{ borderRadius: 10, fontWeight: 600 }}
          >
            New Project
          </Button>
        }
      />

      <Card
        style={{
          borderRadius: 16,
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <Input
            prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />}
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 320, borderRadius: 10 }}
            allowClear
          />
        </div>

        <Table
          dataSource={projects}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={loading}
          onRow={(r) => ({
            onClick: () => router.push(`/projects/${r.id}`),
            style: { cursor: 'pointer' }
          })}
        />
      </Card>
    </AppContainer>
  );
}

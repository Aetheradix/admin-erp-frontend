'use client';

import React from 'react';
import { Table, Button, Input, Card, Space } from 'antd';
import { PlusOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { PageHeader, AppContainer } from '@/src/components/ui';
import { useUsers } from './hooks/useUsers';
import UserModal from './components/UserModal';
import { getUserColumns } from './constants';

export default function Users() {
  const router = useRouter();
  const { users, totalUsers, loading, search, setSearch, addUser } = useUsers();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const columns = getUserColumns(router);

  return (
    <AppContainer fluid>
      <PageHeader
        title="Users"
        subtitle={`${totalUsers} users in your organization.`}
        breadcrumbs={[{ title: 'Users' }]}
        actions={
          <Space>
            <Button icon={<DownloadOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>
              Export
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              style={{ borderRadius: 10, fontWeight: 600 }}
              onClick={() => setIsModalOpen(true)}
            >
              Invite User
            </Button>
          </Space>
        }
      />

      <UserModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={addUser}
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
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 320, borderRadius: 10 }}
            allowClear
          />
        </div>
        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={loading}
          onRow={(r) => ({
            onClick: () => router.push(`/users/${r.id}`),
            style: { cursor: 'pointer' }
          })}
        />
      </Card>
    </AppContainer>
  );
}

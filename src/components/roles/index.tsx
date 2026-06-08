'use client';

import React from 'react';
import { Card, Table, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageHeader, AppContainer } from '@/src/components/ui';
import { useRoles } from './hooks/useRoles';
import { getRoleColumns } from './constants';

export default function Roles() {
  const { roles, loading } = useRoles();

  const columns = getRoleColumns();

  return (
    <AppContainer fluid>
      <PageHeader
        title="Roles & Permissions"
        subtitle="Manage access control for your organization."
        breadcrumbs={[{ title: 'Settings' }, { title: 'Roles & Permissions' }]}
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            style={{ borderRadius: 10, fontWeight: 600 }}
          >
            Create Role
          </Button>
        }
      />
      <Card
        style={{
          borderRadius: 16,
          border: '1px solid var(--border-subtle)'
        }}
      >
        <Table
          dataSource={roles}
          columns={columns}
          rowKey="id"
          pagination={false}
          loading={loading}
        />
      </Card>
    </AppContainer>
  );
}

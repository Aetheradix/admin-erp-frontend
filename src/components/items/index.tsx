'use client';

import React from 'react';
import { Table, Button, Input, Card, Space } from 'antd';
import { PlusOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { PageHeader, AppContainer } from '@/src/components/ui';
import { useItems } from './hooks/useItems';
import ItemModal from './components/ItemModal';
import { getItemColumns } from './constants';

export default function Items() {
  const router = useRouter();
  const { items, totalItems, loading, search, setSearch, addItem } = useItems();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const columns = getItemColumns(router);

  return (
    <AppContainer fluid>
      <PageHeader
        title="Inventory Items"
        subtitle={`${totalItems} items in stock.`}
        breadcrumbs={[{ title: 'Stock', href: '/stock' }, { title: 'Items' }]}
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
              New Item
            </Button>
          </Space>
        }
      />
      <ItemModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={addItem}
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
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 320, borderRadius: 10 }}
            allowClear
          />
        </div>
        <Table
          dataSource={items}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={loading}
          onRow={(r) => ({
            onClick: () => router.push(`/inventory/items/${r.id}`),
            style: { cursor: 'pointer' }
          })}
        />
      </Card>
    </AppContainer>
  );
}

'use client';

import React from 'react';
import { Table, Card, Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { PageHeader, AppContainer } from '@/src/components/ui';
import { useStockMovements } from './hooks/useStockMovements';
import { getStockMovementColumns } from './constants';

export default function StockMovements() {
  const { movements, loading, search, setSearch, setTypeFilter } = useStockMovements();

  const columns = getStockMovementColumns();

  return (
    <AppContainer fluid>
      <PageHeader
        title="Stock Movements"
        subtitle="Track all inventory movements."
        breadcrumbs={[{ title: 'Inventory' }, { title: 'Stock Movements' }]}
      />
      <Card
        style={{
          borderRadius: 16,
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <Input
            prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />}
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 280, borderRadius: 10 }}
            allowClear
          />
          <Select
            placeholder="Type"
            allowClear
            onChange={(v) => setTypeFilter(v || null)}
            style={{ width: 140 }}
            options={[
              { value: 'IN', label: '↓ Stock In' },
              { value: 'OUT', label: '↑ Stock Out' }
            ]}
          />
        </div>
        <Table
          dataSource={movements}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={loading}
        />
      </Card>
    </AppContainer>
  );
}

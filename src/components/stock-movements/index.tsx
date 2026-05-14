'use client';

import React from 'react';
import { Table, Tag, Card, Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import PageHeader from '@/src/components/ui/PageHeader';
import { useStockMovements } from './hooks/useStockMovements';
import { StockMovement } from './types';

export default function StockMovements() {
  const { movements, loading, search, setSearch, setTypeFilter } = useStockMovements();

  const columns = [
    { title: 'Item', dataIndex: 'item', key: 'item', render: (n: string, r: StockMovement) => (
      <div><div style={{ fontWeight: 600 }}>{n}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.sku}</div></div>
    )},
    { title: 'Type', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color={t === 'IN' ? 'green' : 'red'} style={{ borderRadius: 6, border: 'none', fontWeight: 700 }}>{t === 'IN' ? '↓ Stock In' : '↑ Stock Out'}</Tag> },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', render: (q: number, r: StockMovement) => <span style={{ fontWeight: 700, color: r.type === 'IN' ? 'var(--success)' : 'var(--error)' }}>{r.type === 'IN' ? '+' : '-'}{q}</span> },
    { title: 'Date', dataIndex: 'date', key: 'date', render: (d: string) => <span style={{ color: 'var(--muted)', fontSize: 13 }}>{d}</span> },
    { title: 'Reference', dataIndex: 'reference', key: 'reference', render: (r: string) => <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{r}</span> },
    { title: 'Location', dataIndex: 'location', key: 'location' },
    { title: 'By', dataIndex: 'by', key: 'by' },
  ];

  return (
    <div>
      <PageHeader title="Stock Movements" subtitle="Track all inventory movements." breadcrumbs={[{ title: 'Inventory' }, { title: 'Stock Movements' }]} />
      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <Input prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />} placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 280, borderRadius: 10 }} allowClear />
          <Select placeholder="Type" allowClear onChange={(v) => setTypeFilter(v || null)} style={{ width: 140 }} options={[{ value: 'IN', label: '↓ Stock In' }, { value: 'OUT', label: '↑ Stock Out' }]} />
        </div>
        <Table dataSource={movements} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} loading={loading} />
      </Card>
    </div>
  );
}

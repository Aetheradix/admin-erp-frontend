'use client';

import React, { useState } from 'react';
import { Table, Tag, Card, Input, Select, Space } from 'antd';
import { SearchOutlined, SwapOutlined } from '@ant-design/icons';
import PageHeader from '@/src/components/ui/PageHeader';

const movements = [
  { id: '1', item: 'MacBook Pro 16"', sku: 'MBP-16-2026', type: 'IN', quantity: 10, date: '2026-05-10', reference: 'PO-2026-042', by: 'John Doe', location: 'Warehouse A' },
  { id: '2', item: 'MacBook Pro 16"', sku: 'MBP-16-2026', type: 'OUT', quantity: 3, date: '2026-05-08', reference: 'REQ-2026-118', by: 'Sarah Chen', location: 'Office SF' },
  { id: '3', item: 'Dell Monitor 27"', sku: 'DLM-27-4K', type: 'IN', quantity: 20, date: '2026-05-07', reference: 'PO-2026-041', by: 'John Doe', location: 'Warehouse A' },
  { id: '4', item: 'Ergonomic Chair', sku: 'ERG-CH-PRO', type: 'OUT', quantity: 5, date: '2026-05-06', reference: 'REQ-2026-116', by: 'Emily Watson', location: 'Office NY' },
  { id: '5', item: 'Wireless Keyboard', sku: 'WK-LOG-MX', type: 'IN', quantity: 30, date: '2026-05-05', reference: 'PO-2026-040', by: 'John Doe', location: 'Warehouse B' },
  { id: '6', item: 'Standing Desk', sku: 'STD-DSK-EL', type: 'OUT', quantity: 2, date: '2026-05-04', reference: 'REQ-2026-114', by: 'Mike Ross', location: 'Office SF' },
  { id: '7', item: 'Noise-Cancel Headphones', sku: 'NCH-SONY-5', type: 'IN', quantity: 15, date: '2026-05-03', reference: 'PO-2026-039', by: 'John Doe', location: 'Warehouse A' },
  { id: '8', item: 'USB-C Hub', sku: 'USB-HUB-7P', type: 'OUT', quantity: 10, date: '2026-05-01', reference: 'REQ-2026-112', by: 'Tom Baker', location: 'Office SF' },
];

const columns = [
  { title: 'Item', dataIndex: 'item', key: 'item', render: (n: string, r: any) => (
    <div><div style={{ fontWeight: 600 }}>{n}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.sku}</div></div>
  )},
  { title: 'Type', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color={t === 'IN' ? 'green' : 'red'} style={{ borderRadius: 6, border: 'none', fontWeight: 700 }}>{t === 'IN' ? '↓ Stock In' : '↑ Stock Out'}</Tag> },
  { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', render: (q: number, r: any) => <span style={{ fontWeight: 700, color: r.type === 'IN' ? 'var(--success)' : 'var(--error)' }}>{r.type === 'IN' ? '+' : '-'}{q}</span> },
  { title: 'Date', dataIndex: 'date', key: 'date', render: (d: string) => <span style={{ color: 'var(--muted)', fontSize: 13 }}>{d}</span> },
  { title: 'Reference', dataIndex: 'reference', key: 'reference', render: (r: string) => <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{r}</span> },
  { title: 'Location', dataIndex: 'location', key: 'location' },
  { title: 'By', dataIndex: 'by', key: 'by' },
];

export default function StockMovementsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const filtered = movements.filter((m) => {
    const matchSearch = m.item.toLowerCase().includes(search.toLowerCase()) || m.reference.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || m.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div>
      <PageHeader title="Stock Movements" subtitle="Track all inventory movements." breadcrumbs={[{ title: 'Inventory' }, { title: 'Stock Movements' }]} />
      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <Input prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />} placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 280, borderRadius: 10 }} allowClear />
          <Select placeholder="Type" allowClear onChange={(v) => setTypeFilter(v || null)} style={{ width: 140 }} options={[{ value: 'IN', label: '↓ Stock In' }, { value: 'OUT', label: '↑ Stock Out' }]} />
        </div>
        <Table dataSource={filtered} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
}

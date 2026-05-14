'use client';

import React, { useState } from 'react';
import { Table, Button, Input, Tag, Card, Space } from 'antd';
import { PlusOutlined, SearchOutlined, ShoppingOutlined, DownloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageHeader from '@/src/components/ui/PageHeader';
import StatusBadge from '@/src/components/ui/StatusBadge';

const items = [
  { id: 'ITM-001', name: 'MacBook Pro 16"', category: 'Electronics', sku: 'MBP-16-2026', quantity: 24, price: '$2,499', status: 'active' as const },
  { id: 'ITM-002', name: 'Dell Monitor 27"', category: 'Electronics', sku: 'DLM-27-4K', quantity: 45, price: '$449', status: 'active' as const },
  { id: 'ITM-003', name: 'Ergonomic Chair', category: 'Furniture', sku: 'ERG-CH-PRO', quantity: 8, price: '$599', status: 'active' as const },
  { id: 'ITM-004', name: 'Standing Desk', category: 'Furniture', sku: 'STD-DSK-EL', quantity: 3, price: '$749', status: 'inactive' as const },
  { id: 'ITM-005', name: 'Wireless Keyboard', category: 'Peripherals', sku: 'WK-LOG-MX', quantity: 67, price: '$99', status: 'active' as const },
  { id: 'ITM-006', name: 'USB-C Hub', category: 'Peripherals', sku: 'USB-HUB-7P', quantity: 0, price: '$79', status: 'inactive' as const },
  { id: 'ITM-007', name: 'Noise-Cancel Headphones', category: 'Audio', sku: 'NCH-SONY-5', quantity: 15, price: '$349', status: 'active' as const },
];

const catColors: Record<string, string> = { Electronics: 'blue', Furniture: 'green', Peripherals: 'purple', Audio: 'cyan' };

export default function InventoryItemsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { title: 'Item', dataIndex: 'name', key: 'name', render: (n: string, r: any) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(2,132,199,0.08)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingOutlined /></div>
        <div><div style={{ fontWeight: 600 }}>{n}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.sku}</div></div>
      </div>
    )},
    { title: 'Category', dataIndex: 'category', key: 'category', render: (c: string) => <Tag color={catColors[c]} style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>{c}</Tag> },
    { title: 'Qty', dataIndex: 'quantity', key: 'quantity', render: (q: number) => <span style={{ fontWeight: 700, color: q === 0 ? 'var(--error)' : q < 10 ? 'var(--warning)' : 'inherit' }}>{q}</span> },
    { title: 'Price', dataIndex: 'price', key: 'price', render: (p: string) => <span style={{ fontWeight: 600 }}>{p}</span> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: any) => <StatusBadge status={s} /> },
    { title: '', key: 'action', render: (_: any, r: any) => <Button type="link" onClick={() => router.push(`/inventory/items/${r.id}`)} style={{ fontWeight: 600 }}>View →</Button> },
  ];

  return (
    <div>
      <PageHeader title="Item Catalog" subtitle={`${items.length} items in inventory.`} breadcrumbs={[{ title: 'Inventory' }, { title: 'Items' }]}
        actions={<Space><Button icon={<DownloadOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Export</Button><Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: 10, fontWeight: 600 }}>Add Item</Button></Space>}
      />
      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <div style={{ marginBottom: 20 }}><Input prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />} placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320, borderRadius: 10 }} allowClear /></div>
        <Table dataSource={filtered} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} onRow={(r) => ({ onClick: () => router.push(`/inventory/items/${r.id}`), style: { cursor: 'pointer' } })} />
      </Card>
    </div>
  );
}

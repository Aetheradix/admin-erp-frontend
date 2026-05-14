'use client';

import React from 'react';
import { Table, Button, Input, Tag, Card, Space } from 'antd';
import { PlusOutlined, SearchOutlined, ShoppingOutlined, DownloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageHeader from '@/src/components/ui/PageHeader';
import StatusBadge from '@/src/components/ui/StatusBadge';
import { useItems } from './hooks/useItems';
import { catColors } from './mockData';
import { InventoryItem } from './types';

export default function Items() {
  const router = useRouter();
  const { items, totalItems, loading, search, setSearch } = useItems();

  const columns = [
    { title: 'Item', dataIndex: 'name', key: 'name', render: (n: string, r: InventoryItem) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(2,132,199,0.08)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingOutlined /></div>
        <div><div style={{ fontWeight: 600 }}>{n}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.sku}</div></div>
      </div>
    )},
    { title: 'Category', dataIndex: 'category', key: 'category', render: (c: string) => <Tag color={catColors[c]} style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>{c}</Tag> },
    { title: 'Qty', dataIndex: 'quantity', key: 'quantity', render: (q: number) => <span style={{ fontWeight: 700, color: q === 0 ? 'var(--error)' : q < 10 ? 'var(--warning)' : 'inherit' }}>{q}</span> },
    { title: 'Price', dataIndex: 'price', key: 'price', render: (p: string) => <span style={{ fontWeight: 600 }}>{p}</span> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: any) => <StatusBadge status={s} /> },
    { title: '', key: 'action', render: (_: any, r: InventoryItem) => <Button type="link" onClick={(e) => { e.stopPropagation(); router.push(`/inventory/items/${r.id}`); }} style={{ fontWeight: 600 }}>View →</Button> },
  ];

  return (
    <div>
      <PageHeader title="Item Catalog" subtitle={`${totalItems} items in inventory.`} breadcrumbs={[{ title: 'Inventory' }, { title: 'Items' }]}
        actions={<Space><Button icon={<DownloadOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Export</Button><Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: 10, fontWeight: 600 }}>Add Item</Button></Space>}
      />
      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <div style={{ marginBottom: 20 }}><Input prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />} placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320, borderRadius: 10 }} allowClear /></div>
        <Table dataSource={items} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} loading={loading} onRow={(r) => ({ onClick: () => router.push(`/inventory/items/${r.id}`), style: { cursor: 'pointer' } })} />
      </Card>
    </div>
  );
}

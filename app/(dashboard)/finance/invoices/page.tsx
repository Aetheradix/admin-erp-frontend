'use client';

import React, { useState } from 'react';
import { Table, Button, Input, Tag, Card, Space } from 'antd';
import { PlusOutlined, SearchOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageHeader from '@/src/components/ui/PageHeader';
import StatusBadge from '@/src/components/ui/StatusBadge';

const invoices = [
  { id: 'INV-001', client: 'Acme Corp', amount: '$12,500', date: '2026-05-12', dueDate: '2026-06-12', status: 'paid' as const },
  { id: 'INV-002', client: 'TechStart Inc', amount: '$8,200', date: '2026-05-10', dueDate: '2026-06-10', status: 'paid' as const },
  { id: 'INV-003', client: 'Global Solutions', amount: '$15,750', date: '2026-05-07', dueDate: '2026-06-07', status: 'pending' as const },
  { id: 'INV-004', client: 'Design Studio', amount: '$3,400', date: '2026-05-01', dueDate: '2026-05-31', status: 'overdue' as const },
  { id: 'INV-005', client: 'Cloud Nine', amount: '$22,000', date: '2026-04-25', dueDate: '2026-05-25', status: 'paid' as const },
  { id: 'INV-006', client: 'StartUp Labs', amount: '$6,800', date: '2026-04-20', dueDate: '2026-05-20', status: 'unpaid' as const },
  { id: 'INV-007', client: 'Enterprise Co', amount: '$45,000', date: '2026-04-15', dueDate: '2026-05-15', status: 'draft' as const },
];

export default function InvoicesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const filtered = invoices.filter((i) => i.id.toLowerCase().includes(search.toLowerCase()) || i.client.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { title: 'Invoice', dataIndex: 'id', key: 'id', render: (id: string) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileTextOutlined /></div>
        <span style={{ fontWeight: 600 }}>{id}</span>
      </div>
    )},
    { title: 'Client', dataIndex: 'client', key: 'client' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (a: string) => <span style={{ fontWeight: 700 }}>{a}</span> },
    { title: 'Date', dataIndex: 'date', key: 'date', render: (d: string) => <span style={{ color: 'var(--muted)', fontSize: 13 }}>{d}</span> },
    { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate', render: (d: string) => <span style={{ color: 'var(--muted)', fontSize: 13 }}>{d}</span> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: any) => <StatusBadge status={s} /> },
    { title: '', key: 'action', render: (_: any, r: any) => <Button type="link" onClick={() => router.push(`/finance/invoices/${r.id}`)} style={{ fontWeight: 600 }}>View →</Button> },
  ];

  return (
    <div>
      <PageHeader title="Invoices" subtitle={`${invoices.length} invoices total.`} breadcrumbs={[{ title: 'Finance', href: '/finance' }, { title: 'Invoices' }]}
        actions={<Space><Button icon={<DownloadOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Export</Button><Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: 10, fontWeight: 600 }}>New Invoice</Button></Space>}
      />
      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <div style={{ marginBottom: 20 }}>
          <Input prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />} placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320, borderRadius: 10 }} allowClear />
        </div>
        <Table dataSource={filtered} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} onRow={(r) => ({ onClick: () => router.push(`/finance/invoices/${r.id}`), style: { cursor: 'pointer' } })} />
      </Card>
    </div>
  );
}

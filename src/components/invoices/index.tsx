'use client';

import React from 'react';
import { Table, Button, Input, Card, Space } from 'antd';
import { PlusOutlined, SearchOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageHeader from '@/src/components/ui/PageHeader';
import StatusBadge from '@/src/components/ui/StatusBadge';
import { useInvoices } from './hooks/useInvoices';
import { Invoice } from './types';

export default function Invoices() {
  const router = useRouter();
  const { invoices, totalInvoices, loading, search, setSearch } = useInvoices();

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
    { title: '', key: 'action', render: (_: any, r: Invoice) => <Button type="link" onClick={(e) => { e.stopPropagation(); router.push(`/finance/invoices/${r.id}`); }} style={{ fontWeight: 600 }}>View →</Button> },
  ];

  return (
    <div>
      <PageHeader title="Invoices" subtitle={`${totalInvoices} invoices total.`} breadcrumbs={[{ title: 'Finance', href: '/finance' }, { title: 'Invoices' }]}
        actions={<Space><Button icon={<DownloadOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Export</Button><Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: 10, fontWeight: 600 }}>New Invoice</Button></Space>}
      />
      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <div style={{ marginBottom: 20 }}>
          <Input prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />} placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320, borderRadius: 10 }} allowClear />
        </div>
        <Table dataSource={invoices} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} loading={loading} onRow={(r) => ({ onClick: () => router.push(`/finance/invoices/${r.id}`), style: { cursor: 'pointer' } })} />
      </Card>
    </div>
  );
}

'use client';

import React from 'react';
import { Table, Button, Input, Tag, Card, Space } from 'antd';
import { PlusOutlined, SearchOutlined, DownloadOutlined, WalletOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageHeader from '@/src/components/ui/PageHeader';
import StatusBadge from '@/src/components/ui/StatusBadge';
import { useExpenses } from './hooks/useExpenses';
import { categoryColors } from './mockData';
import { Expense } from './types';
import ExpenseModal from './components/ExpenseModal';

export default function Expenses() {
  const router = useRouter();
  const { expenses, totalExpenses, loading, search, setSearch, addExpense } = useExpenses();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const columns = [
    {
      title: 'Expense', dataIndex: 'description', key: 'description', render: (d: string, r: Expense) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(225,29,72,0.08)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><WalletOutlined /></div>
          <div><div style={{ fontWeight: 600 }}>{d}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.id}</div></div>
        </div>
      )
    },
    { title: 'Category', dataIndex: 'category', key: 'category', render: (c: string) => <Tag color={categoryColors[c]} style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>{c}</Tag> },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (a: string) => <span style={{ fontWeight: 700 }}>{a}</span> },
    { title: 'Date', dataIndex: 'date', key: 'date', render: (d: string) => <span style={{ color: 'var(--muted)', fontSize: 13 }}>{d}</span> },
    { title: 'Submitted By', dataIndex: 'submittedBy', key: 'submittedBy' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: any) => <StatusBadge status={s} /> },
    { title: '', key: 'action', render: (_: any, r: Expense) => <Button type="link" onClick={(e) => { e.stopPropagation(); router.push(`/finance/expenses/${r.id}`); }} style={{ fontWeight: 600 }}>View →</Button> },
  ];

  return (
    <div>
      <PageHeader title="Expenses" subtitle={`${totalExpenses} expense reports.`} breadcrumbs={[{ title: 'Finance', href: '/finance' }, { title: 'Expenses' }]}
        actions={<Space><Button icon={<DownloadOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Export</Button><Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: 10, fontWeight: 600 }} onClick={() => setIsModalOpen(true)}>New Expense</Button></Space>}
      />

      <ExpenseModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={addExpense}
      />
      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <div style={{ marginBottom: 20 }}><Input prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />} placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320, borderRadius: 10 }} allowClear /></div>
        <Table dataSource={expenses} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} loading={loading} onRow={(r) => ({ onClick: () => router.push(`/finance/expenses/${r.id}`), style: { cursor: 'pointer' } })} />
      </Card>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Table, Button, Input, Tag, Card, Space } from 'antd';
import { PlusOutlined, SearchOutlined, DownloadOutlined, WalletOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageHeader from '@/src/components/ui/PageHeader';
import StatusBadge from '@/src/components/ui/StatusBadge';

const expenses = [
  { id: 'EXP-001', description: 'Cloud Services (AWS)', category: 'Infrastructure', amount: '$2,100', date: '2026-05-09', submittedBy: 'Tom Baker', status: 'approved' as const },
  { id: 'EXP-002', description: 'Office Supplies', category: 'Office', amount: '$340', date: '2026-05-11', submittedBy: 'Emily Watson', status: 'approved' as const },
  { id: 'EXP-003', description: 'Team Dinner', category: 'Entertainment', amount: '$680', date: '2026-05-08', submittedBy: 'John Doe', status: 'pending' as const },
  { id: 'EXP-004', description: 'Software Licenses', category: 'Software', amount: '$4,500', date: '2026-05-06', submittedBy: 'Sarah Chen', status: 'approved' as const },
  { id: 'EXP-005', description: 'Business Travel - NYC', category: 'Travel', amount: '$1,850', date: '2026-05-04', submittedBy: 'Alex Rivera', status: 'rejected' as const },
  { id: 'EXP-006', description: 'Marketing Ads (Google)', category: 'Marketing', amount: '$3,200', date: '2026-05-02', submittedBy: 'Emily Watson', status: 'approved' as const },
];

const categoryColors: Record<string, string> = { Infrastructure: 'blue', Office: 'default', Entertainment: 'purple', Software: 'cyan', Travel: 'gold', Marketing: 'volcano' };

export default function ExpensesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const filtered = expenses.filter((e) => e.description.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { title: 'Expense', dataIndex: 'description', key: 'description', render: (d: string, r: any) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(225,29,72,0.08)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><WalletOutlined /></div>
        <div><div style={{ fontWeight: 600 }}>{d}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.id}</div></div>
      </div>
    )},
    { title: 'Category', dataIndex: 'category', key: 'category', render: (c: string) => <Tag color={categoryColors[c]} style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>{c}</Tag> },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (a: string) => <span style={{ fontWeight: 700 }}>{a}</span> },
    { title: 'Date', dataIndex: 'date', key: 'date', render: (d: string) => <span style={{ color: 'var(--muted)', fontSize: 13 }}>{d}</span> },
    { title: 'Submitted By', dataIndex: 'submittedBy', key: 'submittedBy' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: any) => <StatusBadge status={s} /> },
    { title: '', key: 'action', render: (_: any, r: any) => <Button type="link" onClick={() => router.push(`/finance/expenses/${r.id}`)} style={{ fontWeight: 600 }}>View →</Button> },
  ];

  return (
    <div>
      <PageHeader title="Expenses" subtitle={`${expenses.length} expense reports.`} breadcrumbs={[{ title: 'Finance', href: '/finance' }, { title: 'Expenses' }]}
        actions={<Space><Button icon={<DownloadOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Export</Button><Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: 10, fontWeight: 600 }}>New Expense</Button></Space>}
      />
      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <div style={{ marginBottom: 20 }}><Input prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />} placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320, borderRadius: 10 }} allowClear /></div>
        <Table dataSource={filtered} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} onRow={(r) => ({ onClick: () => router.push(`/finance/expenses/${r.id}`), style: { cursor: 'pointer' } })} />
      </Card>
    </div>
  );
}

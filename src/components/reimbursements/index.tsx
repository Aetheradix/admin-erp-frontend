'use client';

import React from 'react';
import { Table, Button, Input, Tag, Card, Space } from 'antd';
import { PlusOutlined, SearchOutlined, DownloadOutlined, SafetyOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageHeader from '@/src/components/ui/PageHeader';
import StatusBadge from '@/src/components/ui/StatusBadge';
import { useReimbursements } from './hooks/useReimbursements';
import { categoryColors } from './mockData';
import { Reimbursement } from './types';
import ReimbursementModal from './components/ReimbursementModal';

export default function Reimbursements() {
    const router = useRouter();
    const { reimbursements, totalReimbursements, loading, search, setSearch, addReimbursement } = useReimbursements();
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const columns = [
        {
            title: 'Reimbursement',
            dataIndex: 'description',
            key: 'description',
            render: (d: string, r: Reimbursement) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16, 185, 129, 0.08)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SafetyOutlined />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600 }}>{d}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.id}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (c: string) => (
                <Tag color={categoryColors[c] || 'default'} style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>
                    {c}
                </Tag>
            ),
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (a: string) => <span style={{ fontWeight: 700 }}>{a}</span>,
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (d: string) => <span style={{ color: 'var(--muted)', fontSize: 13 }}>{d}</span>,
        },
        { title: 'Submitted By', dataIndex: 'submittedBy', key: 'submittedBy' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (s: any) => <StatusBadge status={s} />,
        },
        {
            title: '',
            key: 'action',
            render: (_: any, r: Reimbursement) => (
                <Button
                    type="link"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/finance/reimbursements/${r.id}`);
                    }}
                    style={{ fontWeight: 600 }}
                >
                    View →
                </Button>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Reimbursements"
                subtitle={`${totalReimbursements} reimbursement requests.`}
                breadcrumbs={[{ title: 'Finance', href: '/finance' }, { title: 'Reimbursements' }]}
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
                            New Request
                        </Button>
                    </Space>
                }
            />

            <ReimbursementModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSubmit={addReimbursement}
            />
            <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
                <div style={{ marginBottom: 20 }}>
                    <Input
                        prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />}
                        placeholder="Search reimbursements..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ maxWidth: 320, borderRadius: 10 }}
                        allowClear
                    />
                </div>
                <Table
                    dataSource={reimbursements}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                    onRow={(r) => ({
                        onClick: () => router.push(`/finance/reimbursements/${r.id}`),
                        style: { cursor: 'pointer' },
                    })}
                />
            </Card>
        </div>
    );
}

import React from 'react';
import { Tag, Button } from 'antd';
import { SafetyOutlined } from '@ant-design/icons';
import StatusBadge from '@/src/components/ui/StatusBadge';
import { categoryColors } from '../mockData';
import { Reimbursement } from '../types';

export const getReimbursementColumns = (router: { push: (url: string) => void }) => [
    {
        title: 'Reimbursement',
        dataIndex: 'description',
        key: 'description',
        render: (d: string, r: Reimbursement) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(16, 185, 129, 0.08)',
                    color: 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
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
        render: (c: keyof typeof categoryColors) => (
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
        render: (s: Reimbursement['status']) => <StatusBadge status={s} />,
    },
    {
        title: '',
        key: 'action',
        render: (_: unknown, r: Reimbursement) => (
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

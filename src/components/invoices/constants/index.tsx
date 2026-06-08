import React from 'react';
import { Button } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import StatusBadge from '@/src/components/ui/StatusBadge';
import { Invoice } from '../types';

export const getInvoiceColumns = (router: { push: (url: string) => void }) => [
    {
        title: 'Invoice',
        dataIndex: 'id',
        key: 'id',
        render: (id: string) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--primary-soft)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <FileTextOutlined />
                </div>
                <span style={{ fontWeight: 600 }}>{id}</span>
            </div>
        )
    },
    { title: 'Client', dataIndex: 'client', key: 'client' },
    {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
        render: (a: string) => <span style={{ fontWeight: 700 }}>{a}</span>
    },
    {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        render: (d: string) => <span style={{ color: 'var(--muted)', fontSize: 13 }}>{d}</span>
    },
    {
        title: 'Due Date',
        dataIndex: 'dueDate',
        key: 'dueDate',
        render: (d: string) => <span style={{ color: 'var(--muted)', fontSize: 13 }}>{d}</span>
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (s: Invoice['status']) => <StatusBadge status={s} />
    },
    {
        title: '',
        key: 'action',
        render: (_: unknown, r: Invoice) => (
            <Button
                type="link"
                onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/finance/invoices/${r.id}`);
                }}
                style={{ fontWeight: 600 }}
            >
                View →
            </Button>
        )
    },
];

import React from 'react';
import { Tag } from 'antd';
import { StockMovement } from '../types';

export const getStockMovementColumns = () => [
    {
        title: 'Item',
        dataIndex: 'item',
        key: 'item',
        render: (n: string, r: StockMovement) => (
            <div>
                <div style={{ fontWeight: 600 }}>{n}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.sku}</div>
            </div>
        )
    },
    {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: (t: string) => (
            <Tag
                color={t === 'IN' ? 'green' : 'red'}
                style={{ borderRadius: 6, border: 'none', fontWeight: 700 }}
            >
                {t === 'IN' ? '↓ Stock In' : '↑ Stock Out'}
            </Tag>
        )
    },
    {
        title: 'Quantity',
        dataIndex: 'quantity',
        key: 'quantity',
        render: (q: number, r: StockMovement) => (
            <span style={{
                fontWeight: 700,
                color: r.type === 'IN' ? 'var(--success)' : 'var(--error)'
            }}>
                {r.type === 'IN' ? '+' : '-'}{q}
            </span>
        )
    },
    {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        render: (d: string) => <span style={{ color: 'var(--muted)', fontSize: 13 }}>{d}</span>
    },
    {
        title: 'Reference',
        dataIndex: 'reference',
        key: 'reference',
        render: (r: string) => <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{r}</span>
    },
    { title: 'Location', dataIndex: 'location', key: 'location' },
    { title: 'By', dataIndex: 'by', key: 'by' },
];

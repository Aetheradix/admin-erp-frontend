import React from 'react';
import { Tag, Button } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import StatusBadge from '@/src/components/ui/StatusBadge';
import { catColors } from '../mockData';
import { InventoryItem } from '../types';

export const getItemColumns = (router: any) => [
    {
        title: 'Item',
        dataIndex: 'name',
        key: 'name',
        render: (n: string, r: InventoryItem) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(2,132,199,0.08)',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <ShoppingOutlined />
                </div>
                <div>
                    <div style={{ fontWeight: 600 }}>{n}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.sku}</div>
                </div>
            </div>
        )
    },
    {
        title: 'Category',
        dataIndex: 'category',
        key: 'category',
        render: (c: string) => (
            <Tag color={catColors[c]} style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>
                {c}
            </Tag>
        )
    },
    {
        title: 'Qty',
        dataIndex: 'quantity',
        key: 'quantity',
        render: (q: number) => (
            <span style={{
                fontWeight: 700,
                color: q === 0 ? 'var(--error)' : q < 10 ? 'var(--warning)' : 'inherit'
            }}>
                {q}
            </span>
        )
    },
    {
        title: 'Price',
        dataIndex: 'price',
        key: 'price',
        render: (p: string) => <span style={{ fontWeight: 600 }}>{p}</span>
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (s: any) => <StatusBadge status={s} />
    },
    {
        title: '',
        key: 'action',
        render: (_: any, r: InventoryItem) => (
            <Button
                type="link"
                onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/inventory/items/${r.id}`);
                }}
                style={{ fontWeight: 600 }}
            >
                View →
            </Button>
        )
    },
];

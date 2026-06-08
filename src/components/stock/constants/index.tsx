import React from 'react';
import { Tag, Typography, Progress } from 'antd';
import { levelConfig } from '../mockData';
import { StockItem } from '../types';

const { Text } = Typography;

export const getStockColumns = () => [
    {
        title: 'Item',
        dataIndex: 'name',
        key: 'name',
        render: (n: string, r: StockItem) => (
            <div>
                <div style={{ fontWeight: 600 }}>{n}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.sku}</div>
            </div>
        )
    },
    {
        title: 'Category',
        dataIndex: 'category',
        key: 'category',
        render: (c: string) => <Tag style={{ borderRadius: 6, border: 'none' }}>{c}</Tag>
    },
    {
        title: 'In Stock',
        dataIndex: 'inStock',
        key: 'inStock',
        render: (q: number, r: StockItem) => (
            <span style={{ fontWeight: 700, color: levelConfig[r.level].color }}>
                {q}
            </span>
        )
    },
    {
        title: 'Min / Max',
        key: 'range',
        render: (_: any, r: StockItem) => (
            <Text style={{ color: 'var(--muted)', fontSize: 13 }}>
                {r.minStock} / {r.maxStock}
            </Text>
        )
    },
    {
        title: 'Stock Level',
        key: 'level',
        render: (_: any, r: StockItem) => {
            const pct = Math.round((r.inStock / r.maxStock) * 100);
            return <Progress percent={pct} size="small" strokeColor={levelConfig[r.level].color} style={{ maxWidth: 120 }} />;
        }
    },
    {
        title: 'Status',
        dataIndex: 'level',
        key: 'status',
        render: (l: string) => (
            <Tag color={levelConfig[l].tagColor} style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>
                {levelConfig[l].tag}
            </Tag>
        )
    },
];

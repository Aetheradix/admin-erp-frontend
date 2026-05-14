'use client';

import React from 'react';
import { Card, Table, Row, Col, Tag, Typography, Progress } from 'antd';
import { WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import PageHeader from '@/src/components/ui/PageHeader';
import StatCard from '@/src/components/ui/StatCard';
import { useStock } from './hooks/useStock';
import { levelConfig } from './mockData';
import { StockItem } from './types';

const { Text } = Typography;

export default function Stock() {
  const { stock, stats, loading } = useStock();

  const columns = [
    { title: 'Item', dataIndex: 'name', key: 'name', render: (n: string, r: StockItem) => (
      <div><div style={{ fontWeight: 600 }}>{n}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.sku}</div></div>
    )},
    { title: 'Category', dataIndex: 'category', key: 'category', render: (c: string) => <Tag style={{ borderRadius: 6, border: 'none' }}>{c}</Tag> },
    { title: 'In Stock', dataIndex: 'inStock', key: 'inStock', render: (q: number, r: StockItem) => <span style={{ fontWeight: 700, color: levelConfig[r.level].color }}>{q}</span> },
    { title: 'Min / Max', key: 'range', render: (_: any, r: StockItem) => <Text style={{ color: 'var(--muted)', fontSize: 13 }}>{r.minStock} / {r.maxStock}</Text> },
    { title: 'Stock Level', key: 'level', render: (_: any, r: StockItem) => {
      const pct = Math.round((r.inStock / r.maxStock) * 100);
      return <Progress percent={pct} size="small" strokeColor={levelConfig[r.level].color} style={{ maxWidth: 120 }} />;
    }},
    { title: 'Status', dataIndex: 'level', key: 'status', render: (l: string) => <Tag color={levelConfig[l].tagColor} style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>{levelConfig[l].tag}</Tag> },
  ];

  return (
    <div>
      <PageHeader title="Stock Levels" subtitle="Monitor inventory levels across all items." breadcrumbs={[{ title: 'Inventory' }, { title: 'Stock Levels' }]} />
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}><StatCard title="In Stock" value={stats.good} icon={<CheckCircleOutlined />} color="#059669" bgColor="rgba(5,150,105,0.08)" accentColor="#059669" /></Col>
        <Col xs={24} sm={8}><StatCard title="Low Stock" value={stats.low} icon={<WarningOutlined />} color="#d97706" bgColor="rgba(217,119,6,0.08)" accentColor="#d97706" /></Col>
        <Col xs={24} sm={8}><StatCard title="Critical / Out" value={stats.critical} icon={<WarningOutlined />} color="#e11d48" bgColor="rgba(225,29,72,0.08)" accentColor="#e11d48" /></Col>
      </Row>
      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <Table dataSource={stock} columns={columns} rowKey="id" pagination={false} loading={loading} />
      </Card>
    </div>
  );
}

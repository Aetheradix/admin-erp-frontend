'use client';

import React from 'react';
import { Card, Table, Row, Col, Tag, Typography, Progress } from 'antd';
import { ShoppingOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import PageHeader from '@/src/components/ui/PageHeader';
import StatCard from '@/src/components/ui/StatCard';

const { Text } = Typography;

const stockData = [
  { id: '1', name: 'MacBook Pro 16"', sku: 'MBP-16-2026', category: 'Electronics', inStock: 24, minStock: 5, maxStock: 50, level: 'good' },
  { id: '2', name: 'Dell Monitor 27"', sku: 'DLM-27-4K', category: 'Electronics', inStock: 45, minStock: 10, maxStock: 60, level: 'good' },
  { id: '3', name: 'Ergonomic Chair', sku: 'ERG-CH-PRO', category: 'Furniture', inStock: 8, minStock: 10, maxStock: 30, level: 'low' },
  { id: '4', name: 'Standing Desk', sku: 'STD-DSK-EL', category: 'Furniture', inStock: 3, minStock: 5, maxStock: 20, level: 'critical' },
  { id: '5', name: 'Wireless Keyboard', sku: 'WK-LOG-MX', category: 'Peripherals', inStock: 67, minStock: 15, maxStock: 80, level: 'good' },
  { id: '6', name: 'USB-C Hub', sku: 'USB-HUB-7P', category: 'Peripherals', inStock: 0, minStock: 10, maxStock: 40, level: 'out' },
  { id: '7', name: 'Noise-Cancel Headphones', sku: 'NCH-SONY-5', category: 'Audio', inStock: 15, minStock: 5, maxStock: 25, level: 'good' },
];

const levelConfig: Record<string, { color: string; tag: string; tagColor: string }> = {
  good: { color: '#059669', tag: 'In Stock', tagColor: 'green' },
  low: { color: '#d97706', tag: 'Low Stock', tagColor: 'gold' },
  critical: { color: '#e11d48', tag: 'Critical', tagColor: 'red' },
  out: { color: '#6b635e', tag: 'Out of Stock', tagColor: 'default' },
};

const columns = [
  { title: 'Item', dataIndex: 'name', key: 'name', render: (n: string, r: any) => (
    <div><div style={{ fontWeight: 600 }}>{n}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.sku}</div></div>
  )},
  { title: 'Category', dataIndex: 'category', key: 'category', render: (c: string) => <Tag style={{ borderRadius: 6, border: 'none' }}>{c}</Tag> },
  { title: 'In Stock', dataIndex: 'inStock', key: 'inStock', render: (q: number, r: any) => <span style={{ fontWeight: 700, color: levelConfig[r.level].color }}>{q}</span> },
  { title: 'Min / Max', key: 'range', render: (_: any, r: any) => <Text style={{ color: 'var(--muted)', fontSize: 13 }}>{r.minStock} / {r.maxStock}</Text> },
  { title: 'Stock Level', key: 'level', render: (_: any, r: any) => {
    const pct = Math.round((r.inStock / r.maxStock) * 100);
    return <Progress percent={pct} size="small" strokeColor={levelConfig[r.level].color} style={{ maxWidth: 120 }} />;
  }},
  { title: 'Status', dataIndex: 'level', key: 'status', render: (l: string) => <Tag color={levelConfig[l].tagColor} style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>{levelConfig[l].tag}</Tag> },
];

export default function StockLevelsPage() {
  const good = stockData.filter(s => s.level === 'good').length;
  const low = stockData.filter(s => s.level === 'low').length;
  const critical = stockData.filter(s => s.level === 'critical' || s.level === 'out').length;

  return (
    <div>
      <PageHeader title="Stock Levels" subtitle="Monitor inventory levels across all items." breadcrumbs={[{ title: 'Inventory' }, { title: 'Stock Levels' }]} />
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}><StatCard title="In Stock" value={good} icon={<CheckCircleOutlined />} color="#059669" bgColor="rgba(5,150,105,0.08)" accentColor="#059669" /></Col>
        <Col xs={24} sm={8}><StatCard title="Low Stock" value={low} icon={<WarningOutlined />} color="#d97706" bgColor="rgba(217,119,6,0.08)" accentColor="#d97706" /></Col>
        <Col xs={24} sm={8}><StatCard title="Critical / Out" value={critical} icon={<WarningOutlined />} color="#e11d48" bgColor="rgba(225,29,72,0.08)" accentColor="#e11d48" /></Col>
      </Row>
      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <Table dataSource={stockData} columns={columns} rowKey="id" pagination={false} />
      </Card>
    </div>
  );
}

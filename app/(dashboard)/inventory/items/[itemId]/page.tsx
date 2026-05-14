'use client';

import PageHeader from '@/src/components/ui/PageHeader';
import StatCard from '@/src/components/ui/StatCard';
import StatusBadge from '@/src/components/ui/StatusBadge';
import { EditOutlined, HistoryOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Button, Card, Col, Descriptions, Row, Table, Tag, Typography } from 'antd';

const { Text } = Typography;

const item = { id: 'ITM-001', name: 'MacBook Pro 16"', category: 'Electronics', sku: 'MBP-16-2026', quantity: 24, price: '$2,499', status: 'active' as const, description: 'Apple MacBook Pro 16-inch with M4 Pro chip, 36GB RAM, 512GB SSD.', supplier: 'Apple Inc.', minStock: 5, location: 'Warehouse A - Shelf 3' };

const movements = [
  { id: '1', type: 'IN', quantity: 10, date: '2026-05-10', reference: 'PO-2026-042', by: 'John Doe' },
  { id: '2', type: 'OUT', quantity: 3, date: '2026-05-08', reference: 'REQ-2026-118', by: 'Sarah Chen' },
  { id: '3', type: 'OUT', quantity: 1, date: '2026-05-05', reference: 'REQ-2026-115', by: 'Marcus Johnson' },
  { id: '4', type: 'IN', quantity: 20, date: '2026-04-25', reference: 'PO-2026-038', by: 'John Doe' },
];

const movementColumns = [
  { title: 'Type', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color={t === 'IN' ? 'green' : 'red'} style={{ borderRadius: 6, border: 'none', fontWeight: 700 }}>{t === 'IN' ? '↓ Stock In' : '↑ Stock Out'}</Tag> },
  { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', render: (q: number, r: any) => <span style={{ fontWeight: 700, color: r.type === 'IN' ? 'var(--success)' : 'var(--error)' }}>{r.type === 'IN' ? '+' : '-'}{q}</span> },
  { title: 'Date', dataIndex: 'date', key: 'date' },
  { title: 'Reference', dataIndex: 'reference', key: 'reference', render: (r: string) => <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{r}</span> },
  { title: 'By', dataIndex: 'by', key: 'by' },
];

export default function ItemDetailPage() {
  return (
    <div>
      <PageHeader title={item.name} subtitle={`SKU: ${item.sku}`} breadcrumbs={[{ title: 'Inventory' }, { title: 'Items', href: '/inventory/items' }, { title: item.name }]}
        actions={<Button icon={<EditOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Edit Item</Button>}
      />
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}><StatCard title="In Stock" value={item.quantity} icon={<ShoppingOutlined />} color="#059669" bgColor="rgba(5,150,105,0.08)" accentColor="#059669" /></Col>
        <Col xs={24} sm={8}><StatCard title="Unit Price" value={item.price} icon={<ShoppingOutlined />} color="var(--primary)" bgColor="var(--primary-soft)" accentColor="var(--primary)" /></Col>
        <Col xs={24} sm={8}><StatCard title="Min. Stock Level" value={item.minStock} icon={<ShoppingOutlined />} color="#d97706" bgColor="rgba(217,119,6,0.08)" accentColor="#d97706" /></Col>
      </Row>
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={10}>
          <Card title="Item Details" style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
            <Descriptions column={1} labelStyle={{ fontWeight: 600, color: 'var(--muted)', fontSize: 13 }}>
              <Descriptions.Item label="Name">{item.name}</Descriptions.Item>
              <Descriptions.Item label="SKU">{item.sku}</Descriptions.Item>
              <Descriptions.Item label="Category"><Tag color="blue" style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>{item.category}</Tag></Descriptions.Item>
              <Descriptions.Item label="Status"><StatusBadge status={item.status} /></Descriptions.Item>
              <Descriptions.Item label="Supplier">{item.supplier}</Descriptions.Item>
              <Descriptions.Item label="Location">{item.location}</Descriptions.Item>
              <Descriptions.Item label="Description">{item.description}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title={<><HistoryOutlined style={{ marginRight: 8 }} />Stock Movement History</>} style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
            <Table dataSource={movements} columns={movementColumns} rowKey="id" pagination={false} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

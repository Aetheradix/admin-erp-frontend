'use client';

import React from 'react';
import { Card, Row, Col, Table, Typography, Button, Divider } from 'antd';
import { PrinterOutlined, DownloadOutlined, SendOutlined } from '@ant-design/icons';
import PageHeader from '@/src/components/ui/PageHeader';
import StatusBadge from '@/src/components/ui/StatusBadge';

const { Text, Title } = Typography;

const invoice = { id: 'INV-001', client: 'Acme Corp', clientAddress: '123 Business Ave, New York, NY', email: 'billing@acme.com', amount: '$12,500.00', date: '2026-05-12', dueDate: '2026-06-12', status: 'paid' as const };

const lineItems = [
  { key: '1', description: 'Web Application Development', quantity: 40, rate: 150, total: '$6,000.00' },
  { key: '2', description: 'UI/UX Design Services', quantity: 20, rate: 125, total: '$2,500.00' },
  { key: '3', description: 'API Integration', quantity: 16, rate: 150, total: '$2,400.00' },
  { key: '4', description: 'QA Testing & Bug Fixes', quantity: 16, rate: 100, total: '$1,600.00' },
];

const itemColumns = [
  { title: 'Description', dataIndex: 'description', key: 'description', render: (d: string) => <span style={{ fontWeight: 600 }}>{d}</span> },
  { title: 'Qty (hrs)', dataIndex: 'quantity', key: 'quantity', align: 'center' as const },
  { title: 'Rate', dataIndex: 'rate', key: 'rate', align: 'center' as const, render: (r: number) => `$${r}` },
  { title: 'Total', dataIndex: 'total', key: 'total', align: 'right' as const, render: (t: string) => <span style={{ fontWeight: 700 }}>{t}</span> },
];

export default function InvoiceDetailPage() {
  return (
    <div>
      <PageHeader title={`Invoice ${invoice.id}`} breadcrumbs={[{ title: 'Finance', href: '/finance' }, { title: 'Invoices', href: '/finance/invoices' }, { title: invoice.id }]}
        actions={<>
          <Button icon={<PrinterOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Print</Button>
          <Button icon={<DownloadOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Download PDF</Button>
          <Button type="primary" icon={<SendOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Send</Button>
        </>}
      />
      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <Row gutter={[40, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18 }}>A</div>
                <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>AetherERP</span>
              </div>
              <Text style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.8 }}>123 Innovation Drive<br />San Francisco, CA 94107<br />billing@aetheRP.com</Text>
            </div>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Title level={2} style={{ margin: '0 0 8px', letterSpacing: '-1px' }}>INVOICE</Title>
            <Text style={{ fontSize: 16, fontWeight: 700, display: 'block', marginBottom: 4 }}>{invoice.id}</Text>
            <StatusBadge status={invoice.status} />
          </Col>
        </Row>

        <Row gutter={[40, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} md={8}>
            <Text style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>Bill To</Text>
            <Text strong style={{ fontSize: 15, display: 'block' }}>{invoice.client}</Text>
            <Text style={{ color: 'var(--muted)', fontSize: 13 }}>{invoice.clientAddress}<br />{invoice.email}</Text>
          </Col>
          <Col xs={24} md={8}>
            <Text style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>Invoice Date</Text>
            <Text strong>{invoice.date}</Text>
          </Col>
          <Col xs={24} md={8}>
            <Text style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>Due Date</Text>
            <Text strong>{invoice.dueDate}</Text>
          </Col>
        </Row>

        <Table dataSource={lineItems} columns={itemColumns} pagination={false} style={{ marginBottom: 24 }} />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 280 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><Text style={{ color: 'var(--muted)' }}>Subtotal</Text><Text strong>$12,500.00</Text></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><Text style={{ color: 'var(--muted)' }}>Tax (0%)</Text><Text strong>$0.00</Text></div>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text strong style={{ fontSize: 16 }}>Total</Text><Text strong style={{ fontSize: 20, color: 'var(--primary)' }}>$12,500.00</Text></div>
          </div>
        </div>
      </Card>
    </div>
  );
}

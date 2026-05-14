'use client';

import React from 'react';
import { Row, Col, Card, Typography, List, Tag, Button, Progress } from 'antd';
import { DollarOutlined, FileTextOutlined, WalletOutlined, CreditCardOutlined, ArrowRightOutlined, RiseOutlined } from '@ant-design/icons';
import PageHeader from '@/src/components/ui/PageHeader';
import StatCard from '@/src/components/ui/StatCard';

const { Text } = Typography;

const recentTransactions = [
  { id: 1, description: 'Invoice #INV-089 Payment', amount: '+$12,500', type: 'income', date: 'May 12, 2026' },
  { id: 2, description: 'Office Supplies', amount: '-$340', type: 'expense', date: 'May 11, 2026' },
  { id: 3, description: 'Invoice #INV-088 Payment', amount: '+$8,200', type: 'income', date: 'May 10, 2026' },
  { id: 4, description: 'Cloud Services (AWS)', amount: '-$2,100', type: 'expense', date: 'May 9, 2026' },
  { id: 5, description: 'Contractor Payment - Design', amount: '-$5,000', type: 'expense', date: 'May 8, 2026' },
  { id: 6, description: 'Invoice #INV-087 Payment', amount: '+$15,750', type: 'income', date: 'May 7, 2026' },
];

const budgetItems = [
  { name: 'Engineering', spent: 45000, budget: 60000, color: '#0284c7' },
  { name: 'Marketing', spent: 18000, budget: 25000, color: '#E8583A' },
  { name: 'Operations', spent: 12000, budget: 15000, color: '#7c3aed' },
  { name: 'HR & Recruitment', spent: 8500, budget: 20000, color: '#059669' },
];

export default function FinanceOverviewPage() {
  return (
    <div>
      <PageHeader title="Finance" subtitle="Financial overview and key metrics." breadcrumbs={[{ title: 'Finance' }, { title: 'Overview' }]} />

      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Total Revenue" value="$284,500" icon={<DollarOutlined />} color="#059669" bgColor="rgba(5,150,105,0.08)" accentColor="#059669" trend={{ value: '+12.5%', direction: 'up' }} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Outstanding" value="$42,300" icon={<FileTextOutlined />} color="#d97706" bgColor="rgba(217,119,6,0.08)" accentColor="#d97706" trend={{ value: '5 invoices', direction: 'up' }} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Expenses" value="$67,840" icon={<WalletOutlined />} color="#e11d48" bgColor="rgba(225,29,72,0.08)" accentColor="#e11d48" trend={{ value: '+3.2%', direction: 'down' }} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Net Profit" value="$216,660" icon={<RiseOutlined />} color="#0284c7" bgColor="rgba(2,132,199,0.08)" accentColor="#0284c7" trend={{ value: '+18.7%', direction: 'up' }} />
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={14}>
          <Card title={<><CreditCardOutlined style={{ marginRight: 8 }} />Recent Transactions</>}
            extra={<Button type="link" style={{ fontWeight: 600, padding: 0 }}>View All <ArrowRightOutlined /></Button>}
            style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
            <List dataSource={recentTransactions} renderItem={(item) => (
              <List.Item style={{ padding: '12px 0', border: 'none' }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong style={{ fontSize: 14 }}>{item.description}</Text>
                    <br />
                    <Text style={{ fontSize: 12, color: 'var(--muted)' }}>{item.date}</Text>
                  </div>
                  <Text strong style={{ fontSize: 15, color: item.type === 'income' ? 'var(--success)' : 'var(--error)' }}>{item.amount}</Text>
                </div>
              </List.Item>
            )} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Budget Utilization" style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
            {budgetItems.map((item) => (
              <div key={item.name} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text strong style={{ fontSize: 13 }}>{item.name}</Text>
                  <Text style={{ fontSize: 12, color: 'var(--muted)' }}>${(item.spent / 1000).toFixed(0)}k / ${(item.budget / 1000).toFixed(0)}k</Text>
                </div>
                <Progress percent={Math.round((item.spent / item.budget) * 100)} strokeColor={item.color} trailColor="rgba(0,0,0,0.04)" size="small" />
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

'use client';

import React from 'react';
import { Col, List, Progress, Spin } from 'antd';
import { DollarOutlined, FileTextOutlined, WalletOutlined, CreditCardOutlined, ArrowRightOutlined, RiseOutlined } from '@ant-design/icons';
import { PageHeader, StatCard, AppRow, AppCard, AppText, AppButton } from '@/src/components/ui';
import { useFinance } from './hooks/useFinance';

export default function Finance() {
  const { transactions, budgetItems, loading } = useFinance();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <PageHeader title="Finance" subtitle="Financial overview and key metrics." breadcrumbs={[{ title: 'Finance' }, { title: 'Overview' }]} />

      <AppRow marginBottom={24}>
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
      </AppRow>

      <AppRow>
        <Col xs={24} lg={14}>
          <AppCard title={<><CreditCardOutlined style={{ marginRight: 8 }} />Recent Transactions</>}
            extra={<AppButton type="link" style={{ padding: 0 }}>View All <ArrowRightOutlined /></AppButton>}>
            <List dataSource={transactions} renderItem={(item) => (
              <List.Item style={{ padding: '12px 0', border: 'none' }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <AppText strong style={{ fontSize: 14 }}>{item.description}</AppText>
                    <br />
                    <AppText muted small>{item.date}</AppText>
                  </div>
                  <AppText strong style={{ fontSize: 15, color: item.type === 'income' ? 'var(--success)' : 'var(--error)' }}>{item.amount}</AppText>
                </div>
              </List.Item>
            )} />
          </AppCard>
        </Col>
        <Col xs={24} lg={10}>
          <AppCard title="Budget Utilization">
            {budgetItems.map((item) => (
              <div key={item.name} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <AppText strong small>{item.name}</AppText>
                  <AppText muted small>${(item.spent / 1000).toFixed(0)}k / ${(item.budget / 1000).toFixed(0)}k</AppText>
                </div>
                <Progress percent={Math.round((item.spent / item.budget) * 100)} strokeColor={item.color} railColor="rgba(0,0,0,0.04)" size="small" />
              </div>
            ))}
          </AppCard>
        </Col>
      </AppRow>
    </div>
  );
}


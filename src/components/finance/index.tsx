'use client';

import React from 'react';
import { Col, List, Progress, Spin } from 'antd';
import { CreditCardOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { PageHeader, StatCard, AppRow, AppCard, AppText, AppButton, AppContainer, ContainerHeader } from '@/src/components/ui';
import { useFinance } from './hooks/useFinance';
import { financeStats } from './constants';

export default function Finance() {
  const { transactions, budgetItems, loading } = useFinance();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <AppContainer fluid>
      <PageHeader
        title="Finance"
        subtitle="Financial overview and key metrics."
        breadcrumbs={[{ title: 'Finance' }, { title: 'Overview' }]}
      />

      <AppRow marginBottom={24}>
        {financeStats.map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <StatCard {...stat} />
          </Col>
        ))}
      </AppRow>

      <AppRow>
        <Col xs={24} lg={14}>
          <AppCard
            title={
              <ContainerHeader
                title="Recent Transactions"
                icon={<CreditCardOutlined />}
                style={{ marginBottom: 0 }}
              />
            }
            extra={
              <AppButton type="link" style={{ padding: 0 }}>
                View All <ArrowRightOutlined />
              </AppButton>
            }
          >
            <List
              dataSource={transactions}
              renderItem={(item) => (
                <List.Item style={{ padding: '12px 0', border: 'none' }}>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <AppText strong style={{ fontSize: 14 }}>{item.description}</AppText>
                      <br />
                      <AppText muted small>{item.date}</AppText>
                    </div>
                    <AppText
                      strong
                      style={{
                        fontSize: 15,
                        color: item.type === 'income' ? 'var(--success)' : 'var(--error)'
                      }}
                    >
                      {item.amount}
                    </AppText>
                  </div>
                </List.Item>
              )}
            />
          </AppCard>
        </Col>
        <Col xs={24} lg={10}>
          <AppCard
            title={
              <ContainerHeader
                title="Budget Utilization"
                style={{ marginBottom: 0 }}
              />
            }
          >
            {budgetItems.map((item) => (
              <div key={item.name} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <AppText strong small>{item.name}</AppText>
                  <AppText muted small>${(item.spent / 1000).toFixed(0)}k / ${(item.budget / 1000).toFixed(0)}k</AppText>
                </div>
                <Progress
                  percent={Math.round((item.spent / item.budget) * 100)}
                  strokeColor={item.color}
                  railColor="rgba(0,0,0,0.04)"
                  size="small"
                />
              </div>
            ))}
          </AppCard>
        </Col>
      </AppRow>
    </AppContainer>
  );
}

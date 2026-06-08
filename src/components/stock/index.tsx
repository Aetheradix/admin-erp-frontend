'use client';

import React from 'react';
import { Card, Table, Row, Col } from 'antd';
import { WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { PageHeader, AppContainer, StatCard } from '@/src/components/ui';
import { useStock } from './hooks/useStock';
import { getStockColumns } from './constants';

export default function Stock() {
  const { stock, stats, loading } = useStock();

  const columns = getStockColumns();

  return (
    <AppContainer fluid>
      <PageHeader
        title="Stock Levels"
        subtitle="Monitor inventory levels across all items."
        breadcrumbs={[{ title: 'Inventory' }, { title: 'Stock Levels' }]}
      />

      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <StatCard
            title="In Stock"
            value={stats.good}
            icon={<CheckCircleOutlined />}
            color="#059669"
            bgColor="rgba(5,150,105,0.08)"
            accentColor="#059669"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Low Stock"
            value={stats.low}
            icon={<WarningOutlined />}
            color="#d97706"
            bgColor="rgba(217,119,6,0.08)"
            accentColor="#d97706"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Critical / Out"
            value={stats.critical}
            icon={<WarningOutlined />}
            color="#e11d48"
            bgColor="rgba(225,29,72,0.08)"
            accentColor="#e11d48"
          />
        </Col>
      </Row>

      <Card
        style={{
          borderRadius: 16,
          border: '1px solid var(--border-subtle)'
        }}
      >
        <Table
          dataSource={stock}
          columns={columns}
          rowKey="id"
          pagination={false}
          loading={loading}
        />
      </Card>
    </AppContainer>
  );
}

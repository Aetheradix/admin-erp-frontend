'use client';

import React from 'react';
import { Card, Table, Row, Col, Button, Space } from 'antd';
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { PageHeader, AppContainer, StatCard } from '@/src/components/ui';
import { usePayroll } from './hooks/usePayroll';
import PayrollModal from './components/PayrollModal';
import { payrollStats, payrollColumns } from './constants';

export default function Payroll() {
  const { payroll, loading, addPayrollEntry } = usePayroll();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <AppContainer fluid>
      <PageHeader
        title="Payroll"
        subtitle="Manage employee compensation and benefits."
        breadcrumbs={[{ title: 'Finance', href: '/finance' }, { title: 'Payroll' }]}
        actions={
          <Space>
            <Button icon={<DownloadOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>
              Export
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              style={{ borderRadius: 10, fontWeight: 600 }}
              onClick={() => setIsModalOpen(true)}
            >
              Add Entry
            </Button>
          </Space>
        }
      />

      <PayrollModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={addPayrollEntry}
      />

      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        {payrollStats.map((stat, i) => (
          <Col xs={24} sm={8} key={i}>
            <StatCard {...stat} />
          </Col>
        ))}
      </Row>

      <Card
        style={{
          borderRadius: 16,
          border: '1px solid var(--border-subtle)'
        }}
      >
        <Table
          dataSource={payroll}
          columns={payrollColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={loading}
        />
      </Card>
    </AppContainer>
  );
}

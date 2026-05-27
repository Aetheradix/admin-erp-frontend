'use client';

import React from 'react';
import { Card, Table, Row, Col, Button, Avatar, Space } from 'antd';
import { DollarOutlined, CalendarOutlined, TeamOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import PageHeader from '@/src/components/ui/PageHeader';
import StatCard from '@/src/components/ui/StatCard';
import StatusBadge from '@/src/components/ui/StatusBadge';
import { usePayroll } from './hooks/usePayroll';
import { PayrollEntry } from './types';
import PayrollModal from './components/PayrollModal';

export default function Payroll() {
  const { payroll, loading, addPayrollEntry } = usePayroll();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const columns = [
    {
      title: 'Employee', dataIndex: 'name', key: 'name', render: (n: string, r: PayrollEntry) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 11 }} size={32}>{n.split(' ').map(c => c[0]).join('')}</Avatar>
          <div><div style={{ fontWeight: 600 }}>{n}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.department}</div></div>
        </div>
      )
    },
    { title: 'Base Salary', dataIndex: 'baseSalary', key: 'baseSalary', render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: 'Bonus', dataIndex: 'bonus', key: 'bonus', render: (v: string) => <span style={{ color: 'var(--success)' }}>{v}</span> },
    { title: 'Deductions', dataIndex: 'deductions', key: 'deductions', render: (v: string) => <span style={{ color: 'var(--error)' }}>{v}</span> },
    { title: 'Net Pay', dataIndex: 'netPay', key: 'netPay', render: (v: string) => <span style={{ fontWeight: 700, fontSize: 15 }}>{v}</span> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: any) => <StatusBadge status={s} /> },
  ];

  return (
    <div>
      <PageHeader title="Payroll" subtitle="Manage employee compensation and benefits." breadcrumbs={[{ title: 'Finance', href: '/finance' }, { title: 'Payroll' }]}
        actions={<Space><Button icon={<DownloadOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Export</Button><Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: 10, fontWeight: 600 }} onClick={() => setIsModalOpen(true)}>Add Entry</Button></Space>}
      />

      <PayrollModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={addPayrollEntry}
      />
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}><StatCard title="Total Payroll" value="$49,100" icon={<DollarOutlined />} color="var(--primary)" bgColor="var(--primary-soft)" accentColor="var(--primary)" /></Col>
        <Col xs={24} sm={8}><StatCard title="Employees" value="156" icon={<TeamOutlined />} color="#7c3aed" bgColor="rgba(124,58,237,0.08)" accentColor="#7c3aed" /></Col>
        <Col xs={24} sm={8}><StatCard title="Pay Period" value="May 2026" icon={<CalendarOutlined />} color="#0284c7" bgColor="rgba(2,132,199,0.08)" accentColor="#0284c7" /></Col>
      </Row>
      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <Table dataSource={payroll} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} loading={loading} />
      </Card>
    </div>
  );
}

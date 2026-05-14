'use client';

import React from 'react';
import { Card, Table, Row, Col, Tag, Typography, Button, Avatar } from 'antd';
import { DollarOutlined, CalendarOutlined, TeamOutlined, DownloadOutlined } from '@ant-design/icons';
import PageHeader from '@/src/components/ui/PageHeader';
import StatCard from '@/src/components/ui/StatCard';
import StatusBadge from '@/src/components/ui/StatusBadge';

const { Text } = Typography;

const payrollData = [
  { id: '1', name: 'John Doe', department: 'Management', baseSalary: '$12,000', bonus: '$2,000', deductions: '$1,800', netPay: '$12,200', status: 'paid' as const },
  { id: '2', name: 'Sarah Chen', department: 'Engineering', baseSalary: '$10,500', bonus: '$1,500', deductions: '$1,600', netPay: '$10,400', status: 'paid' as const },
  { id: '3', name: 'Mike Ross', department: 'Design', baseSalary: '$9,000', bonus: '$800', deductions: '$1,200', netPay: '$8,600', status: 'paid' as const },
  { id: '4', name: 'Emily Watson', department: 'HR', baseSalary: '$8,500', bonus: '$500', deductions: '$1,100', netPay: '$7,900', status: 'pending' as const },
  { id: '5', name: 'Alex Rivera', department: 'Sales', baseSalary: '$7,800', bonus: '$3,200', deductions: '$1,000', netPay: '$10,000', status: 'pending' as const },
];

const columns = [
  { title: 'Employee', dataIndex: 'name', key: 'name', render: (n: string, r: any) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Avatar style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 11 }} size={32}>{n.split(' ').map(c => c[0]).join('')}</Avatar>
      <div><div style={{ fontWeight: 600 }}>{n}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.department}</div></div>
    </div>
  )},
  { title: 'Base Salary', dataIndex: 'baseSalary', key: 'baseSalary', render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
  { title: 'Bonus', dataIndex: 'bonus', key: 'bonus', render: (v: string) => <span style={{ color: 'var(--success)' }}>{v}</span> },
  { title: 'Deductions', dataIndex: 'deductions', key: 'deductions', render: (v: string) => <span style={{ color: 'var(--error)' }}>{v}</span> },
  { title: 'Net Pay', dataIndex: 'netPay', key: 'netPay', render: (v: string) => <span style={{ fontWeight: 700, fontSize: 15 }}>{v}</span> },
  { title: 'Status', dataIndex: 'status', key: 'status', render: (s: any) => <StatusBadge status={s} /> },
];

export default function PayrollPage() {
  return (
    <div>
      <PageHeader title="Payroll" subtitle="May 2026 payroll cycle." breadcrumbs={[{ title: 'Finance', href: '/finance' }, { title: 'Payroll' }]}
        actions={<><Button icon={<DownloadOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Export</Button><Button type="primary" style={{ borderRadius: 10, fontWeight: 600 }}>Process Payroll</Button></>}
      />
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}><StatCard title="Total Payroll" value="$49,100" icon={<DollarOutlined />} color="var(--primary)" bgColor="var(--primary-soft)" accentColor="var(--primary)" /></Col>
        <Col xs={24} sm={8}><StatCard title="Employees" value="156" icon={<TeamOutlined />} color="#7c3aed" bgColor="rgba(124,58,237,0.08)" accentColor="#7c3aed" /></Col>
        <Col xs={24} sm={8}><StatCard title="Pay Period" value="May 2026" icon={<CalendarOutlined />} color="#0284c7" bgColor="rgba(2,132,199,0.08)" accentColor="#0284c7" /></Col>
      </Row>
      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <Table dataSource={payrollData} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
}

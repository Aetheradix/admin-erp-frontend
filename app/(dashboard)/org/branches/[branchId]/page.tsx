'use client';

import React from 'react';
import { Card, Tabs, Table, Row, Col, Avatar, Typography, Tag, Descriptions, Button } from 'antd';
import { EnvironmentOutlined, UserOutlined, EditOutlined, TeamOutlined } from '@ant-design/icons';
import PageHeader from '@/src/components/ui/PageHeader';
import StatCard from '@/src/components/ui/StatCard';
import StatusBadge from '@/src/components/ui/StatusBadge';

const { Text } = Typography;

interface BranchMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
}

const branchData = {
  id: 'b1',
  name: 'San Francisco HQ',
  location: 'San Francisco, CA',
  address: '123 Innovation Drive, San Francisco, CA 94107',
  manager: 'John Doe',
  phone: '+1 (555) 123-4567',
  email: 'sf@acme.com',
  status: 'active' as const,
  members: 52,
  departments: 6,
  projects: 12,
};

const members: BranchMember[] = [
  { id: '1', name: 'John Doe', email: 'john@acme.com', role: 'Branch Manager', department: 'Management', status: 'active' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@acme.com', role: 'Lead Developer', department: 'Engineering', status: 'active' },
  { id: '3', name: 'Mike Ross', email: 'mike@acme.com', role: 'Designer', department: 'Design', status: 'active' },
  { id: '4', name: 'Emily Watson', email: 'emily@acme.com', role: 'HR Manager', department: 'HR', status: 'active' },
  { id: '5', name: 'Alex Rivera', email: 'alex@acme.com', role: 'Sales Lead', department: 'Sales', status: 'inactive' },
];

const memberColumns = [
  {
    title: 'Name', dataIndex: 'name', key: 'name',
    render: (name: string, r: BranchMember) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar style={{ background: 'var(--primary)', fontWeight: 700 }} size={32}>{name.split(' ').map(n => n[0]).join('')}</Avatar>
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.email}</div>
        </div>
      </div>
    ),
  },
  { title: 'Role', dataIndex: 'role', key: 'role' },
  { title: 'Department', dataIndex: 'department', key: 'department', render: (d: string) => <Tag color="blue" style={{ borderRadius: 6, border: 'none' }}>{d}</Tag> },
  { title: 'Status', dataIndex: 'status', key: 'status', render: (s: BranchMember['status']) => <StatusBadge status={s} /> },
];

export default function BranchDetailPage() {
  return (
    <div>
      <PageHeader
        title={branchData.name}
        subtitle={branchData.address}
        breadcrumbs={[{ title: 'Organization' }, { title: 'Branches', href: '/org/branches' }, { title: branchData.name }]}
        actions={<Button icon={<EditOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Edit Branch</Button>}
      />

      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <StatCard title="Team Members" value={branchData.members} icon={<TeamOutlined />} color="#7c3aed" bgColor="rgba(124,58,237,0.08)" accentColor="#7c3aed" />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard title="Departments" value={branchData.departments} icon={<UserOutlined />} color="#0284c7" bgColor="rgba(2,132,199,0.08)" accentColor="#0284c7" />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard title="Active Projects" value={branchData.projects} icon={<EnvironmentOutlined />} color="var(--primary)" bgColor="var(--primary-soft)" accentColor="var(--primary)" />
        </Col>
      </Row>

      <Tabs defaultActiveKey="overview" items={[
        {
          key: 'overview', label: 'Overview',
          children: (
            <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
              <Descriptions column={{ xs: 1, md: 2 }} labelStyle={{ fontWeight: 600, color: 'var(--muted)', fontSize: 13 }}>
                <Descriptions.Item label="Branch Name">{branchData.name}</Descriptions.Item>
                <Descriptions.Item label="Location">{branchData.location}</Descriptions.Item>
                <Descriptions.Item label="Manager">{branchData.manager}</Descriptions.Item>
                <Descriptions.Item label="Status"><StatusBadge status={branchData.status} /></Descriptions.Item>
                <Descriptions.Item label="Phone">{branchData.phone}</Descriptions.Item>
                <Descriptions.Item label="Email">{branchData.email}</Descriptions.Item>
                <Descriptions.Item label="Address" span={2}>{branchData.address}</Descriptions.Item>
              </Descriptions>
            </Card>
          ),
        },
        {
          key: 'members', label: `Members (${members.length})`,
          children: (
            <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
              <Table dataSource={members} columns={memberColumns} rowKey="id" pagination={false} />
            </Card>
          ),
        },
        {
          key: 'settings', label: 'Settings',
          children: <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)', padding: '48px', textAlign: 'center' }}><Text style={{ color: 'var(--muted)' }}>Branch settings coming soon...</Text></Card>,
        },
      ]} />
    </div>
  );
}

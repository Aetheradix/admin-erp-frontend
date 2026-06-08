'use client';

import React from 'react';
import { Card, Table, Row, Col, Avatar, Typography, Tag, Button, Timeline } from 'antd';
import { EditOutlined, TeamOutlined, UserAddOutlined, ClockCircleOutlined } from '@ant-design/icons';
import PageHeader from '@/src/components/ui/PageHeader';
import StatCard from '@/src/components/ui/StatCard';
import StatusBadge, { StatusType } from '@/src/components/ui/StatusBadge';

const { Text } = Typography;

const team = { id: 't1', name: 'Engineering', description: 'Core product development team building the next generation of AetherERP.', members: 24, department: 'Technology', color: '#0284c7', lead: 'Sarah Chen' };

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: StatusType;
  joined: string;
}

const members: TeamMember[] = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@acme.com', role: 'Team Lead', status: 'active', joined: 'Jan 2023' },
  { id: '2', name: 'Marcus Johnson', email: 'marcus@acme.com', role: 'Sr. Developer', status: 'active', joined: 'Mar 2023' },
  { id: '3', name: 'Priya Sharma', email: 'priya@acme.com', role: 'Developer', status: 'active', joined: 'Jun 2023' },
  { id: '4', name: 'James Wilson', email: 'james@acme.com', role: 'DevOps Engineer', status: 'active', joined: 'Aug 2023' },
  { id: '5', name: 'Ana Martinez', email: 'ana@acme.com', role: 'QA Lead', status: 'active', joined: 'Sep 2023' },
  { id: '6', name: 'Tom Baker', email: 'tom@acme.com', role: 'Developer', status: 'inactive', joined: 'Nov 2023' },
];

const columns = [
  {
    title: 'Name', dataIndex: 'name', key: 'name',
    render: (name: string, r: TeamMember) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar style={{ background: team.color, fontWeight: 700 }} size={32}>{name.split(' ').map(n => n[0]).join('')}</Avatar>
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.email}</div>
        </div>
      </div>
    ),
  },
  { title: 'Role', dataIndex: 'role', key: 'role', render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span> },
  { title: 'Joined', dataIndex: 'joined', key: 'joined', render: (v: string) => <Text style={{ color: 'var(--muted)' }}>{v}</Text> },
  { title: 'Status', dataIndex: 'status', key: 'status', render: (s: StatusType) => <StatusBadge status={s} /> },
];

const activities = [
  { color: '#0284c7' as const, children: <><Text strong style={{ fontSize: 13 }}>Sarah Chen</Text> <Text style={{ color: 'var(--muted)', fontSize: 13 }}>merged PR #248 – Auth module refactor</Text><br /><Text style={{ fontSize: 11, color: 'var(--muted)' }}>30 min ago</Text></> },
  { color: '#059669' as const, children: <><Text strong style={{ fontSize: 13 }}>Marcus Johnson</Text> <Text style={{ color: 'var(--muted)', fontSize: 13 }}>completed sprint task</Text> <Tag color="green" style={{ borderRadius: 6, border: 'none' }}>API Endpoints</Tag><br /><Text style={{ fontSize: 11, color: 'var(--muted)' }}>2 hours ago</Text></> },
  { color: '#d97706' as const, children: <><Text strong style={{ fontSize: 13 }}>Priya Sharma</Text> <Text style={{ color: 'var(--muted)', fontSize: 13 }}>requested code review for</Text> <Tag color="gold" style={{ borderRadius: 6, border: 'none' }}>Dashboard Charts</Tag><br /><Text style={{ fontSize: 11, color: 'var(--muted)' }}>4 hours ago</Text></> },
];

export default function TeamDetailPage() {
  return (
    <div>
      <PageHeader
        title={team.name}
        subtitle={team.description}
        breadcrumbs={[{ title: 'Teams', href: '/teams' }, { title: team.name }]}
        actions={<>
          <Button icon={<UserAddOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Add Member</Button>
          <Button icon={<EditOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Edit Team</Button>
        </>}
      />

      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}><StatCard title="Members" value={team.members} icon={<TeamOutlined />} color={team.color} bgColor={`${team.color}12`} accentColor={team.color} /></Col>
        <Col xs={24} sm={8}><StatCard title="Active Tasks" value={18} icon={<ClockCircleOutlined />} color="#d97706" bgColor="rgba(217,119,6,0.08)" accentColor="#d97706" trend={{ value: '3 due today', direction: 'up' }} /></Col>
        <Col xs={24} sm={8}><StatCard title="Completed This Week" value={12} icon={<ClockCircleOutlined />} color="#059669" bgColor="rgba(5,150,105,0.08)" accentColor="#059669" trend={{ value: '+20%', direction: 'up' }} /></Col>
      </Row>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={16}>
          <Card title={<><TeamOutlined style={{ marginRight: 8 }} />Team Members ({members.length})</>} style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
            <Table dataSource={members} columns={columns} rowKey="id" pagination={false} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<><ClockCircleOutlined style={{ marginRight: 8 }} />Recent Activity</>} style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
            <Timeline items={activities} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

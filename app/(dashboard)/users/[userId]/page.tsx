'use client';

import React from 'react';
import { Card, Row, Col, Avatar, Typography, Tag, Descriptions, Tabs, Timeline, Button, Checkbox, Divider } from 'antd';
import { EditOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import PageHeader from '@/src/components/ui/PageHeader';
import StatusBadge from '@/src/components/ui/StatusBadge';

const { Text } = Typography;

const user = { name: 'Sarah Chen', email: 'sarah@acme.com', phone: '+1 (555) 234-5678', location: 'San Francisco, CA', role: 'Team Lead', department: 'Engineering', status: 'active' as const, joined: 'January 2023', avatar: 'SC' };

const permissions = ['View Projects', 'Edit Projects', 'Create Tasks', 'Manage Team', 'View Reports', 'Export Data', 'Manage Users', 'Admin Settings'];
const userPerms = ['View Projects', 'Edit Projects', 'Create Tasks', 'Manage Team', 'View Reports', 'Export Data'];

const activities = [
  { color: '#0284c7' as const, children: <><Text strong style={{ fontSize: 13 }}>Completed task</Text> <Tag color="green" style={{ borderRadius: 6, border: 'none' }}>API Integration</Tag><br /><Text style={{ fontSize: 11, color: 'var(--muted)' }}>1 hour ago</Text></> },
  { color: '#059669' as const, children: <><Text strong style={{ fontSize: 13 }}>Pushed 3 commits</Text> <Text style={{ color: 'var(--muted)', fontSize: 13 }}>to main branch</Text><br /><Text style={{ fontSize: 11, color: 'var(--muted)' }}>3 hours ago</Text></> },
  { color: '#d97706' as const, children: <><Text strong style={{ fontSize: 13 }}>Reviewed PR</Text> <Tag color="blue" style={{ borderRadius: 6, border: 'none' }}>#245</Tag><br /><Text style={{ fontSize: 11, color: 'var(--muted)' }}>Yesterday</Text></> },
];

export default function UserDetailPage() {
  return (
    <div>
      <PageHeader title={user.name} breadcrumbs={[{ title: 'Users', href: '/users' }, { title: user.name }]}
        actions={<Button icon={<EditOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Edit Profile</Button>}
      />
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={8}>
          <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <Avatar size={80} style={{ background: 'var(--primary)', fontWeight: 800, fontSize: 28, marginBottom: 16 }}>{user.avatar}</Avatar>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>{user.name}</h3>
            <Text style={{ color: 'var(--muted)', display: 'block', marginBottom: 8 }}>{user.role} · {user.department}</Text>
            <StatusBadge status={user.status} />
            <Divider />
            <div style={{ textAlign: 'left' }}>
              {[{ icon: <MailOutlined />, val: user.email }, { icon: <PhoneOutlined />, val: user.phone }, { icon: <EnvironmentOutlined />, val: user.location }].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, color: 'var(--muted)', fontSize: 13 }}>
                  {item.icon} <span>{item.val}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Tabs defaultActiveKey="overview" items={[
            {
              key: 'overview', label: 'Overview', children: (
                <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
                  <Descriptions column={{ xs: 1, md: 2 }} labelStyle={{ fontWeight: 600, color: 'var(--muted)', fontSize: 13 }}>
                    <Descriptions.Item label="Full Name">{user.name}</Descriptions.Item>
                    <Descriptions.Item label="Role"><Tag color="blue" style={{ borderRadius: 6, border: 'none' }}>{user.role}</Tag></Descriptions.Item>
                    <Descriptions.Item label="Department">{user.department}</Descriptions.Item>
                    <Descriptions.Item label="Status"><StatusBadge status={user.status} /></Descriptions.Item>
                    <Descriptions.Item label="Joined">{user.joined}</Descriptions.Item>
                    <Descriptions.Item label="Location">{user.location}</Descriptions.Item>
                  </Descriptions>
                </Card>
              )
            },
            {
              key: 'permissions', label: 'Permissions', children: (
                <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }} title={<><SafetyCertificateOutlined style={{ marginRight: 8 }} />Role Permissions</>}>
                  <Row gutter={[16, 12]}>
                    {permissions.map((p) => (
                      <Col xs={24} sm={12} key={p}>
                        <Checkbox checked={userPerms.includes(p)} style={{ fontSize: 14 }}>{p}</Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Card>
              )
            },
            {
              key: 'activity', label: 'Activity', children: (
                <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
                  <Timeline items={activities} />
                </Card>
              )
            },
          ]} />
        </Col>
      </Row>
    </div>
  );
}

'use client';

import React from 'react';
import { Card, Button, Row, Col, Typography, Tag, Switch } from 'antd';
import { ApiOutlined, MailOutlined, SlackOutlined, GithubOutlined, GoogleOutlined, LinkOutlined } from '@ant-design/icons';
import PageHeader from '@/src/components/ui/PageHeader';

const { Text } = Typography;

const integrations = [
  { id: '1', name: 'Slack', description: 'Get notifications and updates directly in Slack channels.', icon: <SlackOutlined />, color: '#4A154B', connected: true, category: 'Communication' },
  { id: '2', name: 'GitHub', description: 'Sync repositories, PRs, and issues with your projects.', icon: <GithubOutlined />, color: '#24292e', connected: true, category: 'Development' },
  { id: '3', name: 'Google Workspace', description: 'Connect Gmail, Calendar, and Drive.', icon: <GoogleOutlined />, color: '#4285f4', connected: false, category: 'Productivity' },
  { id: '4', name: 'Email (SMTP)', description: 'Configure outgoing email for notifications and invoices.', icon: <MailOutlined />, color: '#E8583A', connected: true, category: 'Communication' },
  { id: '5', name: 'Stripe', description: 'Payment processing for invoices and subscriptions.', icon: <LinkOutlined />, color: '#635bff', connected: false, category: 'Finance' },
  { id: '6', name: 'Jira', description: 'Sync issues and sprints with AetherERP projects.', icon: <ApiOutlined />, color: '#0052CC', connected: false, category: 'Development' },
  { id: '7', name: 'Zapier', description: 'Automate workflows with 5000+ apps.', icon: <ApiOutlined />, color: '#FF4A00', connected: false, category: 'Automation' },
  { id: '8', name: 'Twilio', description: 'SMS notifications and two-factor authentication.', icon: <ApiOutlined />, color: '#F22F46', connected: false, category: 'Communication' },
];

export default function IntegrationsPage() {
  return (
    <div>
      <PageHeader title="Integrations" subtitle="Connect third-party services to enhance your workflow." breadcrumbs={[{ title: 'Settings' }, { title: 'Integrations' }]} />

      <Row gutter={[20, 20]}>
        {integrations.map((integration) => (
          <Col xs={24} sm={12} lg={8} key={integration.id}>
            <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)', height: '100%', transition: 'all 0.3s' }} hoverable
              styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%', padding: 24 } }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${integration.color}12`, color: integration.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                  {integration.icon}
                </div>
                <Switch checked={integration.connected} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{integration.name}</h3>
              <Text style={{ color: 'var(--muted)', fontSize: 13, display: 'block', marginBottom: 16, flex: 1 }}>{integration.description}</Text>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Tag style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>{integration.category}</Tag>
                <Button type={integration.connected ? 'default' : 'primary'} size="small" style={{ borderRadius: 8, fontWeight: 600 }}>
                  {integration.connected ? 'Configure' : 'Connect'}
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

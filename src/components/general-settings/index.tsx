'use client';

import React from 'react';
import { Card, Form, Input, Select, Switch, Button, Divider, Typography, Space, Row, Col } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import PageHeader from '@/src/components/ui/PageHeader';
import { useGeneralSettings } from './hooks/useGeneralSettings';

const { Text } = Typography;

export default function GeneralSettings() {
  const { config, notifications, loading } = useGeneralSettings();

  return (
    <div>
      <PageHeader title="General Settings" subtitle="Configure your application preferences." breadcrumbs={[{ title: 'Settings' }, { title: 'General' }]}
        actions={<Button type="primary" icon={<SaveOutlined />} size="large" style={{ borderRadius: 10, fontWeight: 600 }}>Save Changes</Button>}
      />
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={16}>
          <Card title="Application" style={{ borderRadius: 16, border: '1px solid var(--border-subtle)', marginBottom: 20 }} loading={loading}>
            <Form layout="vertical" requiredMark={false} initialValues={config}>
              <Row gutter={16}>
                <Col xs={24} md={12}><Form.Item label={<span style={{ fontWeight: 600 }}>Application Name</span>} name="appName"><Input style={{ borderRadius: 10 }} /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item label={<span style={{ fontWeight: 600 }}>Language</span>} name="language"><Select options={[{ value: 'en', label: 'English' }, { value: 'es', label: 'Spanish' }, { value: 'fr', label: 'French' }, { value: 'de', label: 'German' }]} /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} md={12}><Form.Item label={<span style={{ fontWeight: 600 }}>Timezone</span>} name="timezone"><Select options={[{ value: 'America/Los_Angeles', label: 'Pacific Time (PT)' }, { value: 'America/New_York', label: 'Eastern Time (ET)' }, { value: 'Europe/London', label: 'GMT' }, { value: 'Asia/Kolkata', label: 'India (IST)' }]} /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item label={<span style={{ fontWeight: 600 }}>Date Format</span>} name="dateFormat"><Select options={[{ value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' }, { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' }, { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }]} /></Form.Item></Col>
              </Row>
              <Form.Item label={<span style={{ fontWeight: 600 }}>Currency</span>} name="currency"><Select style={{ maxWidth: 200 }} options={[{ value: 'USD', label: 'USD ($)' }, { value: 'EUR', label: 'EUR (€)' }, { value: 'GBP', label: 'GBP (£)' }, { value: 'INR', label: 'INR (₹)' }]} /></Form.Item>
            </Form>
          </Card>

          <Card title="Notifications" style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }} loading={loading}>
            <Space vertical size="large" style={{ width: '100%' }}>
              {notifications.map((item, i) => (
                <React.Fragment key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><Text strong>{item.title}</Text><br /><Text style={{ color: 'var(--muted)', fontSize: 13 }}>{item.desc}</Text></div>
                    <Switch defaultChecked={item.def} />
                  </div>
                  {i < notifications.length - 1 && <Divider style={{ margin: 0 }} />}
                </React.Fragment>
              ))}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Danger Zone" style={{ borderRadius: 16, border: '1px solid rgba(225,29,72,0.2)' }}>
            <Space vertical size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>Export Data</Text>
                <Text style={{ color: 'var(--muted)', fontSize: 13, display: 'block', marginBottom: 8 }}>Download all your organization data.</Text>
                <Button style={{ borderRadius: 10, fontWeight: 600 }}>Export All Data</Button>
              </div>
              <Divider style={{ margin: 0 }} />
              <div>
                <Text strong style={{ display: 'block', marginBottom: 4, color: 'var(--error)' }}>Delete Organization</Text>
                <Text style={{ color: 'var(--muted)', fontSize: 13, display: 'block', marginBottom: 8 }}>Permanently delete your organization and all data.</Text>
                <Button danger style={{ borderRadius: 10, fontWeight: 600 }}>Delete Organization</Button>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

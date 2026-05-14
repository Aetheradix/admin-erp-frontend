'use client';

import React from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Upload,
  Avatar,
  Tabs,
  Row,
  Col,
  Divider,
  Switch,
  Typography,
  Space,
} from 'antd';
import {
  BankOutlined,
  UploadOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import PageHeader from '@/src/components/ui/PageHeader';

const { TextArea } = Input;
const { Text } = Typography;

export default function OrgProfilePage() {
  return (
    <div>
      <PageHeader
        title="Company Profile"
        subtitle="Manage your organization's information and settings."
        breadcrumbs={[
          { title: 'Organization', href: '/org/profile' },
          { title: 'Profile' },
        ]}
        actions={
          <Button type="primary" icon={<SaveOutlined />} size="large" style={{ borderRadius: 10, fontWeight: 600 }}>
            Save Changes
          </Button>
        }
      />

      <Tabs
        defaultActiveKey="general"
        items={[
          {
            key: 'general',
            label: 'General',
            children: (
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                  <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
                    <Form layout="vertical" requiredMark={false} initialValues={{
                      name: 'Acme Corporation',
                      industry: 'technology',
                      website: 'https://acme.com',
                      email: 'contact@acme.com',
                      phone: '+1 (555) 123-4567',
                      address: '123 Innovation Drive, San Francisco, CA 94107',
                      description: 'A leading technology company focused on building enterprise solutions that empower teams worldwide.',
                      timezone: 'America/Los_Angeles',
                    }}>
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item label={<span style={{ fontWeight: 600 }}>Company Name</span>} name="name">
                            <Input prefix={<BankOutlined style={{ color: 'var(--muted)' }} />} style={{ borderRadius: 10 }} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item label={<span style={{ fontWeight: 600 }}>Industry</span>} name="industry">
                            <Select style={{ borderRadius: 10 }} options={[
                              { value: 'technology', label: 'Technology' },
                              { value: 'finance', label: 'Finance' },
                              { value: 'healthcare', label: 'Healthcare' },
                              { value: 'retail', label: 'Retail' },
                              { value: 'manufacturing', label: 'Manufacturing' },
                            ]} />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item label={<span style={{ fontWeight: 600 }}>Website</span>} name="website">
                            <Input prefix={<GlobalOutlined style={{ color: 'var(--muted)' }} />} style={{ borderRadius: 10 }} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item label={<span style={{ fontWeight: 600 }}>Contact Email</span>} name="email">
                            <Input prefix={<MailOutlined style={{ color: 'var(--muted)' }} />} style={{ borderRadius: 10 }} />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item label={<span style={{ fontWeight: 600 }}>Phone</span>} name="phone">
                            <Input prefix={<PhoneOutlined style={{ color: 'var(--muted)' }} />} style={{ borderRadius: 10 }} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item label={<span style={{ fontWeight: 600 }}>Timezone</span>} name="timezone">
                            <Select options={[
                              { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                              { value: 'America/New_York', label: 'Eastern Time (ET)' },
                              { value: 'Europe/London', label: 'GMT' },
                              { value: 'Asia/Kolkata', label: 'India (IST)' },
                            ]} />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item label={<span style={{ fontWeight: 600 }}>Address</span>} name="address">
                        <Input prefix={<EnvironmentOutlined style={{ color: 'var(--muted)' }} />} style={{ borderRadius: 10 }} />
                      </Form.Item>
                      <Form.Item label={<span style={{ fontWeight: 600 }}>Description</span>} name="description">
                        <TextArea rows={4} style={{ borderRadius: 10 }} />
                      </Form.Item>
                    </Form>
                  </Card>
                </Col>

                <Col xs={24} lg={8}>
                  <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <Avatar size={96} style={{ background: 'var(--primary)', fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
                      AC
                    </Avatar>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Acme Corporation</h3>
                    <Text style={{ color: 'var(--muted)', display: 'block', marginBottom: 24 }}>Technology · San Francisco, CA</Text>
                    <Upload>
                      <Button icon={<UploadOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Upload Logo</Button>
                    </Upload>
                  </Card>

                  <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)', marginTop: 20 }}>
                    <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Quick Stats</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <Text style={{ color: 'var(--muted)', fontSize: 13 }}>Team Members</Text>
                      <Text strong>156</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <Text style={{ color: 'var(--muted)', fontSize: 13 }}>Branches</Text>
                      <Text strong>4</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <Text style={{ color: 'var(--muted)', fontSize: 13 }}>Active Projects</Text>
                      <Text strong>24</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text style={{ color: 'var(--muted)', fontSize: 13 }}>Created</Text>
                      <Text strong>Jan 2023</Text>
                    </div>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'billing',
            label: 'Billing',
            children: (
              <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <Text style={{ fontSize: 16, color: 'var(--muted)' }}>Billing settings coming soon...</Text>
                </div>
              </Card>
            ),
          },
          {
            key: 'preferences',
            label: 'Preferences',
            children: (
              <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>Email Notifications</Text>
                      <br />
                      <Text style={{ color: 'var(--muted)', fontSize: 13 }}>Receive email updates about account activity</Text>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Divider style={{ margin: 0 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>Two-Factor Authentication</Text>
                      <br />
                      <Text style={{ color: 'var(--muted)', fontSize: 13 }}>Add an extra layer of security</Text>
                    </div>
                    <Switch />
                  </div>
                  <Divider style={{ margin: 0 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>Auto-save Drafts</Text>
                      <br />
                      <Text style={{ color: 'var(--muted)', fontSize: 13 }}>Automatically save document drafts</Text>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </Space>
              </Card>
            ),
          },
        ]}
        style={{ marginTop: 8 }}
      />
    </div>
  );
}

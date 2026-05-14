'use client';

import React, { useState } from 'react';
import { Button, Form, Input, Segmented } from 'antd';
import { MailOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import Link from 'next/link';

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<string>('PASSWORD');
  const [loading, setLoading] = useState(false);

  const handleLogin = (values: Record<string, string>) => {
    setLoading(true);
    // Mock login — redirect to dashboard
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1200);
  };

  return (
    <div className="auth-form-container">
      <h2 className="auth-form-title">Welcome back</h2>
      <p className="auth-form-subtitle">
        Please enter your credentials to access your workspace
      </p>

      {/* Auth Mode Toggle */}
      <Segmented
        value={authMode}
        onChange={(val) => setAuthMode(val as string)}
        options={[
          { label: 'PASSWORD', value: 'PASSWORD', icon: <LockOutlined /> },
          { label: 'SECURE OTP', value: 'OTP', icon: <SafetyOutlined /> },
        ]}
        block
        style={{
          marginBottom: 32,
          padding: 4,
          borderRadius: 12,
          background: 'var(--surface-subtle)',
        }}
      />

      {authMode === 'PASSWORD' ? (
        <Form
          layout="vertical"
          size="large"
          onFinish={handleLogin}
          requiredMark={false}
        >
          <Form.Item
            label={<span style={{ fontWeight: 600, fontSize: 13 }}>Work Email <span style={{ color: 'var(--primary)' }}>*</span></span>}
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: 'var(--muted)' }} />}
              placeholder="e.g. agimonopoly@gmail.com"
              style={{ borderRadius: 10, height: 48 }}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600, fontSize: 13 }}>Password <span style={{ color: 'var(--primary)' }}>*</span></span>}
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'var(--muted)' }} />}
              placeholder="••••••••"
              style={{ borderRadius: 10, height: 48 }}
            />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 24 }}>
            <Link
              href="/auth/forgot-password"
              style={{
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: 13,
                textDecoration: 'none',
              }}
            >
              Forgot password?
            </Link>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                height: 50,
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              GET STARTED
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <Form
          layout="vertical"
          size="large"
          onFinish={handleLogin}
          requiredMark={false}
        >
          <Form.Item
            label={<span style={{ fontWeight: 600, fontSize: 13 }}>Work Email <span style={{ color: 'var(--primary)' }}>*</span></span>}
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: 'var(--muted)' }} />}
              placeholder="e.g. agimonopoly@gmail.com"
              style={{ borderRadius: 10, height: 48 }}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600, fontSize: 13 }}>OTP Code <span style={{ color: 'var(--primary)' }}>*</span></span>}
            name="otp"
            rules={[{ required: true, message: 'Please enter the OTP' }]}
          >
            <Input.OTP
              length={6}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                height: 50,
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              VERIFY & LOGIN
            </Button>
          </Form.Item>
        </Form>
      )}

      <div className="auth-form-footer">
        New to AetherERP?{' '}
        <Link href="/auth/register">Get Beta Access</Link>
      </div>

      <div className="auth-sponsors">
        <div className="auth-sponsors-label">BACKED BY THE BEST</div>
        <div className="auth-sponsors-logos">
          <span>LOGOIPSUM</span>
          <span>GENERIC</span>
          <span>LOGO</span>
          <span>IPSUM</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Button, Form, Input } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useForgotPassword } from './hooks/useForgotPassword';

export default function ForgotPassword() {
  const { loading, submitted, setSubmitted, handleSubmit } = useForgotPassword();

  if (submitted) {
    return (
      <div className="auth-form-container" style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: 'var(--primary-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            color: 'var(--primary)',
            margin: '0 auto 24px',
          }}
        >
          <MailOutlined />
        </div>
        <h2 className="auth-form-title">Check your email</h2>
        <p
          style={{
            color: 'var(--muted)',
            fontSize: 14,
            lineHeight: 1.6,
            marginBottom: 32,
          }}
        >
          We&apos;ve sent a password reset link to your email address.
          Please check your inbox and follow the instructions.
        </p>
        <Button
          type="primary"
          block
          size="large"
          style={{
            height: 50,
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
          onClick={() => setSubmitted(false)}
        >
          RESEND EMAIL
        </Button>
        <Link
          href="/auth/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--muted)',
            fontWeight: 600,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          <ArrowLeftOutlined /> Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-form-container">
      <h2 className="auth-form-title">Reset your password</h2>
      <p className="auth-form-subtitle">
        Enter your email and we&apos;ll send you a reset link
      </p>

      <Form
        layout="vertical"
        size="large"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          label={
            <span style={{ fontWeight: 600, fontSize: 13 }}>
              Work Email <span style={{ color: 'var(--primary)' }}>*</span>
            </span>
          }
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: 'var(--muted)' }} />}
            placeholder="e.g. john@acme.com"
            style={{ borderRadius: 10, height: 48 }}
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
            SEND RESET LINK
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center' }}>
        <Link
          href="/auth/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--muted)',
            fontWeight: 600,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          <ArrowLeftOutlined /> Back to login
        </Link>
      </div>
    </div>
  );
}

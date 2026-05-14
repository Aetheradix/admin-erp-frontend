'use client';

import React, { useState } from 'react';
import { Button, Form, Input, Result } from 'antd';
import { LockOutlined, CheckCircleFilled } from '@ant-design/icons';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = (values: Record<string, string>) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  if (success) {
    return (
      <div className="auth-form-container" style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: 'rgba(5, 150, 105, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            color: 'var(--success)',
            margin: '0 auto 24px',
          }}
        >
          <CheckCircleFilled />
        </div>
        <h2 className="auth-form-title">Password updated!</h2>
        <p
          style={{
            color: 'var(--muted)',
            fontSize: 14,
            lineHeight: 1.6,
            marginBottom: 32,
          }}
        >
          Your password has been successfully reset. You can now sign in
          with your new password.
        </p>
        <Link href="/auth/login">
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
            }}
          >
            SIGN IN
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-form-container">
      <h2 className="auth-form-title">Set new password</h2>
      <p className="auth-form-subtitle">
        Your new password must be different from previous passwords
      </p>

      <Form
        layout="vertical"
        size="large"
        onFinish={handleReset}
        requiredMark={false}
      >
        <Form.Item
          label={
            <span style={{ fontWeight: 600, fontSize: 13 }}>
              New Password{' '}
              <span style={{ color: 'var(--primary)' }}>*</span>
            </span>
          }
          name="password"
          rules={[
            { required: true, message: 'Please enter a new password' },
            { min: 8, message: 'Must be at least 8 characters' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: 'var(--muted)' }} />}
            placeholder="Min. 8 characters"
            style={{ borderRadius: 10, height: 48 }}
          />
        </Form.Item>

        <Form.Item
          label={
            <span style={{ fontWeight: 600, fontSize: 13 }}>
              Confirm Password{' '}
              <span style={{ color: 'var(--primary)' }}>*</span>
            </span>
          }
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error('Passwords do not match')
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: 'var(--muted)' }} />}
            placeholder="Re-enter new password"
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
            RESET PASSWORD
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

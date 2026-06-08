'use client';

import React from 'react';
import { Segmented } from 'antd';
import { LockOutlined, SafetyOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useLogin } from './hooks/useLogin';
import LoginForm from './components/LoginForm';
import OtpForm from './components/OtpForm';
import Sponsors from '../shared/Sponsors';

export default function Login() {
  const { authMode, setAuthMode, loading, handleLogin } = useLogin();

  return (
    <div className="auth-form-container">
      <h2 className="auth-form-title">Welcome back</h2>
      <p className="auth-form-subtitle">
        Please enter your credentials to access your workspace
      </p>

      {/* Auth Mode Toggle */}
      <Segmented
        value={authMode}
        onChange={(val) => setAuthMode(val as any)}
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
        <LoginForm loading={loading} onFinish={handleLogin} />
      ) : (
        <OtpForm loading={loading} onFinish={handleLogin} />
      )}

      <div className="auth-form-footer">
        New to AetherERP?{' '}
        <Link href="/auth/register">Get Beta Access</Link>
      </div>

      <Sponsors />
    </div>
  );
}

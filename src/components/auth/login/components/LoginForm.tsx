'use client';

import React from 'react';
import { Button, Form, Input } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { LoginFormValues } from '../types';

interface LoginFormProps {
  loading: boolean;
  onFinish: (values: LoginFormValues) => Promise<unknown> | void;
}

const LoginForm: React.FC<LoginFormProps> = ({ loading, onFinish }) => {
    return (
        <Form
            layout="vertical"
            size="large"
            onFinish={onFinish}
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
                    placeholder="e.g. agimonopoly@gmail.com"
                    style={{ borderRadius: 10, height: 48 }}
                />
            </Form.Item>

            <Form.Item
                label={
                    <span style={{ fontWeight: 600, fontSize: 13 }}>
                        Password <span style={{ color: 'var(--primary)' }}>*</span>
                    </span>
                }
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
    );
};

export default LoginForm;

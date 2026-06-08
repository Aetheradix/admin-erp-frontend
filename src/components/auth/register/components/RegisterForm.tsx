'use client';

import React from 'react';
import { Button, Checkbox, Form, Input } from 'antd';
import {
    MailOutlined,
    LockOutlined,
    UserOutlined,
    TeamOutlined,
} from '@ant-design/icons';

interface RegisterFormProps {
    loading: boolean;
    onFinish: (values: any) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ loading, onFinish }) => {
    return (
        <Form
            layout="vertical"
            size="large"
            onFinish={onFinish}
            requiredMark={false}
        >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Form.Item
                    label={
                        <span style={{ fontWeight: 600, fontSize: 13 }}>
                            First Name <span style={{ color: 'var(--primary)' }}>*</span>
                        </span>
                    }
                    name="firstName"
                    rules={[{ required: true, message: 'Required' }]}
                >
                    <Input
                        prefix={<UserOutlined style={{ color: 'var(--muted)' }} />}
                        placeholder="John"
                        style={{ borderRadius: 10, height: 48 }}
                    />
                </Form.Item>

                <Form.Item
                    label={
                        <span style={{ fontWeight: 600, fontSize: 13 }}>
                            Last Name <span style={{ color: 'var(--primary)' }}>*</span>
                        </span>
                    }
                    name="lastName"
                    rules={[{ required: true, message: 'Required' }]}
                >
                    <Input
                        placeholder="Doe"
                        style={{ borderRadius: 10, height: 48 }}
                    />
                </Form.Item>
            </div>

            <Form.Item
                label={<span style={{ fontWeight: 600, fontSize: 13 }}>Company Name</span>}
                name="company"
            >
                <Input
                    prefix={<TeamOutlined style={{ color: 'var(--muted)' }} />}
                    placeholder="Acme Inc."
                    style={{ borderRadius: 10, height: 48 }}
                />
            </Form.Item>

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
                    placeholder="john@acme.com"
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
                rules={[
                    { required: true, message: 'Please create a password' },
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
                        Confirm Password <span style={{ color: 'var(--primary)' }}>*</span>
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
                            return Promise.reject(new Error('Passwords do not match'));
                        },
                    }),
                ]}
            >
                <Input.Password
                    prefix={<LockOutlined style={{ color: 'var(--muted)' }} />}
                    placeholder="Re-enter password"
                    style={{ borderRadius: 10, height: 48 }}
                />
            </Form.Item>

            <Form.Item
                name="terms"
                valuePropName="checked"
                rules={[
                    {
                        validator: (_, value) =>
                            value
                                ? Promise.resolve()
                                : Promise.reject(new Error('Please accept the terms')),
                    },
                ]}
            >
                <Checkbox>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                        I agree to the{' '}
                        <a href="#" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                            Privacy Policy
                        </a>
                    </span>
                </Checkbox>
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
                    CREATE ACCOUNT
                </Button>
            </Form.Item>
        </Form>
    );
};

export default RegisterForm;

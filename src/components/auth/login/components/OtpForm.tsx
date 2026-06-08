'use client';

import React from 'react';
import { Button, Form, Input } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { LoginFormValues } from '../types';

interface OtpFormProps {
    loading: boolean;
    onFinish: (values: LoginFormValues) => void;
}


const OtpForm: React.FC<OtpFormProps> = ({ loading, onFinish }) => {
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
                        OTP Code <span style={{ color: 'var(--primary)' }}>*</span>
                    </span>
                }
                name="otp"
                rules={[{ required: true, message: 'Please enter the OTP' }]}
            >
                <Input.OTP length={6} style={{ width: '100%' }} />
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
    );
};

export default OtpForm;

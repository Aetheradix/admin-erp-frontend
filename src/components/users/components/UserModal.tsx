'use client';

import React from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { User } from '../types';

interface UserModalProps {
    open: boolean;
    onCancel: () => void;
    onSubmit: (data: Omit<User, 'id' | 'status' | 'lastActive' | 'avatar'>) => void;
}

export default function UserModal({ open, onCancel, onSubmit }: UserModalProps) {
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values);
            form.resetFields();
            onCancel();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title="Invite New User"
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText="Send Invitation"
            cancelText="Cancel"
            width={520}
            destroyOnClose
            modalRender={(modal) => (
                <div style={{ borderRadius: 16, overflow: 'hidden' }}>
                    {modal}
                </div>
            )}
        >
            <Form
                form={form}
                layout="vertical"
                style={{ marginTop: 20 }}
                initialValues={{ role: 'Member', department: 'Product' }}
            >
                <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[{ required: true, message: 'Please enter full name' }]}
                >
                    <Input placeholder="e.g. John Doe" size="large" style={{ borderRadius: 10 }} />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[
                        { required: true, message: 'Please enter email address' },
                        { type: 'email', message: 'Please enter a valid email' }
                    ]}
                >
                    <Input placeholder="e.g. john@company.com" size="large" style={{ borderRadius: 10 }} />
                </Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item
                        name="role"
                        label="Role"
                        rules={[{ required: true, message: 'Please select a role' }]}
                    >
                        <Select size="large" style={{ borderRadius: 10 }}>
                            <Select.Option value="Admin">Admin</Select.Option>
                            <Select.Option value="Manager">Manager</Select.Option>
                            <Select.Option value="Member">Member</Select.Option>
                            <Select.Option value="Guest">Guest</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="department"
                        label="Department"
                        rules={[{ required: true, message: 'Please select a department' }]}
                    >
                        <Select size="large" style={{ borderRadius: 10 }}>
                            <Select.Option value="Engineering">Engineering</Select.Option>
                            <Select.Option value="Product">Product</Select.Option>
                            <Select.Option value="Design">Design</Select.Option>
                            <Select.Option value="Marketing">Marketing</Select.Option>
                            <Select.Option value="Finance">Finance</Select.Option>
                        </Select>
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    );
}

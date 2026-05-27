'use client';

import React from 'react';
import { Modal, Form, Input, Select, InputNumber } from 'antd';
import { Expense } from '../types';
import { categoryColors } from '../mockData';

interface ExpenseModalProps {
    open: boolean;
    onCancel: () => void;
    onSubmit: (data: Omit<Expense, 'id' | 'status' | 'date' | 'submittedBy'>) => void;
}

export default function ExpenseModal({ open, onCancel, onSubmit }: ExpenseModalProps) {
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSubmit({
                ...values,
                amount: `$${values.amount.toLocaleString()}`,
            });
            form.resetFields();
            onCancel();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title="Create New Expense"
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText="Create Expense"
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
                initialValues={{ category: 'Other' }}
            >
                <Form.Item
                    name="description"
                    label="Expense Description"
                    rules={[{ required: true, message: 'Please enter description' }]}
                >
                    <Input placeholder="e.g. Office Snacks" size="large" style={{ borderRadius: 10 }} />
                </Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item
                        name="category"
                        label="Category"
                        rules={[{ required: true, message: 'Please select category' }]}
                    >
                        <Select size="large" style={{ borderRadius: 10 }}>
                            {Object.keys(categoryColors).map((cat) => (
                                <Select.Option key={cat} value={cat}>{cat}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="amount"
                        label="Amount"
                        rules={[{ required: true, message: 'Please enter amount' }]}
                    >
                        <InputNumber
                            prefix="$"
                            style={{ width: '100%', borderRadius: 10 }}
                            size="large"
                            placeholder="0.00"
                            min={0}
                        />
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    );
}

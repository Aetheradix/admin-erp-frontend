'use client';

import React from 'react';
import { Modal, Form, Input, Select, InputNumber, Button } from 'antd';
import { Reimbursement } from '../types';
import { categoryColors } from '../mockData';

interface ReimbursementModalProps {
    open: boolean;
    onCancel: () => void;
    onSubmit: (data: Omit<Reimbursement, 'id' | 'status' | 'date' | 'submittedBy'>) => void;
}

export default function ReimbursementModal({ open, onCancel, onSubmit }: ReimbursementModalProps) {
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
            title="New Reimbursement Request"
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText="Submit Request"
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
                    label="Description"
                    rules={[{ required: true, message: 'Please enter a description' }]}
                >
                    <Input placeholder="e.g. Business Trip to NY" size="large" style={{ borderRadius: 10 }} />
                </Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item
                        name="category"
                        label="Category"
                        rules={[{ required: true, message: 'Please select a category' }]}
                    >
                        <Select size="large" style={{ borderRadius: 10 }}>
                            {Object.keys(categoryColors).map((cat) => (
                                <Select.Option key={cat} value={cat}>
                                    {cat}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="amount"
                        label="Amount"
                        rules={[{ required: true, message: 'Please enter the amount' }]}
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

                <Form.Item
                    name="receiptUrl"
                    label="Receipt URL (Optional)"
                >
                    <Input placeholder="https://..." size="large" style={{ borderRadius: 10 }} />
                </Form.Item>
            </Form>
        </Modal>
    );
}

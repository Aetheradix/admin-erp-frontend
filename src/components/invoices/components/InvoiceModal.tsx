'use client';

import React from 'react';
import { Modal, Form, Input, InputNumber, DatePicker } from 'antd';
import { Invoice } from '../types';

interface InvoiceModalProps {
    open: boolean;
    onCancel: () => void;
    onSubmit: (data: Omit<Invoice, 'id' | 'status' | 'date'>) => void;
}

export default function InvoiceModal({ open, onCancel, onSubmit }: InvoiceModalProps) {
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSubmit({
                ...values,
                amount: `$${values.amount.toLocaleString()}`,
                dueDate: values.dueDate.format('YYYY-MM-DD'),
            });
            form.resetFields();
            onCancel();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title="Create New Invoice"
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText="Create Invoice"
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
            >
                <Form.Item
                    name="client"
                    label="Client Name"
                    rules={[{ required: true, message: 'Please enter client name' }]}
                >
                    <Input placeholder="e.g. Acme Corp" size="large" style={{ borderRadius: 10 }} />
                </Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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

                    <Form.Item
                        name="dueDate"
                        label="Due Date"
                        rules={[{ required: true, message: 'Please select due date' }]}
                    >
                        <DatePicker style={{ width: '100%', borderRadius: 10 }} size="large" />
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    );
}

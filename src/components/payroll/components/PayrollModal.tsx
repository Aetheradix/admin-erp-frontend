'use client';

import React from 'react';
import { Modal, Form, Input, Select, InputNumber } from 'antd';
import { PayrollEntry } from '../types';

interface PayrollModalProps {
    open: boolean;
    onCancel: () => void;
    onSubmit: (data: Omit<PayrollEntry, 'id' | 'status' | 'netPay'>) => void;
}

export default function PayrollModal({ open, onCancel, onSubmit }: PayrollModalProps) {
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSubmit({
                ...values,
                baseSalary: `$${values.baseSalary.toLocaleString()}`,
                bonus: `$${values.bonus.toLocaleString()}`,
                deductions: `$${values.deductions.toLocaleString()}`,
            });
            form.resetFields();
            onCancel();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title="Add Payroll Entry"
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText="Add Entry"
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
                initialValues={{ department: 'Product', bonus: 0, deductions: 0 }}
            >
                <Form.Item
                    name="name"
                    label="Employee Name"
                    rules={[{ required: true, message: 'Please enter employee name' }]}
                >
                    <Input placeholder="e.g. Mike Johnson" size="large" style={{ borderRadius: 10 }} />
                </Form.Item>

                <Form.Item
                    name="department"
                    label="Department"
                    rules={[{ required: true, message: 'Please select department' }]}
                >
                    <Select size="large" style={{ borderRadius: 10 }}>
                        <Select.Option value="Engineering">Engineering</Select.Option>
                        <Select.Option value="Product">Product</Select.Option>
                        <Select.Option value="Design">Design</Select.Option>
                        <Select.Option value="Marketing">Marketing</Select.Option>
                        <Select.Option value="Finance">Finance</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="baseSalary"
                    label="Base Salary"
                    rules={[{ required: true, message: 'Please enter base salary' }]}
                >
                    <InputNumber
                        prefix="$"
                        style={{ width: '100%', borderRadius: 10 }}
                        size="large"
                        placeholder="0.00"
                        min={0}
                    />
                </Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item
                        name="bonus"
                        label="Bonus"
                        rules={[{ required: true, message: 'Please enter bonus amount' }]}
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
                        name="deductions"
                        label="Deductions"
                        rules={[{ required: true, message: 'Please enter deduction amount' }]}
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

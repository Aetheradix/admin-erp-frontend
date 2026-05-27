'use client';

import React from 'react';
import { Modal, Form, Input, Select, InputNumber } from 'antd';
import { InventoryItem } from '../types';

interface ItemModalProps {
    open: boolean;
    onCancel: () => void;
    onSubmit: (data: Omit<InventoryItem, 'id' | 'status'>) => void;
}

export default function ItemModal({ open, onCancel, onSubmit }: ItemModalProps) {
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSubmit({
                ...values,
                price: `$${values.price.toLocaleString()}`,
            });
            form.resetFields();
            onCancel();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title="Add New Inventory Item"
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText="Add Item"
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
                initialValues={{ category: 'General' }}
            >
                <Form.Item
                    name="name"
                    label="Item Name"
                    rules={[{ required: true, message: 'Please enter item name' }]}
                >
                    <Input placeholder="e.g. MacBook Pro M3" size="large" style={{ borderRadius: 10 }} />
                </Form.Item>

                <Form.Item
                    name="sku"
                    label="SKU"
                    rules={[{ required: true, message: 'Please enter SKU' }]}
                >
                    <Input placeholder="e.g. LAP-MBP-001" size="large" style={{ borderRadius: 10 }} />
                </Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item
                        name="category"
                        label="Category"
                        rules={[{ required: true, message: 'Please select category' }]}
                    >
                        <Select size="large" style={{ borderRadius: 10 }}>
                            <Select.Option value="Electronics">Electronics</Select.Option>
                            <Select.Option value="Furniture">Furniture</Select.Option>
                            <Select.Option value="Office Supplies">Office Supplies</Select.Option>
                            <Select.Option value="General">General</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="price"
                        label="Price"
                        rules={[{ required: true, message: 'Please enter price' }]}
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
                    name="quantity"
                    label="Initial Quantity"
                    rules={[{ required: true, message: 'Please enter quantity' }]}
                >
                    <InputNumber
                        style={{ width: '100%', borderRadius: 10 }}
                        size="large"
                        placeholder="0"
                        min={0}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}

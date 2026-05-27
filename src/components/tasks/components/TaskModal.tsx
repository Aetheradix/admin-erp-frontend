'use client';

import React from 'react';
import { Modal, Form, Input, Select, DatePicker } from 'antd';
import { Task } from '../types';

interface TaskModalProps {
    open: boolean;
    onCancel: () => void;
    onSubmit: (data: Omit<Task, 'id' | 'status'>) => void;
}

export default function TaskModal({ open, onCancel, onSubmit }: TaskModalProps) {
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSubmit({
                ...values,
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
            title="Create New Task"
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText="Create Task"
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
                initialValues={{ priority: 'Medium', project: 'General' }}
            >
                <Form.Item
                    name="title"
                    label="Task Title"
                    rules={[{ required: true, message: 'Please enter task title' }]}
                >
                    <Input placeholder="e.g. Design System Audit" size="large" style={{ borderRadius: 10 }} />
                </Form.Item>

                <Form.Item
                    name="assignee"
                    label="Assignee"
                    rules={[{ required: true, message: 'Please select assignee' }]}
                >
                    <Input placeholder="e.g. Sarah Wilson" size="large" style={{ borderRadius: 10 }} />
                </Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item
                        name="priority"
                        label="Priority"
                        rules={[{ required: true, message: 'Please select priority' }]}
                    >
                        <Select size="large" style={{ borderRadius: 10 }}>
                            <Select.Option value="Critical">Critical</Select.Option>
                            <Select.Option value="High">High</Select.Option>
                            <Select.Option value="Medium">Medium</Select.Option>
                            <Select.Option value="Low">Low</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="dueDate"
                        label="Due Date"
                        rules={[{ required: true, message: 'Please select due date' }]}
                    >
                        <DatePicker style={{ width: '100%', borderRadius: 10 }} size="large" />
                    </Form.Item>
                </div>

                <Form.Item
                    name="project"
                    label="Project"
                    rules={[{ required: true, message: 'Please enter project name' }]}
                >
                    <Input placeholder="e.g. Internal Tooling" size="large" style={{ borderRadius: 10 }} />
                </Form.Item>
            </Form>
        </Modal>
    );
}

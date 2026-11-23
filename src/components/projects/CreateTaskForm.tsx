import React from 'react';
import { Form, Input, Select, Button, Row, Col } from 'antd';
import { EmployeeSelector } from './EmployeeSelector';
import { departmentService } from '@/services/departmentService';

const { TextArea } = Input;

export interface CreateTaskFormValues {
  title: string;
  description?: string;
  assigned_to?: number;
  department_id?: number;
  priority?: 'High' | 'Medium' | 'Low';
  due_date?: string;
  project_id?: number;
}

interface CreateTaskFormProps {
  projectId?: number;
  onFinish: (values: CreateTaskFormValues) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
  projectId,
  onFinish,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const departments = departmentService.getDepartments();

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        priority: 'Medium',
        project_id: projectId,
        due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      }}>
      <Form.Item
        name="title"
        label="Task Title"
        rules={[{ required: true, message: 'Please enter task title' }]}>
        <Input placeholder="What needs to be done?" className="rounded-xl" />
      </Form.Item>

      <Row gutter={12}>
        <Col span={12}>
          <Form.Item name="department_id" label="Department">
            <Select
              allowClear
              placeholder="Select department"
              options={departments.map((d) => ({ value: d.id, label: d.name }))}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="assigned_to" label="Assignee">
            <EmployeeSelector placeholder="Select employee" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="description" label="Description">
        <TextArea rows={3} placeholder="Add detailed requirements..." className="rounded-xl" />
      </Form.Item>

      <Row gutter={12}>
        <Col span={12}>
          <Form.Item name="priority" label="Priority">
            <Select
              options={[
                { value: 'High', label: 'High' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Low', label: 'Low' },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="due_date" label="Due Date">
            <Input type="date" className="rounded-xl" />
          </Form.Item>
        </Col>
      </Row>

      <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle mt-4">
        {onCancel && (
          <Button onClick={onCancel} className="rounded-xl">
            Cancel
          </Button>
        )}
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          className="rounded-xl font-bold shadow-xs">
          Create Task
        </Button>
      </div>
    </Form>
  );
};

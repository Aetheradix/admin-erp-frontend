import React from 'react';
import { Form, Input, Select, Button, Row, Col } from 'antd';
import { departmentService } from '@/services/departmentService';
import { EmployeeSelector } from './EmployeeSelector';

const { TextArea } = Input;

export interface CreateProjectFormValues {
  project_name: string;
  project_key?: string;
  description?: string;
  department_id?: number;
  owner_user_id?: number;
  project_manager_id?: number;
  start_date?: string;
  end_date?: string;
  methodology?: string;
}

interface CreateProjectFormProps {
  onFinish: (values: CreateProjectFormValues) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
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
        methodology: 'scrum',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
      }}>
      <Form.Item
        name="project_name"
        label="Project Name"
        rules={[{ required: true, message: 'Please enter project name' }]}>
        <Input placeholder="e.g. Cedar Client Portal & Billing Suite" className="rounded-xl" />
      </Form.Item>

      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            name="project_key"
            label="Project Key (2–5 chars)"
            rules={[{ required: true, message: 'Enter a project key' }]}>
            <Input
              maxLength={10}
              placeholder="e.g. CDR"
              className="rounded-xl font-mono uppercase"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="department_id" label="Department">
            <Select
              placeholder="Select department"
              allowClear
              options={departments.map((d) => ({
                value: d.id,
                label: d.name,
              }))}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={12}>
        <Col span={12}>
          <Form.Item name="owner_user_id" label="Project Owner">
            <EmployeeSelector placeholder="Select Project Owner" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="project_manager_id" label="Project Manager">
            <EmployeeSelector placeholder="Select Delivery Manager" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="description" label="Scope & Description">
        <TextArea
          rows={3}
          placeholder="Scope, deliverables, key targets..."
          className="rounded-xl"
        />
      </Form.Item>

      <Row gutter={12}>
        <Col span={12}>
          <Form.Item name="start_date" label="Start Date">
            <Input type="date" className="rounded-xl" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="end_date" label="Target Due Date">
            <Input type="date" className="rounded-xl" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="methodology" label="Methodology">
        <Select
          options={[
            { value: 'scrum', label: 'Scrum' },
            { value: 'kanban', label: 'Kanban' },
            { value: 'waterfall', label: 'Waterfall' },
            { value: 'timeline_first', label: 'Timeline First' },
          ]}
        />
      </Form.Item>

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
          Create Project
        </Button>
      </div>
    </Form>
  );
};

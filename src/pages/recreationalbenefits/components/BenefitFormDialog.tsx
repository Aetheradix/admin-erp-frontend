import { useEffect } from 'react';
import { Modal, Button, Input, Select, Form, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

import type {
  RecreationalBenefit,
  RecreationalBenefitType,
  RecreationalBenefitFrequency,
  CreateRecreationalBenefitRequest,
  UpdateRecreationalBenefitRequest,
} from '../types/index';

import {
  useCreateRecreationalBenefitMutation,
  useUpdateRecreationalBenefitMutation,
} from '@/store/api/recreationalbenefitsSlice';

interface BenefitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  benefit?: RecreationalBenefit | null;
}

const benefitTypes: RecreationalBenefitType[] = [
  'Food Delivery',
  'Outstation Travel',
  'Gym Membership',
  'OTT Subscription',
  'Other',
];

const frequencies: RecreationalBenefitFrequency[] = ['One-Time', 'Monthly', 'Quarterly', 'Yearly'];

// Helper to convert object { a: "1" } to array [{ key: "a", value: "1" }]
const objectToPairs = (obj?: Record<string, any>) =>
  obj ? Object.entries(obj).map(([key, value]) => ({ key, value })) : [];

// Helper to convert array [{ key: "a", value: "1" }] back to object { a: "1" }
const pairsToObject = (pairs?: { key: string; value: any }[]) => {
  if (!pairs || !Array.isArray(pairs)) return {};
  return pairs.reduce(
    (acc, { key, value }) => {
      if (key?.trim()) acc[key.trim()] = value;
      return acc;
    },
    {} as Record<string, any>
  );
};

export default function BenefitFormDialog({ open, onOpenChange, benefit }: BenefitFormDialogProps) {
  const [form] = Form.useForm();
  const isEdit = Boolean(benefit);

  const [createBenefit, createState] = useCreateRecreationalBenefitMutation();
  const [updateBenefit, updateState] = useUpdateRecreationalBenefitMutation();

  useEffect(() => {
    if (!open) return;

    if (benefit) {
      form.setFieldsValue({
        benefit_name: benefit.benefit_name,
        benefit_type: benefit.benefit_type,
        benefit_description: benefit.benefit_description ?? '',
        benefit_value: benefit.benefit_value ?? null,
        currency: benefit.currency ?? 'INR',
        usage_limit: benefit.usage_limit ?? null,
        usage_frequency: benefit.usage_frequency ?? 'One-Time',
        valid_from: benefit.valid_from ?? null,
        valid_until: benefit.valid_until ?? null,
        eligibility: objectToPairs(benefit.eligibility),
        configuration: objectToPairs(benefit.configuration),
      });
    } else {
      form.resetFields();
    }
  }, [open, benefit, form]);

  const handleSubmit = async (values: any) => {
    const payload: CreateRecreationalBenefitRequest = {
      ...values,
      eligibility: pairsToObject(values.eligibility),
      configuration: pairsToObject(values.configuration),
    };

    try {
      if (benefit) {
        await updateBenefit({
          id: benefit.benefit_id,
          data: payload as UpdateRecreationalBenefitRequest,
        }).unwrap();
      } else {
        await createBenefit(payload).unwrap();
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save recreational benefit', error);
    }
  };

  const isSaving = createState.isLoading || updateState.isLoading;

  return (
    <Modal
      title={isEdit ? 'Edit Recreational Benefit' : 'Add Recreational Benefit'}
      open={open}
      onCancel={() => onOpenChange(false)}
      footer={null}
      width={720}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          benefit_type: 'Other',
          currency: 'INR',
          usage_frequency: 'One-Time',
        }}
        className="pt-2"
      >
        <div className="grid gap-x-4 md:grid-cols-2">
          {/* Benefit Name */}
          <Form.Item
            name="benefit_name"
            label="Benefit Name"
            rules={[{ required: true, message: 'Please enter a benefit name' }]}
            className="md:col-span-2"
          >
            <Input placeholder="e.g. Spotify Premium" />
          </Form.Item>

          {/* Benefit Type */}
          <Form.Item name="benefit_type" label="Benefit Type" rules={[{ required: true }]}>
            <Select
              options={benefitTypes.map((type) => ({
                label: type,
                value: type,
              }))}
            />
          </Form.Item>

          {/* Frequency */}
          <Form.Item name="usage_frequency" label="Frequency">
            <Select
              options={frequencies.map((freq) => ({
                label: freq,
                value: freq,
              }))}
            />
          </Form.Item>

          {/* Description */}
          <Form.Item name="benefit_description" label="Description" className="md:col-span-2">
            <Input.TextArea rows={3} placeholder="Describe the benefit..." />
          </Form.Item>

          {/* Benefit Value */}
          <Form.Item name="benefit_value" label="Benefit Value">
            <Input type="number" min={0} placeholder="0" />
          </Form.Item>

          {/* Currency */}
          <Form.Item name="currency" label="Currency">
            <Input placeholder="INR" />
          </Form.Item>

          {/* Usage Limit */}
          <Form.Item name="usage_limit" label="Usage Limit">
            <Input type="number" min={0} placeholder="Unlimited if empty" />
          </Form.Item>

          {/* Valid From */}
          <Form.Item name="valid_from" label="Valid From">
            <Input type="date" />
          </Form.Item>

          {/* Valid Until */}
          <Form.Item name="valid_until" label="Valid Until" className="md:col-span-2">
            <Input type="date" />
          </Form.Item>
        </div>

        {/* Dynamic Key-Value Pairs for Eligibility */}
        <Form.Item label="Eligibility Rules">
          <Form.List name="eligibility">
            {(fields, { add, remove }) => (
              <div className="space-y-2">
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} className="flex w-full" align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'key']}
                      rules={[{ required: true, message: 'Key required' }]}
                      className="mb-0 flex-1"
                    >
                      <Input placeholder="Rule Key (e.g. min_tenure)" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'value']}
                      rules={[{ required: true, message: 'Value required' }]}
                      className="mb-0 flex-1"
                    >
                      <Input placeholder="Value (e.g. 6 months)" />
                    </Form.Item>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                    />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Eligibility Rule
                </Button>
              </div>
            )}
          </Form.List>
        </Form.Item>

        {/* Dynamic Key-Value Pairs for Configuration */}
        <Form.Item label="Configuration Metadata">
          <Form.List name="configuration">
            {(fields, { add, remove }) => (
              <div className="space-y-2">
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} className="flex w-full" align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'key']}
                      rules={[{ required: true, message: 'Key required' }]}
                      className="mb-0 flex-1"
                    >
                      <Input placeholder="Config Key (e.g. provider)" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'value']}
                      rules={[{ required: true, message: 'Value required' }]}
                      className="mb-0 flex-1"
                    >
                      <Input placeholder="Value (e.g. Spotify)" />
                    </Form.Item>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                    />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Configuration Item
                </Button>
              </div>
            )}
          </Form.List>
        </Form.Item>

        {/* Modal Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isSaving}>
            {isEdit ? 'Update Benefit' : 'Create Benefit'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

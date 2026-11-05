import React, { useEffect } from 'react';
import { Modal, Form, Select, Input, DatePicker, Alert, Button } from 'antd';
import dayjs from 'dayjs';
import { GitCommit } from 'lucide-react';
import {
  useReplaceManagerMutation,
  type HierarchyNodeUser,
} from '@/store/api/organizationApiSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';

interface ReplaceManagerModalProps {
  open: boolean;
  onClose: () => void;
  preselectedManagerId?: number | null;
  flatUsers: HierarchyNodeUser[];
  onSuccess?: () => void;
}

export const ReplaceManagerModal: React.FC<ReplaceManagerModalProps> = ({
  open,
  onClose,
  preselectedManagerId,
  flatUsers,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [replaceManager, { isLoading }] = useReplaceManagerMutation();

  const currentManagerId = Form.useWatch('currentManagerId', form) || preselectedManagerId;
  const newManagerId = Form.useWatch('newManagerId', form);

  const currentManagerObj = flatUsers.find((u) => u.id === currentManagerId);
  const newManagerObj = flatUsers.find((u) => u.id === newManagerId);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        currentManagerId: preselectedManagerId || undefined,
        newManagerId: undefined,
        reason: '',
        effectiveDate: dayjs(),
      });
    }
  }, [open, preselectedManagerId, form]);

  const handleSubmit = async (values: any) => {
    try {
      const effectiveDateStr = values.effectiveDate
        ? dayjs(values.effectiveDate).format('YYYY-MM-DD')
        : undefined;

      const res = await replaceManager({
        currentManagerId: Number(values.currentManagerId),
        newManagerId: Number(values.newManagerId),
        reason: values.reason?.trim(),
        effectiveDate: effectiveDateStr,
      }).unwrap();

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: res.message || 'Manager replaced successfully',
      });
      onClose();
      onSuccess?.();
    } catch (err: any) {
      showToast({
        severity: 'error',
        summary: 'Replacement Failed',
        detail: err?.data?.message || 'Could not replace manager',
      });
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-foreground font-black">
          <GitCommit size={18} className="text-primary" />
          <span>Replace Manager (Succession)</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="pt-2">
        <Alert
          message="Atomic Succession & Hierarchy Swap"
          description="Successor (Manager B) inherits Outgoing Manager's supervisor (parent) and all direct reporting lines (children) in a single atomic transaction."
          type="warning"
          showIcon
          className="mb-4"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item
            label="Current Manager to Replace"
            name="currentManagerId"
            rules={[{ required: true, message: 'Select manager being replaced' }]}>
            <Select
              showSearch
              placeholder="Select current manager..."
              filterOption={(input, opt) =>
                (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={flatUsers
                .filter((u) => u.directReports && u.directReports.length > 0)
                .map((m) => ({
                  value: m.id,
                  label: `${m.username} (${m.directReports.length} direct reports)`,
                }))}
            />
          </Form.Item>

          <Form.Item
            label="Successor / New Manager"
            name="newManagerId"
            rules={[{ required: true, message: 'Select successor manager' }]}>
            <Select
              showSearch
              placeholder="Select successor..."
              filterOption={(input, opt) =>
                (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={flatUsers
                .filter((u) => u.id !== currentManagerId)
                .map((u) => ({
                  value: u.id,
                  label: `${u.username} (${u.role})`,
                }))}
            />
          </Form.Item>
        </div>

        {/* Transition Summary Preview */}
        {currentManagerObj && newManagerObj && (
          <div className="mb-4 p-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs space-y-2">
            <span className="font-bold text-foreground block">Hierarchy Inheritance Preview</span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-surface border border-border-subtle">
                <span className="text-muted block">Supervisor Inherited:</span>
                <strong className="text-foreground">
                  {currentManagerObj.reporting_manager_name || 'None (Top Level)'}
                </strong>
              </div>
              <div className="p-2 rounded-lg bg-surface border border-border-subtle">
                <span className="text-muted block">Reports Transferred:</span>
                <strong className="text-foreground">
                  {currentManagerObj.directReports?.length || 0} Employees
                </strong>
              </div>
            </div>
          </div>
        )}

        <Form.Item
          label="Effective Date"
          name="effectiveDate"
          rules={[{ required: true, message: 'Effective date is required' }]}>
          <DatePicker className="w-full" format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          label="Mandatory Reason for Succession"
          name="reason"
          rules={[
            { required: true, message: 'Reason is required for audit verification' },
            { min: 5, message: 'Please provide at least 5 characters' },
          ]}>
          <Input.TextArea
            rows={3}
            placeholder="Document why this leadership position replacement is occurring (e.g. Promotion, Resignation, Succession Planning)..."
          />
        </Form.Item>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            disabled={!newManagerId || !currentManagerId}
            style={{ backgroundColor: '#E8583A' }}>
            Execute Manager Replacement
          </Button>
        </div>
      </Form>
    </Modal>
  );
};


import React, { useEffect, useMemo } from 'react';
import { Modal, Form, Select, Input, DatePicker, Alert, Button } from 'antd';
import dayjs from 'dayjs';
import { UserCheck, AlertTriangle } from 'lucide-react';
import {
  useUpdateReportingManagerMutation,
  type HierarchyNodeUser,
} from '@/store/api/organizationApiSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';

interface ChangeManagerModalProps {
  open: boolean;
  onClose: () => void;
  selectedUser: HierarchyNodeUser | null;
  flatUsers: HierarchyNodeUser[];
  onSuccess?: () => void;
}

export const ChangeManagerModal: React.FC<ChangeManagerModalProps> = ({
  open,
  onClose,
  selectedUser,
  flatUsers,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [updateReportingManager, { isLoading }] = useUpdateReportingManagerMutation();

  const selectedTargetId = Form.useWatch('userId', form) || selectedUser?.id;
  const selectedNewManagerId = Form.useWatch('reportingManagerId', form);

  // Find all subordinate IDs to prevent cycles in client preview
  const subordinateIds = useMemo(() => {
    if (!selectedTargetId) return new Set<number>();
    const target = flatUsers.find((u) => u.id === selectedTargetId);
    if (!target) return new Set<number>();

    const ids = new Set<number>();
    const collect = (node: HierarchyNodeUser) => {
      if (node.directReports) {
        node.directReports.forEach((child) => {
          ids.add(child.id);
          collect(child);
        });
      }
    };
    collect(target);
    return ids;
  }, [selectedTargetId, flatUsers]);

  const hasCycleWarning = selectedNewManagerId && subordinateIds.has(selectedNewManagerId);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        userId: selectedUser?.id || undefined,
        reportingManagerId: selectedUser?.reporting_manager_id || undefined,
        reason: '',
        effectiveDate: dayjs(),
      });
    }
  }, [open, selectedUser, form]);

  const handleSubmit = async (values: any) => {
    try {
      const effectiveDateStr = values.effectiveDate
        ? dayjs(values.effectiveDate).format('YYYY-MM-DD')
        : undefined;

      await updateReportingManager({
        userId: Number(values.userId),
        reportingManagerId: values.reportingManagerId ? Number(values.reportingManagerId) : null,
        reason: values.reason?.trim(),
        effectiveDate: effectiveDateStr,
      }).unwrap();

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Reporting manager updated successfully',
      });
      onClose();
      onSuccess?.();
    } catch (err: any) {
      showToast({
        severity: 'error',
        summary: 'Update Failed',
        detail: err?.data?.message || 'Could not update manager line',
      });
    }
  };

  const targetUserObj = flatUsers.find((u) => u.id === selectedTargetId);

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-foreground font-black">
          <UserCheck size={18} className="text-primary" />
          <span>Change Reporting Manager</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={560}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="pt-2">
        {targetUserObj && (
          <div className="mb-4 p-3 rounded-xl bg-surface-subtle border border-border-subtle flex items-center justify-between text-xs">
            <div>
              <span className="text-muted block">Selected Employee</span>
              <strong className="text-foreground text-sm">{targetUserObj.username}</strong>
              <span className="text-muted block text-[11px]">{targetUserObj.email}</span>
            </div>
            <div className="text-right">
              <span className="text-muted block">Current Manager</span>
              <span className="font-bold text-foreground">
                {targetUserObj.reporting_manager_name || 'None (Top Level)'}
              </span>
            </div>
          </div>
        )}

        <Form.Item
          label="Target Employee"
          name="userId"
          rules={[{ required: true, message: 'Please select an employee' }]}>
          <Select
            showSearch
            placeholder="Select employee..."
            filterOption={(input, opt) =>
              (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={flatUsers.map((u) => ({
              value: u.id,
              label: `${u.username} (${u.email}) - ${u.designation || u.role}`,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="New Reporting Manager"
          name="reportingManagerId"
          help="Leave empty if this employee reports directly to Board/Executive (Top-level).">
          <Select
            showSearch
            allowClear
            placeholder="Select new manager (or clear for top-level)..."
            filterOption={(input, opt) =>
              (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={flatUsers
              .filter((u) => u.id !== selectedTargetId)
              .map((u) => ({
                value: u.id,
                label: `${u.username} (${u.email}) - ${u.designation || u.role}`,
              }))}
          />
        </Form.Item>

        {hasCycleWarning && (
          <Alert
            message="Circular Dependency Warning"
            description="The selected manager is currently a direct or indirect subordinate of this employee. The backend Cycle Guard will block cyclical assignments."
            type="error"
            showIcon
            icon={<AlertTriangle size={16} />}
            className="mb-4"
          />
        )}

        <Form.Item
          label="Effective Date"
          name="effectiveDate"
          rules={[{ required: true, message: 'Effective date is required' }]}>
          <DatePicker className="w-full" format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          label="Reason for Change (Audit Requirement)"
          name="reason"
          rules={[
            { required: true, message: 'Reason is mandatory for organizational audit' },
            { min: 5, message: 'Please provide at least 5 characters explanation' },
          ]}>
          <Input.TextArea
            rows={3}
            placeholder="Explain why this reporting line is being modified (e.g. Annual Reorganization, Team Transfer)..."
          />
        </Form.Item>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            style={{ backgroundColor: '#E8583A' }}
            disabled={hasCycleWarning}>
            Confirm Manager Change
          </Button>
        </div>
      </Form>
    </Modal>
  );
};


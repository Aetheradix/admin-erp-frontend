import React, { useEffect } from 'react';
import { Modal, Form, Select, Input, DatePicker, Alert, Button, Badge } from 'antd';
import dayjs from 'dayjs';
import { UserMinus } from 'lucide-react';
import {
  useOffboardRollupMutation,
  type HierarchyNodeUser,
} from '@/store/api/organizationApiSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';

interface OffboardRollupModalProps {
  open: boolean;
  onClose: () => void;
  preselectedUserId?: number | null;
  flatUsers: HierarchyNodeUser[];
  onSuccess?: () => void;
}

export const OffboardRollupModal: React.FC<OffboardRollupModalProps> = ({
  open,
  onClose,
  preselectedUserId,
  flatUsers,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [offboardRollup, { isLoading }] = useOffboardRollupMutation();

  const terminatingUserId = Form.useWatch('terminatingUserId', form) || preselectedUserId;

  const terminatingUserObj = flatUsers.find((u) => u.id === terminatingUserId);
  const directReports = terminatingUserObj?.directReports || [];
  const grandparentManager = flatUsers.find(
    (u) => u.id === terminatingUserObj?.reporting_manager_id
  );

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        terminatingUserId: preselectedUserId || undefined,
        reason: '',
        effectiveDate: dayjs(),
      });
    }
  }, [open, preselectedUserId, form]);

  const handleSubmit = async (values: any) => {
    try {
      const effectiveDateStr = values.effectiveDate
        ? dayjs(values.effectiveDate).format('YYYY-MM-DD')
        : undefined;

      const res = await offboardRollup({
        terminatingUserId: Number(values.terminatingUserId),
        reason: values.reason?.trim(),
        effectiveDate: effectiveDateStr,
      }).unwrap();

      showToast({
        severity: 'success',
        summary: 'Offboard Rollup Complete',
        detail: res.message || 'Direct reports successfully rolled up',
      });
      onClose();
      onSuccess?.();
    } catch (err: any) {
      showToast({
        severity: 'error',
        summary: 'Rollup Failed',
        detail: err?.data?.message || 'Could not complete offboard rollup',
      });
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-rose-600 font-black">
          <UserMinus size={18} />
          <span>Offboard Rollup</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="pt-2">
        <Alert
          message="Employee Deactivation & Tree Rollup"
          description="The offboarded employee will have their direct reports automatically re-assigned to the grandparent manager to maintain continuous management line coverage."
          type="error"
          showIcon
          className="mb-4"
        />

        <Form.Item
          label="Employee / Manager to Offboard"
          name="terminatingUserId"
          rules={[{ required: true, message: 'Please select employee' }]}>
          <Select
            showSearch
            placeholder="Select employee to offboard..."
            filterOption={(input, opt) =>
              (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={flatUsers.map((u) => ({
              value: u.id,
              label: `${u.username} (${u.email}) - ${u.directReports?.length || 0} direct reports`,
            }))}
          />
        </Form.Item>

        {terminatingUserObj && (
          <div className="mb-4 p-3.5 rounded-xl bg-surface-subtle border border-border-subtle space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <div>
                <span className="text-muted block text-[11px]">Grandparent Receiver:</span>
                <strong className="text-foreground text-sm">
                  {grandparentManager ? (
                    `${grandparentManager.username} (${grandparentManager.role})`
                  ) : (
                    <span className="text-amber-600">None (Direct reports will become top-level)</span>
                  )}
                </strong>
              </div>
              <Badge count={directReports.length} style={{ backgroundColor: '#E8583A' }} />
            </div>

            <div>
              <span className="text-muted block text-[11px] mb-1.5 font-bold">
                Affected Direct Reports ({directReports.length}):
              </span>
              {directReports.length === 0 ? (
                <span className="text-muted italic">No direct reports currently under this employee.</span>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto no-scrollbar">
                  {directReports.map((r) => (
                    <span
                      key={r.id}
                      className="px-2 py-0.5 rounded bg-surface border border-border-subtle text-[11px] font-medium text-foreground">
                      {r.username}
                    </span>
                  ))}
                </div>
              )}
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
          label="Mandatory Offboarding Reason (Audit Log)"
          name="reason"
          rules={[
            { required: true, message: 'Reason is required for compliance audit' },
            { min: 5, message: 'Please provide at least 5 characters' },
          ]}>
          <Input.TextArea
            rows={3}
            placeholder="Document reason for separation and automatic hierarchical rollup..."
          />
        </Form.Item>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            danger
            htmlType="submit"
            loading={isLoading}
            disabled={!terminatingUserId}>
            Confirm Offboard & Rollup
          </Button>
        </div>
      </Form>
    </Modal>
  );
};


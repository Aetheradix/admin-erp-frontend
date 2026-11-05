import React, { useEffect, useMemo } from 'react';
import { Modal, Form, Select, Input, DatePicker, Alert, Button, Badge } from 'antd';
import dayjs from 'dayjs';
import { Users } from 'lucide-react';
import {
  useBulkHandoverMutation,
  type HierarchyNodeUser,
} from '@/store/api/organizationApiSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';

interface BulkHandoverModalProps {
  open: boolean;
  onClose: () => void;
  preselectedManagerId?: number | null;
  flatUsers: HierarchyNodeUser[];
  onSuccess?: () => void;
}

export const BulkHandoverModal: React.FC<BulkHandoverModalProps> = ({
  open,
  onClose,
  preselectedManagerId,
  flatUsers,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [bulkHandover, { isLoading }] = useBulkHandoverMutation();

  const fromManagerId = Form.useWatch('fromManagerId', form) || preselectedManagerId;
  const toManagerId = Form.useWatch('toManagerId', form);

  // Managers with reports
  const managersWithReports = useMemo(() => {
    return flatUsers.filter((u) => u.directReports && u.directReports.length > 0);
  }, [flatUsers]);

  // Current direct reports of fromManager
  const affectedReports = useMemo(() => {
    if (!fromManagerId) return [];
    const mgr = flatUsers.find((u) => u.id === fromManagerId);
    return mgr?.directReports || [];
  }, [fromManagerId, flatUsers]);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        fromManagerId: preselectedManagerId || undefined,
        toManagerId: undefined,
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

      const res = await bulkHandover({
        fromManagerId: Number(values.fromManagerId),
        toManagerId: Number(values.toManagerId),
        reason: values.reason?.trim(),
        effectiveDate: effectiveDateStr,
      }).unwrap();

      showToast({
        severity: 'success',
        summary: 'Handover Completed',
        detail: res.message || 'Team successfully transferred',
      });
      onClose();
      onSuccess?.();
    } catch (err: any) {
      showToast({
        severity: 'error',
        summary: 'Handover Failed',
        detail: err?.data?.message || 'Could not complete team handover',
      });
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-foreground font-black">
          <Users size={18} className="text-primary" />
          <span>Bulk Team Handover</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="pt-2">
        <Alert
          message="Atomic Team Transfer"
          description="Transfers all direct reports from Manager A to Manager B simultaneously. Any existing sub-teams and subordinate tiers remain preserved."
          type="info"
          showIcon
          className="mb-4"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item
            label="Source Manager (From)"
            name="fromManagerId"
            rules={[{ required: true, message: 'Select outgoing manager' }]}>
            <Select
              showSearch
              placeholder="Select current manager..."
              filterOption={(input, opt) =>
                (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={managersWithReports.map((m) => ({
                value: m.id,
                label: `${m.username} (${m.directReports.length} direct reports)`,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Destination Manager (To)"
            name="toManagerId"
            rules={[{ required: true, message: 'Select destination manager' }]}>
            <Select
              showSearch
              placeholder="Select receiving manager..."
              filterOption={(input, opt) =>
                (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={flatUsers
                .filter((u) => u.id !== fromManagerId)
                .map((u) => ({
                  value: u.id,
                  label: `${u.username} (${u.role})`,
                }))}
            />
          </Form.Item>
        </div>

        {/* Affected direct reports preview */}
        {fromManagerId && (
          <div className="mb-4 p-3 rounded-xl bg-surface-subtle border border-border-subtle">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-foreground">
                Affected Direct Reports ({affectedReports.length})
              </span>
              <Badge count={affectedReports.length} overflowCount={99} style={{ backgroundColor: '#E8583A' }} />
            </div>

            {affectedReports.length === 0 ? (
              <p className="text-xs text-muted">This manager currently has 0 direct reports.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
                {affectedReports.map((r) => (
                  <span
                    key={r.id}
                    className="px-2 py-1 rounded-lg bg-surface border border-border-subtle text-xs text-foreground font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{r.username}</span>
                    <span className="text-[10px] text-muted">({r.designation || r.role})</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <Form.Item
          label="Effective Date"
          name="effectiveDate"
          rules={[{ required: true, message: 'Effective date is required' }]}>
          <DatePicker className="w-full" format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          label="Mandatory Reason for Bulk Handover"
          name="reason"
          rules={[
            { required: true, message: 'Reason is required for audit verification' },
            { min: 5, message: 'Please provide at least 5 characters' },
          ]}>
          <Input.TextArea
            rows={3}
            placeholder="Explain the organizational restructuring or transition requirement (e.g. Department reorganization, Manager role change)..."
          />
        </Form.Item>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            disabled={affectedReports.length === 0 || !toManagerId}
            style={{ backgroundColor: '#E8583A' }}>
            Execute Bulk Handover
          </Button>
        </div>
      </Form>
    </Modal>
  );
};


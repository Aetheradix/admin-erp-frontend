import { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Checkbox,
  Button as AntButton,
  Popconfirm,
} from 'antd';
import {
  useGetLeavePoliciesQuery,
  useGetLeaveTypesQuery,
  useCreateLeavePolicyMutation,
  useDeleteLeavePolicyMutation,
} from '@/store/api/leaveSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { Button } from '@/components/ui/primitives/Button';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Repeat,
} from 'lucide-react';

export function LeavePolicyStudio({ isAdmin }: { isAdmin: boolean }) {
  const { data: policies = [] } = useGetLeavePoliciesQuery();
  const { data: leaveTypes = [] } = useGetLeaveTypesQuery();

  const [createPolicy, { isLoading: isCreating }] = useCreateLeavePolicyMutation();
  const [deletePolicy] = useDeleteLeavePolicyMutation();

  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();

  const handleCreatePolicy = async (values: any) => {
    try {
      await createPolicy({
        leave_type_id: Number(values.leave_type_id),
        name: values.name.trim(),
        yearly_quota: Number(values.yearly_quota),
        accrual_frequency: values.accrual_frequency,
        apply_sandwich_rule: values.apply_sandwich_rule ? 1 : 0,
        allow_half_day: values.allow_half_day ? 1 : 0,
        allow_carry_forward: values.allow_carry_forward ? 1 : 0,
        max_carry_forward_days: Number(values.max_carry_forward_days || 0),
        allow_encashment: 0,
        max_encashment_days: 0,
        max_consecutive_days: values.max_consecutive_days ? Number(values.max_consecutive_days) : null,
        min_notice_days: Number(values.min_notice_days || 0),
      }).unwrap();

      showToast({ severity: 'success', summary: 'Success', detail: 'Leave policy created successfully' });
      setShowModal(false);
      form.resetFields();
    } catch (err: any) {
      showToast({ severity: 'error', summary: 'Failed', detail: err?.data?.message || 'Could not save policy' });
    }
  };

  const handleDeletePolicy = async (id: number, policyName: string) => {
    try {
      await deletePolicy(id).unwrap();
      showToast({ severity: 'info', summary: 'Removed', detail: `Policy "${policyName}" deleted` });
    } catch (err: any) {
      showToast({ severity: 'error', summary: 'Failed', detail: err?.data?.message || 'Could not delete policy' });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-surface border border-border-subtle shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground tracking-tight">
              Enterprise Leave Policy Engine
            </h3>
            <p className="text-xs text-muted">
              Configure dynamic quotas, accrual intervals, sandwich rules, and carry-forward formulas.
            </p>
          </div>
        </div>

        {isAdmin && (
          <Button
            onClick={() => {
              form.resetFields();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-xs font-black shadow-md shadow-primary/20 hover:bg-primary-hover">
            <Plus size={16} />
            <span>Create Leave Policy</span>
          </Button>
        )}
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {policies.map((p) => (
          <div
            key={p.id}
            className="flex flex-col justify-between p-6 rounded-3xl bg-surface border border-border-subtle hover:border-primary/30 transition-all shadow-xs group">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-black text-[10px] uppercase tracking-wider">
                    {p.leave_type_code || 'LEAVE'}
                  </span>
                  <h4 className="text-base font-black text-foreground mt-2 group-hover:text-primary transition-colors">
                    {p.name}
                  </h4>
                </div>

                {isAdmin && (
                  <Popconfirm
                    title="Delete Leave Policy"
                    description={`Are you sure you want to delete "${p.name}"?`}
                    onConfirm={() => handleDeletePolicy(p.id, p.name)}
                    okText="Yes, Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}>
                    <button
                      type="button"
                      className="p-1.5 text-muted hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete Policy">
                      <Trash2 size={15} />
                    </button>
                  </Popconfirm>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 my-5 p-4 rounded-2xl bg-surface-elevated/60 border border-border-subtle/60 text-xs">
                <div>
                  <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">Quota</span>
                  <p className="font-black text-foreground text-sm mt-0.5">
                    {p.yearly_quota} days / yr
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">Accrual</span>
                  <p className="font-black text-foreground text-sm mt-0.5 capitalize">
                    {p.accrual_frequency.replace('_', ' ').toLowerCase()}
                  </p>
                </div>
              </div>

              {/* Rules Badges */}
              <div className="flex flex-wrap gap-1.5">
                {Boolean(p.apply_sandwich_rule) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-700 text-[10px] font-bold">
                    <Repeat size={11} /> Sandwich Rule Active
                  </span>
                )}
                {Boolean(p.allow_half_day) && (
                  <span className="px-2.5 py-1 rounded-xl bg-surface-elevated text-foreground text-[10px] font-bold border border-border-subtle">
                    Half-Day OK
                  </span>
                )}
                {Boolean(p.allow_carry_forward) ? (
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 text-[10px] font-bold">
                    Carry-over (Max {p.max_carry_forward_days}d)
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-xl bg-surface-elevated text-muted text-[10px] font-bold">
                    No Carry-Forward
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border-subtle/80 flex items-center justify-between text-[11px] text-muted">
              <span>Notice: {p.min_notice_days} days</span>
              <span>Max Consecutive: {p.max_consecutive_days || 'Unlimited'}</span>
            </div>
          </div>
        ))}
      </div>

      {policies.length === 0 && (
        <div className="p-12 text-center text-muted rounded-3xl bg-surface border border-border-subtle">
          <p className="text-sm font-bold">No leave policies configured yet.</p>
        </div>
      )}

      {/* Modal: Create Policy (Ant Design Form) */}
      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        title={<span className="text-base font-black text-foreground">Create Declarative Leave Policy</span>}
        footer={null}
        centered
        width={580}
        destroyOnClose>
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
          initialValues={{
            leave_type_id: leaveTypes[0]?.id || 1,
            accrual_frequency: 'MONTHLY_PRORATA',
            yearly_quota: 12,
            max_consecutive_days: 10,
            allow_half_day: true,
            apply_sandwich_rule: false,
            allow_carry_forward: false,
            max_carry_forward_days: 15,
            min_notice_days: 0,
          }}
          onFinish={handleCreatePolicy}>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label={<span className="text-xs font-bold text-foreground">Leave Master Type</span>}
              name="leave_type_id"
              rules={[{ required: true, message: 'Please select leave type' }]}>
              <Select
                className="w-full"
                options={leaveTypes.map((t) => ({
                  label: `${t.name} (${t.code})`,
                  value: t.id,
                }))}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-bold text-foreground">Accrual Frequency</span>}
              name="accrual_frequency"
              rules={[{ required: true, message: 'Please select frequency' }]}>
              <Select
                className="w-full"
                options={[
                  { label: 'Monthly Pro-Rata', value: 'MONTHLY_PRORATA' },
                  { label: 'Yearly Upfront', value: 'YEARLY_UPFRONT' },
                  { label: 'None (On Demand / Unpaid)', value: 'NONE' },
                ]}
              />
            </Form.Item>
          </div>

          <Form.Item
            label={<span className="text-xs font-bold text-foreground">Policy Display Name</span>}
            name="name"
            rules={[{ required: true, message: 'Please enter policy name' }]}>
            <Input placeholder="e.g. Standard Casual Leave Policy 2026" className="rounded-xl py-2" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label={<span className="text-xs font-bold text-foreground">Yearly Quota (Days)</span>}
              name="yearly_quota"
              rules={[{ required: true, message: 'Please enter quota' }]}>
              <InputNumber min={0} step={0.5} className="w-full rounded-xl py-1" />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-bold text-foreground">Max Consecutive Days</span>}
              name="max_consecutive_days">
              <InputNumber min={1} className="w-full rounded-xl py-1" />
            </Form.Item>
          </div>

          {/* Rules & Checkboxes */}
          <div className="p-4 rounded-2xl bg-surface-elevated/70 border border-border-subtle flex flex-col gap-2.5 mb-4">
            <Form.Item name="apply_sandwich_rule" valuePropName="checked" className="mb-0">
              <Checkbox className="text-xs font-bold text-foreground">
                Apply Sandwich Rule (Deduct intervening weekends & public holidays)
              </Checkbox>
            </Form.Item>

            <Form.Item name="allow_half_day" valuePropName="checked" className="mb-0">
              <Checkbox className="text-xs font-bold text-foreground">
                Allow Half-Day Applications
              </Checkbox>
            </Form.Item>

            <Form.Item name="allow_carry_forward" valuePropName="checked" className="mb-0">
              <Checkbox className="text-xs font-bold text-foreground">
                Enable Year-End Carry Forward (Max 15 days)
              </Checkbox>
            </Form.Item>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border-subtle">
            <AntButton onClick={() => setShowModal(false)} className="rounded-xl">
              Cancel
            </AntButton>
            <AntButton
              type="primary"
              htmlType="submit"
              loading={isCreating}
              className="rounded-xl bg-primary">
              Save Policy
            </AntButton>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Tabs,
  Form,
  Select,
  Input,
  DatePicker,
  Button,
  Popconfirm,
  Tag,
  Spin,
} from 'antd';
import dayjs from 'dayjs';
import { Network, Trash2, UserPlus, Link2 } from 'lucide-react';
import {
  useAddMatrixManagerMutation,
  useRemoveMatrixManagerMutation,
  useGetMatrixManagersForUserQuery,
  type HierarchyNodeUser,
} from '@/store/api/organizationApiSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';

interface MatrixManagerModalProps {
  open: boolean;
  onClose: () => void;
  preselectedUserId?: number | null;
  flatUsers: HierarchyNodeUser[];
  onSuccess?: () => void;
}

const RELATIONSHIP_TYPES = [
  'Project / Functional Lead',
  'Cross-Functional Mentor',
  'Product Lead',
  'Agile / Scrum Coach',
  'Technical Domain Lead',
  'Secondary Supervisor',
];

export const MatrixManagerModal: React.FC<MatrixManagerModalProps> = ({
  open,
  onClose,
  preselectedUserId,
  flatUsers,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'add' | 'manage'>('add');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(preselectedUserId || null);

  const [form] = Form.useForm();
  const [addMatrixManager, { isLoading: isAdding }] = useAddMatrixManagerMutation();
  const [removeMatrixManager, { isLoading: isRemoving }] = useRemoveMatrixManagerMutation();

  const {
    data: matrixDataRes,
    isLoading: isLoadingMatrix,
    refetch: refetchMatrix,
  } = useGetMatrixManagersForUserQuery(selectedUserId || 0, {
    skip: !selectedUserId,
  });

  const matrixInfo = matrixDataRes?.data;
  const matrixManagers = matrixInfo?.matrixManagers || [];
  const matrixReports = matrixInfo?.matrixReports || [];

  useEffect(() => {
    if (open) {
      const initialId = preselectedUserId || flatUsers[0]?.id || null;
      setSelectedUserId(initialId);
      form.setFieldsValue({
        userId: initialId || undefined,
        matrixManagerId: undefined,
        relationshipType: RELATIONSHIP_TYPES[0],
        reason: '',
        effectiveDate: dayjs(),
      });
    }
  }, [open, preselectedUserId, flatUsers, form]);

  const handleAddSubmit = async (values: any) => {
    try {
      const effectiveDateStr = values.effectiveDate
        ? dayjs(values.effectiveDate).format('YYYY-MM-DD')
        : undefined;

      await addMatrixManager({
        userId: Number(values.userId),
        matrixManagerId: Number(values.matrixManagerId),
        relationshipType: values.relationshipType,
        reason: values.reason?.trim(),
        effectiveDate: effectiveDateStr,
      }).unwrap();

      showToast({
        severity: 'success',
        summary: 'Assigned',
        detail: 'Dotted-line matrix manager added successfully',
      });
      form.resetFields(['matrixManagerId', 'reason']);
      refetchMatrix();
      onSuccess?.();
    } catch (err: any) {
      showToast({
        severity: 'error',
        summary: 'Assignment Failed',
        detail: err?.data?.message || 'Could not assign matrix manager',
      });
    }
  };

  const handleRemove = async (matrixManagerId: number, name: string) => {
    if (!selectedUserId) return;
    try {
      await removeMatrixManager({
        userId: selectedUserId,
        matrixManagerId,
        reason: 'Matrix relationship removed via Organization Management',
      }).unwrap();

      showToast({
        severity: 'info',
        summary: 'Removed',
        detail: `Dotted line to ${name} removed`,
      });
      refetchMatrix();
      onSuccess?.();
    } catch (err: any) {
      showToast({
        severity: 'error',
        summary: 'Remove Failed',
        detail: err?.data?.message || 'Could not remove matrix relationship',
      });
    }
  };

  const selectedUserObj = flatUsers.find((u) => u.id === selectedUserId);

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-foreground font-black">
          <Network size={18} className="text-primary" />
          <span>Matrix / Dotted-Line Management</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={640}>
      <div className="pt-2">
        {/* User Selection Banner */}
        <div className="mb-4 p-3 rounded-xl bg-surface-subtle border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              <Link2 size={16} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted block">Selected Employee</span>
              <strong className="text-foreground text-xs">{selectedUserObj?.username || 'None'}</strong>
              <span className="text-muted block text-[11px]">{selectedUserObj?.email}</span>
            </div>
          </div>

          <div className="w-full sm:w-56">
            <Select
              showSearch
              placeholder="Switch employee..."
              value={selectedUserId || undefined}
              onChange={(val) => {
                setSelectedUserId(val);
                form.setFieldValue('userId', val);
              }}
              className="w-full text-xs"
              filterOption={(input, opt) =>
                (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={flatUsers.map((u) => ({
                value: u.id,
                label: u.username,
              }))}
            />
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as any)}
          items={[
            {
              key: 'add',
              label: (
                <span className="flex items-center gap-1.5 text-xs font-bold">
                  <UserPlus size={13} />
                  <span>Assign Matrix Manager</span>
                </span>
              ),
              children: (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleAddSubmit}
                  className="pt-2">
                  <Form.Item name="userId" hidden>
                    <Input />
                  </Form.Item>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Form.Item
                      label="Matrix / Dotted-Line Manager"
                      name="matrixManagerId"
                      rules={[{ required: true, message: 'Please select a manager' }]}>
                      <Select
                        showSearch
                        placeholder="Select matrix manager..."
                        filterOption={(input, opt) =>
                          (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={flatUsers
                          .filter((u) => u.id !== selectedUserId)
                          .map((u) => ({
                            value: u.id,
                            label: `${u.username} (${u.role})`,
                          }))}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Relationship Type"
                      name="relationshipType"
                      rules={[{ required: true, message: 'Select relationship type' }]}>
                      <Select
                        placeholder="Select relationship..."
                        options={RELATIONSHIP_TYPES.map((t) => ({
                          value: t,
                          label: t,
                        }))}
                      />
                    </Form.Item>
                  </div>

                  <Form.Item
                    label="Effective Date"
                    name="effectiveDate"
                    rules={[{ required: true, message: 'Date is required' }]}>
                    <DatePicker className="w-full" format="YYYY-MM-DD" />
                  </Form.Item>

                  <Form.Item
                    label="Reason for Matrix Line"
                    name="reason"
                    rules={[
                      { required: true, message: 'Reason is required for governance log' },
                      { min: 5, message: 'Please provide at least 5 characters' },
                    ]}>
                    <Input.TextArea
                      rows={2}
                      placeholder="Detail cross-functional assignment (e.g. Project Delivery Lead for Mobile App Sprint)..."
                    />
                  </Form.Item>

                  <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isAdding}
                      style={{ backgroundColor: '#E8583A' }}>
                      Assign Matrix Line
                    </Button>
                  </div>
                </Form>
              ),
            },
            {
              key: 'manage',
              label: (
                <span className="flex items-center gap-1.5 text-xs font-bold">
                  <Network size={13} />
                  <span>Existing Relations ({matrixManagers.length})</span>
                </span>
              ),
              children: (
                <div className="pt-2 space-y-4">
                  {isLoadingMatrix ? (
                    <div className="py-8 text-center">
                      <Spin size="small" />
                    </div>
                  ) : matrixManagers.length === 0 ? (
                    <div className="py-8 text-center text-muted text-xs border border-dashed border-border-subtle rounded-xl">
                      <Network size={24} className="mx-auto mb-1.5 opacity-40" />
                      <p className="font-bold text-foreground">No dotted-line managers assigned</p>
                      <p className="text-[11px] text-muted">Use the "Assign Matrix Manager" tab to add one.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {matrixManagers.map((m) => (
                        <div
                          key={m.relation_id}
                          className="p-3 rounded-xl bg-surface border border-border-subtle flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-xs text-foreground font-black">{m.manager_name}</strong>
                              <Tag color="purple" className="text-[9px] font-bold border-none m-0 rounded-md">
                                {m.relationship_type}
                              </Tag>
                            </div>
                            <p className="text-[11px] text-muted mt-0.5">{m.manager_email} • {m.manager_designation || m.manager_role}</p>
                            {m.reason && <p className="text-[10px] text-muted italic mt-0.5">"{m.reason}"</p>}
                          </div>

                          <Popconfirm
                            title="Remove Dotted Line"
                            description={`Are you sure you want to remove matrix relationship with ${m.manager_name}?`}
                            onConfirm={() => handleRemove(m.matrix_manager_id, m.manager_name)}
                            okText="Yes, Remove"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}>
                            <Button
                              danger
                              size="small"
                              icon={<Trash2 size={12} />}
                              loading={isRemoving}
                              className="text-xs">
                              Remove
                            </Button>
                          </Popconfirm>
                        </div>
                      ))}
                    </div>
                  )}

                  {matrixReports.length > 0 && (
                    <div className="pt-3 border-t border-border-subtle">
                      <span className="text-xs font-bold text-foreground block mb-2">
                        Employees Reporting into this Person via Matrix Lines ({matrixReports.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {matrixReports.map((r) => (
                          <span
                            key={r.relation_id}
                            className="px-2 py-1 rounded-lg bg-surface border border-border-subtle text-xs text-foreground font-medium">
                            {r.employee_name} <span className="text-[10px] text-muted">({r.relationship_type})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>
    </Modal>
  );
};


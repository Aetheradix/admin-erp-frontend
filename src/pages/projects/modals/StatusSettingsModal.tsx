import { useState, useEffect } from 'react';
import type { TaskStatus, TaskStatusCategory } from '@/types/taskStatus';
import { projectService } from '@/services/projectService';
import { Plus, Trash2, ArrowUpDown, SlidersHorizontal } from 'lucide-react';
import {
  Modal,
  Button,
  Input,
  Select,
  Tag,
  Table,
  Form,
  Checkbox,
  Popconfirm,
  Space,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface StatusSettingsModalProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: () => void;
}

const CATEGORY_COLORS: Record<TaskStatusCategory, string> = {
  initial: 'default',
  active: 'blue',
  completed: 'green',
  cancelled: 'red',
};

export function StatusSettingsModal({
  projectId,
  isOpen,
  onClose,
  onStatusUpdated,
}: StatusSettingsModalProps) {
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [form] = Form.useForm();

  const loadStatuses = () => {
    setStatuses(projectService.getTaskStatuses(projectId));
  };

  useEffect(() => {
    if (isOpen) {
      loadStatuses();
    }
  }, [isOpen, projectId]);

  const handleCreateStatus = (values: {
    name: string;
    category: TaskStatusCategory;
    color: string;
    description?: string;
    requiresApproval?: boolean;
  }) => {
    projectService.createTaskStatus({
      name: values.name.trim(),
      color: values.color,
      category: values.category,
      description: values.description?.trim() || '',
      requiresApproval: !!values.requiresApproval,
      projectId,
    });

    message.success(`Status "${values.name}" created successfully!`);
    setIsCreating(false);
    form.resetFields();
    loadStatuses();
    onStatusUpdated();
  };

  const handleDeleteStatus = (id: number, name: string) => {
    const success = projectService.deleteTaskStatus(id);
    if (success) {
      message.success(`Status "${name}" deleted`);
      loadStatuses();
      onStatusUpdated();
    } else {
      message.error('Default system status cannot be deleted');
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= statuses.length) return;

    const copy = [...statuses];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);

    projectService.reorderTaskStatuses(copy.map((s) => s.id));
    loadStatuses();
    onStatusUpdated();
  };

  const columns: ColumnsType<TaskStatus> = [
    {
      title: 'Order',
      key: 'order',
      width: 80,
      render: (_, __, idx) => (
        <Space size={4}>
          <Button
            size="small"
            type="text"
            disabled={idx === 0}
            onClick={() => handleMove(idx, 'up')}
            icon={<ArrowUpDown size={12} />}
          />
        </Space>
      ),
    },
    {
      title: 'Status Name',
      key: 'name',
      render: (_, record) => (
        <Space>
          <span
            className="w-3.5 h-3.5 rounded-full inline-block border border-black/10 shrink-0"
            style={{ backgroundColor: record.color }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-foreground">{record.name}</span>
              {record.isDefault && (
                <Tag color="default" className="text-[10px] m-0">
                  Default
                </Tag>
              )}
            </div>
            {record.description && (
              <span className="text-[11px] text-muted block">{record.description}</span>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (cat: TaskStatusCategory) => (
        <Tag color={CATEGORY_COLORS[cat]} className="uppercase text-[10px] font-bold">
          {cat}
        </Tag>
      ),
    },
    {
      title: 'Sign-off',
      dataIndex: 'requiresApproval',
      key: 'requiresApproval',
      width: 120,
      render: (req: boolean) =>
        req ? (
          <Tag color="purple" className="text-[10px] font-bold">
            Approval Req
          </Tag>
        ) : (
          <span className="text-muted text-xs">—</span>
        ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      align: 'right',
      render: (_, record) =>
        !record.isDefault && (
          <Popconfirm
            title="Delete Status"
            description={`Are you sure you want to delete "${record.name}"?`}
            onConfirm={() => handleDeleteStatus(record.id, record.name)}
            okText="Yes"
            cancelText="No">
            <Button
              danger
              type="text"
              size="small"
              icon={<Trash2 size={14} />}
              className="hover:bg-rose-500/10"
            />
          </Popconfirm>
        ),
    },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 pb-2">
          <SlidersHorizontal size={18} className="text-primary" />
          <span className="text-base font-black">Pipeline Task Statuses</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose} className="rounded-xl font-bold">
          Done
        </Button>,
      ]}
      width={720}
      centered
      destroyOnClose>
      <div className="space-y-4 py-2">
        <p className="text-xs text-muted">
          Define dynamic workflow statuses for your project board, configure categories, and reorder
          columns.
        </p>

        {/* Ant Design Statuses Table */}
        <Table
          dataSource={statuses}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="middle"
          className="rounded-xl border border-border-subtle overflow-hidden"
        />

        {/* Add New Status Toggle or Form */}
        {isCreating ? (
          <div className="p-4 rounded-xl bg-surface-subtle border border-primary/30 space-y-3">
            <h4 className="text-xs font-bold text-foreground">Create Custom Workflow Status</h4>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCreateStatus}
              initialValues={{
                category: 'active',
                color: '#3b82f6',
                requiresApproval: false,
              }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Form.Item
                  name="name"
                  label="Status Name"
                  rules={[{ required: true, message: 'Status name is required' }]}>
                  <Input placeholder="e.g. In QA Review, Staging, Blocked" className="rounded-lg" />
                </Form.Item>

                <Form.Item name="category" label="Pipeline Category">
                  <Select
                    options={[
                      { value: 'initial', label: 'Initial (To Do / Backlog)' },
                      { value: 'active', label: 'Active (In Progress / Review)' },
                      { value: 'completed', label: 'Completed (Done / Resolved)' },
                      { value: 'cancelled', label: 'Cancelled (Abandoned)' },
                    ]}
                  />
                </Form.Item>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Form.Item name="color" label="Badge Color">
                  <Input type="color" className="h-9 p-1 rounded-lg w-20 cursor-pointer" />
                </Form.Item>

                <Form.Item name="requiresApproval" valuePropName="checked" className="pt-6">
                  <Checkbox>Requires Formal Sign-off</Checkbox>
                </Form.Item>
              </div>

              <Form.Item name="description" label="Description / Guidelines">
                <Input
                  placeholder="Optional guidelines for moving tasks here"
                  className="rounded-lg"
                />
              </Form.Item>

              <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
                <Button onClick={() => setIsCreating(false)} className="rounded-lg">
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" className="rounded-lg font-bold">
                  Save Status
                </Button>
              </div>
            </Form>
          </div>
        ) : (
          <Button
            type="dashed"
            block
            icon={<Plus size={14} />}
            onClick={() => setIsCreating(true)}
            className="rounded-xl font-bold h-10 text-xs">
            Add New Status
          </Button>
        )}
      </div>
    </Modal>
  );
}

import { useState } from 'react';
import { FileText, Plus, Trash2, ExternalLink } from 'lucide-react';
import { Card, Table, Button, Tag, Modal, Form, Input, Select, Popconfirm, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  useGetDocumentTemplatesQuery,
  useCreateDocumentTemplateMutation,
  useDeleteDocumentTemplateMutation,
  type BackendDocumentTemplate,
} from '@/store/api/projectApiSlice';

const PHASE_OPTIONS = [
  { value: 'initiation', label: 'Initiation' },
  { value: 'requirements', label: 'Requirements' },
  { value: 'planning', label: 'Planning' },
  { value: 'design', label: 'Design & Architecture' },
  { value: 'build', label: 'Build & Code Standards' },
  { value: 'testing', label: 'Quality Assurance' },
  { value: 'release', label: 'Release & Deployment' },
  { value: 'closure', label: 'Project Closure' },
];

export function DocTemplatesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [form] = Form.useForm();

  const { data: templates = [], isLoading, refetch } = useGetDocumentTemplatesQuery();
  const [createTemplate, { isLoading: creating }] = useCreateDocumentTemplateMutation();
  const [deleteTemplate] = useDeleteDocumentTemplateMutation();

  const handleCreate = async (values: {
    name: string;
    phase: string;
    owner_role: string;
    format: string;
    file_url?: string;
  }) => {
    try {
      await createTemplate(values).unwrap();
      message.success('Document template created');
      form.resetFields();
      setShowCreate(false);
      refetch();
    } catch (err: unknown) {
      message.error((err as { data?: { message?: string } })?.data?.message || 'Failed to create template');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTemplate(id).unwrap();
      message.success('Template deleted');
      refetch();
    } catch {
      message.error('Failed to delete template');
    }
  };

  const columns: ColumnsType<BackendDocumentTemplate> = [
    {
      title: 'Template Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className="font-bold text-xs text-foreground">{name}</span>,
    },
    {
      title: 'Phase',
      dataIndex: 'phase',
      key: 'phase',
      render: (p: string) => (
        <Tag color="blue" className="uppercase text-[10px] font-bold">
          {p || 'planning'}
        </Tag>
      ),
    },
    {
      title: 'Default Owner Role',
      dataIndex: 'owner_role',
      key: 'owner_role',
      render: (r: string) => <span className="text-xs text-muted">{r || 'Project Manager'}</span>,
    },
    {
      title: 'Format',
      dataIndex: 'format',
      key: 'format',
      render: (f: string) => <Tag className="font-mono text-[10px]">{f || 'DOCX'}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, r) => (
        <div className="flex justify-end gap-2">
          {r.file_url && (
            <Button
              size="small"
              icon={<ExternalLink size={12} />}
              onClick={() => window.open(r.file_url, '_blank', 'noopener,noreferrer')}>
              Open
            </Button>
          )}
          <Popconfirm title="Delete this template?" onConfirm={() => handleDelete(r.id)}>
            <Button size="small" danger icon={<Trash2 size={12} />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2.5">
            <FileText className="text-primary" size={22} />
            <span>Document Templates Library</span>
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Centralized document templates reusable across all StartupOS projects.
          </p>
        </div>

        <Button
          type="primary"
          icon={<Plus size={14} />}
          onClick={() => setShowCreate(true)}
          className="rounded-xl font-bold text-xs">
          New Template
        </Button>
      </div>

      <Card className="rounded-2xl border-border-subtle bg-card shadow-xs">
        <Table
          dataSource={templates}
          columns={columns}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 12 }}
          size="middle"
        />
      </Card>

      <Modal
        title="Create Document Template"
        open={showCreate}
        onCancel={() => setShowCreate(false)}
        footer={null}
        destroyOnClose>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ phase: 'planning', owner_role: 'Project Manager', format: 'DOCX' }}>
          <Form.Item name="name" label="Template Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Technical Design Document" className="rounded-xl" />
          </Form.Item>
          <Form.Item name="phase" label="Default Phase">
            <Select options={PHASE_OPTIONS} />
          </Form.Item>
          <Form.Item name="owner_role" label="Default Owner Role">
            <Input placeholder="e.g. Tech Lead" className="rounded-xl" />
          </Form.Item>
          <Form.Item name="format" label="Format">
            <Select
              options={[
                { value: 'DOCX', label: 'DOCX' },
                { value: 'PDF', label: 'PDF' },
                { value: 'MD', label: 'Markdown' },
                { value: 'XLSX', label: 'Spreadsheet (XLSX)' },
              ]}
            />
          </Form.Item>
          <Form.Item name="file_url" label="Template Link (optional)">
            <Input placeholder="https://..." className="rounded-xl" />
          </Form.Item>
          <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
            <Button onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={creating} className="font-bold">
              Create Template
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
export default DocTemplatesPage;

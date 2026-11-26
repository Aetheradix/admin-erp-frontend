import { useState } from 'react';
import type { Project, ProjectDocument, DocumentPhase } from '@/types/project';
import { FileText, Download, CheckCircle2, XCircle, Plus, Upload, Trash2 } from 'lucide-react';
import { projectService } from '@/services/projectService';
import {
  useCreateProjectDocumentMutation,
  useUpdateProjectDocumentMutation,
  useDeleteProjectDocumentMutation,
  useGetDocumentTemplatesQuery,
} from '@/store/api/projectApiSlice';
import { Card, Progress, Button, Tag, Modal, Input, Select, Form, Space, message, Popconfirm } from 'antd';

const { TextArea } = Input;

interface DocumentsTabProps {
  project: Project;
  documents: ProjectDocument[];
  onDocumentsUpdated: () => void;
}

const PHASES: { id: DocumentPhase; label: string }[] = [
  { id: 'initiation', label: '1. Initiation' },
  { id: 'requirements', label: '2. Requirements' },
  { id: 'planning', label: '3. Planning' },
  { id: 'design', label: '4. Design & Architecture' },
  { id: 'build', label: '5. Build & Code Standards' },
  { id: 'testing', label: '6. Quality Assurance & UAT' },
  { id: 'release', label: '7. Release & Deployment' },
  { id: 'closure', label: '8. Project Closure' },
];

export function DocumentsTab({ project, documents, onDocumentsUpdated }: DocumentsTabProps) {
  const [notNeededReason, setNotNeededReason] = useState('');
  const [reasonModalDoc, setReasonModalDoc] = useState<ProjectDocument | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form] = Form.useForm();

  const { data: templates = [] } = useGetDocumentTemplatesQuery();
  const [createDocApi, { isLoading: creating }] = useCreateProjectDocumentMutation();
  const [updateDocApi] = useUpdateProjectDocumentMutation();
  const [deleteDocApi] = useDeleteProjectDocumentMutation();

  const doneCount = documents.filter((d) => d.status === 'done').length;
  const activeCount = documents.filter((d) => d.status !== 'not_needed').length;
  const progressPct = activeCount > 0 ? Math.round((doneCount / activeCount) * 100) : 0;

  const handleDownloadTemplate = (doc: ProjectDocument) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    const blob = new Blob(
      [
        `StartupOS Document Template\nProject: ${project.name} (${project.key})\nDocument: ${doc.name}\nPhase: ${doc.phase}\nOwner Role: ${doc.ownerRole}`,
      ],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.key}_${doc.name.replace(/\s+/g, '_')}.${doc.templateFormat || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
    message.success(`Template for "${doc.name}" downloaded`);
  };

  const handleMarkDone = async (doc: ProjectDocument) => {
    try {
      await updateDocApi({ id: doc.id, data: { status: 'done' } }).unwrap();
    } catch {
      projectService.updateDocumentStatus(doc.id, 'done');
    }
    message.success(`"${doc.name}" marked as Completed`);
    onDocumentsUpdated();
  };

  const handleMarkNotNeeded = async () => {
    if (!reasonModalDoc || !notNeededReason.trim()) {
      message.error('Reason is required to mark a document as not needed');
      return;
    }
    try {
      await updateDocApi({
        id: reasonModalDoc.id,
        data: { status: 'not_needed', not_needed_reason: notNeededReason.trim() },
      }).unwrap();
    } catch {
      projectService.updateDocumentStatus(reasonModalDoc.id, 'not_needed', notNeededReason);
    }
    message.info(`"${reasonModalDoc.name}" flagged as Not Needed`);
    setReasonModalDoc(null);
    setNotNeededReason('');
    onDocumentsUpdated();
  };

  const handleAddDocument = async (values: {
    name: string;
    phase: string;
    owner_role: string;
    external_link?: string;
  }) => {
    try {
      await createDocApi({
        project_id: project.id,
        name: values.name.trim(),
        phase: values.phase || 'planning',
        owner_role: values.owner_role || 'Project Manager',
        external_link: values.external_link?.trim() || undefined,
      }).unwrap();
      message.success('Document added to project checklist');
      form.resetFields();
      setShowAddModal(false);
      onDocumentsUpdated();
    } catch (err: unknown) {
      message.error((err as { data?: { message?: string } })?.data?.message || 'Failed to add document');
    }
  };

  const handleDeleteDoc = async (docId: number) => {
    try {
      await deleteDocApi(docId).unwrap();
      message.success('Document removed');
      onDocumentsUpdated();
    } catch {
      message.error('Failed to delete document');
    }
  };

  const handleAddFromTemplate = async (templateId: number) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;
    try {
      await createDocApi({
        project_id: project.id,
        name: tpl.name,
        phase: tpl.phase || 'planning',
        owner_role: tpl.owner_role || 'Project Manager',
        file_url: tpl.file_url || undefined,
      }).unwrap();
      message.success(`Added "${tpl.name}" from template`);
      onDocumentsUpdated();
    } catch {
      message.error('Failed to add document from template');
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Metric Card */}
      <Card
        className="rounded-2xl border-border-subtle bg-surface-subtle shadow-xs"
        styles={{ body: { padding: '20px' } }}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-foreground">Project Document Checklist</h3>
              <p className="text-xs text-muted">
                {doneCount} of {activeCount} required documents completed ({progressPct}%)
              </p>
            </div>
          </div>

          <Space wrap>
            {templates.length > 0 && (
              <Select
                placeholder="Add from template..."
                className="w-52"
                value={null}
                onChange={(val) => val && handleAddFromTemplate(Number(val))}
                options={templates.map((t) => ({ value: t.id, label: `${t.name} (${t.phase || 'planning'})` }))}
              />
            )}
            <Button
              type="primary"
              icon={<Plus size={14} />}
              onClick={() => setShowAddModal(true)}
              className="rounded-xl font-bold text-xs">
              Add Document
            </Button>
          </Space>
        </div>
        <Progress percent={progressPct} strokeColor="#10b981" className="mt-4 mb-0" />
      </Card>

      {/* Documents List grouped by phase */}
      <div className="space-y-4">
        {PHASES.map((phase) => {
          const phaseDocs = documents.filter((d) => {
            const p = String(d.phase || 'planning').toLowerCase();
            return (
              p === phase.id ||
              (phase.id === 'design' && p === 'execution') ||
              (phase.id === 'testing' && p === 'review')
            );
          });
          if (phaseDocs.length === 0) return null;

          return (
            <Card
              key={phase.id}
              title={<span className="text-xs font-black uppercase tracking-wider text-muted">{phase.label}</span>}
              className="rounded-2xl border-border-subtle bg-card shadow-xs"
              styles={{ body: { padding: '12px 20px' } }}>
              <div className="divide-y divide-border-subtle">
                {phaseDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{doc.name}</span>
                        <Tag
                          color={
                            doc.status === 'done'
                              ? 'success'
                              : doc.status === 'not_needed'
                                ? 'default'
                                : 'processing'
                          }
                          className="text-[10px] font-bold uppercase m-0">
                          {doc.status.replace('_', ' ')}
                        </Tag>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        Owner Role: {doc.ownerRole}
                        {doc.externalLink && (
                          <>
                            {' • '}
                            <a
                              href={doc.externalLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline">
                              External Link
                            </a>
                          </>
                        )}
                      </p>
                      {doc.notNeededReason && (
                        <p className="text-[11px] text-muted italic mt-0.5">
                          Reason: {doc.notNeededReason}
                        </p>
                      )}
                    </div>

                    <Space size="small" wrap>
                      <Button
                        size="small"
                        icon={<Download size={12} />}
                        onClick={() => handleDownloadTemplate(doc)}
                        className="rounded-lg text-xs">
                        Download
                      </Button>
                      {doc.status !== 'done' && (
                        <Button
                          size="small"
                          type="primary"
                          icon={<CheckCircle2 size={12} />}
                          onClick={() => handleMarkDone(doc)}
                          className="rounded-lg text-xs">
                          Mark Done
                        </Button>
                      )}
                      {doc.status !== 'not_needed' && (
                        <Button
                          size="small"
                          icon={<XCircle size={12} />}
                          onClick={() => setReasonModalDoc(doc)}
                          className="rounded-lg text-xs">
                          Not Needed
                        </Button>
                      )}
                      <Popconfirm title="Remove document?" onConfirm={() => handleDeleteDoc(doc.id)}>
                        <Button size="small" danger icon={<Trash2 size={12} />} className="rounded-lg" />
                      </Popconfirm>
                    </Space>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Not Needed Modal */}
      <Modal
        title="Mark Document as Not Needed"
        open={Boolean(reasonModalDoc)}
        onCancel={() => {
          setReasonModalDoc(null);
          setNotNeededReason('');
        }}
        onOk={handleMarkNotNeeded}
        okText="Confirm">
        <p className="text-xs text-muted mb-2">
          Provide a brief reason why <strong>{reasonModalDoc?.name}</strong> is not required:
        </p>
        <TextArea
          rows={3}
          value={notNeededReason}
          onChange={(e) => setNotNeededReason(e.target.value)}
          placeholder="e.g. Internal tool — no external client UAT required"
        />
      </Modal>

      {/* Add Document Modal */}
      <Modal
        title="Add Project Document"
        open={showAddModal}
        onCancel={() => setShowAddModal(false)}
        footer={null}
        destroyOnClose>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddDocument}
          initialValues={{ phase: 'planning', owner_role: 'Project Manager' }}>
          <Form.Item name="name" label="Document Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Security Architecture Review" className="rounded-xl" />
          </Form.Item>
          <Form.Item name="phase" label="Phase">
            <Select options={PHASES.map((p) => ({ value: p.id, label: p.label }))} />
          </Form.Item>
          <Form.Item name="owner_role" label="Owner Role">
            <Input placeholder="e.g. Tech Lead" className="rounded-xl" />
          </Form.Item>
          <Form.Item name="external_link" label="External Link (optional, https://...)">
            <Input placeholder="https://docs.google.com/..." className="rounded-xl" />
          </Form.Item>
          <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
            <Button onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={creating} icon={<Upload size={13} />}>
              Save Document
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

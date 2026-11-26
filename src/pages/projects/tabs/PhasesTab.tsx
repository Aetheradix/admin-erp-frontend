import { useState } from 'react';
import type { Project, ProjectTask, Milestone } from '@/types/project';
import type { ProjectPhase, PhaseTemplate } from '@/types/phase';
import { projectService } from '@/services/projectService';
import {
  useCreateMilestoneMutation,
  useUpdateMilestoneMutation,
  useDeleteMilestoneMutation,
  useSignoffMilestoneMutation,
} from '@/store/api/projectApiSlice';
import {
  Plus,
  ArrowUpDown,
  Trash2,
  Calendar,
  User,
  Sparkles,
  Layers,
  Edit2,
  Check,
  Flag,
  Lock,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  Card,
  Button,
  Progress,
  Tag,
  Modal,
  Form,
  Input,
  Popconfirm,
  Row,
  Col,
  Space,
  Switch,
  message,
} from 'antd';

const { TextArea } = Input;

interface PhasesTabProps {
  project: Project;
  phases: ProjectPhase[];
  milestones?: Milestone[];
  tasks: ProjectTask[];
  onPhasesUpdated: () => void;
}

export function PhasesTab({ project, phases, milestones = [], tasks, onPhasesUpdated }: PhasesTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingPhase, setEditingPhase] = useState<ProjectPhase | null>(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [form] = Form.useForm();
  const [msForm] = Form.useForm();

  const [createMilestoneApi, { isLoading: savingMs }] = useCreateMilestoneMutation();
  const [updateMilestoneApi] = useUpdateMilestoneMutation();
  const [deleteMilestoneApi] = useDeleteMilestoneMutation();
  const [signoffMilestoneApi] = useSignoffMilestoneMutation();

  const templates: PhaseTemplate[] = projectService.getPhaseTemplates();

  const handleOpenCreateMilestone = () => {
    setEditingMilestone(null);
    msForm.resetFields();
    msForm.setFieldsValue({
      targetDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      isFixed: false,
      requiresSignoff: false,
    });
    setShowMilestoneModal(true);
  };

  const handleOpenEditMilestone = (ms: Milestone) => {
    setEditingMilestone(ms);
    msForm.setFieldsValue({
      name: ms.name,
      description: ms.description || '',
      targetDate: ms.targetDate,
      isFixed: ms.isFixed,
      requiresSignoff: ms.requiresSignoff,
    });
    setShowMilestoneModal(true);
  };

  const handleSaveMilestone = async (values: {
    name: string;
    description?: string;
    targetDate?: string;
    isFixed?: boolean;
    requiresSignoff?: boolean;
  }) => {
    try {
      if (editingMilestone) {
        await updateMilestoneApi({
          id: editingMilestone.id,
          data: {
            name: values.name.trim(),
            description: values.description || '',
            target_date: values.targetDate,
            is_fixed: values.isFixed ? 1 : 0,
            requires_signoff: values.requiresSignoff ? 1 : 0,
          },
        }).unwrap();
        message.success('Milestone updated');
      } else {
        await createMilestoneApi({
          project_id: project.id,
          name: values.name.trim(),
          description: values.description || '',
          target_date: values.targetDate,
          is_fixed: values.isFixed ? 1 : 0,
          requires_signoff: values.requiresSignoff ? 1 : 0,
        }).unwrap();
        message.success('Milestone created');
      }
      setShowMilestoneModal(false);
      onPhasesUpdated();
    } catch {
      message.error('Failed to save milestone');
    }
  };

  const handleOpenCreate = () => {
    setEditingPhase(null);
    form.resetFields();
    form.setFieldsValue({
      ownerName: 'Alex Mercer',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      color: '#3b82f6',
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (phase: ProjectPhase) => {
    setEditingPhase(phase);
    form.resetFields();
    form.setFieldsValue({
      name: phase.name,
      description: phase.description || '',
      ownerName: phase.ownerName || 'Project Lead',
      startDate: phase.startDate,
      endDate: phase.endDate,
      color: phase.color || '#3b82f6',
    });
    setShowAddModal(true);
  };

  const handleFormFinish = (values: {
    name: string;
    description?: string;
    ownerName?: string;
    startDate?: string;
    endDate?: string;
    color?: string;
  }) => {
    if (editingPhase) {
      projectService.updatePhase(editingPhase.id, {
        name: values.name.trim(),
        description: values.description?.trim(),
        ownerName: values.ownerName?.trim(),
        startDate: values.startDate,
        endDate: values.endDate,
        color: values.color,
      });
      message.success('Phase updated successfully');
    } else {
      projectService.createPhase({
        projectId: project.id,
        name: values.name.trim(),
        description: values.description?.trim(),
        ownerName: values.ownerName?.trim(),
        startDate: values.startDate,
        endDate: values.endDate,
        color: values.color,
      });
      message.success(`Phase "${values.name}" created!`);
    }

    setShowAddModal(false);
    onPhasesUpdated();
  };

  const handleDelete = (id: number) => {
    const success = projectService.deletePhase(id);
    if (success) {
      message.success('Phase removed');
      onPhasesUpdated();
    }
  };

  const handleToggleComplete = (phase: ProjectPhase) => {
    projectService.updatePhase(phase.id, {
      isCompleted: !phase.isCompleted,
    });
    message.success(`Phase marked as ${!phase.isCompleted ? 'Completed' : 'In Progress'}`);
    onPhasesUpdated();
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= phases.length) return;

    const copy = [...phases];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);

    projectService.reorderPhases(
      project.id,
      copy.map((p) => p.id)
    );
    onPhasesUpdated();
  };

  const handleApplyTemplate = (templateId: number) => {
    projectService.applyPhaseTemplate(project.id, templateId);
    message.success('Phase template applied to project!');
    setShowTemplateModal(false);
    onPhasesUpdated();
  };

  return (
    <div className="space-y-6">
      {/* ── Live Project Milestones Section ── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-foreground flex items-center gap-2">
              <Flag className="text-primary" size={18} />
              <span>Project Milestones ({milestones.length})</span>
            </h2>
            <p className="text-xs text-muted">
              Track Fixed & Flexible delivery gates, sign-offs, and milestone completion.
            </p>
          </div>
          <Button
            type="primary"
            icon={<Plus size={14} />}
            onClick={handleOpenCreateMilestone}
            className="rounded-xl font-bold text-xs">
            New Milestone
          </Button>
        </div>

        {milestones.length === 0 ? (
          <Card className="rounded-2xl border-border-subtle bg-card text-center py-6">
            <p className="text-xs text-muted">No milestones yet. Create one to track delivery gates.</p>
          </Card>
        ) : (
          <Row gutter={[12, 12]}>
            {milestones.map((ms) => {
              const msTasks = tasks.filter((t) => t.milestoneId === ms.id);
              const doneTasks = msTasks.filter((t) => t.status === 'Done' || t.status === 'Completed').length;
              const pct = msTasks.length > 0 ? Math.round((doneTasks / msTasks.length) * 100) : ms.progress ?? 0;
              const isOverdue =
                Boolean(ms.targetDate) &&
                new Date(ms.targetDate) < new Date() &&
                ms.status !== 'completed';

              return (
                <Col xs={24} md={12} key={ms.id}>
                  <Card className="rounded-2xl border-border-subtle bg-card shadow-xs" styles={{ body: { padding: '16px' } }}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-sm text-foreground">{ms.name}</span>
                          <Tag color={ms.isFixed ? 'purple' : 'blue'} className="text-[10px] m-0 font-bold">
                            {ms.isFixed ? (
                              <span className="flex items-center gap-0.5"><Lock size={9} /> Fixed</span>
                            ) : (
                              'Flexible'
                            )}
                          </Tag>
                          {isOverdue && (
                            <Tag color="error" className="text-[10px] m-0 font-bold flex items-center gap-0.5">
                              <AlertTriangle size={9} /> Overdue
                            </Tag>
                          )}
                        </div>
                        <span className="text-xs text-muted block mt-0.5">
                          Target: {ms.targetDate || 'No date'} · {ms.ownerName || 'Owner'}
                        </span>
                      </div>
                      <Space size={4}>
                        {ms.requiresSignoff && ms.signoffStatus !== 'approved' && (
                          <Button
                            size="small"
                            type="primary"
                            icon={<ShieldCheck size={12} />}
                            onClick={async () => {
                              try {
                                await signoffMilestoneApi({ id: ms.id, approval_status: 'approved' }).unwrap();
                                message.success('Milestone signed off!');
                                onPhasesUpdated();
                              } catch {
                                message.error('Sign-off failed');
                              }
                            }}
                            className="rounded-lg text-xs">
                            Sign Off
                          </Button>
                        )}
                        <Button size="small" icon={<Edit2 size={12} />} onClick={() => handleOpenEditMilestone(ms)} />
                        <Popconfirm
                          title="Delete milestone?"
                          onConfirm={async () => {
                            try {
                              await deleteMilestoneApi(ms.id).unwrap();
                              message.success('Milestone deleted');
                              onPhasesUpdated();
                            } catch {
                              message.error('Failed to delete milestone');
                            }
                          }}>
                          <Button size="small" danger icon={<Trash2 size={12} />} />
                        </Popconfirm>
                      </Space>
                    </div>
                    <Progress percent={pct} size="small" status={ms.status === 'completed' ? 'success' : 'active'} />
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border-subtle">
        <div>
          <h2 className="text-base font-black text-foreground flex items-center gap-2">
            <Layers className="text-primary" size={18} />
            <span>Project Lifecycle Phases</span>
          </h2>
          <p className="text-xs text-muted">
            Define dynamic execution stages, assign stage owners, and track milestone progression.
          </p>
        </div>

        <Space>
          <Button
            icon={<Sparkles size={14} className="text-primary" />}
            onClick={() => setShowTemplateModal(true)}
            className="rounded-xl font-bold">
            Apply Template
          </Button>

          <Button
            type="primary"
            icon={<Plus size={14} />}
            onClick={handleOpenCreate}
            className="rounded-xl font-bold shadow-xs">
            New Phase
          </Button>
        </Space>
      </div>

      {/* Sequence Cards with Ant Design Progress */}
      {phases.length > 0 && (
        <Card className="rounded-2xl border-border-subtle bg-surface-subtle shadow-xs">
          <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-3">
            Lifecycle Progress
          </span>
          <Row gutter={[16, 16]}>
            {phases.map((phase, idx) => {
              const phaseTasks = tasks.filter((t) => t.phaseId === phase.id);
              const doneTasks = phaseTasks.filter((t) => t.status === 'Done').length;
              const pct =
                phaseTasks.length > 0 ? Math.round((doneTasks / phaseTasks.length) * 100) : 0;

              return (
                <Col xs={24} sm={12} md={6} key={phase.id}>
                  <div
                    className={`p-3 rounded-xl border transition-all ${
                      phase.isCompleted
                        ? 'bg-emerald-500/5 border-emerald-500/30'
                        : 'bg-background border-border-subtle'
                    }`}>
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-primary">Phase {idx + 1}</span>
                      <Tag
                        color={phase.isCompleted ? 'green' : 'blue'}
                        className="m-0 text-[10px] font-bold uppercase">
                        {phase.isCompleted ? 'Done' : 'Active'}
                      </Tag>
                    </div>
                    <h4 className="text-xs font-bold text-foreground line-clamp-1 mb-2">
                      {phase.name}
                    </h4>
                    <Progress percent={pct} size="small" strokeColor={phase.color || '#3b82f6'} />
                    <div className="flex justify-between text-[11px] text-muted mt-1">
                      <span>
                        {doneTasks}/{phaseTasks.length} tasks
                      </span>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </Card>
      )}

      {/* Phase Cards Listing */}
      <div className="space-y-3">
        {phases.map((phase, idx) => {
          const phaseTasks = tasks.filter((t) => t.phaseId === phase.id);
          const doneTasks = phaseTasks.filter((t) => t.status === 'Done').length;

          return (
            <Card
              key={phase.id}
              className="rounded-2xl border-border-subtle bg-surface-subtle shadow-xs hover:border-primary/40 transition-all"
              styles={{ body: { padding: '16px 20px' } }}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-0.5 pt-1">
                    <Button
                      size="small"
                      type="text"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'up')}
                      icon={<ArrowUpDown size={13} />}
                    />
                  </div>

                  <span
                    className="w-3.5 h-3.5 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: phase.color || '#3b82f6' }}
                  />

                  <div>
                    <Space size={8} wrap>
                      <span className="text-xs font-mono font-bold text-primary">
                        Stage {idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-foreground">{phase.name}</h3>
                      {phase.isCompleted && (
                        <Tag color="green" className="text-[10px] font-bold uppercase m-0">
                          Completed
                        </Tag>
                      )}
                    </Space>

                    {phase.description && (
                      <p className="text-xs text-muted mt-1 max-w-xl">{phase.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted mt-2">
                      <span className="flex items-center gap-1">
                        <User size={12} className="text-primary" />
                        {phase.ownerName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-primary" />
                        {phase.startDate} → {phase.endDate}
                      </span>
                      <span>
                        {doneTasks}/{phaseTasks.length} tasks completed
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <Space>
                  <Button
                    type={phase.isCompleted ? 'default' : 'primary'}
                    icon={<Check size={13} />}
                    onClick={() => handleToggleComplete(phase)}
                    className="rounded-xl font-bold text-xs">
                    {phase.isCompleted ? 'Mark Active' : 'Complete Phase'}
                  </Button>

                  <Button
                    type="text"
                    icon={<Edit2 size={14} />}
                    onClick={() => handleOpenEdit(phase)}
                    className="rounded-xl"
                  />

                  <Popconfirm
                    title="Remove Phase"
                    description={`Delete phase "${phase.name}"?`}
                    onConfirm={() => handleDelete(phase.id)}
                    okText="Yes"
                    cancelText="No">
                    <Button
                      danger
                      type="text"
                      icon={<Trash2 size={14} />}
                      className="rounded-xl hover:bg-rose-500/10"
                    />
                  </Popconfirm>
                </Space>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add / Edit Phase Modal */}
      <Modal
        title={
          <span className="text-base font-black">
            {editingPhase ? 'Edit Phase' : 'Create New Phase'}
          </span>
        }
        open={showAddModal}
        onCancel={() => setShowAddModal(false)}
        footer={null}
        destroyOnClose
        centered>
        <Form form={form} layout="vertical" onFinish={handleFormFinish} className="pt-2">
          <Form.Item
            name="name"
            label="Phase Name"
            rules={[{ required: true, message: 'Please enter phase name' }]}>
            <Input placeholder="e.g. Core Architecture, Testing & QA" className="rounded-xl" />
          </Form.Item>

          <Form.Item name="description" label="Description / Objectives">
            <TextArea
              rows={3}
              placeholder="Phase goals, criteria for completion, deliverables..."
              className="rounded-xl"
            />
          </Form.Item>

          <Form.Item name="ownerName" label="Phase Lead / Owner">
            <Input className="rounded-xl" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="startDate" label="Start Date">
                <Input type="date" className="rounded-xl" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="End Date">
                <Input type="date" className="rounded-xl" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="color" label="Phase Color">
            <Input type="color" className="h-9 p-1 rounded-lg w-24 cursor-pointer" />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle mt-4">
            <Button onClick={() => setShowAddModal(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="rounded-xl font-bold">
              {editingPhase ? 'Save Changes' : 'Create Phase'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Apply Template Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-2">
            <Sparkles size={18} className="text-primary" />
            <span className="text-base font-black">Organizational Phase Templates</span>
          </div>
        }
        open={showTemplateModal}
        onCancel={() => setShowTemplateModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowTemplateModal(false)} className="rounded-xl">
            Close
          </Button>,
        ]}
        width={600}
        centered
        destroyOnClose>
        <div className="space-y-3 py-2">
          {templates.map((tmpl) => (
            <Card
              key={tmpl.id}
              className="rounded-xl border-border-subtle bg-surface-subtle"
              styles={{ body: { padding: '16px' } }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-xs font-bold text-foreground">{tmpl.name}</h4>
                  <Tag color="blue" className="text-[10px] font-bold uppercase m-0">
                    {tmpl.projectType}
                  </Tag>
                </div>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleApplyTemplate(tmpl.id)}
                  className="rounded-lg font-bold">
                  Apply
                </Button>
              </div>
              <p className="text-[11px] text-muted mb-2">{tmpl.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {tmpl.phases.map((p, i) => (
                  <Tag key={i} className="text-[10px] m-0 bg-surface-elevated">
                    {p.name}
                  </Tag>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Modal>

      {/* Create / Edit Milestone Modal */}
      <Modal
        title={editingMilestone ? 'Edit Milestone' : 'Create Milestone'}
        open={showMilestoneModal}
        onCancel={() => setShowMilestoneModal(false)}
        footer={null}
        destroyOnClose>
        <Form form={msForm} layout="vertical" onFinish={handleSaveMilestone}>
          <Form.Item name="name" label="Milestone Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Beta Release" className="rounded-xl" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={2} placeholder="Deliverables for this milestone..." className="rounded-xl" />
          </Form.Item>
          <Form.Item name="targetDate" label="Target Date">
            <Input type="date" className="rounded-xl" />
          </Form.Item>
          <Space size="large" className="mb-4">
            <Form.Item name="isFixed" valuePropName="checked" className="mb-0">
              <Switch checkedChildren="Fixed Date" unCheckedChildren="Flexible" />
            </Form.Item>
            <Form.Item name="requiresSignoff" valuePropName="checked" className="mb-0">
              <Switch checkedChildren="Requires Sign-off" unCheckedChildren="No Sign-off" />
            </Form.Item>
          </Space>
          <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
            <Button onClick={() => setShowMilestoneModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={savingMs} className="font-bold">
              {editingMilestone ? 'Save Changes' : 'Create Milestone'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

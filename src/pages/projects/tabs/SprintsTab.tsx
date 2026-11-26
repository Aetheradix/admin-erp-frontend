import { useState } from 'react';
import type { Project, Sprint, ProjectTask } from '@/types/project';
import { Sparkles, Calendar, Plus, Play, CheckCircle2, ArrowRight } from 'lucide-react';
import { projectService } from '@/services/projectService';
import {
  useCreateSprintMutation,
  useStartSprintMutation,
  useCompleteSprintMutation,
  useAssignTaskToSprintMutation,
} from '@/store/api/projectApiSlice';
import { Card, Button, Tag, Modal, Form, Input, Progress, Row, Col, Select, message } from 'antd';

const { TextArea } = Input;

interface SprintsTabProps {
  project: Project;
  sprints: Sprint[];
  tasks?: ProjectTask[];
  onSprintsUpdated: () => void;
}

export function SprintsTab({ project, sprints, tasks = [], onSprintsUpdated }: SprintsTabProps) {
  const [showNewSprintModal, setShowNewSprintModal] = useState(false);
  const [completeModalSprint, setCompleteModalSprint] = useState<Sprint | null>(null);
  const [moveToSprintId, setMoveToSprintId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const [createSprintApi, { isLoading: creating }] = useCreateSprintMutation();
  const [startSprintApi] = useStartSprintMutation();
  const [completeSprintApi] = useCompleteSprintMutation();
  const [assignTaskToSprintApi] = useAssignTaskToSprintMutation();

  const activeSprint = sprints.find((s) => s.status === 'active');
  const backlogTasks = tasks.filter((t) => !t.sprintId);

  const handleCreateSprint = async (values: {
    name: string;
    goal?: string;
    capacity: number;
    startDate?: string;
    endDate?: string;
  }) => {
    const startDate = values.startDate || new Date().toISOString().split('T')[0];
    const endDate = values.endDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

    try {
      await createSprintApi({
        project_id: project.id,
        name: values.name.trim(),
        goal: values.goal?.trim() || '',
        capacity_points: Number(values.capacity || 40),
        capacity_hours: Number(values.capacity || 40),
        start_date: startDate,
        end_date: endDate,
      }).unwrap();
    } catch {
      projectService.createSprint({
        projectId: project.id,
        name: values.name.trim(),
        goal: values.goal?.trim() || '',
        capacity: Number(values.capacity || 40),
        startDate,
        endDate,
      });
    }
    message.success('Sprint created successfully');
    form.resetFields();
    setShowNewSprintModal(false);
    onSprintsUpdated();
  };

  const handleStartSprint = async (sprint: Sprint) => {
    try {
      await startSprintApi(sprint.id).unwrap();
      message.success(`Sprint "${sprint.name}" is now Active!`);
      onSprintsUpdated();
    } catch (err: unknown) {
      message.error((err as { data?: { message?: string } })?.data?.message || 'Failed to start sprint');
    }
  };

  const handleCompleteSprint = async () => {
    if (!completeModalSprint) return;
    try {
      await completeSprintApi({
        id: completeModalSprint.id,
        move_to_sprint_id: moveToSprintId,
      }).unwrap();
      message.success(`Sprint "${completeModalSprint.name}" completed!`);
      setCompleteModalSprint(null);
      setMoveToSprintId(null);
      onSprintsUpdated();
    } catch (err: unknown) {
      message.error((err as { data?: { message?: string } })?.data?.message || 'Failed to complete sprint');
    }
  };

  const handleAssignTask = async (taskId: number, sprintId: number | 'backlog') => {
    try {
      await assignTaskToSprintApi({ sprintId, taskId }).unwrap();
      message.success('Task sprint assignment updated');
      onSprintsUpdated();
    } catch {
      message.error('Failed to assign task to sprint');
    }
  };

  const getSprintTaskStats = (sprint: Sprint) => {
    const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id);
    const total = sprintTasks.length;
    const done = sprintTasks.filter((t) => t.status === 'Done' || t.status === 'Completed').length;
    const committedPts = sprintTasks.reduce((s, t) => s + (t.estimatePoints || 1), 0) || sprint.committedPoints || 0;
    const completedPts =
      sprintTasks
        .filter((t) => t.status === 'Done' || t.status === 'Completed')
        .reduce((s, t) => s + (t.estimatePoints || 1), 0) || sprint.completedPoints || 0;
    return { sprintTasks, total, done, committedPts, completedPts };
  };

  return (
    <div className="space-y-6">
      {/* Active Sprint Banner */}
      {activeSprint && (() => {
        const stats = getSprintTaskStats(activeSprint);
        const pct = stats.committedPts > 0 ? Math.round((stats.completedPts / stats.committedPts) * 100) : 0;
        return (
          <Card
            className="rounded-2xl border-primary/30 bg-primary/5 shadow-xs"
            styles={{ body: { padding: '24px' } }}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  <Sparkles size={14} /> Active Sprint
                </div>
                <h3 className="text-lg font-black text-foreground">{activeSprint.name}</h3>
                <p className="text-xs text-muted mt-0.5">
                  {activeSprint.goal || 'No sprint goal specified'}
                </p>
                <div className="flex items-center gap-4 text-xs font-semibold text-muted mt-3">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} /> {activeSprint.startDate || '—'} to {activeSprint.endDate || '—'}
                  </span>
                  <span>•</span>
                  <span>
                    Capacity: {activeSprint.capacity ?? 0} {project.estimationUnit}
                  </span>
                  <span>•</span>
                  <span>
                    Tasks: {stats.done}/{stats.total} Done
                  </span>
                </div>
              </div>

              <div className="w-full md:w-64 text-right space-y-2">
                <div>
                  <span className="text-2xl font-black text-foreground">{stats.completedPts}</span>
                  <span className="text-xs text-muted"> / {stats.committedPts} pts</span>
                </div>
                <Progress percent={pct} strokeColor="#06b6d4" size="small" />
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckCircle2 size={13} />}
                  onClick={() => setCompleteModalSprint(activeSprint)}
                  className="rounded-lg font-bold text-xs">
                  Complete Sprint
                </Button>
              </div>
            </div>
          </Card>
        );
      })()}

      {/* Sprint Backlog Header & Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-foreground">Project Sprints</h3>
          <p className="text-xs text-muted">Plan iterations, commit backlog tasks, and track historical sprints.</p>
        </div>

        <Button
          type="primary"
          icon={<Plus size={14} />}
          onClick={() => setShowNewSprintModal(true)}
          className="rounded-xl font-bold text-xs shadow-xs">
          Create Sprint
        </Button>
      </div>

      {/* Sprints Grid */}
      {sprints.length === 0 ? (
        <Card className="rounded-2xl border-border-subtle bg-card text-center py-10">
          <p className="text-xs text-muted mb-3">No sprints created yet.</p>
          <Button type="primary" size="small" onClick={() => setShowNewSprintModal(true)}>
            Create First Sprint
          </Button>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {sprints.map((s) => {
            const stats = getSprintTaskStats(s);
            return (
              <Col xs={24} md={12} key={s.id}>
                <Card
                  className="rounded-2xl border-border-subtle bg-card hover:border-primary/40 transition-colors shadow-xs h-full"
                  styles={{ body: { padding: '20px' } }}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{s.name}</h4>
                      <span className="text-xs text-muted">
                        {s.startDate || '—'} → {s.endDate || '—'}
                      </span>
                    </div>
                    <Tag
                      color={
                        s.status === 'active'
                          ? 'cyan'
                          : s.status === 'completed'
                            ? 'green'
                            : 'default'
                      }
                      className="uppercase font-bold text-[10px] m-0">
                      {s.status}
                    </Tag>
                  </div>

                  {s.goal && <p className="text-xs text-muted mb-3 line-clamp-2">{s.goal}</p>}

                  <div className="flex items-center justify-between text-xs text-muted pt-3 border-t border-border-subtle">
                    <span>
                      Capacity: <strong>{s.capacity ?? 0} {project.estimationUnit}</strong>
                    </span>
                    <span>
                      Tasks: <strong>{stats.done}/{stats.total}</strong>
                    </span>
                  </div>

                  {s.status === 'planned' && (
                    <div className="mt-3 pt-3 border-t border-border-subtle flex justify-end">
                      <Button
                        size="small"
                        type="primary"
                        icon={<Play size={12} />}
                        onClick={() => handleStartSprint(s)}
                        className="rounded-lg text-xs font-bold">
                        Start Sprint
                      </Button>
                    </div>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Backlog Tasks Assignment */}
      {tasks.length > 0 && (
        <Card
          title={
            <span className="text-sm font-black">
              Backlog ({backlogTasks.length} unassigned tasks)
            </span>
          }
          className="rounded-2xl border-border-subtle bg-card shadow-xs"
          styles={{ body: { padding: '16px' } }}>
          {backlogTasks.length === 0 ? (
            <p className="text-xs text-muted text-center py-4">All tasks are assigned to sprints.</p>
          ) : (
            <div className="divide-y divide-border-subtle">
              {backlogTasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2.5 gap-3">
                  <div className="min-w-0">
                    <span className="font-mono text-[11px] font-bold text-primary mr-2">
                      {project.key}-{t.keyNumber}
                    </span>
                    <span className="text-xs font-semibold text-foreground">{t.title}</span>
                  </div>
                  <Select
                    size="small"
                    placeholder="Assign to sprint"
                    className="w-44"
                    onChange={(val) => handleAssignTask(t.id, val)}
                    options={sprints
                      .filter((sp) => sp.status !== 'completed')
                      .map((sp) => ({ value: sp.id, label: sp.name }))}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Create Sprint Modal */}
      <Modal
        title="Create New Sprint"
        open={showNewSprintModal}
        onCancel={() => setShowNewSprintModal(false)}
        footer={null}
        destroyOnClose>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateSprint}
          initialValues={{
            capacity: 40,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          }}>
          <Form.Item
            name="name"
            label="Sprint Name"
            rules={[{ required: true, message: 'Enter sprint name' }]}>
            <Input placeholder="e.g. Sprint 2" className="rounded-xl" />
          </Form.Item>

          <Form.Item name="goal" label="Sprint Goal">
            <TextArea rows={2} placeholder="What does this sprint deliver?" className="rounded-xl" />
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

          <Form.Item name="capacity" label={`Capacity (${project.estimationUnit})`}>
            <Input type="number" className="rounded-xl" />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
            <Button onClick={() => setShowNewSprintModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={creating} className="font-bold">
              Create Sprint
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Complete Sprint & Carry-Over Modal */}
      <Modal
        title={`Complete "${completeModalSprint?.name}"`}
        open={Boolean(completeModalSprint)}
        onCancel={() => {
          setCompleteModalSprint(null);
          setMoveToSprintId(null);
        }}
        onOk={handleCompleteSprint}
        okText="Complete Sprint">
        <p className="text-xs text-muted mb-3">
          Incomplete tasks will be preserved and carried over. Choose destination for incomplete tasks:
        </p>
        <Select
          className="w-full"
          placeholder="Move incomplete tasks to Backlog (default)"
          allowClear
          value={moveToSprintId ?? undefined}
          onChange={(val) => setMoveToSprintId(val ?? null)}
          options={sprints
            .filter((sp) => sp.id !== completeModalSprint?.id && sp.status !== 'completed')
            .map((sp) => ({
              value: sp.id,
              label: (
                <span className="flex items-center gap-1">
                  <ArrowRight size={12} /> {sp.name}
                </span>
              ),
            }))}
        />
      </Modal>
    </div>
  );
}

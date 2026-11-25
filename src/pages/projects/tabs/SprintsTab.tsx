import { useState } from 'react';
import type { Project, Sprint } from '@/types/project';
import { Sparkles, Calendar, Plus } from 'lucide-react';
import { projectService } from '@/services/projectService';
import { Card, Button, Tag, Modal, Form, Input, Progress, Row, Col, message } from 'antd';

const { TextArea } = Input;

interface SprintsTabProps {
  project: Project;
  sprints: Sprint[];
  onSprintsUpdated: () => void;
}

export function SprintsTab({ project, sprints, onSprintsUpdated }: SprintsTabProps) {
  const [showNewSprintModal, setShowNewSprintModal] = useState(false);
  const [form] = Form.useForm();

  const activeSprint = sprints.find((s) => s.status === 'active');

  const handleCreateSprint = (values: {
    name: string;
    goal?: string;
    capacity: number;
    startDate?: string;
    endDate?: string;
  }) => {
    projectService.createSprint({
      projectId: project.id,
      name: values.name.trim(),
      goal: values.goal?.trim() || '',
      capacity: Number(values.capacity || 40),
      startDate: values.startDate || new Date().toISOString().split('T')[0],
      endDate: values.endDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    });
    message.success('Sprint created successfully');
    form.resetFields();
    setShowNewSprintModal(false);
    onSprintsUpdated();
  };

  return (
    <div className="space-y-6">
      {/* Active Sprint Banner */}
      {activeSprint && (
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
                  <Calendar size={13} /> {activeSprint.startDate} to {activeSprint.endDate}
                </span>
                <span>•</span>
                <span>
                  Capacity: {activeSprint.capacity} {project.estimationUnit}
                </span>
              </div>
            </div>

            <div className="w-full md:w-56 text-right">
              <span className="text-2xl font-black text-foreground">
                {activeSprint.completedPoints}
              </span>
              <span className="text-xs text-muted"> / {activeSprint.committedPoints} pts</span>
              <Progress
                percent={
                  activeSprint.committedPoints > 0
                    ? Math.round(
                        (activeSprint.completedPoints / activeSprint.committedPoints) * 100
                      )
                    : 0
                }
                size="small"
                strokeColor="var(--primary, #3b82f6)"
                className="mt-1"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Sprints List Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">All Sprints ({sprints.length})</h3>
        <Button
          type="primary"
          icon={<Plus size={14} />}
          onClick={() => {
            form.resetFields();
            form.setFieldsValue({
              capacity: 40,
              startDate: new Date().toISOString().split('T')[0],
              endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
            });
            setShowNewSprintModal(true);
          }}
          className="rounded-xl font-bold shadow-xs">
          Plan Sprint
        </Button>
      </div>

      {/* Sprints Grid */}
      <Row gutter={[16, 16]}>
        {sprints.map((sprint) => {
          const isDone = sprint.status === 'completed';
          const isActive = sprint.status === 'active';

          return (
            <Col xs={24} md={12} key={sprint.id}>
              <Card
                className={`rounded-2xl border-border-subtle shadow-xs h-full ${
                  isActive ? 'bg-primary/5 border-primary/40' : 'bg-surface-subtle'
                }`}
                styles={{ body: { padding: '20px' } }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-foreground">{sprint.name}</span>
                  <Tag
                    color={isActive ? 'blue' : isDone ? 'green' : 'default'}
                    className="font-bold text-[10px] uppercase rounded-md m-0">
                    {sprint.status}
                  </Tag>
                </div>
                <p className="text-xs text-muted line-clamp-2 mb-3">
                  {sprint.goal || 'No goal set'}
                </p>
                <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-border-subtle">
                  <span>
                    {sprint.startDate} to {sprint.endDate}
                  </span>
                  <span className="font-bold text-foreground">
                    {sprint.completedPoints} / {sprint.committedPoints} {project.estimationUnit}
                  </span>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Create Sprint Modal */}
      <Modal
        title={<span className="text-base font-black">Plan New Sprint</span>}
        open={showNewSprintModal}
        onCancel={() => setShowNewSprintModal(false)}
        footer={null}
        destroyOnClose
        centered>
        <Form form={form} layout="vertical" onFinish={handleCreateSprint} className="pt-2">
          <Form.Item
            name="name"
            label="Sprint Name"
            rules={[{ required: true, message: 'Please enter sprint name' }]}>
            <Input placeholder="e.g. Sprint 3: Customer Portal Beta" className="rounded-xl" />
          </Form.Item>

          <Form.Item name="goal" label="Sprint Goal">
            <TextArea
              rows={3}
              placeholder="Primary objective to achieve by sprint end"
              className="rounded-xl"
            />
          </Form.Item>

          <Form.Item name="capacity" label={`Team Capacity (${project.estimationUnit})`}>
            <Input type="number" className="rounded-xl" />
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

          <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle mt-4">
            <Button onClick={() => setShowNewSprintModal(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="rounded-xl font-bold shadow-xs">
              Create Sprint
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

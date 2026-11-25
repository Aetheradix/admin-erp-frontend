import { useState } from 'react';
import type { Project, ProjectTask, Milestone } from '@/types/project';
import type { ProjectPhase } from '@/types/phase';
import type { TaskStatus } from '@/types/taskStatus';
import { Clock, SlidersHorizontal, Plus, Sparkles, CheckSquare } from 'lucide-react';
import { Button, Select, Tag, Card, Input, Badge, Radio, Space, message } from 'antd';
import { projectService } from '@/services/projectService';
import { StatusSettingsModal } from '../modals/StatusSettingsModal';
import { SmartTaskCreateModal } from '../modals/SmartTaskCreateModal';
import { TaskDrawer } from '@/components/projects/TaskDrawer';
import { useCreateTaskRealMutation, useUpdateTaskRealMutation } from '@/store/api/projectApiSlice';

interface BoardTabProps {
  project: Project;
  tasks: ProjectTask[];
  phases?: ProjectPhase[];
  milestones?: Milestone[];
  onTasksUpdated: () => void;
}

export function BoardTab({
  project,
  tasks,
  phases = [],
  milestones: _milestones = [],
  onTasksUpdated,
}: BoardTabProps) {
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [showStatusSettings, setShowStatusSettings] = useState(false);
  const [showSmartCreate, setShowSmartCreate] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);

  const [createTaskReal] = useCreateTaskRealMutation();
  const [updateTaskReal] = useUpdateTaskRealMutation();

  // Quick Add Task state
  const [showQuickAdd, setShowQuickAdd] = useState<string | null>(null);
  const [quickTitle, setQuickTitle] = useState('');

  const statuses: TaskStatus[] = projectService.getTaskStatuses(project.id);

  const filteredTasks = tasks.filter((t) => {
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterPhase !== 'all' && String(t.phaseId) !== filterPhase) return false;
    return true;
  });

  const handleStatusChange = async (task: ProjectTask, newStatus: string) => {
    try {
      const backendStatus =
        newStatus === 'Done' || newStatus === 'Completed'
          ? 'Completed'
          : newStatus === 'In Review' || newStatus === 'QA'
            ? 'In Review'
            : newStatus === 'Blocked'
              ? 'Blocked'
              : newStatus === 'In Progress'
                ? 'In Progress'
                : 'Pending';
      await updateTaskReal({ id: task.id, data: { task_status: backendStatus } }).unwrap();
    } catch {
      // offline fallback
    }
    projectService.saveTask({ id: task.id, status: newStatus });
    onTasksUpdated();
    message.success(`Task moved to ${newStatus}`);
  };

  const handleQuickAdd = async (statusName: string) => {
    if (!quickTitle.trim()) return;
    try {
      const backendStatus =
        statusName === 'Done' || statusName === 'Completed'
          ? 'Completed'
          : statusName === 'In Review' || statusName === 'QA'
            ? 'In Review'
            : statusName === 'Blocked'
              ? 'Blocked'
              : statusName === 'In Progress'
                ? 'In Progress'
                : 'Pending';
      await createTaskReal({
        task_title: quickTitle.trim(),
        task_description: quickTitle.trim(),
        project_id: project.id,
        task_status: backendStatus,
        priority: 'Medium',
      }).unwrap();
    } catch {
      // offline fallback
    }
    projectService.saveTask({
      projectId: project.id,
      title: quickTitle.trim(),
      status: statusName,
      priority: 'Medium',
      durationDays: 3,
      estimatePoints: 3,
      estimateMinutes: 720,
    });
    setQuickTitle('');
    setShowQuickAdd(null);
    onTasksUpdated();
    message.success('Task created');
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Configuration Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Space wrap size="middle">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted">Priority:</span>
            <Radio.Group
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              buttonStyle="solid"
              size="small">
              <Radio.Button value="all">All</Radio.Button>
              <Radio.Button value="High">High</Radio.Button>
              <Radio.Button value="Medium">Medium</Radio.Button>
              <Radio.Button value="Low">Low</Radio.Button>
            </Radio.Group>
          </div>

          {phases.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted">Phase:</span>
              <Select
                value={filterPhase}
                onChange={setFilterPhase}
                size="small"
                className="w-40"
                options={[
                  { value: 'all', label: 'All Phases' },
                  ...phases.map((ph) => ({ value: String(ph.id), label: ph.name })),
                ]}
              />
            </div>
          )}
        </Space>

        <Space wrap>
          <Button
            type="primary"
            icon={<Plus size={13} />}
            onClick={() => setShowSmartCreate(true)}
            className="rounded-xl font-bold text-xs h-9">
            Assign Task
          </Button>

          <Button
            icon={<SlidersHorizontal size={13} className="text-primary" />}
            onClick={() => setShowStatusSettings(true)}
            className="rounded-xl font-bold text-xs h-9">
            Workflow Statuses ({statuses.length})
          </Button>
        </Space>
      </div>

      {/* Dynamic Kanban Board Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {statuses.map((statusObj) => {
          const colTasks = filteredTasks.filter((t) => t.status === statusObj.name);

          return (
            <div
              key={statusObj.id}
              className="flex flex-col bg-surface-subtle/50 rounded-2xl border border-border-subtle p-3 min-w-[280px] w-[300px] shrink-0 min-h-[520px]">
              {/* Column Header */}
              <div className="flex items-center justify-between px-1.5 py-1.5 mb-2">
                <Space size={6}>
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: statusObj.color }}
                  />
                  <span className="text-xs font-black text-foreground">{statusObj.name}</span>
                  <Badge
                    count={colTasks.length}
                    style={{
                      backgroundColor: 'var(--surface-elevated, #f1f5f9)',
                      color: 'var(--muted, #64748b)',
                      boxShadow: 'none',
                    }}
                  />
                </Space>

                <Button
                  size="small"
                  type="text"
                  icon={<Plus size={14} />}
                  onClick={() => setShowQuickAdd(statusObj.name)}
                />
              </div>

              {/* Quick Add Form inside column */}
              {showQuickAdd === statusObj.name && (
                <div className="p-2.5 mb-2.5 bg-background border border-primary/40 rounded-xl space-y-2 animate-in fade-in">
                  <Input
                    size="small"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    placeholder="Task title..."
                    autoFocus
                    onPressEnter={() => handleQuickAdd(statusObj.name)}
                    className="rounded-lg"
                  />
                  <div className="flex justify-end gap-1.5">
                    <Button size="small" type="text" onClick={() => setShowQuickAdd(null)}>
                      Cancel
                    </Button>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleQuickAdd(statusObj.name)}
                      className="font-bold">
                      Add
                    </Button>
                  </div>
                </div>
              )}

              {/* Task Cards List */}
              <div className="flex-1 space-y-2.5 overflow-y-auto custom-scrollbar">
                {colTasks.length === 0 ? (
                  <div className="h-28 flex items-center justify-center border border-dashed border-border-subtle rounded-xl text-xs text-muted/60">
                    No tasks
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const taskPhase = phases.find((p) => p.id === task.phaseId);

                    return (
                      <Card
                        key={task.id}
                        hoverable
                        onClick={() => setSelectedTask(task)}
                        className="rounded-xl border-border-subtle bg-background shadow-xs hover:border-primary/50 transition-all cursor-pointer group"
                        styles={{
                          body: {
                            padding: '12px',
                            borderLeft: `4px solid ${statusObj.color}`,
                            borderRadius: '12px',
                          },
                        }}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono font-bold text-primary">
                            {project.key}-{task.keyNumber}
                          </span>
                          <Tag
                            color={
                              task.priority === 'High'
                                ? 'red'
                                : task.priority === 'Medium'
                                  ? 'gold'
                                  : 'default'
                            }
                            className="font-bold text-[9px] uppercase m-0">
                            {task.priority}
                          </Tag>
                        </div>

                        <h4 className="text-xs font-bold text-foreground line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">
                          {task.title}
                        </h4>

                        {taskPhase && (
                          <div className="mb-2">
                            <Tag
                              bordered={false}
                              className="text-[9px] font-bold flex items-center gap-1 w-max m-0 bg-surface-elevated text-muted">
                              <Sparkles size={10} className="text-primary" />
                              {taskPhase.name}
                            </Tag>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-muted pt-2 border-t border-border-subtle">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <Clock size={11} />
                              {task.durationDays}d
                            </span>
                            {task.subtasks && task.subtasks.length > 0 && (
                              <span className="flex items-center gap-0.5 text-[10px]">
                                <CheckSquare size={10} />
                                {task.subtasks.filter((s) => s.status === 'Done').length}/
                                {task.subtasks.length}
                              </span>
                            )}
                          </div>

                          {/* Quick Status Select */}
                          <div onClick={(e) => e.stopPropagation()}>
                            <Select
                              size="small"
                              value={task.status}
                              onChange={(val) => handleStatusChange(task, val)}
                              className="w-28 text-[10px]"
                              options={statuses.map((s) => ({
                                value: s.name,
                                label: s.name,
                              }))}
                            />
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Workflow Settings Modal */}
      <StatusSettingsModal
        projectId={project.id}
        isOpen={showStatusSettings}
        onClose={() => setShowStatusSettings(false)}
        onStatusUpdated={onTasksUpdated}
      />

      {/* Smart Task Assignment Modal */}
      <SmartTaskCreateModal
        visible={showSmartCreate}
        projectId={project.id}
        projectKey={project.key}
        phases={phases}
        onClose={() => setShowSmartCreate(false)}
        onSuccess={onTasksUpdated}
      />

      {/* Right-Side Task Details Drawer */}
      <TaskDrawer
        task={selectedTask}
        open={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        onTaskUpdated={() => {
          onTasksUpdated();
          if (selectedTask) {
            const fresh = projectService
              .getProjectTasks(project.id)
              .find((t) => t.id === selectedTask.id);
            if (fresh) setSelectedTask(fresh);
          }
        }}
      />
    </div>
  );
}

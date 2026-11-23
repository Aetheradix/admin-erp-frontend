import { useState } from 'react';
import type { Project, Milestone, ProjectTask } from '@/types/project';
import type { ProjectPhase } from '@/types/phase';
import type { TaskStatus } from '@/types/taskStatus';
import { Target, ShieldCheck, Layers, Sparkles, Plus } from 'lucide-react';
import {
  Table,
  Card,
  Radio,
  Select,
  Tag,
  Space,
  Button,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { projectService } from '@/services/projectService';
import { SmartTaskCreateModal } from '../modals/SmartTaskCreateModal';
import { TaskDrawer } from '@/components/projects/TaskDrawer';
import { useUpdateTaskRealMutation } from '@/store/api/projectApiSlice';

interface ListTabProps {
  project: Project;
  milestones: Milestone[];
  tasks: ProjectTask[];
  phases?: ProjectPhase[];
  onTasksUpdated?: () => void;
}

export function ListTab({
  project,
  milestones,
  tasks,
  phases = [],
  onTasksUpdated = () => {},
}: ListTabProps) {
  const [groupBy, setGroupBy] = useState<'phase' | 'milestone'>('phase');
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [showSmartCreate, setShowSmartCreate] = useState(false);
  const [updateTaskReal] = useUpdateTaskRealMutation();

  const statuses: TaskStatus[] = projectService.getTaskStatuses(project.id);

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
    message.success(`Status updated to ${newStatus}`);
  };

  // Grouping logic
  const groups: {
    id: number | string;
    title: string;
    subtitle?: string;
    color?: string;
    tasks: ProjectTask[];
  }[] = [];

  if (groupBy === 'phase') {
    phases.forEach((p) => {
      groups.push({
        id: `phase-${p.id}`,
        title: p.name,
        subtitle: `${p.startDate || ''} → ${p.endDate || ''} • Lead: ${p.ownerName || 'Lead'}`,
        color: p.color,
        tasks: tasks.filter((t) => t.phaseId === p.id),
      });
    });

    const unassignedPhaseTasks = tasks.filter((t) => !t.phaseId);
    if (unassignedPhaseTasks.length > 0) {
      groups.push({
        id: 'unassigned-phase',
        title: 'Unassigned Phase',
        subtitle: 'Tasks not yet placed into a project lifecycle phase',
        tasks: unassignedPhaseTasks,
      });
    }
  } else {
    milestones.forEach((m) => {
      groups.push({
        id: `milestone-${m.id}`,
        title: m.name,
        subtitle: `Target: ${m.targetDate}${m.requiresSignoff ? ' • Requires Sign-off' : ''}`,
        tasks: tasks.filter((t) => t.milestoneId === m.id),
      });
    });

    const unassignedMilestoneTasks = tasks.filter((t) => !t.milestoneId);
    if (unassignedMilestoneTasks.length > 0) {
      groups.push({
        id: 'unassigned-milestone',
        title: 'Unassigned Milestone',
        subtitle: 'Tasks without a target milestone',
        tasks: unassignedMilestoneTasks,
      });
    }
  }

  const tableColumns: ColumnsType<ProjectTask> = [
    {
      title: 'Key',
      key: 'key',
      width: 100,
      render: (_, record) => (
        <span className="font-mono font-bold text-primary text-xs">
          {project.key}-{record.keyNumber}
        </span>
      ),
    },
    {
      title: 'Title',
      key: 'title',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <span className="font-semibold text-xs text-foreground hover:text-primary transition-colors">
            {record.title}
          </span>
          {record.phaseId && groupBy !== 'phase' && (
            <Tag bordered={false} className="text-[10px] m-0 bg-surface-elevated text-muted">
              <Sparkles size={9} className="text-primary inline mr-1" />
              {phases.find((p) => p.id === record.phaseId)?.name}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => (
        <Tag
          color={priority === 'High' ? 'red' : priority === 'Medium' ? 'gold' : 'default'}
          className="font-bold text-[10px] uppercase">
          {priority}
        </Tag>
      ),
    },
    {
      title: 'Assignee',
      key: 'assignee',
      width: 160,
      render: (_, record) => (
        <span className="text-xs text-muted">
          {record.assigneeNames?.join(', ') || 'Unassigned'}
        </span>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (due: string) => <span className="text-xs text-muted">{due || '—'}</span>,
    },
    {
      title: 'Duration',
      dataIndex: 'durationDays',
      key: 'durationDays',
      width: 90,
      render: (dur: number) => <span className="text-xs text-muted">{dur}d</span>,
    },
    {
      title: 'Status',
      key: 'status',
      width: 140,
      render: (_, record) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Select
            size="small"
            value={record.status}
            onChange={(val) => handleStatusChange(record, val)}
            className="w-32 text-xs"
            options={statuses.map((s) => ({
              value: s.name,
              label: (
                <Space size={6}>
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: s.color }}
                  />
                  <span>{s.name}</span>
                </Space>
              ),
            }))}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Grouping Toggle Control */}
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <Space align="center">
          <span className="text-xs font-semibold text-muted">Group By:</span>
          <Radio.Group
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            buttonStyle="solid"
            size="small">
            <Radio.Button value="phase">
              <Space orientation="horizontal" size={4}>
                <Layers size={12} />
                <span>Project Phase</span>
              </Space>
            </Radio.Button>
            <Radio.Button value="milestone">
              <Space orientation="horizontal" size={4}>
                <Target size={12} />
                <span>Milestone</span>
              </Space>
            </Radio.Button>
          </Radio.Group>
        </Space>

        <Space>
          <Button
            type="primary"
            icon={<Plus size={13} />}
            onClick={() => setShowSmartCreate(true)}
            className="rounded-xl font-bold text-xs h-8">
            Assign Task
          </Button>
          <span className="text-xs text-muted font-semibold">
            Total: {tasks.length} tasks
          </span>
        </Space>
      </div>

      {/* Render Groups with Ant Design Table */}
      {groups.map((group) => {
        const completedCount = group.tasks.filter((t) => t.status === 'Done').length;

        return (
          <Card
            key={group.id}
            className="rounded-2xl border-border-subtle bg-surface-subtle overflow-hidden shadow-xs"
            styles={{ body: { padding: 0 } }}>
            {/* Group Header */}
            <div className="p-4 bg-surface-elevated/40 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <Space size={10}>
                {groupBy === 'phase' ? (
                  <span
                    className="w-3 h-3 rounded-full inline-block shrink-0"
                    style={{ backgroundColor: group.color || '#3b82f6' }}
                  />
                ) : (
                  <Target size={16} className="text-primary shrink-0" />
                )}

                <div>
                  <Space size={8}>
                    <span className="text-xs font-black text-foreground">{group.title}</span>
                    {group.subtitle?.includes('Sign-off') && (
                      <Tag color="purple" className="text-[10px] font-bold flex items-center gap-1 m-0">
                        <ShieldCheck size={11} /> Requires Sign-off
                      </Tag>
                    )}
                  </Space>
                  {group.subtitle && (
                    <span className="text-[11px] text-muted block">{group.subtitle}</span>
                  )}
                </div>
              </Space>

              <Tag color="default" className="font-bold text-xs m-0">
                {completedCount} / {group.tasks.length} Done
              </Tag>
            </div>

            {/* Ant Design Task Table */}
            <Table
              dataSource={group.tasks}
              columns={tableColumns}
              rowKey="id"
              pagination={false}
              size="middle"
              onRow={(record) => ({
                onClick: () => setSelectedTask(record),
                className: 'cursor-pointer hover:bg-surface-elevated transition-colors',
              })}
            />
          </Card>
        );
      })}

      {/* Right-Side Task Detail Drawer */}
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

      {/* Smart Task Assignment Modal */}
      <SmartTaskCreateModal
        visible={showSmartCreate}
        projectId={project.id}
        projectKey={project.key}
        phases={phases}
        onClose={() => setShowSmartCreate(false)}
        onSuccess={onTasksUpdated}
      />
    </div>
  );
}

import { useMemo } from 'react';
import type { Project, Milestone, ProjectTask, Sprint, ProjectDocument } from '@/types/project';
import { Plus, FileText, Activity as ActivityIcon, CheckCircle2, Clock } from 'lucide-react';
import { Card, Row, Col, Progress, Tag, Button, Avatar } from 'antd';
import { useGetProjectActivityQuery } from '@/store/api/projectApiSlice';

interface OverviewTabProps {
  project: Project;
  milestones: Milestone[];
  tasks: ProjectTask[];
  sprints?: Sprint[];
  documents?: ProjectDocument[];
  onTabChange: (tabKey: string) => void;
  onAddTask?: () => void;
  onProjectUpdated?: () => void;
}

export function OverviewTab({
  project,
  milestones,
  tasks,
  documents = [],
  onTabChange,
  onAddTask,
}: OverviewTabProps) {
  const { data: activities = [] } = useGetProjectActivityQuery({ id: project.id, limit: 6 });

  const openTasks = useMemo(
    () => tasks.filter((t) => t.status !== 'Done' && t.status !== 'Completed'),
    [tasks]
  );

  const doneDocsCount = documents.filter((d) => d.status === 'done').length;
  const activeDocsCount = documents.filter((d) => d.status !== 'not_needed').length;
  const docsPct = activeDocsCount > 0 ? Math.round((doneDocsCount / activeDocsCount) * 100) : 0;
  const overdueDocsCount = documents.filter(
    (d) =>
      d.status !== 'done' &&
      d.status !== 'not_needed' &&
      Boolean(d.dueDate) &&
      new Date(d.dueDate!) < new Date()
  ).length;

  const formatShortDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Row gutter={[20, 20]}>
      {/* Left Column: Steps + Next Up */}
      <Col xs={24} lg={16} className="space-y-5">
        {/* Steps Card (Live Milestones) */}
        <Card
          className="rounded-2xl border-border-subtle bg-card shadow-xs"
          styles={{ body: { padding: '20px' } }}>
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="text-sm font-black text-foreground m-0">Steps</h3>
            <div className="flex items-center gap-2">
              <Button
                size="small"
                onClick={() => onTabChange('phases')}
                className="rounded-lg text-xs font-semibold">
                Edit steps
              </Button>
              {onAddTask && (
                <Button
                  size="small"
                  type="primary"
                  icon={<Plus size={12} />}
                  onClick={onAddTask}
                  className="rounded-lg text-xs font-bold">
                  Task
                </Button>
              )}
            </div>
          </div>

          {milestones.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted border border-dashed border-border-subtle rounded-xl">
              No steps defined yet. Click <strong>Edit steps</strong> to add milestones.
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {milestones.map((ms, idx) => {
                const msTasks = tasks.filter((t) => t.milestoneId === ms.id);
                const doneMsTasks = msTasks.filter(
                  (t) => t.status === 'Done' || t.status === 'Completed'
                ).length;
                const pct =
                  msTasks.length > 0
                    ? Math.round((doneMsTasks / msTasks.length) * 100)
                    : ms.progress ?? 0;

                const statusLabel =
                  ms.status === 'completed'
                    ? 'Completed'
                    : ms.status === 'in_progress'
                      ? 'In progress'
                      : ms.status === 'missed'
                        ? 'Blocked'
                        : 'Not started';

                return (
                  <div
                    key={ms.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-surface-subtle border border-border-subtle text-xs font-bold text-muted flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-foreground truncate">{ms.name}</div>
                        <div className="text-xs text-muted">
                          {formatShortDate(ms.targetDate)} ·{' '}
                          {msTasks.length > 0
                            ? `${doneMsTasks}/${msTasks.length} tasks`
                            : 'No tasks yet'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-24">
                        <Progress percent={pct} showInfo={false} size="small" />
                      </div>
                      <Tag
                        color={
                          ms.status === 'completed'
                            ? 'success'
                            : ms.status === 'in_progress'
                              ? 'processing'
                              : 'default'
                        }
                        className="text-[11px] font-semibold m-0 rounded-md">
                        {statusLabel}
                      </Tag>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Next Up Card (Live Open Tasks) */}
        <Card
          className="rounded-2xl border-border-subtle bg-card shadow-xs"
          styles={{ body: { padding: '20px' } }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-foreground m-0">Next up</h3>
            {openTasks.length > 0 && (
              <Button
                type="link"
                size="small"
                onClick={() => onTabChange('list')}
                className="text-xs p-0">
                View all ({openTasks.length})
              </Button>
            )}
          </div>

          {openTasks.length === 0 ? (
            <p className="text-xs text-muted m-0">
              No open tasks. Add one with <strong>+ Task</strong>.
            </p>
          ) : (
            <div className="divide-y divide-border-subtle">
              {openTasks.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  onClick={() => onTabChange('board')}
                  className="flex items-center justify-between py-2.5 gap-3 cursor-pointer hover:bg-surface-subtle/60 px-2 -mx-2 rounded-lg transition-colors">
                  <div className="min-w-0">
                    <span className="font-mono text-[11px] font-bold text-primary mr-2">
                      {project.key}-{t.keyNumber}
                    </span>
                    <span className="text-xs font-semibold text-foreground">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Tag
                      color={t.priority === 'High' ? 'red' : t.priority === 'Medium' ? 'gold' : 'default'}
                      className="text-[10px] font-bold m-0">
                      {t.priority}
                    </Tag>
                    <Tag className="text-[10px] m-0">{t.status}</Tag>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </Col>

      {/* Right Column: Documents + Activity */}
      <Col xs={24} lg={8} className="space-y-5">
        {/* Documents Summary Card */}
        <Card
          className="rounded-2xl border-border-subtle bg-card shadow-xs"
          styles={{ body: { padding: '20px' } }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-foreground flex items-center gap-1.5 m-0">
              <FileText size={14} className="text-primary" /> Documents
            </h3>
            <Button
              size="small"
              onClick={() => onTabChange('documents')}
              className="rounded-lg text-xs font-semibold">
              Open checklist
            </Button>
          </div>

          <div className="flex items-center justify-between text-xs text-muted mb-1.5">
            <span>
              {doneDocsCount} of {activeDocsCount} done
            </span>
            <span className={overdueDocsCount > 0 ? 'text-rose-500 font-semibold' : ''}>
              {overdueDocsCount > 0 ? (
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {overdueDocsCount} overdue
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-emerald-500" /> Nothing overdue
                </span>
              )}
            </span>
          </div>
          <Progress percent={docsPct} showInfo={false} size="small" strokeColor="#10b981" />
        </Card>

        {/* Live Activity Card */}
        <Card
          className="rounded-2xl border-border-subtle bg-card shadow-xs"
          styles={{ body: { padding: '20px' } }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-foreground flex items-center gap-1.5 m-0">
              <ActivityIcon size={14} className="text-primary" /> Activity
            </h3>
            <Button
              type="link"
              size="small"
              onClick={() => onTabChange('activity')}
              className="text-xs p-0">
              View all
            </Button>
          </div>

          {activities.length === 0 ? (
            <p className="text-xs text-muted m-0">No recent activity logged yet.</p>
          ) : (
            <div className="space-y-3">
              {activities.map((act) => {
                const actor = act.actor_name || 'System';
                const initials = actor
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <div key={act.id} className="flex items-start justify-between gap-2 text-xs">
                    <div className="flex items-start gap-2 min-w-0">
                      <Avatar
                        size={22}
                        src={act.actor_image || undefined}
                        className="bg-amber-500/20 text-amber-700 font-bold text-[10px] shrink-0">
                        {initials}
                      </Avatar>
                      <div className="min-w-0">
                        <span className="font-bold text-foreground">{actor}</span>{' '}
                        <span className="text-muted">
                          {act.action.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted shrink-0">
                      {act.created_at ? formatShortDate(act.created_at) : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
}

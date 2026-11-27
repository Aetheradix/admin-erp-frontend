import { useState, useMemo } from 'react';
import type { Project, Milestone, ProjectTask, Dependency } from '@/types/project';
import { Zap, Link2, Trash2 } from 'lucide-react';
import { Card, Radio, Checkbox, Space, Button, Modal, Form, Select, Input, Tag, message } from 'antd';
import { useCreateDependencyMutation, useDeleteDependencyMutation } from '@/store/api/projectApiSlice';

interface TimelineTabProps {
  project: Project;
  milestones: Milestone[];
  tasks: ProjectTask[];
  dependencies: Dependency[];
  onUpdated?: () => void;
}

export function TimelineTab({ project, milestones, tasks, dependencies, onUpdated }: TimelineTabProps) {
  const [zoom, setZoom] = useState<'day' | 'week' | 'month'>('week');
  const [showCriticalPath, setShowCriticalPath] = useState(true);
  const [showDepModal, setShowDepModal] = useState(false);
  const [depForm] = Form.useForm();
  const [createDepApi, { isLoading: savingDep }] = useCreateDependencyMutation();
  const [deleteDepApi] = useDeleteDependencyMutation();

  // Derive global timeline bounds (min start date, max due date)
  const { minDate, totalDays } = useMemo(() => {
    let min = '9999-99-99';
    let max = '0000-00-00';
    tasks.forEach((t) => {
      if (t.startDate && t.startDate < min) min = t.startDate;
      if (t.dueDate && t.dueDate > max) max = t.dueDate;
    });
    milestones.forEach((m) => {
      if (m.targetDate && m.targetDate > max) max = m.targetDate;
      if (m.targetDate && m.targetDate < min) min = m.targetDate;
    });

    if (min === '9999-99-99') min = project.startDate || '2026-11-01';
    if (max === '0000-00-00') max = project.targetDate || '2026-12-31';

    const minD = new Date(min + 'T00:00:00');
    const maxD = new Date(max + 'T00:00:00');
    const diff = Math.max(
      15,
      Math.ceil((maxD.getTime() - minD.getTime()) / (1000 * 60 * 60 * 24)) + 7
    );

    return { minDate: minD, totalDays: diff };
  }, [tasks, milestones, project]);

  const dayWidth = zoom === 'day' ? 36 : zoom === 'week' ? 18 : 8;
  const chartWidth = totalDays * dayWidth;

  const getXCoordinate = (dateStr?: string) => {
    if (!dateStr) return 0;
    const d = new Date(dateStr + 'T00:00:00');
    const diff = (d.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, diff * dayWidth);
  };

  const todayX = getXCoordinate(new Date().toISOString().split('T')[0]);

  // Generate date timeline header markers
  const timelineMarkers = useMemo(() => {
    const markers: { label: string; x: number }[] = [];
    for (let i = 0; i < totalDays; i += zoom === 'day' ? 1 : zoom === 'week' ? 7 : 14) {
      const d = new Date(minDate);
      d.setDate(d.getDate() + i);
      const label = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      markers.push({ label, x: i * dayWidth });
    }
    return markers;
  }, [minDate, totalDays, dayWidth, zoom]);

  return (
    <div className="space-y-4">
      {/* Timeline Controls */}
      <Card
        className="rounded-2xl border-border-subtle bg-surface-subtle shadow-xs"
        styles={{ body: { padding: '12px 16px' } }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Space size="middle">
            <span className="text-xs font-semibold text-muted">Zoom:</span>
            <Radio.Group
              value={zoom}
              onChange={(e) => setZoom(e.target.value)}
              buttonStyle="solid"
              size="small">
              <Radio.Button value="day">Day</Radio.Button>
              <Radio.Button value="week">Week</Radio.Button>
              <Radio.Button value="month">Month</Radio.Button>
            </Radio.Group>
          </Space>

          <Space size="middle">
            <Checkbox
              checked={showCriticalPath}
              onChange={(e) => setShowCriticalPath(e.target.checked)}>
              <span className="flex items-center gap-1 text-xs font-bold text-foreground">
                <Zap size={13} className="text-rose-500" />
                Highlight Critical Path
              </span>
            </Checkbox>

            <Button
              size="small"
              type="primary"
              icon={<Link2 size={12} />}
              onClick={() => setShowDepModal(true)}
              className="rounded-lg text-xs font-bold">
              Add Dependency
            </Button>
          </Space>
        </div>
      </Card>

      {/* Main Gantt Split Container */}
      <div className="rounded-2xl border border-border-subtle bg-surface-subtle overflow-hidden flex flex-col md:flex-row min-h-112.5">
        {/* Left Side: Task Grid */}
        <div className="w-full md:w-80 border-r border-border-subtle bg-background shrink-0 overflow-y-auto">
          <div className="h-10 px-4 border-b border-border-subtle bg-surface-elevated/40 flex items-center font-bold text-xs text-muted">
            Task Hierarchy
          </div>
          <div className="divide-y divide-border-subtle">
            {tasks.map((task) => {
              const isCrit = showCriticalPath && task.isCritical;
              return (
                <div key={task.id} className="h-12 px-4 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <span className="font-mono text-[10px] font-bold text-primary mr-2">
                      {project.key}-{task.keyNumber}
                    </span>
                    <span className="font-semibold text-foreground truncate block">
                      {task.title}
                    </span>
                  </div>
                  {isCrit && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/15 text-rose-500 uppercase">
                      Crit
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Virtualized SVG Chart */}
        <div className="flex-1 overflow-x-auto overflow-y-auto relative bg-surface-subtle/30 custom-scrollbar">
          <div style={{ width: chartWidth }} className="relative h-full min-h-112.5">
            {/* Header Dates */}
            <div className="h-10 border-b border-border-subtle relative bg-surface-elevated/20">
              {timelineMarkers.map((m, idx) => (
                <div
                  key={idx}
                  style={{ left: m.x }}
                  className="absolute top-2.5 text-[10px] font-semibold text-muted border-l border-border-subtle pl-1 whitespace-nowrap">
                  {m.label}
                </div>
              ))}
            </div>

            {/* Today Line */}
            {todayX > 0 && todayX < chartWidth && (
              <div
                style={{ left: todayX }}
                className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10 pointer-events-none opacity-80"
                title="Today">
                <span className="text-[9px] font-bold bg-rose-500 text-white px-1 rounded-b absolute -top-0 -left-4">
                  TODAY
                </span>
              </div>
            )}

            {/* SVG Connecting Curves for Dependencies */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              {dependencies.map((dep) => {
                const predIndex = tasks.findIndex((t) => t.id === dep.predecessorId);
                const succIndex = tasks.findIndex((t) => t.id === dep.successorId);
                if (predIndex === -1 || succIndex === -1) return null;

                const pred = tasks[predIndex];
                const succ = tasks[succIndex];
                const predX = getXCoordinate(pred.dueDate);
                const predY = predIndex * 48 + 24 + 40; // 48px row height, offset 40px for header
                const succX = getXCoordinate(succ.startDate);
                const succY = succIndex * 48 + 24 + 40;

                const midX = (predX + succX) / 2;
                const path = `M ${predX} ${predY} C ${midX} ${predY}, ${midX} ${succY}, ${succX} ${succY}`;

                return (
                  <path
                    key={dep.id}
                    d={path}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    className="opacity-60"
                  />
                );
              })}
            </svg>

            {/* Task Bars */}
            <div className="relative">
              {tasks.map((task) => {
                const startX = getXCoordinate(task.startDate);
                const endX = getXCoordinate(task.dueDate);
                const width = Math.max(dayWidth, endX - startX);
                const isCrit = showCriticalPath && task.isCritical;

                const barColor = isCrit
                  ? 'bg-rose-500 text-white'
                  : task.status === 'Done'
                    ? 'bg-emerald-500 text-white'
                    : task.status === 'In Progress'
                      ? 'bg-primary text-white'
                      : 'bg-surface-elevated text-foreground border border-border-subtle';

                return (
                  <div
                    key={task.id}
                    className="h-12 border-b border-border-subtle/50 relative flex items-center">
                    <div
                      style={{ left: startX, width }}
                      className={`absolute h-7 rounded-lg px-2 flex items-center justify-between text-[11px] font-bold shadow-xs transition-all cursor-pointer hover:scale-y-110 ${barColor}`}
                      title={`${task.title} (${task.startDate} to ${task.dueDate})`}>
                      <span className="truncate">{task.title}</span>
                      <span className="text-[9px] opacity-80 shrink-0 ml-1">
                        {task.durationDays}d
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Active Dependencies List */}
      {dependencies.length > 0 && (
        <Card
          title={<span className="text-xs font-black uppercase tracking-wider text-muted">Task Dependencies ({dependencies.length})</span>}
          className="rounded-2xl border-border-subtle bg-card shadow-xs"
          styles={{ body: { padding: '12px 16px' } }}>
          <div className="flex flex-wrap gap-2">
            {dependencies.map((d) => {
              const pred = tasks.find((t) => t.id === d.predecessorId);
              const succ = tasks.find((t) => t.id === d.successorId);
              return (
                <Tag
                  key={d.id}
                  closable
                  onClose={async (e) => {
                    e.preventDefault();
                    try {
                      await deleteDepApi(d.id).unwrap();
                      message.success('Dependency removed');
                      onUpdated?.();
                    } catch {
                      message.error('Failed to remove dependency');
                    }
                  }}
                  closeIcon={<Trash2 size={11} className="inline ml-1 text-red-500" />}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                  <span>{pred?.title || `#${d.predecessorId}`}</span>
                  <span className="text-primary font-mono">→ ({d.depType}{d.lagDays ? ` ${d.lagDays > 0 ? `+${d.lagDays}d` : `${d.lagDays}d`}` : ''}) →</span>
                  <span>{succ?.title || `#${d.successorId}`}</span>
                </Tag>
              );
            })}
          </div>
        </Card>
      )}

      {/* Create Dependency Modal */}
      <Modal
        title="Add Task Dependency"
        open={showDepModal}
        onCancel={() => setShowDepModal(false)}
        footer={null}
        destroyOnClose>
        <Form
          form={depForm}
          layout="vertical"
          initialValues={{ dependency_type: 'FS', lag_days: 0 }}
          onFinish={async (values: {
            predecessor_id: number;
            successor_id: number;
            dependency_type: 'FS' | 'SS' | 'FF' | 'SF';
            lag_days?: number;
          }) => {
            try {
              await createDepApi({
                project_id: project.id,
                predecessor_id: values.predecessor_id,
                successor_id: values.successor_id,
                dependency_type: values.dependency_type,
                lag_days: Number(values.lag_days || 0),
              }).unwrap();
              message.success('Dependency added');
              depForm.resetFields();
              setShowDepModal(false);
              onUpdated?.();
            } catch (err: unknown) {
              message.error((err as { data?: { message?: string } })?.data?.message || 'Failed to add dependency');
            }
          }}>
          <Form.Item name="predecessor_id" label="Predecessor Task" rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder="Select task that comes first"
              options={tasks.map((t) => ({ value: t.id, label: `${project.key}-${t.keyNumber} ${t.title}` }))}
            />
          </Form.Item>
          <Form.Item name="successor_id" label="Successor Task" rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder="Select dependent task"
              options={tasks.map((t) => ({ value: t.id, label: `${project.key}-${t.keyNumber} ${t.title}` }))}
            />
          </Form.Item>
          <Space className="w-full" size="middle">
            <Form.Item name="dependency_type" label="Type" className="w-44">
              <Select
                options={[
                  { value: 'FS', label: 'Finish-to-Start (FS)' },
                  { value: 'SS', label: 'Start-to-Start (SS)' },
                  { value: 'FF', label: 'Finish-to-Finish (FF)' },
                  { value: 'SF', label: 'Start-to-Finish (SF)' },
                ]}
              />
            </Form.Item>
            <Form.Item name="lag_days" label="Lag (Days)" className="w-32">
              <Input type="number" />
            </Form.Item>
          </Space>
          <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
            <Button onClick={() => setShowDepModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={savingDep} className="font-bold">
              Add Dependency
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

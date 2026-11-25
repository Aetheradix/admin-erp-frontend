import { useState, useMemo } from 'react';
import type { Project, Milestone, ProjectTask, Dependency } from '@/types/project';
import { Zap } from 'lucide-react';
import { Card, Radio, Checkbox, Space } from 'antd';

interface TimelineTabProps {
  project: Project;
  milestones: Milestone[];
  tasks: ProjectTask[];
  dependencies: Dependency[];
}

export function TimelineTab({ project, milestones, tasks, dependencies }: TimelineTabProps) {
  const [zoom, setZoom] = useState<'day' | 'week' | 'month'>('week');
  const [showCriticalPath, setShowCriticalPath] = useState(true);

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

          <Checkbox
            checked={showCriticalPath}
            onChange={(e) => setShowCriticalPath(e.target.checked)}>
            <span className="flex items-center gap-1 text-xs font-bold text-foreground">
              <Zap size={13} className="text-rose-500" />
              Highlight Critical Path
            </span>
          </Checkbox>
        </div>
      </Card>

      {/* Main Gantt Split Container */}
      <div className="rounded-2xl border border-border-subtle bg-surface-subtle overflow-hidden flex flex-col md:flex-row min-h-[450px]">
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
          <div style={{ width: chartWidth }} className="relative h-full min-h-[450px]">
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
    </div>
  );
}

import React from 'react';
import { Card, Tooltip } from 'antd';
import { Calendar, AlertCircle } from 'lucide-react';
import { PriorityTag } from './PriorityTag';
import { AssigneeAvatar } from './AssigneeAvatar';
import type { ProjectTask } from '@/types/project';

interface TaskCardProps {
  task: ProjectTask;
  onClick?: (task: ProjectTask) => void;
  className?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, className = '' }) => {
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'Done' &&
    task.status !== 'Completed';

  return (
    <Card
      hoverable
      size="small"
      onClick={() => onClick && onClick(task)}
      className={`rounded-xl border border-border-subtle bg-card shadow-xs transition-all hover:border-primary/50 hover:shadow-sm cursor-pointer select-none group ${className}`}
      styles={{
        body: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' },
      }}>
      {/* Top Header: ID & Priority */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
          TSK-{task.id}
        </span>
        <PriorityTag priority={task.priority} />
      </div>

      {/* Task Title */}
      <div className="text-xs font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
        {task.title}
      </div>

      {/* Footer: Due Date & Assignee */}
      <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs text-muted-foreground">
        {task.dueDate ? (
          <Tooltip title={isOverdue ? 'Overdue!' : `Due ${task.dueDate}`}>
            <span
              className={`flex items-center gap-1 font-medium text-[11px] ${
                isOverdue ? 'text-destructive font-bold' : ''
              }`}>
              {isOverdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
              <span>{task.dueDate}</span>
            </span>
          </Tooltip>
        ) : (
          <span className="text-[11px] text-muted-foreground/60">No due date</span>
        )}

        <AssigneeAvatar name={task.assignedToName} size={22} />
      </div>
    </Card>
  );
};

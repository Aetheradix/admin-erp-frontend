import React from 'react';
import { Tag } from 'antd';

interface StatusTagProps {
  status: string;
  size?: 'small' | 'middle';
  className?: string;
}

const STATUS_CONFIG: Record<string, { color: string; label: string; bg?: string }> = {
  // Project statuses
  planning: { color: 'gold', label: 'Planning' },
  active: { color: 'success', label: 'Active' },
  on_hold: { color: 'warning', label: 'On Hold' },
  'on hold': { color: 'warning', label: 'On Hold' },
  completed: { color: 'success', label: 'Completed' },
  at_risk: { color: 'warning', label: 'At Risk' },
  overdue: { color: 'error', label: 'Overdue' },
  cancelled: { color: 'default', label: 'Cancelled' },
  archived: { color: 'default', label: 'Archived' },

  // Task statuses
  'to do': { color: 'default', label: 'To Do' },
  todo: { color: 'default', label: 'To Do' },
  pending: { color: 'default', label: 'Pending' },
  'in progress': { color: 'processing', label: 'In Progress' },
  'on-going': { color: 'processing', label: 'In Progress' },
  'in review': { color: 'purple', label: 'In Review' },
  blocked: { color: 'error', label: 'Blocked' },
  done: { color: 'success', label: 'Done' },
};

export const StatusTag: React.FC<StatusTagProps> = ({ status, className = '' }) => {
  const normalized = (status || '').toLowerCase().trim();
  const config = STATUS_CONFIG[normalized] || { color: 'default', label: status || 'Unknown' };

  return (
    <Tag
      color={config.color}
      className={`font-semibold text-[11px] uppercase tracking-wide rounded-md px-2 py-0.5 m-0 inline-flex items-center gap-1 ${className}`}>
      {config.label}
    </Tag>
  );
};

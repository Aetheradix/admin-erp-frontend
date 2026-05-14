'use client';

import React from 'react';
import { Tag } from 'antd';

type StatusType =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'overdue'
  | 'completed'
  | 'in-progress'
  | 'draft'
  | 'paid'
  | 'unpaid'
  | 'cancelled';

const statusConfig: Record<
  StatusType,
  { color: string; label: string }
> = {
  active: { color: 'green', label: 'Active' },
  inactive: { color: 'default', label: 'Inactive' },
  pending: { color: 'gold', label: 'Pending' },
  approved: { color: 'green', label: 'Approved' },
  rejected: { color: 'red', label: 'Rejected' },
  overdue: { color: 'red', label: 'Overdue' },
  completed: { color: 'green', label: 'Completed' },
  'in-progress': { color: 'blue', label: 'In Progress' },
  draft: { color: 'default', label: 'Draft' },
  paid: { color: 'green', label: 'Paid' },
  unpaid: { color: 'gold', label: 'Unpaid' },
  cancelled: { color: 'red', label: 'Cancelled' },
};

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status] || { color: 'default', label: status };

  return (
    <Tag
      color={config.color}
      style={{
        borderRadius: 6,
        fontWeight: 600,
        fontSize: 12,
        padding: '2px 10px',
        border: 'none',
      }}
    >
      {label || config.label}
    </Tag>
  );
}

export type { StatusType };

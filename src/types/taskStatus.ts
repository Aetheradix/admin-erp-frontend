export type TaskStatusCategory = 'initial' | 'active' | 'completed' | 'cancelled';

export interface TaskStatus {
  id: number;
  orgId?: number;
  projectId?: number | null; // null = global default status
  name: string;
  slug: string;
  description?: string;
  color: string; // e.g. '#64748b' or hex/tailwind color
  category: TaskStatusCategory;
  sortOrder: number;
  isDefault?: boolean;
  isActive: boolean;
  requiresApproval?: boolean;
  allowedTransitionIds?: number[]; // IDs of allowed target statuses (empty = any)
}

export interface StatusTransitionRule {
  fromStatusId: number;
  toStatusId: number;
  allowedRoleIds?: string[];
  requiresComment?: boolean;
}

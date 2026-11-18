import type { StatusVariant } from '../types/common';

export const STATUS_VARIANT_MAP: Record<string, StatusVariant> = {
  active: 'success',
  approved: 'success',
  completed: 'success',
  paid: 'success',
  present: 'success',
  available: 'success',
  accepted: 'success',
  pending: 'warning',
  'in progress': 'info',
  'in-progress': 'info',
  processing: 'info',
  scheduled: 'info',
  draft: 'neutral',
  inactive: 'neutral',
  archived: 'neutral',
  'not started': 'neutral',
  rejected: 'danger',
  failed: 'danger',
  cancelled: 'danger',
  canceled: 'danger',
  expired: 'danger',
  overdue: 'danger',
  absent: 'danger',
};

export function resolveStatusVariant(status?: string | null): StatusVariant {
  if (!status) return 'neutral';
  return STATUS_VARIANT_MAP[status.trim().toLowerCase()] ?? 'neutral';
}

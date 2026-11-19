import type { DateRangePreset } from './types';

export const EXPENSE_ALL = 'All';

export const EXPENSE_CATEGORIES = [
  'All',
  'Travel',
  'Equipment',
  'Software',
  'Meals',
  'Medical',
  'Office Supplies',
  'Client Entertainment',
  'Other',
] as const;

export const EXPENSE_STATUSES = ['All', 'Pending', 'Approved', 'Rejected', 'Paid'] as const;

export const MULTI_USER_CATEGORIES = ['Travel', 'Team Outing', 'Meals & Entertainment', 'Events'];

export const DATE_RANGE_PRESETS: ReadonlyArray<{ id: DateRangePreset; label: string }> = [
  { id: 'all', label: 'All Time' },
  { id: '7days', label: 'Last 7 Days' },
  { id: '30days', label: 'Last 30 Days' },
  { id: 'last_month', label: 'Last Month' },
  { id: '1year', label: 'Last Year' },
  { id: '3years', label: 'Last 3 Years' },
  { id: 'custom', label: 'Custom Range...' },
];

export const STATUS_BADGE_CLASSES: Record<string, string> = {
  approved: 'bg-blue-100 text-blue-800 border-blue-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

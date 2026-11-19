import type { ExpenseRecord } from '@/store/api/expenseSlice';

export type { ExpenseRecord };

export interface UserOption {
  id: number | string;
  name: string;
  email?: string;
  department?: string;
}

export type DateRangePreset =
  | 'all'
  | '7days'
  | '30days'
  | 'last_month'
  | '1year'
  | '3years'
  | 'custom';

export interface ExpenseFilters {
  category: string;
  status: string;
  search: string;
}

export interface CompanyExpenseStats {
  totalExpenses: number;
  pendingAmount: number;
  pendingCount: number;
  approvedAmount: number;
  approvedCount: number;
  paidAmount: number;
  paidCount: number;
  rejectedAmount: number;
  rejectedCount: number;
}

import type { Reimbursement } from '@/types/models';

export type { Reimbursement };

export interface ReimbursementFilters {
  category: string;
  status: string;
  search: string;
}

export interface FinanceStats {
  totalExpenses: number;
  approvedAmount: number;
  approvedCount: number;
  pendingAmount: number;
  pendingCount: number;
  rejectedAmount: number;
  rejectedCount: number;
  paidAmount: number;
  paidCount: number;
}

export type CreateReimbursementPayload =
  FormData | Partial<Omit<Reimbursement, 'id' | 'created_at' | 'updated_at' | 'approved_at'>>;

export type ReimbursementStatus = 'Pending' | 'Approved' | 'Rejected' | 'Paid';

export interface Reimbursement {
  id: string;
  description: string;
  category: string;
  amount: string;
  date: string;
  submittedBy: string;
  status: ReimbursementStatus;
  receiptUrl?: string;
}

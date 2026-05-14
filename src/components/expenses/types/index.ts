export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: string;
  date: string;
  submittedBy: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface Invoice {
  id: string;
  client: string;
  amount: string;
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'unpaid' | 'draft';
}

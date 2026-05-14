export interface Transaction {
  id: number;
  description: string;
  amount: string;
  type: 'income' | 'expense';
  date: string;
}

export interface BudgetItem {
  name: string;
  spent: number;
  budget: number;
  color: string;
}

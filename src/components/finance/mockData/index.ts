import { Transaction, BudgetItem } from '../types';

export const recentTransactions: Transaction[] = [
  { id: 1, description: 'Invoice #INV-089 Payment', amount: '+$12,500', type: 'income', date: 'May 12, 2026' },
  { id: 2, description: 'Office Supplies', amount: '-$340', type: 'expense', date: 'May 11, 2026' },
  { id: 3, description: 'Invoice #INV-088 Payment', amount: '+$8,200', type: 'income', date: 'May 10, 2026' },
  { id: 4, description: 'Cloud Services (AWS)', amount: '-$2,100', type: 'expense', date: 'May 9, 2026' },
  { id: 5, description: 'Contractor Payment - Design', amount: '-$5,000', type: 'expense', date: 'May 8, 2026' },
  { id: 6, description: 'Invoice #INV-087 Payment', amount: '+$15,750', type: 'income', date: 'May 7, 2026' },
];

export const budgetItems: BudgetItem[] = [
  { name: 'Engineering', spent: 45000, budget: 60000, color: '#0284c7' },
  { name: 'Marketing', spent: 18000, budget: 25000, color: '#E8583A' },
  { name: 'Operations', spent: 12000, budget: 15000, color: '#7c3aed' },
  { name: 'HR & Recruitment', spent: 8500, budget: 20000, color: '#059669' },
];

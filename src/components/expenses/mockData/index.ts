import { Expense } from '../types';

export const mockExpenses: Expense[] = [
  { id: 'EXP-001', description: 'Cloud Services (AWS)', category: 'Infrastructure', amount: '$2,100', date: '2026-05-09', submittedBy: 'Tom Baker', status: 'approved' },
  { id: 'EXP-002', description: 'Office Supplies', category: 'Office', amount: '$340', date: '2026-05-11', submittedBy: 'Emily Watson', status: 'approved' },
  { id: 'EXP-003', description: 'Team Dinner', category: 'Entertainment', amount: '$680', date: '2026-05-08', submittedBy: 'John Doe', status: 'pending' },
  { id: 'EXP-004', description: 'Software Licenses', category: 'Software', amount: '$4,500', date: '2026-05-06', submittedBy: 'Sarah Chen', status: 'approved' },
  { id: 'EXP-005', description: 'Business Travel - NYC', category: 'Travel', amount: '$1,850', date: '2026-05-04', submittedBy: 'Alex Rivera', status: 'rejected' },
  { id: 'EXP-006', description: 'Marketing Ads (Google)', category: 'Marketing', amount: '$3,200', date: '2026-05-02', submittedBy: 'Emily Watson', status: 'approved' },
];

export const categoryColors: Record<string, string> = { 
  Infrastructure: 'blue', 
  Office: 'default', 
  Entertainment: 'purple', 
  Software: 'cyan', 
  Travel: 'gold', 
  Marketing: 'volcano' 
};

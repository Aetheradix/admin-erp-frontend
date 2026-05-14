import { AnalyticsReport } from '../types';

export const mockReports: AnalyticsReport[] = [
  { id: 'r1', title: 'Q1 2026 Financial Summary', type: 'Finance', createdBy: 'David Kim', date: '2026-04-01', status: 'Published' },
  { id: 'r2', title: 'Engineering Sprint Report - May', type: 'Operations', createdBy: 'Sarah Chen', date: '2026-05-10', status: 'Published' },
  { id: 'r3', title: 'Monthly Revenue Analysis', type: 'Finance', createdBy: 'David Kim', date: '2026-05-01', status: 'Published' },
  { id: 'r4', title: 'Team Performance Review Q1', type: 'HR', createdBy: 'Emily Watson', date: '2026-04-28', status: 'Draft' },
  { id: 'r5', title: 'Customer Satisfaction Survey', type: 'Support', createdBy: 'Nina Gupta', date: '2026-04-15', status: 'Published' },
  { id: 'r6', title: 'Inventory Audit 2026', type: 'Operations', createdBy: 'John Doe', date: '2026-03-30', status: 'Draft' },
];

export const typeColors: Record<string, string> = { 
  Finance: 'green', 
  Operations: 'blue', 
  HR: 'purple', 
  Support: 'cyan' 
};

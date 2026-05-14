import { Metric, Department, Report } from '../types';

export const topMetrics: Metric[] = [
  { label: 'Revenue Growth', value: '18.7%', desc: 'vs last quarter' },
  { label: 'Task Completion Rate', value: '87%', desc: 'across all projects' },
  { label: 'Avg. Project Duration', value: '42 days', desc: '↓ 8 days from avg' },
  { label: 'Team Utilization', value: '78%', desc: 'target: 85%' },
];

export const departmentPerformance: Department[] = [
  { name: 'Engineering', score: 92, tasks: 245, color: '#0284c7' },
  { name: 'Design', score: 88, tasks: 128, color: '#7c3aed' },
  { name: 'Marketing', score: 85, tasks: 96, color: '#E8583A' },
  { name: 'Sales', score: 79, tasks: 184, color: '#059669' },
  { name: 'Operations', score: 75, tasks: 67, color: '#d97706' },
];

export const recentReports: Report[] = [
  { id: 'r1', title: 'Q1 2026 Financial Summary', date: 'Apr 1, 2026', type: 'Finance' },
  { id: 'r2', title: 'Engineering Sprint Report', date: 'May 10, 2026', type: 'Operations' },
  { id: 'r3', title: 'Monthly Revenue Analysis', date: 'May 1, 2026', type: 'Finance' },
  { id: 'r4', title: 'Team Performance Review', date: 'Apr 28, 2026', type: 'HR' },
  { id: 'r5', title: 'Customer Satisfaction Survey', date: 'Apr 15, 2026', type: 'Support' },
];

export const typeColors: Record<string, string> = { Finance: 'green', Operations: 'blue', HR: 'purple', Support: 'cyan' };

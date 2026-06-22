export type { Reimbursement } from '@/types/models';

export const mockReimbursements: import('@/types/models').Reimbursement[] = [
  {
    id: 'R1',
    item: 'Ergonomic Desk Chair',
    category: 'Equipment',
    amount: 250,
    date: '2026-03-10',
    status: 'Approved',
    description: 'Necessary for home office setup for WFH days.'
  },
  {
    id: 'R2',
    item: 'Adobe Creative Cloud Subscription',
    category: 'Software',
    amount: 52.99,
    date: '2026-03-15',
    status: 'Pending',
    description: 'Monthly subscription for design tools.'
  },
  {
    id: 'R3',
    item: 'Travel to Regional HQ',
    category: 'Travel',
    amount: 120.50,
    date: '2026-03-05',
    status: 'Paid',
    description: 'Fuel and parking for project kickoff meeting.'
  },
  {
    id: 'R4',
    item: 'Team Lunch',
    category: 'Meals',
    amount: 75.20,
    date: '2026-03-12',
    status: 'Rejected',
    description: 'Non-billable lunch expensed by mistake.'
  }
];

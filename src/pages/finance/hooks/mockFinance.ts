export type { Reimbursement } from '@/types/models';

export const mockReimbursements: import('@/types/models').Reimbursement[] = [
  {
    id: 'R1',
    item: 'Monitor',
    category: 'Equipment',
    amount: 15000,
    date: '2026-07-01',
    status: 'Pending',
    description: 'Necessary for home office setup for WFH days.',

    user_id: 1,
    employee_name: 'John Doe',
    title: 'Monitor',
    expense_date: '2026-07-01',
    created_at: '2026-07-01T10:00:00.000Z',
    updated_at: '2026-07-01T10:00:00.000Z',
    approved_at: null,
  },

  {
    id: 'R2',
    item: 'Figma',
    category: 'Equipment',
    amount: 2500,
    date: '2026-07-05',
    status: 'Approved',
    description: 'Monthly subscription for design tools.',

    user_id: 2,
    employee_name: 'Jane Smith',
    title: 'Figma',
    expense_date: '2026-07-05',
    created_at: '2026-07-05T10:00:00.000Z',
    updated_at: '2026-07-05T10:00:00.000Z',
    approved_at: '2026-07-06T10:00:00.000Z',
  },

  {
    id: 'R3',
    item: 'Fuel',
    category: 'Others',
    amount: 1200,
    date: '2026-07-10',
    status: 'Pending',
    description: 'Fuel and parking for project kickoff meeting.',

    user_id: 3,
    employee_name: 'Mike Johnson',
    title: 'Fuel',
    expense_date: '2026-07-10',
    created_at: '2026-07-10T10:00:00.000Z',
    updated_at: '2026-07-10T10:00:00.000Z',
    approved_at: null,
  },

  {
    id: 'R4',
    item: 'Lunch',
    category: 'Meals',
    amount: 800,
    date: '2026-07-12',
    status: 'Rejected',
    description: 'Non-billable lunch expensed by mistake.',

    user_id: 4,
    employee_name: 'Sarah Williams',
    title: 'Lunch',
    expense_date: '2026-07-12',
    created_at: '2026-07-12T10:00:00.000Z',
    updated_at: '2026-07-12T10:00:00.000Z',
    approved_at: null,
  },
];

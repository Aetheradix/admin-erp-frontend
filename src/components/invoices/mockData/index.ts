import { Invoice } from '../types';

export const mockInvoices: Invoice[] = [
  { id: 'INV-001', client: 'Acme Corp', amount: '$12,500', date: '2026-05-12', dueDate: '2026-06-12', status: 'paid' },
  { id: 'INV-002', client: 'TechStart Inc', amount: '$8,200', date: '2026-05-10', dueDate: '2026-06-10', status: 'paid' },
  { id: 'INV-003', client: 'Global Solutions', amount: '$15,750', date: '2026-05-07', dueDate: '2026-06-07', status: 'pending' },
  { id: 'INV-004', client: 'Design Studio', amount: '$3,400', date: '2026-05-01', dueDate: '2026-05-31', status: 'overdue' },
  { id: 'INV-005', client: 'Cloud Nine', amount: '$22,000', date: '2026-04-25', dueDate: '2026-05-25', status: 'paid' },
  { id: 'INV-006', client: 'StartUp Labs', amount: '$6,800', date: '2026-04-20', dueDate: '2026-05-20', status: 'unpaid' },
  { id: 'INV-007', client: 'Enterprise Co', amount: '$45,000', date: '2026-04-15', dueDate: '2026-05-15', status: 'draft' },
];

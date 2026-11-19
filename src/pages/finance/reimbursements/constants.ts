export const REIMBURSEMENT_ALL = 'All';

export const REIMBURSEMENT_CATEGORIES = [
  'All',
  'Travel',
  'Equipment',
  'Software',
  'Meals',
  'Medical',
  'Office Supplies',
] as const;

export const REIMBURSEMENT_STATUSES = ['All', 'Pending', 'Approved', 'Rejected'] as const;

export const REIMBURSEMENT_FORM_CATEGORIES = [
  { label: 'Travel', value: 'Travel' },
  { label: 'Equipment', value: 'Equipment' },
  { label: 'Software', value: 'Software' },
  { label: 'Meals', value: 'Meals' },
  { label: 'Medical', value: 'Medical' },
  { label: 'Office Supplies', value: 'Office Supplies' },
] as const;

import { PayrollEntry } from '../types';

export const mockPayrollData: PayrollEntry[] = [
  { id: '1', name: 'John Doe', department: 'Management', baseSalary: '$12,000', bonus: '$2,000', deductions: '$1,800', netPay: '$12,200', status: 'paid' },
  { id: '2', name: 'Sarah Chen', department: 'Engineering', baseSalary: '$10,500', bonus: '$1,500', deductions: '$1,600', netPay: '$10,400', status: 'paid' },
  { id: '3', name: 'Mike Ross', department: 'Design', baseSalary: '$9,000', bonus: '$800', deductions: '$1,200', netPay: '$8,600', status: 'paid' },
  { id: '4', name: 'Emily Watson', department: 'HR', baseSalary: '$8,500', bonus: '$500', deductions: '$1,100', netPay: '$7,900', status: 'pending' },
  { id: '5', name: 'Alex Rivera', department: 'Sales', baseSalary: '$7,800', bonus: '$3,200', deductions: '$1,000', netPay: '$10,000', status: 'pending' },
];

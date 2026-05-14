export interface PayrollEntry {
  id: string;
  name: string;
  department: string;
  baseSalary: string;
  bonus: string;
  deductions: string;
  netPay: string;
  status: 'paid' | 'pending';
}

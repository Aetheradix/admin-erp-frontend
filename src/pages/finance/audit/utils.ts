import type { ExpenseRecord } from '@/store/api/expenseSlice';
import type { BackendInvoiceRecord } from '../invoices/types';
import type { AuditBookMetrics, FinancialEntry } from './types';

export function formatAuditCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function getQuarterRange(quarter: string): { startMonth: number; endMonth: number } {
  if (quarter.startsWith('Q1')) return { startMonth: 0, endMonth: 2 };
  if (quarter.startsWith('Q2')) return { startMonth: 3, endMonth: 5 };
  if (quarter.startsWith('Q3')) return { startMonth: 6, endMonth: 8 };
  if (quarter.startsWith('Q4')) return { startMonth: 9, endMonth: 11 };
  return { startMonth: 0, endMonth: 11 };
}

function createDateMatcher(year: string, quarter: string) {
  const { startMonth, endMonth } = getQuarterRange(quarter);

  return (dateValue?: string): boolean => {
    if (!dateValue) return false;
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return false;
    if (date.getFullYear().toString() !== year) return false;
    if (quarter === 'Full Year') return true;
    const month = date.getMonth();
    return month >= startMonth && month <= endMonth;
  };
}

export function computeAuditMetrics(
  invoicesData: BackendInvoiceRecord[],
  expensesData: ExpenseRecord[],
  year: string,
  quarter: string
): AuditBookMetrics {
  const isMatch = createDateMatcher(year, quarter);

  const incomeMap = new Map<string, number>();
  invoicesData.forEach((invoice) => {
    const date = String(
      invoice.date || invoice.invoice_date || invoice.invoiceDate || invoice.created_at || ''
    );
    if (!isMatch(date)) return;
    const particulars = String(
      invoice.client || invoice.bill_to_name || invoice.clientName || 'Invoice Revenue'
    );
    const amount = Number(invoice.amount || invoice.total || 0);
    incomeMap.set(particulars, (incomeMap.get(particulars) || 0) + amount);
  });

  const expenseMap = new Map<string, number>();
  expensesData.forEach((expense) => {
    const record = expense as ExpenseRecord & { date?: string };
    const date = String(record.expense_date || record.created_at || record.date || '');
    if (!isMatch(date)) return;
    const category = record.category || record.title || record.description || 'General Expense';
    const amount = Number(record.amount || 0);
    expenseMap.set(category, (expenseMap.get(category) || 0) + amount);
  });

  const income: FinancialEntry[] = Array.from(incomeMap.entries()).map(
    ([particulars, currentPeriod]) => ({ particulars, currentPeriod, category: 'income' })
  );
  const expenses: FinancialEntry[] = Array.from(expenseMap.entries()).map(
    ([particulars, currentPeriod]) => ({ particulars, currentPeriod, category: 'expense' })
  );

  const totalRevenue = income.reduce((sum, entry) => sum + entry.currentPeriod, 0);
  const totalExpenses = expenses.reduce((sum, entry) => sum + entry.currentPeriod, 0);
  const netProfitLoss = totalRevenue - totalExpenses;

  return {
    income,
    expenses,
    totalRevenue,
    totalExpenses,
    netProfitLoss,
    grossMargin: totalRevenue > 0 ? ((netProfitLoss / totalRevenue) * 100).toFixed(1) : '0',
    expenseRatio: totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : '0',
  };
}

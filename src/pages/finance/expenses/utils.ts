import type { ExpenseParticipant, ExpenseRecord } from '@/store/api/expenseSlice';
import { STATUS_BADGE_CLASSES } from './constants';
import type { CompanyExpenseStats, DateRangePreset, ExpenseFilters } from './types';

export function getExpenseStatusBadge(status?: string | null): string {
  return STATUS_BADGE_CLASSES[(status ?? 'pending').toLowerCase()] ?? STATUS_BADGE_CLASSES.pending;
}

export function getExpenseDate(expense: ExpenseRecord): string | undefined {
  return expense.expense_date || expense.created_at;
}

export function filterExpenses(
  expenses: ExpenseRecord[],
  filters: ExpenseFilters
): ExpenseRecord[] {
  const category = filters.category.toLowerCase();
  const status = filters.status.toLowerCase();
  const search = filters.search.toLowerCase().trim();

  return expenses.filter((expense) => {
    const matchesCategory = category === 'all' || expense.category?.toLowerCase() === category;
    const matchesStatus = status === 'all' || expense.status?.toLowerCase() === status;
    const matchesSearch =
      !search ||
      expense.title?.toLowerCase().includes(search) ||
      expense.expense_number?.toLowerCase().includes(search) ||
      expense.vendor_name?.toLowerCase().includes(search) ||
      expense.employee_name?.toLowerCase().includes(search) ||
      expense.category?.toLowerCase().includes(search) ||
      expense.payment_mode?.toLowerCase().includes(search) ||
      String(expense.amount).includes(search);

    return matchesCategory && matchesStatus && matchesSearch;
  });
}

export function filterExpensesByDateRange(
  expenses: ExpenseRecord[],
  preset: DateRangePreset,
  customStartDate: string,
  customEndDate: string,
  now = new Date()
): ExpenseRecord[] {
  if (preset === 'all') return expenses;

  return expenses.filter((expense) => {
    const rawDate = getExpenseDate(expense);
    if (!rawDate) return true;

    const expenseDate = new Date(rawDate);
    if (Number.isNaN(expenseDate.getTime())) return true;

    switch (preset) {
      case '7days': {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        return expenseDate >= sevenDaysAgo && expenseDate <= now;
      }
      case '30days': {
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return expenseDate >= thirtyDaysAgo && expenseDate <= now;
      }
      case 'last_month': {
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        return expenseDate >= startOfLastMonth && expenseDate <= endOfLastMonth;
      }
      case '1year': {
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        return expenseDate >= oneYearAgo && expenseDate <= now;
      }
      case '3years': {
        const threeYearsAgo = new Date(now);
        threeYearsAgo.setFullYear(now.getFullYear() - 3);
        return expenseDate >= threeYearsAgo && expenseDate <= now;
      }
      case 'custom': {
        const start = customStartDate ? new Date(customStartDate) : null;
        const end = customEndDate ? new Date(`${customEndDate}T23:59:59`) : null;

        if (start && expenseDate < start) return false;
        if (end && expenseDate > end) return false;
        return true;
      }
      default:
        return true;
    }
  });
}

export function getDatePresetLabel(
  preset: DateRangePreset,
  customStartDate: string,
  customEndDate: string
): string {
  switch (preset) {
    case '7days':
      return 'Last 7 Days';
    case '30days':
      return 'Last 30 Days';
    case 'last_month':
      return 'Last Month';
    case '1year':
      return 'Last Year';
    case '3years':
      return 'Last 3 Years';
    case 'custom':
      return `Custom (${customStartDate || 'Start'} to ${customEndDate || 'End'})`;
    default:
      return 'All Time';
  }
}

export function computeExpenseStats(expenses: ExpenseRecord[]): CompanyExpenseStats {
  const stats: CompanyExpenseStats = {
    totalExpenses: 0,
    pendingAmount: 0,
    pendingCount: 0,
    approvedAmount: 0,
    approvedCount: 0,
    paidAmount: 0,
    paidCount: 0,
    rejectedAmount: 0,
    rejectedCount: 0,
  };

  for (const expense of expenses) {
    const amount = Number(expense.amount || 0);
    stats.totalExpenses += amount;

    switch (expense.status?.toLowerCase()) {
      case 'pending':
        stats.pendingAmount += amount;
        stats.pendingCount += 1;
        break;
      case 'approved':
        stats.approvedAmount += amount;
        stats.approvedCount += 1;
        break;
      case 'paid':
        stats.paidAmount += amount;
        stats.paidCount += 1;
        break;
      case 'rejected':
        stats.rejectedAmount += amount;
        stats.rejectedCount += 1;
        break;
      default:
        break;
    }
  }

  return stats;
}

export function getExpenseParticipants(expense: ExpenseRecord): ExpenseParticipant[] {
  return Array.isArray(expense.participants) ? expense.participants : [];
}

export function sumExpenseAmounts(expenses: ExpenseRecord[]): number {
  return expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
}

export function buildExpensesCsv(expenses: ExpenseRecord[]): string {
  const headers = [
    'Expense #',
    'Title',
    'Date',
    'Vendor',
    'Employee',
    'Category',
    'Amount',
    'Status',
  ];

  const rows = expenses.map((expense) => {
    const expenseDate = getExpenseDate(expense) || 'N/A';
    return [
      `"${expense.expense_number || '#' + expense.id}"`,
      `"${(expense.title || '').replace(/"/g, '""')}"`,
      `"${expenseDate}"`,
      `"${(expense.vendor_name || 'N/A').replace(/"/g, '""')}"`,
      `"${(expense.employee_name || 'N/A').replace(/"/g, '""')}"`,
      `"${(expense.category || '').replace(/"/g, '""')}"`,
      expense.amount || 0,
      `"${expense.status || 'Pending'}"`,
    ];
  });

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

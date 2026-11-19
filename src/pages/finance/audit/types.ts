export interface FinancialEntry {
  particulars: string;
  currentPeriod: number;
  previousPeriod?: number;
  category: 'income' | 'expense' | 'asset' | 'liability';
}

export interface AuditBookMetrics {
  income: FinancialEntry[];
  expenses: FinancialEntry[];
  totalRevenue: number;
  totalExpenses: number;
  netProfitLoss: number;
  grossMargin: string;
  expenseRatio: string;
}

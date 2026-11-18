import { formatCurrency } from '@/shared/utils/formatCurrency';
import type { CompanyExpenseStats } from '../types';

interface ExpenseStatsCardsProps {
  stats: CompanyExpenseStats;
}

export function ExpenseStatsCards({ stats }: ExpenseStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase">Total Expenses</p>
        <p className="text-xl font-bold text-gray-900 mt-1">
          {formatCurrency(stats.totalExpenses)}
        </p>
      </div>
      <div className="p-4 bg-yellow-50/50 rounded-lg border border-yellow-200 shadow-sm">
        <p className="text-xs font-semibold text-yellow-700 uppercase">
          Pending ({stats.pendingCount})
        </p>
        <p className="text-xl font-bold text-yellow-900 mt-1">
          {formatCurrency(stats.pendingAmount)}
        </p>
      </div>
      <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 shadow-sm">
        <p className="text-xs font-semibold text-blue-700 uppercase">
          Approved ({stats.approvedCount})
        </p>
        <p className="text-xl font-bold text-blue-900 mt-1">
          {formatCurrency(stats.approvedAmount)}
        </p>
      </div>
      <div className="p-4 bg-green-50/50 rounded-lg border border-green-200 shadow-sm">
        <p className="text-xs font-semibold text-green-700 uppercase">Paid ({stats.paidCount})</p>
        <p className="text-xl font-bold text-green-900 mt-1">
          {formatCurrency(stats.paidAmount)}
        </p>
      </div>
      <div className="p-4 bg-red-50/50 rounded-lg border border-red-200 shadow-sm">
        <p className="text-xs font-semibold text-red-700 uppercase">
          Rejected ({stats.rejectedCount})
        </p>
        <p className="text-xl font-bold text-red-900 mt-1">
          {formatCurrency(stats.rejectedAmount)}
        </p>
      </div>
    </div>
  );
}

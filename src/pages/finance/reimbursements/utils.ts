import type { FinanceStats, Reimbursement, ReimbursementFilters } from './types';

export const EMPTY_FINANCE_STATS: FinanceStats = {
  totalExpenses: 0,
  approvedAmount: 0,
  approvedCount: 0,
  pendingAmount: 0,
  pendingCount: 0,
  rejectedAmount: 0,
  rejectedCount: 0,
  paidAmount: 0,
  paidCount: 0,
};

export function filterReimbursements(
  requests: Reimbursement[],
  filters: ReimbursementFilters
): Reimbursement[] {
  const searchLower = filters.search.toLowerCase().trim();
  const category = filters.category.toLowerCase();
  const status = filters.status.toLowerCase();

  return requests.filter((request) => {
    const matchesCategory = category === 'all' || request.category?.toLowerCase() === category;
    const matchesStatus = status === 'all' || request.status?.toLowerCase() === status;
    const matchesSearch =
      !searchLower ||
      request.title?.toLowerCase().includes(searchLower) ||
      request.item?.toLowerCase().includes(searchLower) ||
      request.employee_name?.toLowerCase().includes(searchLower) ||
      request.category?.toLowerCase().includes(searchLower) ||
      request.description?.toLowerCase().includes(searchLower) ||
      String(request.amount).includes(searchLower);

    return matchesCategory && matchesStatus && matchesSearch;
  });
}

export function computeFinanceStats(requests: Reimbursement[]): FinanceStats {
  const stats: FinanceStats = { ...EMPTY_FINANCE_STATS };

  for (const request of requests) {
    const amount = Number(request.amount || 0);
    stats.totalExpenses += amount;

    switch (request.status?.toLowerCase()) {
      case 'approved':
        stats.approvedAmount += amount;
        stats.approvedCount += 1;
        break;
      case 'pending':
        stats.pendingAmount += amount;
        stats.pendingCount += 1;
        break;
      case 'rejected':
        stats.rejectedAmount += amount;
        stats.rejectedCount += 1;
        break;
      case 'paid':
        stats.paidAmount += amount;
        stats.paidCount += 1;
        break;
      default:
        break;
    }
  }

  return stats;
}

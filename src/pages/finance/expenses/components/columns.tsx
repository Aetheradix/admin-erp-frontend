import type { ColumnsType } from 'antd/es/table';
import type { ExpenseRecord } from '@/store/api/expenseSlice';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { getExpenseParticipants, getExpenseStatusBadge } from '../utils';

export interface ExpenseTableActions {
  isUpdatingStatus: boolean;
  onOpenDetails: (expense: ExpenseRecord) => void;
  onApprove: (id: number) => void;
  onRequestReject: (id: number) => void;
  onMarkPaid: (id: number) => void;
}

export function createExpenseColumns({
  isUpdatingStatus,
  onOpenDetails,
  onApprove,
  onRequestReject,
  onMarkPaid,
}: ExpenseTableActions): ColumnsType<ExpenseRecord> {
  return [
    {
      title: 'Expense #',
      key: 'expense_number',
      render: (_, expense) => (
        <span className="font-mono text-xs text-gray-500">
          {expense.expense_number || `#${expense.id}`}
        </span>
      ),
    },
    {
      title: 'Title & Vendor',
      key: 'title',
      render: (_, expense) => (
        <>
          <div className="font-medium text-gray-900">{expense.title}</div>
          <div className="text-xs text-gray-500">{expense.vendor_name || 'N/A'}</div>
        </>
      ),
    },
    {
      title: 'Employee / Team',
      key: 'employee',
      render: (_, expense) => {
        const participants = getExpenseParticipants(expense);
        return (
          <>
            <div>{expense.employee_name || 'N/A'}</div>
            {participants.length > 0 && (
              <span className="inline-flex items-center text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 mt-0.5">
                Shared ({participants.length} people)
              </span>
            )}
          </>
        );
      },
    },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <span className="font-semibold text-gray-900">{formatCurrency(Number(amount || 0))}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span
          className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full border ${getExpenseStatusBadge(status)}`}>
          {status || 'Pending'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, expense) => {
        const status = expense.status?.toLowerCase();
        return (
          <div className="flex items-center justify-end gap-2 whitespace-nowrap">
            <button
              onClick={() => onOpenDetails(expense)}
              className="text-xs font-medium text-gray-600 hover:text-gray-900 underline">
              Details
            </button>
            {status === 'pending' && (
              <>
                <button
                  disabled={isUpdatingStatus}
                  onClick={() => onApprove(expense.id)}
                  className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 disabled:opacity-50">
                  Approve
                </button>
                <button
                  disabled={isUpdatingStatus}
                  onClick={() => onRequestReject(expense.id)}
                  className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 disabled:opacity-50">
                  Reject
                </button>
              </>
            )}
            {status === 'approved' && (
              <button
                disabled={isUpdatingStatus}
                onClick={() => onMarkPaid(expense.id)}
                className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 disabled:opacity-50">
                Mark Paid
              </button>
            )}
          </div>
        );
      },
    },
  ];
}

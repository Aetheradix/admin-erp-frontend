import { Table } from 'antd';
import type { ExpenseRecord } from '@/store/api/expenseSlice';
import { createExpenseColumns, type ExpenseTableActions } from './columns';

interface ExpenseTableProps extends ExpenseTableActions {
  expenses: ExpenseRecord[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRefetch: () => void;
}

export function ExpenseTable({
  expenses,
  isLoading,
  isError,
  error,
  onRefetch,
  ...actions
}: ExpenseTableProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {isLoading ? (
        <div className="p-12 text-center text-gray-500">Loading expenses...</div>
      ) : isError ? (
        <div className="p-12 text-center text-red-600">
          <p>Failed to load expenses.</p>
          <p className="text-xs text-gray-400 mt-1">{JSON.stringify(error)}</p>
          <button
            onClick={onRefetch}
            className="mt-4 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm hover:bg-red-100">
            Try Again
          </button>
        </div>
      ) : expenses.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          No expenses found matching the selected criteria or date range.
        </div>
      ) : (
        <Table<ExpenseRecord>
          columns={createExpenseColumns(actions)}
          dataSource={expenses}
          rowKey="id"
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      )}
    </div>
  );
}

import { Download } from 'lucide-react';

interface ExpensePageHeaderProps {
  isFetching: boolean;
  onRefresh: () => void;
  onExportPdf: () => void;
  onExportCsv: () => void;
  onNewExpense: () => void;
}

export function ExpensePageHeader({
  isFetching,
  onRefresh,
  onExportPdf,
  onExportCsv,
  onNewExpense,
}: ExpensePageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Expenses Management</h1>
        <p className="text-sm text-gray-500">
          Track, approve, and process employee company expenses with verifiable audit trails.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onRefresh}
          disabled={isFetching}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </button>
        <button
          onClick={onExportPdf}
          className="px-3.5 py-2 text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 shadow-xs flex items-center gap-1.5 transition-colors">
          <Download size={15} /> Export PDF Report
        </button>
        <button
          onClick={onExportCsv}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-xs flex items-center gap-1.5">
          Export CSV
        </button>
        <button
          onClick={onNewExpense}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm">
          + New Expense
        </button>
      </div>
    </div>
  );
}

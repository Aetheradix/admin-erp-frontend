import { useCallback } from 'react';
import type { ExpenseRecord } from '@/store/api/expenseSlice';
import { downloadTextFile } from '@/shared/utils/downloadFile';
import { buildExpensesCsv } from '../utils';
import { downloadExpenseReportPdf, downloadExpenseVoucherPdf } from '../pdf';

interface UseExpenseExportOptions {
  expenses: ExpenseRecord[];
  category: string;
  status: string;
  dateRangeLabel: string;
}

const EMPTY_EXPORT_MESSAGE = 'No expense records available to export for the selected filters.';

export function useExpenseExport({
  expenses,
  category,
  status,
  dateRangeLabel,
}: UseExpenseExportOptions) {
  const handleDownloadCSV = useCallback(() => {
    if (!expenses || expenses.length === 0) {
      alert(EMPTY_EXPORT_MESSAGE);
      return;
    }

    downloadTextFile(
      buildExpensesCsv(expenses),
      `Expenses_Report_${new Date().toISOString().split('T')[0]}.csv`,
      'text/csv;charset=utf-8;'
    );
  }, [expenses]);

  const handleExpenseReportDownloadPDF = useCallback(() => {
    if (!expenses || expenses.length === 0) {
      alert(EMPTY_EXPORT_MESSAGE);
      return;
    }

    downloadExpenseReportPdf({ expenses, category, status, dateRangeLabel });
  }, [expenses, category, status, dateRangeLabel]);

  const handleDownloadSingleVoucherPDF = useCallback((expense: ExpenseRecord) => {
    downloadExpenseVoucherPdf(expense);
  }, []);

  return {
    handleDownloadCSV,
    handleExpenseReportDownloadPDF,
    handleDownloadSingleVoucherPDF,
  };
}

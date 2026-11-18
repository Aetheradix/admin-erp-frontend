import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ExpenseRecord } from '@/store/api/expenseSlice';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { getExpenseDate, sumExpenseAmounts } from './utils';

export interface ExpenseReportPdfOptions {
  expenses: ExpenseRecord[];
  category: string;
  status: string;
  dateRangeLabel: string;
}

export function downloadExpenseReportPdf({
  expenses,
  category,
  status,
  dateRangeLabel,
}: ExpenseReportPdfOptions): void {
  const totalAmount = sumExpenseAmounts(expenses);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  doc.setFontSize(18);
  doc.setTextColor(17, 24, 39);
  doc.text('Expenses Management Report', 14, 18);

  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(
    `Generated on ${new Date().toLocaleDateString()}  •  Total Items: ${expenses.length}`,
    14,
    25
  );

  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(14, 29, 182, 18, 1.5, 1.5, 'FD');

  const col1 = 18;
  const col2 = 65;
  const col3 = 115;
  const col4 = 155;

  doc.setFontSize(7);
  doc.setTextColor(107, 114, 128);
  doc.text('FILTERED TOTAL VALUE', col1, 34);
  doc.text('DATE RANGE FILTER', col2, 34);
  doc.text('CATEGORY FILTER', col3, 34);
  doc.text('STATUS FILTER', col4, 34);

  doc.setFontSize(9);
  doc.setTextColor(17, 24, 39);
  doc.text(formatCurrency(totalAmount), col1, 41);
  doc.text(dateRangeLabel, col2, 41);
  doc.text(String(category || 'All'), col3, 41);
  doc.text(String(status || 'All'), col4, 41);

  const tableRows = expenses.map((expense) => [
    expense.expense_number || `#${expense.id}`,
    expense.title || '',
    getExpenseDate(expense) || 'N/A',
    expense.vendor_name || 'N/A',
    expense.employee_name || 'N/A',
    expense.category || '',
    expense.status || 'Pending',
    formatCurrency(Number(expense.amount || 0)),
  ]);

  autoTable(doc, {
    head: [['Expense #', 'Title', 'Date', 'Vendor', 'Employee', 'Category', 'Status', 'Amount']],
    body: tableRows,
    startY: 52,
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [17, 24, 39],
    },
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [55, 65, 81],
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      7: { halign: 'right' },
    },
  });

  doc.save(`Expenses_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function downloadExpenseVoucherPdf(expense: ExpenseRecord): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });

  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('EXPENSE PAYMENT VOUCHER', 14, 16);

  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(`Voucher Ref: ${expense.expense_number || '#' + expense.id}`, 14, 23);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(14, 33, 120, 20, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text('APPROVED AMOUNT', 18, 40);
  doc.text('STATUS', 75, 40);

  doc.setFontSize(13);
  doc.setTextColor(17, 24, 39);
  doc.text(formatCurrency(Number(expense.amount || 0)), 18, 48);
  doc.text(String(expense.status || 'Pending'), 75, 48);

  const voucherDetails = [
    ['Expense Title', String(expense.title || 'N/A')],
    ['Expense Category', String(expense.category || 'N/A')],
    ['Claimed By', String(expense.employee_name || 'N/A')],
    ['Vendor / Payee', String(expense.vendor_name || 'N/A')],
    ['Payment Mode', String(expense.payment_mode || 'Corporate / Direct')],
    ['Description', String(expense.description || 'No additional notes provided.')],
  ];

  autoTable(doc, {
    head: [['Field', 'Details']],
    body: voucherDetails,
    startY: 58,
    styles: { fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
  });

  doc.save(`Voucher_${expense.expense_number || expense.id}.pdf`);
}

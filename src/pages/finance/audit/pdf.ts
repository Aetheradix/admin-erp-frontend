import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AuditBookMetrics } from './types';
import { formatAuditCurrency } from './utils';

interface AutoTableDocument extends jsPDF {
  lastAutoTable?: { finalY?: number };
}

export function exportAuditBookPdf(metrics: AuditBookMetrics, year: string, quarter: string): void {
  const { income, expenses, totalRevenue, totalExpenses, netProfitLoss, grossMargin } = metrics;
  const fmt = formatAuditCurrency;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFillColor(10, 15, 30);
  doc.rect(0, 0, pageW, 40, 'F');
  doc.setTextColor(99, 102, 241);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('FINANCIAL AUDIT BOOK', 20, 18);
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${quarter} ${year}`, 20, 26);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 20, 32);
  doc.setTextColor(100, 116, 139);
  doc.text('CONFIDENTIAL — For Internal Use Only', pageW - 20, 32, { align: 'right' });

  doc.setFillColor(30, 41, 59);
  doc.rect(0, 44, pageW, 28, 'F');
  const kpis = [
    { label: 'Total Revenue', value: fmt(totalRevenue) },
    { label: 'Total Expenses', value: fmt(totalExpenses) },
    {
      label: netProfitLoss >= 0 ? 'Net Profit' : 'Net Loss',
      value: fmt(Math.abs(netProfitLoss)),
    },
    { label: 'Gross Margin', value: `${grossMargin}%` },
  ];
  kpis.forEach((kpi, index) => {
    const x = 20 + index * (pageW / 4);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text(kpi.label, x, 52);
    doc.setTextColor(241, 245, 249);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(kpi.value, x, 62);
  });

  let y = 80;
  const getFinalY = (fallback: number) =>
    (doc as AutoTableDocument).lastAutoTable?.finalY ?? fallback;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(99, 102, 241);
  doc.text('INCOME STATEMENT', 20, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [['Particulars', 'Amount (INR)', '% of Revenue']],
    body: [
      ...income.map((entry) => [
        entry.particulars,
        fmt(entry.currentPeriod),
        totalRevenue > 0 ? `${((entry.currentPeriod / totalRevenue) * 100).toFixed(1)}%` : '—',
      ]),
      ['TOTAL REVENUE', fmt(totalRevenue), '100%'],
    ],
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [99, 102, 241],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { textColor: [51, 65, 85], fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    footStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    didParseCell: (data) => {
      if (data.row.index === income.length) {
        data.cell.styles.fillColor = [15, 23, 42];
        data.cell.styles.textColor = [255, 255, 255];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  y = getFinalY(y) + 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(239, 68, 68);
  doc.text('EXPENSE LEDGER', 20, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [['Particulars', 'Amount (INR)', '% of Expenses']],
    body: [
      ...expenses.map((entry) => [
        entry.particulars,
        fmt(entry.currentPeriod),
        totalExpenses > 0 ? `${((entry.currentPeriod / totalExpenses) * 100).toFixed(1)}%` : '—',
      ]),
      ['TOTAL EXPENSES', fmt(totalExpenses), '100%'],
    ],
    theme: 'striped',
    headStyles: {
      fillColor: [127, 29, 29],
      textColor: [254, 202, 202],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { textColor: [51, 65, 85], fontSize: 9 },
    alternateRowStyles: { fillColor: [255, 247, 247] },
    didParseCell: (data) => {
      if (data.row.index === expenses.length) {
        data.cell.styles.fillColor = [127, 29, 29];
        data.cell.styles.textColor = [255, 255, 255];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  y = getFinalY(y) + 14;

  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  autoTable(doc, {
    startY: y,
    head: [['Profit & Loss Summary', 'Amount (INR)']],
    body: [
      ['Total Revenue', fmt(totalRevenue)],
      ['Less: Total Expenses', `(${fmt(totalExpenses)})`],
      [netProfitLoss >= 0 ? 'NET PROFIT BEFORE TAX' : 'NET LOSS', fmt(Math.abs(netProfitLoss))],
      ['Gross Margin %', `${grossMargin}%`],
    ],
    theme: 'plain',
    headStyles: {
      fillColor: netProfitLoss >= 0 ? [6, 78, 59] : [127, 29, 29],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: { textColor: [15, 23, 42], fontSize: 10 },
    didParseCell: (data) => {
      if (data.row.index === 2) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = netProfitLoss >= 0 ? [220, 252, 231] : [254, 226, 226];
        data.cell.styles.textColor = netProfitLoss >= 0 ? [6, 78, 59] : [153, 27, 27];
      }
    },
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Page ${i} of ${pageCount} | Aetheradix ERP — Financial Audit Book ${quarter} ${year}`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  doc.save(`Audit_Book_${year}_${quarter.replace(/[^a-z0-9]/gi, '_')}.pdf`);
}

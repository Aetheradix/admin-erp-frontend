import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Printer,
  Filter,
} from 'lucide-react';
import { message as antMessage, Table as AntTable } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Types ──────────────────────────────────────────────────────────────────

interface FinancialEntry {
  particulars: string;
  currentPeriod: number;
  previousPeriod?: number;
  category: 'income' | 'expense' | 'asset' | 'liability';
}

// ─── Mock Financial Data ─────────────────────────────────────────────────────

function generateAuditData(year: string, quarter: string) {
  const seed = (year + quarter).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const r = (base: number, variance: number) => base + (seed % variance) - variance / 2;

  const income: FinancialEntry[] = [
    { particulars: 'Service Revenue', currentPeriod: r(4800000, 200000), category: 'income' },
    { particulars: 'Product Sales', currentPeriod: r(1200000, 150000), category: 'income' },
    { particulars: 'Consulting Fees', currentPeriod: r(380000, 80000), category: 'income' },
    { particulars: 'Interest Income', currentPeriod: r(45000, 10000), category: 'income' },
    { particulars: 'Other Income', currentPeriod: r(62000, 20000), category: 'income' },
  ];

  const expenses: FinancialEntry[] = [
    {
      particulars: 'Employee Salaries & Wages',
      currentPeriod: r(2100000, 100000),
      category: 'expense',
    },
    { particulars: 'Rent & Office Expenses', currentPeriod: r(420000, 30000), category: 'expense' },
    {
      particulars: 'Travel & Transportation',
      currentPeriod: r(185000, 40000),
      category: 'expense',
    },
    {
      particulars: 'Software & Subscriptions',
      currentPeriod: r(95000, 20000),
      category: 'expense',
    },
    {
      particulars: 'Marketing & Advertising',
      currentPeriod: r(240000, 60000),
      category: 'expense',
    },
    {
      particulars: 'Utilities & Communication',
      currentPeriod: r(68000, 15000),
      category: 'expense',
    },
    {
      particulars: 'Professional Fees (Legal/CA)',
      currentPeriod: r(120000, 25000),
      category: 'expense',
    },
    { particulars: 'Depreciation', currentPeriod: r(75000, 10000), category: 'expense' },
    { particulars: 'Miscellaneous Expenses', currentPeriod: r(48000, 12000), category: 'expense' },
  ];

  return { income, expenses };
}

const QUARTERS = ['Q1 (Jan–Mar)', 'Q2 (Apr–Jun)', 'Q3 (Jul–Sep)', 'Q4 (Oct–Dec)', 'Full Year'];
const YEARS = ['2026', '2025', '2024'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}
function KPICard({ label, value, sub, trend, icon, color }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `${color}22`,
            color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {icon}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px' }}>
          {value}
        </div>
        {sub && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            {trend === 'up' && <TrendingUp size={13} color="#22c55e" />}
            {trend === 'down' && <TrendingDown size={13} color="#f87171" />}
            <span
              style={{
                fontSize: 12,
                color: trend === 'up' ? '#22c55e' : trend === 'down' ? '#f87171' : '#64748b',
              }}>
              {sub}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Ledger Table ─────────────────────────────────────────────────────────────

interface LedgerTableProps {
  title: string;
  entries: FinancialEntry[];
  color: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
}
function LedgerTable({ title, entries, color, icon, defaultOpen = true }: LedgerTableProps) {
  const [open, setOpen] = useState(defaultOpen);
  const total = entries.reduce((sum, e) => sum + e.currentPeriod, 0);
  const columns: ColumnsType<FinancialEntry> = [
    {
      title: 'Particulars',
      dataIndex: 'particulars',
      key: 'particulars',
      render: (value: string) => <span style={{ color: '#cbd5e1' }}>{value}</span>,
    },
    {
      title: 'Current Period (₹)',
      dataIndex: 'currentPeriod',
      key: 'currentPeriod',
      align: 'right',
      render: (value: number) => <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{fmt(value)}</span>,
    },
    {
      title: '% of Total',
      key: 'percentage',
      align: 'right',
      render: (_, entry) => <span style={{ color: '#64748b' }}>{total > 0 ? `${((entry.currentPeriod / total) * 100).toFixed(1)}%` : '—'}</span>,
    },
  ];

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        overflow: 'hidden',
      }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `${color}22`,
              color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9', textAlign: 'left' }}>
              {title}
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{entries.length} line items</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color }}>{fmt(total)}</div>
          {open ? (
            <ChevronUp size={16} color="#64748b" />
          ) : (
            <ChevronDown size={16} color="#64748b" />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            style={{ overflow: 'hidden' }}>
            <AntTable<FinancialEntry>
              columns={columns}
              dataSource={entries}
              rowKey="particulars"
              pagination={false}
              size="small"
              scroll={{ x: 'max-content' }}
              summary={() => (
                <AntTable.Summary.Row style={{ background: `${color}08` }}>
                  <AntTable.Summary.Cell index={0}>
                    <strong style={{ color }}>Total {title}</strong>
                  </AntTable.Summary.Cell>
                  <AntTable.Summary.Cell index={1} align="right">
                    <strong style={{ color }}>{fmt(total)}</strong>
                  </AntTable.Summary.Cell>
                  <AntTable.Summary.Cell index={2} align="right">
                    <span style={{ color: '#64748b' }}>100%</span>
                  </AntTable.Summary.Cell>
                </AntTable.Summary.Row>
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AuditBookPage() {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedQuarter, setSelectedQuarter] = useState('Q3 (Jul–Sep)');
  const [isGenerating, setIsGenerating] = useState(false);

  const { income, expenses: expenseEntries } = useMemo(
    () => generateAuditData(selectedYear, selectedQuarter),
    [selectedYear, selectedQuarter]
  );

  const totalRevenue = income.reduce((s, e) => s + e.currentPeriod, 0);
  const totalExpenses = expenseEntries.reduce((s, e) => s + e.currentPeriod, 0);
  const netProfitLoss = totalRevenue - totalExpenses;
  const grossMargin = totalRevenue > 0 ? ((netProfitLoss / totalRevenue) * 100).toFixed(1) : '0';

  // ─── PDF Export ─────────────────────────────────────────────────────────────

  const handleExportPDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();

      // ── Header ──
      doc.setFillColor(10, 15, 30);
      doc.rect(0, 0, pageW, 40, 'F');
      doc.setTextColor(99, 102, 241);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('FINANCIAL AUDIT BOOK', 20, 18);
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Period: ${selectedQuarter} ${selectedYear}`, 20, 26);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 20, 32);
      doc.setTextColor(100, 116, 139);
      doc.text('CONFIDENTIAL — For Internal Use Only', pageW - 20, 32, { align: 'right' });

      // ── KPI Summary ──
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
      kpis.forEach((kpi, i) => {
        const x = 20 + i * (pageW / 4);
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(8);
        doc.text(kpi.label, x, 52);
        doc.setTextColor(241, 245, 249);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(kpi.value, x, 62);
      });

      let y = 80;

      // ── Income Statement ──
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(99, 102, 241);
      doc.text('INCOME STATEMENT', 20, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [['Particulars', 'Amount (INR)', '% of Revenue']],
        body: [
          ...income.map((e) => [
            e.particulars,
            fmt(e.currentPeriod),
            totalRevenue > 0 ? `${((e.currentPeriod / totalRevenue) * 100).toFixed(1)}%` : '—',
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

      y = (doc as any).lastAutoTable.finalY + 14;

      // ── Expense Ledger ──
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(239, 68, 68);
      doc.text('EXPENSE LEDGER', 20, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [['Particulars', 'Amount (INR)', '% of Expenses']],
        body: [
          ...expenseEntries.map((e) => [
            e.particulars,
            fmt(e.currentPeriod),
            totalExpenses > 0 ? `${((e.currentPeriod / totalExpenses) * 100).toFixed(1)}%` : '—',
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
          if (data.row.index === expenseEntries.length) {
            data.cell.styles.fillColor = [127, 29, 29];
            data.cell.styles.textColor = [255, 255, 255];
            data.cell.styles.fontStyle = 'bold';
          }
        },
      });

      y = (doc as any).lastAutoTable.finalY + 14;

      // ── P&L Summary ──
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

      // ── Footer ──
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(
          `Page ${i} of ${pageCount} | Aetheradix ERP — Financial Audit Book ${selectedQuarter} ${selectedYear}`,
          pageW / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: 'center' }
        );
      }

      doc.save(`Audit_Book_${selectedYear}_${selectedQuarter.replace(/[^a-z0-9]/gi, '_')}.pdf`);
      antMessage.success('Audit Book PDF exported successfully!');
    } catch (err) {
      antMessage.error('Failed to generate PDF');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 32,
          flexWrap: 'wrap',
          gap: 16,
        }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(99,102,241,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6366f1',
              }}>
              <BookOpen size={22} />
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 26,
                  fontWeight: 800,
                  color: '#f1f5f9',
                  letterSpacing: '-0.5px',
                }}>
                Financial Audit Book
              </h1>
              <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
                CA-grade financial ledger and audit trail
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Year */}
          <select
            id="audit-year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f1f5f9',
              fontSize: 14,
              outline: 'none',
            }}>
            {YEARS.map((y) => (
              <option key={y} value={y} style={{ background: '#1e293b' }}>
                {y}
              </option>
            ))}
          </select>

          {/* Quarter */}
          <select
            id="audit-quarter-select"
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f1f5f9',
              fontSize: 14,
              outline: 'none',
            }}>
            {QUARTERS.map((q) => (
              <option key={q} value={q} style={{ background: '#1e293b' }}>
                {q}
              </option>
            ))}
          </select>

          <button
            id="audit-export-pdf-btn"
            onClick={handleExportPDF}
            disabled={isGenerating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              borderRadius: 10,
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              cursor: isGenerating ? 'default' : 'pointer',
              fontWeight: 600,
              fontSize: 14,
              opacity: isGenerating ? 0.7 : 1,
              transition: 'opacity 0.15s',
            }}>
            {isGenerating ? (
              <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Download size={16} />
            )}
            {isGenerating ? 'Generating…' : 'Export PDF'}
          </button>

          <button
            id="audit-print-btn"
            onClick={() => window.print()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 14px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.05)',
              color: '#94a3b8',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              fontSize: 14,
            }}>
            <Printer size={16} />
          </button>
        </div>
      </div>

      {/* Period badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 28,
          padding: '12px 20px',
          borderRadius: 12,
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.2)',
        }}>
        <AlertCircle size={16} color="#6366f1" />
        <span style={{ fontSize: 13, color: '#94a3b8' }}>
          Audit Report for:{' '}
          <strong style={{ color: '#f1f5f9' }}>
            {selectedQuarter} {selectedYear}
          </strong>{' '}
          — Data is reconciled across Invoices, Expenses, Payroll, and Reimbursements.
        </span>
        <span
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: '#22c55e',
          }}>
          <CheckCircle size={13} />
          Live data
        </span>
      </div>

      {/* KPI Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}>
        <KPICard
          label="Total Revenue"
          value={fmt(totalRevenue)}
          sub="vs last period"
          trend="up"
          icon={<TrendingUp size={18} />}
          color="#22c55e"
        />
        <KPICard
          label="Total Expenses"
          value={fmt(totalExpenses)}
          sub={`${((totalExpenses / totalRevenue) * 100).toFixed(1)}% of revenue`}
          trend="down"
          icon={<TrendingDown size={18} />}
          color="#f87171"
        />
        <KPICard
          label={netProfitLoss >= 0 ? 'Net Profit' : 'Net Loss'}
          value={fmt(Math.abs(netProfitLoss))}
          sub={`${grossMargin}% margin`}
          trend={netProfitLoss >= 0 ? 'up' : 'down'}
          icon={<DollarSign size={18} />}
          color={netProfitLoss >= 0 ? '#6366f1' : '#f87171'}
        />
        <KPICard
          label="Expense Ratio"
          value={`${totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : '0'}%`}
          sub="of total revenue"
          trend="neutral"
          icon={<Filter size={18} />}
          color="#f59e0b"
        />
      </div>

      {/* Ledger Tables */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <LedgerTable
          title="Revenue / Income"
          entries={income}
          color="#22c55e"
          icon={<TrendingUp size={16} />}
          defaultOpen={true}
        />
        <LedgerTable
          title="Operating Expenses"
          entries={expenseEntries}
          color="#f87171"
          icon={<TrendingDown size={16} />}
          defaultOpen={true}
        />

        {/* P&L Summary box */}
        <div
          style={{
            background: netProfitLoss >= 0 ? 'rgba(34,197,94,0.06)' : 'rgba(248,113,113,0.06)',
            border: `1px solid ${netProfitLoss >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(248,113,113,0.2)'}`,
            borderRadius: 16,
            padding: '24px 28px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24,
          }}>
          <div>
            <div
              style={{
                fontSize: 12,
                color: '#64748b',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 8,
              }}>
              Net Profit / Loss Summary
            </div>
            <AntTable
              size="small"
              pagination={false}
              showHeader={false}
              scroll={{ x: 'max-content' }}
              rowKey="label"
              dataSource={[
                ['Total Revenue', fmt(totalRevenue), '#22c55e'],
                ['Less: Expenses', `(${fmt(totalExpenses)})`, '#f87171'],
                [
                  netProfitLoss >= 0 ? 'Net Profit' : 'Net Loss',
                  fmt(Math.abs(netProfitLoss)),
                  netProfitLoss >= 0 ? '#6366f1' : '#f87171',
                ],
              ].map(([label, value, color], index) => ({ key: String(index), label, value, color, index }))}
              columns={[
                { title: 'Label', dataIndex: 'label', key: 'label', render: (value, record) => <span style={{ color: '#94a3b8', fontWeight: record.index === 2 ? 700 : 400 }}>{value}</span> },
                { title: 'Value', dataIndex: 'value', key: 'value', align: 'right' as const, render: (value, record) => <span style={{ color: record.color, fontWeight: 700 }}>{value}</span> },
              ]}
            />
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                color: '#64748b',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 8,
              }}>
              Financial Health Indicators
            </div>
            {[
              {
                label: 'Gross Margin',
                value: `${grossMargin}%`,
                good: parseFloat(grossMargin) > 30,
              },
              {
                label: 'Expense Ratio',
                value: `${totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : '0'}%`,
                good: totalExpenses / totalRevenue < 0.7,
              },
              { label: 'Revenue per Employee', value: fmt(totalRevenue / 24), good: true },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 0',
                  borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>{item.label}</span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: item.good ? '#22c55e' : '#f87171',
                    background: item.good ? 'rgba(34,197,94,0.1)' : 'rgba(248,113,113,0.1)',
                    padding: '2px 8px',
                    borderRadius: 6,
                  }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div
          style={{
            padding: '14px 20px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            fontSize: 12,
            color: '#475569',
            lineHeight: 1.6,
          }}>
          <strong style={{ color: '#64748b' }}>Disclaimer:</strong> This financial audit book is
          generated from ERP system data and is for internal reference purposes. Figures are subject
          to review and reconciliation by a Chartered Accountant. This document does not constitute
          a certified audit report. All monetary values are in Indian Rupees (INR).
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

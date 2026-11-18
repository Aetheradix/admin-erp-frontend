import { useMemo, useState } from 'react';
import { Filter, IndianRupee, TrendingDown, TrendingUp } from 'lucide-react';
import { message as antMessage } from 'antd';
import { useGetInvoicesQuery } from '@/store/api/financeApiSlice';
import { useGetAllExpensesQuery } from '@/store/api/expenseSlice';
import { AuditBookHeader } from './audit/components/AuditBookHeader';
import { AuditDisclaimer } from './audit/components/AuditDisclaimer';
import { KPICard } from './audit/components/KPICard';
import { LedgerTable } from './audit/components/LedgerTable';
import { ProfitLossSummary } from './audit/components/ProfitLossSummary';
import { AUDIT_COLORS, DEFAULT_AUDIT_QUARTER, DEFAULT_AUDIT_YEAR } from './audit/constants';
import { computeAuditMetrics, formatAuditCurrency as fmt } from './audit/utils';
import { exportAuditBookPdf } from './audit/pdf';

export type { FinancialEntry } from './audit/types';

export default function AuditBookPage() {
  const [selectedYear, setSelectedYear] = useState(DEFAULT_AUDIT_YEAR);
  const [selectedQuarter, setSelectedQuarter] = useState(DEFAULT_AUDIT_QUARTER);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: invoicesData = [] } = useGetInvoicesQuery();
  const { data: expensesData = [] } = useGetAllExpensesQuery();

  const metrics = useMemo(
    () => computeAuditMetrics(invoicesData, expensesData, selectedYear, selectedQuarter),
    [invoicesData, expensesData, selectedYear, selectedQuarter]
  );

  const { income, expenses, totalRevenue, totalExpenses, netProfitLoss, grossMargin, expenseRatio } =
    metrics;
  const isProfitable = netProfitLoss >= 0;

  const handleExportPDF = async () => {
    setIsGenerating(true);
    try {
      exportAuditBookPdf(metrics, selectedYear, selectedQuarter);
      antMessage.success('Audit Book PDF exported successfully!');
    } catch (err) {
      antMessage.error('Failed to generate PDF');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      style={{
        padding: 'clamp(12px, 3vw, 24px) clamp(12px, 4vw, 32px)',
        maxWidth: 1200,
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>
      <AuditBookHeader
        year={selectedYear}
        quarter={selectedQuarter}
        onYearChange={setSelectedYear}
        onQuarterChange={setSelectedQuarter}
        isGenerating={isGenerating}
        onExportPdf={handleExportPDF}
        onPrint={() => window.print()}
      />

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
          color={AUDIT_COLORS.income}
        />
        <KPICard
          label="Total Expenses"
          value={fmt(totalExpenses)}
          sub={`${expenseRatio}% of revenue`}
          trend="down"
          icon={<TrendingDown size={18} />}
          color={AUDIT_COLORS.expense}
        />
        <KPICard
          label={isProfitable ? 'Net Profit' : 'Net Loss'}
          value={fmt(Math.abs(netProfitLoss))}
          sub={`${grossMargin}% margin`}
          trend={isProfitable ? 'up' : 'down'}
          icon={<IndianRupee size={18} />}
          color={isProfitable ? AUDIT_COLORS.profit : AUDIT_COLORS.expense}
        />
        <KPICard
          label="Expense Ratio"
          value={`${expenseRatio}%`}
          sub="of total revenue"
          trend="neutral"
          icon={<Filter size={18} />}
          color={AUDIT_COLORS.warning}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <LedgerTable
          title="Revenue / Income"
          entries={income}
          color={AUDIT_COLORS.income}
          icon={<TrendingUp size={16} />}
          defaultOpen={true}
        />
        <LedgerTable
          title="Operating Expenses"
          entries={expenses}
          color={AUDIT_COLORS.expense}
          icon={<TrendingDown size={16} />}
          defaultOpen={true}
        />
        <ProfitLossSummary metrics={metrics} />
        <AuditDisclaimer />
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

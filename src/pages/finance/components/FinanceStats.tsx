import { History, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { StatCard } from '@/shared/components/StatCard';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import type { FinanceStats as FinanceStatsModel } from '../reimbursements/types';

const CURRENCY_OPTIONS = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

interface FinanceStatsProps {
  stats: FinanceStatsModel;
}

export function FinanceStats({ stats }: FinanceStatsProps) {
  const items = [
    {
      label: 'Total Pending',
      value: formatCurrency(stats.pendingAmount, CURRENCY_OPTIONS),
      icon: Clock,
      tone: 'warning' as const,
    },
    {
      label: 'Total Approved',
      value: formatCurrency(stats.approvedAmount, CURRENCY_OPTIONS),
      icon: CheckCircle2,
      tone: 'success' as const,
    },
    {
      label: 'Paid Reimbursements',
      value: formatCurrency(stats.paidAmount, CURRENCY_OPTIONS),
      icon: History,
      tone: 'primary' as const,
    },
    {
      label: 'Rejected Requests',
      value: formatCurrency(stats.rejectedAmount, CURRENCY_OPTIONS),
      icon: XCircle,
      tone: 'error' as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <StatCard
          key={item.label}
          label={item.label}
          value={item.value}
          icon={item.icon}
          tone={item.tone}
        />
      ))}
    </div>
  );
}

import { Archive as ArchiveIcon, Layers, PieChart, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatsSummaryCardsProps {
  activeProjects: number;
  totalEmployees: number;
  completionRate: string;
  historicalCount: number;
}

interface SummaryCard {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
}

export function StatsSummaryCards({
  activeProjects,
  totalEmployees,
  completionRate,
  historicalCount,
}: StatsSummaryCardsProps) {
  const cards: SummaryCard[] = [
    { label: 'Active Projects', value: activeProjects, icon: Layers, color: 'text-primary' },
    { label: 'Total Employees', value: totalEmployees, icon: PieChart, color: 'text-info' },
    { label: 'Completion Rate', value: completionRate, icon: TrendingUp, color: 'text-success' },
    {
      label: 'Historical Data',
      value: historicalCount,
      icon: ArchiveIcon,
      color: 'text-warning',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((stat) => (
        <div
          key={stat.label}
          className="bg-white p-6 rounded-2xl border border-border-subtle shadow-soft transition-all duration-300 hover:shadow-lg flex items-center gap-6 group">
          <div
            className={`w-14 h-14 rounded-lg bg-surface-subtle flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
            <stat.icon size={28} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-foreground">{stat.value}</span>
            <span className="text-xs font-bold text-muted uppercase tracking-wider">
              {stat.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
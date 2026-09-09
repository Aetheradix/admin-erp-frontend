import { Gift, Users, Activity, IndianRupee } from 'lucide-react';

import type { RecreationalBenefitStats } from '@/types/recreationalBenefits';

interface BenefitStatsProps {
  stats?: RecreationalBenefitStats;
  isLoading?: boolean;
}

export default function BenefitStats({ stats, isLoading }: BenefitStatsProps) {
  const items = [
    {
      title: 'Total Benefits',
      value: stats?.totalBenefits ?? 0,
      icon: Gift,
    },
    {
      title: 'Active Benefits',
      value: stats?.activeBenefits ?? 0,
      icon: Activity,
    },
    {
      title: 'Assignments',
      value: stats?.totalAssignments ?? 0,
      icon: Users,
    },
    {
      title: 'Amount Used',
      value: `₹${(stats?.totalAmountUsed ?? 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-xl border bg-card text-card-foreground shadow-sm"
          >
            {/* Card Header */}
            <div className="flex flex-row items-center justify-between p-6 pb-2">
              <h3 className="text-sm font-medium text-muted-foreground">{item.title}</h3>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Card Content */}
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="h-8 w-20 animate-pulse rounded bg-muted" />
                ) : (
                  item.value
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

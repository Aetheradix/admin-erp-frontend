import React from 'react';
import { Package, CheckCircle2, CalendarCheck, UserCheck, Wrench, Sparkles, TrendingUp } from 'lucide-react';
import type { InventoryStats as InventoryStatsType } from '@/types/inventory';

interface InventoryStatsProps {
  stats?: InventoryStatsType | null;
  isLoading?: boolean;
  onSelectCategory?: (category: string) => void;
  selectedCategory?: string;
}

export const InventoryStats: React.FC<InventoryStatsProps> = ({
  stats,
  isLoading,
  onSelectCategory,
  selectedCategory,
}) => {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-3xl bg-surface-subtle animate-pulse border border-border-subtle" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Assets',
      value: stats.totalItems,
      subtitle: `$${Number(stats.totalValuation).toLocaleString()} Value`,
      icon: Package,
      gradient: 'from-blue-500/10 via-indigo-500/5 to-transparent',
      iconColor: 'text-indigo-600 ',
      borderColor: 'border-indigo-500/20',
      badge: `${stats.totalQuantity} Units`,
      badgeColor: 'bg-indigo-50 text-indigo-700  ',
    },
    {
      title: 'Available',
      value: stats.availableItems,
      subtitle: 'Ready for use / booking',
      icon: CheckCircle2,
      gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
      iconColor: 'text-emerald-600 ',
      borderColor: 'border-emerald-500/20',
      badge: 'In Stock',
      badgeColor: 'bg-emerald-50 text-emerald-700  ',
    },
    {
      title: 'Bookable Resources',
      value: stats.bookableItems,
      subtitle: 'Enabled in Booking System',
      icon: Sparkles,
      gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
      iconColor: 'text-amber-600 ',
      borderColor: 'border-amber-500/20',
      badge: 'Bookable Toggle ON',
      badgeColor: 'bg-amber-50 text-amber-700  ',
    },
    {
      title: 'Active Booked',
      value: stats.bookedItems,
      subtitle: 'Reserved by employees',
      icon: CalendarCheck,
      gradient: 'from-sky-500/10 via-cyan-500/5 to-transparent',
      iconColor: 'text-sky-600 ',
      borderColor: 'border-sky-500/20',
      badge: 'Reservations',
      badgeColor: 'bg-sky-50 text-sky-700  ',
    },
    {
      title: 'Assigned Staff',
      value: stats.assignedItems,
      subtitle: 'Checked out to members',
      icon: UserCheck,
      gradient: 'from-purple-500/10 via-fuchsia-500/5 to-transparent',
      iconColor: 'text-purple-600 ',
      borderColor: 'border-purple-500/20',
      badge: 'Allocated',
      badgeColor: 'bg-purple-50 text-purple-700  ',
    },
    {
      title: 'Under Maintenance',
      value: stats.maintenanceItems,
      subtitle: stats.retiredItems > 0 ? `+${stats.retiredItems} retired` : 'Repair in progress',
      icon: Wrench,
      gradient: 'from-rose-500/10 via-pink-500/5 to-transparent',
      iconColor: 'text-rose-600 ',
      borderColor: 'border-rose-500/20',
      badge: stats.maintenanceItems > 0 ? 'Attention Needed' : 'All Functional',
      badgeColor: stats.maintenanceItems > 0 
        ? 'bg-rose-50 text-rose-700  ' 
        : 'bg-slate-50 text-slate-700  ',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-3xl bg-white backdrop-blur-xl p-5 border ${card.borderColor} shadow-xs hover:shadow-md transition-all duration-300 group`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-muted truncate">
                    {card.title}
                  </span>
                  <div className={`w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-xs ${card.iconColor}`}>
                    <Icon size={16} />
                  </div>
                </div>

                <div className="my-2">
                  <div className="text-2xl font-black text-foreground tracking-tight">
                    {card.value}
                  </div>
                  <div className="text-[11px] font-bold text-muted truncate mt-0.5">
                    {card.subtitle}
                  </div>
                </div>

                <div className="pt-2 border-t border-border-subtle/50">
                  <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resource Utilization & Category Strip */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-border-subtle backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-muted">
              Resource Utilization Rate
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-foreground">
                {stats.utilizationRate}%
              </span>
              <span className="text-xs font-bold text-muted">
                ({stats.assignedItems + stats.bookedItems} of {stats.totalItems - stats.retiredItems} active assets in service)
              </span>
            </div>
          </div>
        </div>

        {/* Categories Quick Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => onSelectCategory?.('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !selectedCategory
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-subtle text-foreground hover:bg-surface-subtle/80'
            }`}
          >
            All Categories ({stats.totalItems})
          </button>
          {stats.categoryBreakdown?.map((cat) => (
            <button
              key={cat.category}
              type="button"
              onClick={() => onSelectCategory?.(cat.category === selectedCategory ? '' : cat.category)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.category
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-subtle text-foreground hover:bg-surface-subtle/80'
              }`}
            >
              {cat.category} <span className="opacity-70">({cat.count})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

import { PageHeader } from '@/components/ui/composed/PageHeader';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Total Revenue', value: '$1.2M', growth: '+12.5%', trend: 'up', icon: DollarSign },
  { label: 'Active Users', value: '4.2k', growth: '+5.2%', trend: 'up', icon: Users },
  { label: 'Conversion Rate', value: '3.1%', growth: '-0.4%', trend: 'down', icon: TrendingUp },
  { label: 'Avg Order Value', value: '$280', growth: '+2.1%', trend: 'up', icon: BarChart3 },
];

export function AnalyticsOverview() {
  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Analytics Overview"
        description="Comprehensive insights into your organization's performance."
        breadcrumbs={[{ label: 'Home', url: '/' }, { label: 'Analytics' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="bg-white rounded-[32px] border border-border-subtle shadow-soft p-8 group hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                <stat.icon size={24} />
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-black ${stat.trend === 'up' ? 'text-success' : 'text-error'}`}
              >
                {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.growth}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-foreground">{stat.value}</span>
              <span className="text-xs font-bold text-muted uppercase tracking-[0.1em]">
                {stat.label}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] border border-border-subtle shadow-soft p-10 h-80 flex items-center justify-center text-muted italic font-medium">
        Revenue Trend Chart Placeholder (Integration with Recharts/Chart.js recommended)
      </div>
    </div>
  );
}

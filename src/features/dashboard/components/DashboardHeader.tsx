import StatCard from '@/components/ui/StatCard';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';

const DashboardHeader: React.FC = () => {
  const { stats } = useDashboardData();
  
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <h1 className="text-4xl font-bold text-white tracking-tight">Dashboard</h1>
      
      <div className="flex items-center gap-4 flex-wrap">
        {stats.map((stat, i) => (
          <StatCard 
            key={i}
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            trend={stat.trend}
            trendValue={stat.trendValue}
            variant="elevated"
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardHeader;

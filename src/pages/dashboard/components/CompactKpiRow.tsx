import type { DashboardSummaryData } from '@/types/dashboard';
import { KPI_COUNT, KPI_GRID_CLASS } from '../constants';
import { buildKpiItems } from '../utils/dashboardKpis';
import { KpiCard } from './kpi/KpiCard';

interface CompactKpiRowProps {
  data: DashboardSummaryData | null;
  isLoading: boolean;
}

function KpiRowSkeleton() {
  return (
    <div className={KPI_GRID_CLASS}>
      {Array.from({ length: KPI_COUNT }).map((_, index) => (
        <div
          key={index}
          className="h-[68px] rounded-[12px] bg-white border border-border-subtle p-3 animate-pulse flex flex-col justify-between shadow-2xs">
          <div className="h-3 w-16 bg-surface-subtle rounded" />
          <div className="h-5 w-20 bg-surface-subtle rounded mt-1" />
        </div>
      ))}
    </div>
  );
}

export function CompactKpiRow({ data, isLoading }: CompactKpiRowProps) {
  if (isLoading || !data) return <KpiRowSkeleton />;

  return (
    <div className={KPI_GRID_CLASS}>
      {buildKpiItems(data).map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  );
}

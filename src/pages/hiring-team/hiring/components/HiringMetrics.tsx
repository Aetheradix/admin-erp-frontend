import { AlertCircle, CheckCircle2, Clock, KeyRound, TrendingUp } from 'lucide-react';
import type { HiringMetrics as HiringMetricsData, HiringView } from '../types';

interface HiringMetricsProps {
  metrics: HiringMetricsData;
  mainView: HiringView;
  onToggleOnboarding: () => void;
}

export function HiringMetrics({ metrics, mainView, onToggleOnboarding }: HiringMetricsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
      <div className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle">
        <div className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Total</div>
        <div className="text-2xl font-black text-foreground">{metrics.total}</div>
      </div>
      <div
        className={`p-5 rounded-2xl border cursor-pointer transition-all ${
          mainView === 'onboarding'
            ? 'bg-warning/10 border-warning/30 ring-2 ring-warning/20'
            : 'bg-warning/5 border-warning/20 hover:bg-warning/10'
        }`}
        onClick={onToggleOnboarding}>
        <div className="text-xs font-bold text-warning uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <TrendingUp size={12} />
          In Onboarding
        </div>
        <div className="text-2xl font-black text-warning">{metrics.onboarding}</div>
        <div className="text-[10px] text-warning/70 mt-0.5">
          {mainView === 'onboarding' ? '▲ Click to hide' : 'Click to view'}
        </div>
      </div>
      <div className="p-5 rounded-2xl bg-info/5 border border-info/20">
        <div className="text-xs font-bold text-info uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Clock size={12} />
          Pending Review
        </div>
        <div className="text-2xl font-black text-info">{metrics.pending}</div>
      </div>
      <div className="p-5 rounded-2xl bg-warning/5 border border-warning/20">
        <div className="text-xs font-bold text-warning uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <AlertCircle size={12} />
          Changes Needed
        </div>
        <div className="text-2xl font-black text-warning">{metrics.changes}</div>
      </div>
      <div className="p-5 rounded-2xl bg-success/5 border border-success/20">
        <div className="text-xs font-bold text-success uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <CheckCircle2 size={12} />
          Approved
        </div>
        <div className="text-2xl font-black text-success">{metrics.approved}</div>
      </div>
      <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20">
        <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <KeyRound size={12} />
          ID Assigned
        </div>
        <div className="text-2xl font-black text-primary">{metrics.assigned}</div>
      </div>
    </div>
  );
}

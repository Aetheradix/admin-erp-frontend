import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/utils/cn';

export type StatTone = 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface StatTrend {
  direction: 'up' | 'down';
  label: string;
}

const TONE_CLASSES: Record<StatTone, { color: string; bg: string }> = {
  primary: { color: 'text-primary', bg: 'bg-primary/10' },
  success: { color: 'text-success', bg: 'bg-success/10' },
  warning: { color: 'text-warning', bg: 'bg-warning/10' },
  error: { color: 'text-error', bg: 'bg-error/10' },
  info: { color: 'text-info', bg: 'bg-info/10' },
};

export interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: StatTone;
  className?: string;
  subtext?: ReactNode;
  badge?: ReactNode;
  trend?: StatTrend;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'primary',
  className,
  subtext,
  badge,
  trend,
}: StatCardProps) {
  const { color, bg } = TONE_CLASSES[tone];
  const iconBox = (
    <div
      className={cn(
        'w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500',
        bg,
        color
      )}>
      <Icon size={24} />
    </div>
  );

  return (
    <div
      className={cn(
        'bg-white p-6 rounded-4xl border border-border-subtle shadow-soft transition-all duration-300 hover:shadow-lg flex flex-col gap-4 group',
        className
      )}>
      {badge ? (
        <div className="flex items-start justify-between gap-3">
          {iconBox}
          {badge}
        </div>
      ) : (
        iconBox
      )}
      <div className="flex flex-col">
        <span className="text-2xl font-black text-foreground">{value}</span>
        <span className="text-xs font-bold text-muted uppercase tracking-wider">{label}</span>
        {subtext && <span className="text-[11px] text-muted font-medium mt-1">{subtext}</span>}
        {trend && (
          <span
            className={cn(
              'flex items-center gap-1 text-[11px] font-bold mt-1',
              trend.direction === 'up' ? 'text-success' : 'text-error'
            )}>
            {trend.direction === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.label}
          </span>
        )}
      </div>
    </div>
  );
}

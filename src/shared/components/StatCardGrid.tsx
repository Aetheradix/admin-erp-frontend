import type { KeyboardEvent, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { StatCard, type StatTone } from './StatCard';

const TONE_COLOR: Record<StatTone, string> = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-info',
};

export interface StatCardItem {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: StatTone;
  colorClassName?: string;
  className?: string;
  onClick?: () => void;
}

export interface StatCardGridProps {
  items: readonly StatCardItem[];
  variant?: 'stacked' | 'inline';
  className?: string;
}

const DEFAULT_GRID = 'grid grid-cols-2 lg:grid-cols-4 gap-6';

export function StatCardGrid({ items, variant = 'inline', className }: StatCardGridProps) {
  return (
    <div className={cn(DEFAULT_GRID, className)}>
      {items.map((item) =>
        variant === 'stacked' ? (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            icon={item.icon}
            tone={item.tone}
            className={item.className}
          />
        ) : (
          <InlineStatCard key={item.label} item={item} />
        )
      )}
    </div>
  );
}

function InlineStatCard({ item }: { item: StatCardItem }) {
  const isInteractive = Boolean(item.onClick);
  const Icon = item.icon;

  return (
    <div
      {...(isInteractive
        ? {
            role: 'button',
            tabIndex: 0,
            onClick: item.onClick,
            onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                item.onClick?.();
              }
            },
          }
        : {})}
      className={cn(
        'bg-white p-6 rounded-[32px] border border-border-subtle shadow-soft transition-all duration-300 hover:shadow-lg flex items-center gap-6 group',
        isInteractive && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        item.className
      )}>
      <div
        className={cn(
          'w-14 h-14 rounded-2xl bg-surface-subtle flex items-center justify-center group-hover:scale-110 transition-transform duration-500',
          item.colorClassName ?? TONE_COLOR[item.tone ?? 'primary']
        )}>
        <Icon size={28} />
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-black text-foreground">{item.value}</span>
        <span className="text-xs font-bold text-muted uppercase tracking-wider">{item.label}</span>
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export type StatTone = 'primary' | 'success' | 'warning' | 'error' | 'info';

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
}

export function StatCard({ label, value, icon: Icon, tone = 'primary', className }: StatCardProps) {
  const { color, bg } = TONE_CLASSES[tone];

  return (
    <div
      className={cn(
        'bg-white p-6 rounded-[32px] border border-border-subtle shadow-soft transition-all duration-300 hover:shadow-lg flex flex-col gap-4 group',
        className
      )}>
      <div
        className={cn(
          'w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500',
          bg,
          color
        )}>
        <Icon size={24} />
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-black text-foreground">{value}</span>
        <span className="text-xs font-bold text-muted uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}

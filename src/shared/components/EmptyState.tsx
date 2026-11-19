import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: ReactNode;
  variant?: 'card' | 'ghost';
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, message, variant = 'card', action, className }: EmptyStateProps) {
  if (variant === 'ghost') {
    return (
      <div
        className={cn(
          'col-span-full py-20 flex flex-col items-center justify-center text-center opacity-40',
          className
        )}>
        <Icon size={48} />
        <p className="text-sm font-black mt-4">{title}</p>
        {action}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'col-span-full py-32 flex flex-col items-center justify-center text-center gap-6 bg-white/50 backdrop-blur-sm rounded-[48px] border-2 border-dashed border-border-strong',
        className
      )}>
      <div className="w-24 h-24 rounded-full bg-surface-subtle flex items-center justify-center text-muted/30">
        <Icon size={48} />
      </div>
      <div className="max-w-md px-6">
        <h3 className="text-2xl font-black text-foreground mb-2">{title}</h3>
        <p className="text-muted font-medium leading-relaxed">{message}</p>
        {action}
      </div>
    </div>
  );
}

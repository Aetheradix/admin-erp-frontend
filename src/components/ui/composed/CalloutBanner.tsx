import type { ReactNode } from 'react';
import { Button } from '@/components/ui/primitives/Button';
import { classNames } from 'primereact/utils';

interface CalloutBannerProps {
  title: ReactNode;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    variant?: 'primary' | 'secondary';
  };
  color?: 'dark' | 'primary';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CalloutBanner = ({
  title,
  description,
  action,
  color = 'dark',
  padding = 'md',
  className,
}: CalloutBannerProps) => {
  const padCls = { sm: 'p-8', md: 'p-10', lg: 'p-12' }[padding];
  const bgCls = color === 'primary' ? 'bg-primary text-white' : 'bg-foreground text-white';
  const glowFrom = color === 'primary' ? 'from-foreground/20' : 'from-primary/20';

  return (
    <div className={classNames(`${padCls} rounded-[48px] ${bgCls} relative overflow-hidden group`, className)}>
      <div className={`absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l ${glowFrom} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="max-w-2xl flex flex-col gap-4">
          <h2 className="text-3xl font-black leading-tight tracking-tight">{title}</h2>
          <p className="text-white/80 text-lg font-medium leading-relaxed">{description}</p>
        </div>
        {action && (
          <Button
            variant={action.variant ?? 'secondary'}
            onClick={action.onClick}
            className="h-14 px-10 rounded-2xl! font-black tracking-widest bg-white text-primary border-none shrink-0"
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
};

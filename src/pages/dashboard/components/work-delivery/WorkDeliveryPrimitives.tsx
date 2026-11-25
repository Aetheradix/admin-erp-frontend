import type { KeyboardEvent, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  WORK_DELIVERY_EMPTY_CLASS,
  WORK_DELIVERY_LIST_CLASS,
  WORK_DELIVERY_ROW_CLASS,
  WORK_DELIVERY_TAB_LABEL_CLASS,
} from '../../constants';

export function TabLabel({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className={WORK_DELIVERY_TAB_LABEL_CLASS}>
      <Icon size={12} />
      <span>{children}</span>
    </span>
  );
}

export function WorkDeliveryList({
  children,
  padded = true,
}: {
  children: ReactNode;
  padded?: boolean;
}) {
  return <div className={cn(WORK_DELIVERY_LIST_CLASS, padded && 'pr-0.5')}>{children}</div>;
}

export function WorkDeliveryRow({
  children,
  onClick,
  group = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  group?: boolean;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      className={cn(WORK_DELIVERY_ROW_CLASS, onClick && 'cursor-pointer', group && 'group')}>
      {children}
    </div>
  );
}

export function WorkDeliveryEmpty({
  icon: Icon,
  title,
  message,
  action,
  iconSize = 24,
  iconClassName = 'text-muted/50 mb-1.5',
  messageClassName = 'text-[11px] text-muted mt-0.5',
}: {
  icon: LucideIcon;
  title: string;
  message?: string;
  action?: ReactNode;
  iconSize?: number;
  iconClassName?: string;
  messageClassName?: string;
}) {
  return (
    <div className={WORK_DELIVERY_EMPTY_CLASS}>
      <Icon size={iconSize} className={iconClassName} />
      <p className="text-xs font-bold text-foreground">{title}</p>
      {message && <p className={messageClassName}>{message}</p>}
      {action}
    </div>
  );
}

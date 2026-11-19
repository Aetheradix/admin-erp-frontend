import type { ReactNode } from 'react';
import { Tabs } from '@/components/ui/primitives/Tabs';
import { cn } from '@/utils/cn';

export interface TabbedLayoutProps {
  items: readonly string[];
  activeItem: string;
  onItemChange: (item: string) => void;
  className?: string;
  tabsClassName?: string;
  children?: ReactNode;
}

export function TabbedLayout({
  items,
  activeItem,
  onItemChange,
  className,
  tabsClassName,
  children,
}: TabbedLayoutProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <Tabs
        items={items}
        activeItem={activeItem}
        onItemChange={onItemChange}
        className={tabsClassName}
      />
      {children}
    </div>
  );
}

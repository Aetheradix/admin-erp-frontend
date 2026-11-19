import { Fragment, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface ContentCardGridProps<T> {
  items: readonly T[];
  getKey: (item: T) => string | number;
  renderCard: (item: T) => ReactNode;
  className?: string;
  empty?: ReactNode;
}

const DEFAULT_GRID = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8';

export function ContentCardGrid<T>({
  items,
  getKey,
  renderCard,
  className,
  empty,
}: ContentCardGridProps<T>) {
  return (
    <div className={cn(DEFAULT_GRID, className)}>
      {items.map((item) => (
        <Fragment key={getKey(item)}>{renderCard(item)}</Fragment>
      ))}
      {items.length === 0 && empty}
    </div>
  );
}

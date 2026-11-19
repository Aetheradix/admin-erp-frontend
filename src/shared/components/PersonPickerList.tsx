import { useMemo, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import type { PersonSummary } from '../types/common';
import { FALLBACK } from '../constants/fallbacks';
import { Avatar } from './Avatar';

export interface PersonPickerListProps<T extends PersonSummary> {
  people: readonly T[];
  mode: 'checkbox' | 'radio';
  selectedIds: readonly (string | number)[];
  onToggle: (person: T) => void;
  getId: (person: T) => string | number;
  name?: string;
  empty?: ReactNode;
  className?: string;
  itemClassName?: string;
}

export function PersonPickerList<T extends PersonSummary>({
  people,
  mode,
  selectedIds,
  onToggle,
  getId,
  name,
  empty,
  className,
  itemClassName,
}: PersonPickerListProps<T>) {
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);

  if (people.length === 0) return <>{empty}</>;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {people.map((person) => {
        const id = getId(person);
        const label = person.username || person.name || FALLBACK.DEFAULT_NAME;
        return (
          <label
            key={id}
            className={cn(
              'flex items-center gap-3 p-2.5 rounded-xl border border-border-subtle bg-white hover:bg-surface-subtle cursor-pointer transition-colors',
              selected.has(id) && 'border-primary/50 bg-primary/5',
              itemClassName
            )}>
            <input
              type={mode}
              name={name}
              checked={selected.has(id)}
              onChange={() => onToggle(person)}
              className="w-4 h-4 accent-primary shrink-0"
            />
            <Avatar
              name={label}
              imageUrl={person.image_url || person.image}
              size="sm"
              presence={false}
            />
            <span className="min-w-0">
              <span className="text-xs font-bold text-foreground block truncate">{label}</span>
              <span className="text-[10px] text-muted block truncate">
                {person.designation || person.role || person.email || ''}
              </span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

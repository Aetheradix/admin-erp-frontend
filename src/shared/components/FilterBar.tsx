import { Fragment, type ReactNode } from 'react';
import { Tabs } from '@/components/ui/primitives/Tabs';
import { Select } from '@/components/ui/primitives/Select';
import { cn } from '@/utils/cn';
import type { FilterConfig } from '../types/filters';
import { SearchInput } from './SearchInput';

export interface FilterBarProps {
  filters: readonly FilterConfig[];
  className?: string;
}

function renderFilter(filter: FilterConfig): ReactNode {
  switch (filter.kind) {
    case 'search':
      return (
        <SearchInput
          value={filter.value}
          onChange={filter.onChange}
          placeholder={filter.placeholder}
          className={filter.className}
          inputClassName={filter.inputClassName}
          iconClassName={filter.iconClassName}
          iconSize={filter.iconSize}
          clearable={filter.clearable}
          ariaLabel={filter.ariaLabel}
        />
      );
    case 'tabs':
      return (
        <Tabs
          items={filter.items}
          activeItem={filter.value}
          onItemChange={filter.onChange}
          className={filter.tabsClassName}
        />
      );
    case 'segmented':
      return (
        <div
          role="group"
          aria-label={filter.ariaLabel}
          className={cn(
            'flex items-center p-1 rounded-2xl bg-surface-subtle/80 border border-border-subtle',
            filter.className
          )}>
          {filter.items.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={filter.value === item}
              onClick={() => filter.onChange(item)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all',
                filter.value === item
                  ? 'bg-white shadow-xs text-primary'
                  : 'text-muted hover:text-foreground'
              )}>
              {item}
            </button>
          ))}
        </div>
      );
    case 'viewToggle':
      return (
        <div
          role="group"
          aria-label={filter.ariaLabel}
          className={cn(
            'flex items-center p-1 rounded-2xl bg-surface-subtle/80 border border-border-subtle',
            filter.className
          )}>
          {filter.options.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={filter.value === option.value}
              aria-label={option.label}
              title={option.label}
              onClick={() => filter.onChange(option.value)}
              className={cn(
                'p-2 rounded-xl transition-all',
                filter.value === option.value
                  ? 'bg-white shadow-xs text-primary'
                  : 'text-muted hover:text-foreground'
              )}>
              {option.icon}
            </button>
          ))}
        </div>
      );
    case 'select':
      return (
        <Select
          aria-label={filter.ariaLabel}
          value={filter.value}
          placeholder={filter.placeholder}
          className={filter.className}
          options={filter.options.map((option) => ({ label: option.label, value: option.value }))}
          onChange={(event) => filter.onChange(String(event.value ?? ''))}
        />
      );
    case 'count':
      return (
        <span
          className={cn(
            'text-xs font-bold text-muted hidden lg:inline-block px-2',
            filter.className
          )}>
          {filter.label}
        </span>
      );
    case 'custom':
      return filter.node;
  }
}

export function FilterBar({ filters, className }: FilterBarProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {filters.map((filter, index) => (
        <Fragment key={index}>{renderFilter(filter)}</Fragment>
      ))}
    </div>
  );
}

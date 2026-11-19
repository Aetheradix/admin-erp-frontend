import { cn } from '@/utils/cn';
import type { RowAction } from '../types/table';

export interface RowActionsProps<T> {
  row: T;
  actions: readonly RowAction<T>[];
  className?: string;
  buttonClassName?: (action: RowAction<T>) => string | undefined;
}

export function RowActions<T>({ row, actions, className, buttonClassName }: RowActionsProps<T>) {
  return (
    <div className={cn('flex items-center justify-end gap-1', className)}>
      {actions.map((action) => {
        if (action.hidden?.(row)) return null;
        const disabled =
          typeof action.disabled === 'function' ? action.disabled(row) : action.disabled;

        return (
          <button
            key={action.key}
            type="button"
            title={action.label}
            aria-label={action.label}
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
              action.onClick(row);
            }}
            className={cn(
              'p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-subtle transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
              action.danger && 'text-error hover:text-error hover:bg-error/10',
              buttonClassName?.(action)
            )}>
            {action.icon}
          </button>
        );
      })}
    </div>
  );
}

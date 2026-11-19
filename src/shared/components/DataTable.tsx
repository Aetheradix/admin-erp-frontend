import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { Table, type TableProps } from 'antd';
import type { RowAction } from '../types/table';
import { RowActions } from './RowActions';

export interface DataTableProps<T extends object> extends Omit<TableProps<T>, 'dataSource'> {
  rows?: T[];
  empty?: ReactNode;
  rowActions?: readonly RowAction<T>[];
  actionsTitle?: ReactNode;
  actionsWidth?: number | string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends object>({
  rows,
  empty,
  rowActions,
  actionsTitle,
  actionsWidth,
  onRowClick,
  columns,
  locale,
  onRow,
  ...rest
}: DataTableProps<T>) {
  const actionColumn: NonNullable<TableProps<T>['columns']>[number] | null =
    rowActions && rowActions.length > 0
      ? {
          key: '__actions',
          title: actionsTitle ?? '',
          width: actionsWidth,
          align: 'right',
          render: (_: unknown, row: T) => <RowActions row={row} actions={rowActions} />,
        }
      : null;

  const mergedColumns = actionColumn ? [...(columns ?? []), actionColumn] : columns;

  const mergedRow: TableProps<T>['onRow'] = onRowClick
    ? (record, index) => {
        const base = onRow?.(record, index) ?? {};
        return {
          ...base,
          role: 'button',
          tabIndex: 0,
          onClick: (event: MouseEvent<HTMLElement>) => {
            base.onClick?.(event);
            if (!event.defaultPrevented) onRowClick(record);
          },
          onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
            base.onKeyDown?.(event);
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onRowClick(record);
            }
          },
        };
      }
    : onRow;

  return (
    <Table<T>
      {...rest}
      columns={mergedColumns}
      dataSource={rows}
      locale={empty ? { emptyText: empty, ...locale } : locale}
      onRow={mergedRow}
    />
  );
}

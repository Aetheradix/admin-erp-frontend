import type { ReactNode } from 'react';
import type { TableProps } from 'antd';

export type TableColumns<T extends object> = NonNullable<TableProps<T>['columns']>;
export type TableRowSelection<T extends object> = TableProps<T>['rowSelection'];

export interface RowAction<T> {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: (row: T) => void;
  danger?: boolean;
  disabled?: boolean | ((row: T) => boolean);
  hidden?: (row: T) => boolean;
}

export interface TableQueryState {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

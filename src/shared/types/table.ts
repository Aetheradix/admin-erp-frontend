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

export interface ColumnConfig<T extends object> {
  key: string;
  title: ReactNode;
  dataIndex?: Extract<keyof T, string>;
  render?: (row: T, index: number) => ReactNode;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sorter?: boolean | ((a: T, b: T) => number);
  className?: string;
  hidden?: boolean;
}

export type ActionConfig<T extends object> = RowAction<T>;

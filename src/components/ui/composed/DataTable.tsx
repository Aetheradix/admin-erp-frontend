import React, { useMemo } from 'react';
import { Table } from 'antd';
import { cn } from '@/utils/cn';
import { extractColumns, applyFilters, type ColumnProps } from './DataTable.utils';

export { FilterMatchMode } from './DataTable.utils';
export type { DataTableFilterMeta } from './DataTable.utils';

export const Column = <T,>(_: ColumnProps<T>) => null;

interface DataTableProps<T extends object> {
  value?: T[];
  filters?: any;
  globalFilterFields?: string[];
  paginator?: boolean;
  rows?: number;
  className?: string;
  scrollable?: boolean;
  breakpoint?: string;
  rowHover?: boolean;
  dataKey?: string;
  loading?: boolean;
  emptyMessage?: string;
  children?: React.ReactNode;
  stripedRows?: boolean;
}

export const DataTable = <T extends object>({
  value = [],
  filters,
  globalFilterFields,
  paginator,
  rows = 10,
  className,
  scrollable,
  dataKey = 'id',
  loading,
  emptyMessage = 'No records found',
  children,
  stripedRows,
}: DataTableProps<T>) => {
  const columns = useMemo(() => extractColumns<T>(children), [children]);
  const filteredData = useMemo(
    () => applyFilters(value as Record<string, unknown>[], filters, globalFilterFields) as T[],
    [value, filters, globalFilterFields]
  );

  return (
    <Table<T>
      columns={columns}
      dataSource={filteredData}
      rowKey={dataKey}
      loading={loading}
      pagination={paginator ? { pageSize: rows, showSizeChanger: false } : false}
      scroll={scrollable ? { x: true } : undefined}
      locale={{ emptyText: emptyMessage }}
      rowClassName={stripedRows ? (_, index) => (index % 2 === 1 ? 'bg-surface-subtle/30' : '') : undefined}
      className={cn(
        'rounded-card border border-border-subtle overflow-hidden bg-white shadow-soft premium-datatable',
        className
      )}
    />
  );
};

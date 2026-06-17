import React, { isValidElement, useMemo } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { cn } from '@/utils/cn';

export const FilterMatchMode = {
  CONTAINS: 'CONTAINS',
  EQUALS: 'EQUALS',
  STARTS_WITH: 'STARTS_WITH',
  ENDS_WITH: 'ENDS_WITH',
} as const;

export interface DataTableFilterMeta {
  [key: string]: {
    value: unknown;
    matchMode: string;
  };
}

export interface ColumnProps<T = Record<string, unknown>> {
  field?: string;
  header?: React.ReactNode;
  body?: (rowData: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  style?: React.CSSProperties;
  className?: string;
  headerClassName?: string;
  key?: string;
  sortable?: boolean;
}

export const Column = <T,>(_props: ColumnProps<T>) => null;

interface DataTableProps<T extends object> {
  value?: T[];
  filters?: DataTableFilterMeta;
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

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function applyFilters<T extends Record<string, unknown>>(
  data: T[],
  filters?: DataTableFilterMeta,
  globalFilterFields?: string[]
): T[] {
  if (!filters) return data;

  return data.filter((row) => {
    for (const [key, filter] of Object.entries(filters)) {
      if (!filter?.value) continue;

      if (key === 'global' && globalFilterFields) {
        const search = String(filter.value).toLowerCase();
        const matches = globalFilterFields.some((field) => {
          const val = getNestedValue(row, field);
          return val != null && String(val).toLowerCase().includes(search);
        });
        if (!matches) return false;
        continue;
      }

      const fieldValue = row[key];
      const filterValue = filter.value;

      if (filter.matchMode === 'equals' || filter.matchMode === 'EQUALS') {
        if (fieldValue !== filterValue) return false;
      } else if (filter.matchMode === 'contains' || filter.matchMode === 'CONTAINS') {
        if (!String(fieldValue ?? '').toLowerCase().includes(String(filterValue).toLowerCase())) {
          return false;
        }
      }
    }
    return true;
  });
}

function extractColumns<T>(children: React.ReactNode): ColumnsType<T> {
  const columns: ColumnsType<T> = [];

  React.Children.forEach(children, (child) => {
    if (!isValidElement<ColumnProps<T>>(child)) return;

    const { field, header, body, align, style, className } = child.props;

    columns.push({
      key: child.key?.toString() ?? field ?? String(header),
      title: header,
      dataIndex: field,
      align,
      width: style?.width,
      className,
      render: body
        ? (_: unknown, record: T) => body(record)
        : field
          ? (_: unknown, record: T) => {
              const val = (record as Record<string, unknown>)[field];
              return val != null ? String(val) : null;
            }
          : undefined,
    });
  });

  return columns;
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

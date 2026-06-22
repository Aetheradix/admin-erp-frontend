import React from 'react';
import type { ColumnsType } from 'antd/es/table';

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

export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce<unknown>((acc, key) => {
        if (acc && typeof acc === 'object') {
            return (acc as Record<string, unknown>)[key];
        }
        return undefined;
    }, obj);
}

export function applyFilters<T extends Record<string, unknown>>(
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

export function extractColumns<T>(children: React.ReactNode): ColumnsType<T> {
    const columns: ColumnsType<T> = [];

    React.Children.forEach(children, (child) => {
        if (!React.isValidElement<ColumnProps<T>>(child)) return;

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

import type { ColumnConfig, TableColumns } from '../types/table';

export function toTableColumns<T extends object>(
  configs: readonly ColumnConfig<T>[]
): TableColumns<T> {
  return configs
    .filter((config) => !config.hidden)
    .map((config) => ({
      key: config.key,
      title: config.title,
      dataIndex: config.dataIndex,
      width: config.width,
      align: config.align,
      sorter: config.sorter,
      className: config.className,
      render: config.render
        ? (_value: unknown, row: T, index: number) => config.render?.(row, index)
        : undefined,
    }));
}

import { DataTable as PRDataTable, type DataTableProps as PRDataTableProps } from 'primereact/datatable';
import { classNames } from 'primereact/utils';

export const DataTable = <T extends object>(props: PRDataTableProps<T[]>) => {
  return (
    <PRDataTable
      {...props}
      className={classNames(
        'rounded-card border border-border-subtle overflow-hidden bg-white shadow-soft',
        props.className
      )}
      tableClassName="min-w-full"
      rowClassName={() => 'border-b border-border-subtle hover:bg-surface-subtle/50 transition-colors'}
    />
  );
};

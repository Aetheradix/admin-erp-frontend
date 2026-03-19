import type { TableProps } from 'antd';
import { Table } from 'antd';

export interface DataTableProps<T> extends TableProps<T> {
  // Custom props can be added here
}

function DataTable<T extends object>(props: DataTableProps<T>) {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden p-4">
      <Table
        {...props}
        className="custom-table"
        pagination={
          props.pagination !== false
            ? {
                ...props.pagination,
                className: '!mb-0 !mt-4',
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              }
            : false
        }
      />
    </div>
  );
}

export default DataTable;

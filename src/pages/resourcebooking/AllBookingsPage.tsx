import { useGetAllResourceBookingsQuery } from '../../store/api/resourceBookingSlice';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const AllBookingsPage = () => {
  const { data: bookings = [], isLoading } = useGetAllResourceBookingsQuery();
  const columns: ColumnsType<(typeof bookings)[number]> = [
    { title: 'Employee', key: 'employee', render: (_, booking) => <><p className="font-medium">{booking.username || '-'}</p><p className="text-xs text-muted-foreground">{booking.email || ''}</p></> },
    { title: 'Resource', dataIndex: 'resource_name', key: 'resource_name' },
    { title: 'Purpose', dataIndex: 'purpose', key: 'purpose', render: (value) => value || '-' },
    { title: 'Date', dataIndex: 'start_datetime', key: 'start_datetime', render: (value) => new Date(value).toLocaleString() },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (value) => <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs text-green-700">{value}</span> },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">All Resource Bookings</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage company-wide resource reservations.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table columns={columns} dataSource={bookings} rowKey="id" loading={isLoading} pagination={false} scroll={{ x: 'max-content' }} />
      </div>
    </div>
  );
};

export default AllBookingsPage;

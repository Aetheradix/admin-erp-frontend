import { useState } from 'react';
import { Search } from 'lucide-react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import {
  useGetMyResourceBookingsQuery,
  useCancelResourceBookingMutation,
} from '../../store/api/resourceBookingSlice';

const MyBookingsPage = () => {
  const [search, setSearch] = useState('');

  const { data: bookings = [], isLoading } = useGetMyResourceBookingsQuery();

  const [cancelBooking, { isLoading: cancelling }] = useCancelResourceBookingMutation();

  const filteredBookings = bookings.filter((booking) => {
    const value = search.toLowerCase();

    return (
      booking.resource_name?.toLowerCase().includes(value) ||
      booking.purpose?.toLowerCase().includes(value)
    );
  });
  const columns: ColumnsType<(typeof bookings)[number]> = [
    { title: 'Resource', key: 'resource', render: (_, booking) => <><p className="font-medium">{booking.resource_name}</p><p className="text-xs text-muted-foreground">{booking.resource_type}</p></> },
    { title: 'Purpose', dataIndex: 'purpose', key: 'purpose', render: (value) => value || '-' },
    { title: 'Date', dataIndex: 'start_datetime', key: 'date', render: (value) => new Date(value).toLocaleDateString() },
    { title: 'Time', key: 'time', render: (_, booking) => `${new Date(booking.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(booking.end_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (value) => <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">{value}</span> },
    { title: 'Action', key: 'action', align: 'right', render: (_, booking) => booking.status?.toLowerCase() !== 'cancelled' && <button type="button" disabled={cancelling} onClick={() => handleCancel(booking.id)} className="text-sm font-medium text-red-600 hover:underline">Cancel</button> },
  ];

  const handleCancel = async (id: number) => {
    const confirmed = window.confirm('Are you sure you want to cancel this booking?');

    if (!confirmed) return;

    try {
      await cancelBooking(id).unwrap();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">My Bookings</h1>

        <p className="mt-1 text-sm text-muted-foreground">Manage your resource reservations.</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookings..."
            className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table columns={columns} dataSource={filteredBookings} rowKey="id" loading={isLoading} pagination={false} locale={{ emptyText: 'No bookings found' }} scroll={{ x: 'max-content' }} />
      </div>
    </div>
  );
};

export default MyBookingsPage;

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Table, Popconfirm, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import {
  useGetMyResourceBookingsQuery,
  useCancelResourceBookingMutation,
  type ResourceBooking,
} from '../../store/api/resourceBookingSlice';

export const getStatusBadge = (status?: string) => {
  const s = status?.toLowerCase();
  switch (s) {
    case 'confirmed':
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          Confirmed
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
          Pending
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
          Cancelled
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-800">
          Rejected
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
          Completed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
          {status || 'Unknown'}
        </span>
      );
  }
};

const MyBookingsPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const { data: bookings = [], isLoading } = useGetMyResourceBookingsQuery();
  const [cancelBooking, { isLoading: cancelling }] = useCancelResourceBookingMutation();

  const handleCancel = async (id: number) => {
    try {
      await cancelBooking(id).unwrap();
      message.success('Booking cancelled successfully.');
    } catch (error: any) {
      console.error(error);
      message.error(error?.data?.message || 'Failed to cancel booking.');
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const value = search.toLowerCase();
    const matchesSearch =
      booking.resource_name?.toLowerCase().includes(value) ||
      booking.purpose?.toLowerCase().includes(value) ||
      booking.notes?.toLowerCase().includes(value);

    const matchesStatus =
      statusFilter === 'All' || booking.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const columns: ColumnsType<ResourceBooking> = [
    {
      title: 'Resource',
      key: 'resource',
      render: (_, booking) => (
        <div>
          <p className="font-medium text-foreground">{booking.resource_name || 'Resource'}</p>
          <p className="text-xs text-muted-foreground">{booking.resource_type || 'Asset'}</p>
        </div>
      ),
    },
    {
      title: 'Purpose',
      dataIndex: 'purpose',
      key: 'purpose',
      render: (value, booking) => (
        <div>
          <p>{value || '-'}</p>
          {booking.notes && (
            <p className="text-xs text-muted-foreground italic truncate max-w-xs">{booking.notes}</p>
          )}
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'start_datetime',
      key: 'date',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      title: 'Time',
      key: 'time',
      render: (_, booking) =>
        `${new Date(booking.start_datetime).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })} - ${new Date(booking.end_datetime).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value) => getStatusBadge(value),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, booking) =>
        booking.status?.toLowerCase() !== 'cancelled' && (
          <Popconfirm
            title="Cancel Booking"
            description="Are you sure you want to cancel this booking?"
            onConfirm={() => handleCancel(booking.id)}
            okText="Yes, Cancel"
            cancelText="No"
            okButtonProps={{ danger: true }}>
            <button
              type="button"
              disabled={cancelling}
              className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline disabled:opacity-50">
              Cancel
            </button>
          </Popconfirm>
        ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">My Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your resource reservations.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookings..."
            className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Confirmed', 'Pending', 'Cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-primary text-primary-foreground'
                  : 'border bg-background hover:bg-muted text-muted-foreground'
              }`}>
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table
          columns={columns}
          dataSource={filteredBookings}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          locale={{ emptyText: 'No bookings found' }}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </div>
  );
};

export default MyBookingsPage;

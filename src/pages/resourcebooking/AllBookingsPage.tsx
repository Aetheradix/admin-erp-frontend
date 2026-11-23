import { useState } from 'react';
import { Search, Trash2, Ban } from 'lucide-react';
import { Table, Popconfirm, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import {
  useGetAllResourceBookingsQuery,
  useCancelResourceBookingMutation,
  useDeleteResourceBookingMutation,
  type ResourceBooking,
} from '../../store/api/resourceBookingSlice';
import { getStatusBadge } from './MyBookingsPage';

const AllBookingsPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const { data: bookings = [], isLoading } = useGetAllResourceBookingsQuery();
  const [cancelBooking, { isLoading: cancelling }] = useCancelResourceBookingMutation();
  const [deleteBooking, { isLoading: deleting }] = useDeleteResourceBookingMutation();

  const handleCancel = async (id: number) => {
    try {
      await cancelBooking(id).unwrap();
      message.success('Booking cancelled successfully.');
    } catch (error: any) {
      console.error(error);
      message.error(error?.data?.message || 'Failed to cancel booking.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBooking(id).unwrap();
      message.success('Booking deleted successfully.');
    } catch (error: any) {
      console.error(error);
      message.error(error?.data?.message || 'Failed to delete booking.');
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const value = search.toLowerCase();
    const matchesSearch =
      booking.username?.toLowerCase().includes(value) ||
      booking.email?.toLowerCase().includes(value) ||
      booking.resource_name?.toLowerCase().includes(value) ||
      booking.purpose?.toLowerCase().includes(value) ||
      booking.notes?.toLowerCase().includes(value);

    const matchesStatus =
      statusFilter === 'All' || booking.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const columns: ColumnsType<ResourceBooking> = [
    {
      title: 'Employee',
      key: 'employee',
      render: (_, booking) => (
        <div>
          <p className="font-medium text-foreground">{booking.username || 'Unknown Employee'}</p>
          <p className="text-xs text-muted-foreground">{booking.email || '-'}</p>
        </div>
      ),
    },
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
      title: 'Date & Time',
      key: 'date_time',
      render: (_, booking) => (
        <div>
          <p className="text-xs font-medium">{new Date(booking.start_datetime).toLocaleDateString()}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(booking.start_datetime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            -{' '}
            {new Date(booking.end_datetime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value) => getStatusBadge(value),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, booking) => (
        <div className="flex items-center justify-end gap-2">
          {booking.status?.toLowerCase() !== 'cancelled' && (
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
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                title="Cancel booking">
                <Ban className="h-3.5 w-3.5" />
                Cancel
              </button>
            </Popconfirm>
          )}

          <Popconfirm
            title="Delete Booking"
            description="Are you sure you want to permanently delete this booking record?"
            onConfirm={() => handleDelete(booking.id)}
            okText="Yes, Delete"
            cancelText="No"
            okButtonProps={{ danger: true }}>
            <button
              type="button"
              disabled={deleting}
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              title="Delete record">
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">All Resource Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage and monitor company-wide resource reservations.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee, resource, purpose..."
            className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Confirmed', 'Pending', 'Cancelled', 'Completed'].map((st) => (
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
          locale={{ emptyText: 'No resource bookings found' }}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </div>
  );
};

export default AllBookingsPage;

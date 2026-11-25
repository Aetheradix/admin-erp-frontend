import { useState, useMemo } from 'react';
import { CalendarDays, Plus, Clock, User } from 'lucide-react';
import { Calendar, Modal, Popconfirm, message, Spin } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import {
  useGetAllResourceBookingsQuery,
  useGetResourcesQuery,
  useCreateResourceBookingMutation,
  useCancelResourceBookingMutation,
  type ResourceBooking,
} from '../../store/api/resourceBookingSlice';
import ResourceBookingModal from './components/ResourceBookingModal';
import { getStatusBadge } from './MyBookingsPage';

const ResourceCalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedResourceFilter, setSelectedResourceFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [selectedBooking, setSelectedBooking] = useState<ResourceBooking | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const { data: bookings = [], isLoading: bookingsLoading } = useGetAllResourceBookingsQuery();
  const { data: resources = [] } = useGetResourcesQuery();
  const [createBooking, { isLoading: isCreating }] = useCreateResourceBookingMutation();
  const [cancelBooking, { isLoading: isCancelling }] = useCancelResourceBookingMutation();

  // Filter bookings based on active filters
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchResource =
        selectedResourceFilter === 'All' ||
        String(b.resource_id) === selectedResourceFilter ||
        b.resource_name?.toLowerCase() === selectedResourceFilter.toLowerCase();

      const matchStatus =
        selectedStatusFilter === 'All' ||
        b.status?.toLowerCase() === selectedStatusFilter.toLowerCase();

      return matchResource && matchStatus;
    });
  }, [bookings, selectedResourceFilter, selectedStatusFilter]);

  // Bookings grouped by date string (YYYY-MM-DD)
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, ResourceBooking[]>();
    for (const booking of filteredBookings) {
      if (!booking.start_datetime) continue;
      const dateKey = dayjs(booking.start_datetime).format('YYYY-MM-DD');
      const list = map.get(dateKey) || [];
      list.push(booking);
      map.set(dateKey, list);
    }
    return map;
  }, [filteredBookings]);

  // Bookings for the currently selected date
  const selectedDayBookings = useMemo(() => {
    const key = selectedDate.format('YYYY-MM-DD');
    return bookingsByDate.get(key) || [];
  }, [selectedDate, bookingsByDate]);

  const handleCreateSubmit = async (data: any) => {
    try {
      await createBooking(data).unwrap();
      message.success('Resource booking created successfully!');
      setIsBookingModalOpen(false);
    } catch (err: any) {
      console.error(err);
      message.error(err?.data?.message || 'Failed to create booking.');
      throw err;
    }
  };

  const handleCancelBooking = async (id: number) => {
    try {
      await cancelBooking(id).unwrap();
      message.success('Booking cancelled successfully.');
      setSelectedBooking(null);
    } catch (err: any) {
      console.error(err);
      message.error(err?.data?.message || 'Failed to cancel booking.');
    }
  };

  // Cell renderer for calendar date cells
  const dateCellRender = (current: Dayjs) => {
    const key = current.format('YYYY-MM-DD');
    const dayBookings = bookingsByDate.get(key) || [];

    if (dayBookings.length === 0) return null;

    return (
      <ul className="m-0 p-0 list-none space-y-1 overflow-hidden">
        {dayBookings.slice(0, 3).map((b) => {
          const isCancelled = b.status?.toLowerCase() === 'cancelled';
          const isPending = b.status?.toLowerCase() === 'pending';
          const dotClass = isCancelled
            ? 'bg-red-500'
            : isPending
              ? 'bg-amber-500'
              : 'bg-emerald-500';

          const timeStr = dayjs(b.start_datetime).format('HH:mm');

          return (
            <li
              key={b.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedBooking(b);
              }}
              className="group flex items-center gap-1.5 truncate rounded px-1.5 py-0.5 text-[11px] font-medium leading-tight bg-muted/60 hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
              title={`${timeStr} - ${b.resource_name || 'Resource'} (${b.status})`}>
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
              <span className="shrink-0 text-muted-foreground">{timeStr}</span>
              <span className="truncate">{b.resource_name}</span>
            </li>
          );
        })}
        {dayBookings.length > 3 && (
          <li className="text-[10px] text-muted-foreground font-medium pl-1">
            +{dayBookings.length - 3} more
          </li>
        )}
      </ul>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            Resource Booking Calendar
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View resource bookings and asset reservations in an interactive timeline calendar.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsBookingModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Book Resource
        </button>
      </div>

      {/* Filter and Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Resource</label>
            <select
              value={selectedResourceFilter}
              onChange={(e) => setSelectedResourceFilter(e.target.value)}
              className="rounded-lg border bg-background px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/20">
              <option value="All">All Resources</option>
              {resources.map((r) => (
                <option key={r.id} value={String(r.id)}>
                  {r.name} ({r.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="rounded-lg border bg-background px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/20">
              <option value="All">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>Confirmed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span>Cancelled</span>
          </div>
        </div>
      </div>

      {/* Calendar & Selected Date Schedule layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar View (3 cols on large screens) */}
        <div className="lg:col-span-3 rounded-xl border bg-card p-4 shadow-sm">
          <Spin spinning={bookingsLoading}>
            <Calendar
              value={selectedDate}
              onSelect={(date) => setSelectedDate(date)}
              cellRender={(current, info) => {
                if (info.type === 'date') return dateCellRender(current);
                return info.originNode;
              }}
            />
          </Spin>
        </div>

        {/* Day Schedule Sidebar (1 col on large screens) */}
        <div className="lg:col-span-1 rounded-xl border bg-card p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-semibold text-base">{selectedDate.format('dddd, MMMM D, YYYY')}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedDayBookings.length === 0
                ? 'No bookings scheduled for this date.'
                : `${selectedDayBookings.length} booking${
                    selectedDayBookings.length > 1 ? 's' : ''
                  } scheduled`}
            </p>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {selectedDayBookings.map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedBooking(b)}
                className="cursor-pointer rounded-lg border bg-background p-3 hover:border-primary/50 hover:shadow-sm transition-all space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-medium text-foreground leading-snug">
                    {b.resource_name || 'Resource'}
                  </h4>
                  {getStatusBadge(b.status)}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {dayjs(b.start_datetime).format('h:mm A')} -{' '}
                    {dayjs(b.end_datetime).format('h:mm A')}
                  </span>
                </div>

                {b.purpose && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    <span className="font-medium text-foreground">Purpose:</span> {b.purpose}
                  </p>
                )}

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 border-t">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{b.username || 'Employee'}</span>
                </div>
              </div>
            ))}

            {selectedDayBookings.length === 0 && (
              <div className="py-12 text-center text-muted-foreground text-xs">
                <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>No bookings for this date.</p>
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(true)}
                  className="mt-3 text-xs text-primary font-medium hover:underline inline-flex items-center gap-1">
                  <Plus className="h-3 w-3" />
                  Book a resource for this day
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <Modal
          title="Booking Details"
          open={Boolean(selectedBooking)}
          onCancel={() => setSelectedBooking(null)}
          footer={[
            selectedBooking.status?.toLowerCase() !== 'cancelled' && (
              <Popconfirm
                key="cancel"
                title="Cancel Booking"
                description="Are you sure you want to cancel this booking?"
                onConfirm={() => handleCancelBooking(selectedBooking.id)}
                okText="Yes, Cancel"
                cancelText="No"
                okButtonProps={{ danger: true }}>
                <button
                  type="button"
                  disabled={isCancelling}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 mr-2">
                  Cancel Booking
                </button>
              </Popconfirm>
            ),
            <button
              key="close"
              type="button"
              onClick={() => setSelectedBooking(null)}
              className="rounded-lg border px-4 py-1.5 text-xs font-medium hover:bg-muted">
              Close
            </button>,
          ]}>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-semibold">
                  {selectedBooking.resource_name || 'Resource'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedBooking.resource_type || 'Asset'}
                </p>
              </div>
              {getStatusBadge(selectedBooking.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-medium text-muted-foreground">Booked By</p>
                <p className="mt-0.5 text-foreground font-semibold">
                  {selectedBooking.username || 'Employee'}
                </p>
                <p className="text-muted-foreground">{selectedBooking.email || '-'}</p>
              </div>

              <div>
                <p className="font-medium text-muted-foreground">Date</p>
                <p className="mt-0.5 text-foreground font-medium">
                  {dayjs(selectedBooking.start_datetime).format('MMMM D, YYYY')}
                </p>
              </div>

              <div>
                <p className="font-medium text-muted-foreground">Time Slot</p>
                <p className="mt-0.5 text-foreground font-medium">
                  {dayjs(selectedBooking.start_datetime).format('h:mm A')} -{' '}
                  {dayjs(selectedBooking.end_datetime).format('h:mm A')}
                </p>
              </div>

              {selectedBooking.resource_location && (
                <div>
                  <p className="font-medium text-muted-foreground">Location</p>
                  <p className="mt-0.5 text-foreground">{selectedBooking.resource_location}</p>
                </div>
              )}
            </div>

            {selectedBooking.purpose && (
              <div className="rounded-lg bg-muted/40 p-3 text-xs">
                <p className="font-medium text-foreground">Purpose</p>
                <p className="mt-1 text-muted-foreground">{selectedBooking.purpose}</p>
              </div>
            )}

            {selectedBooking.notes && (
              <div className="rounded-lg bg-muted/40 p-3 text-xs">
                <p className="font-medium text-foreground">Notes</p>
                <p className="mt-1 text-muted-foreground">{selectedBooking.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Book Resource Modal */}
      <ResourceBookingModal
        open={isBookingModalOpen}
        resource={null}
        resources={resources}
        bookings={bookings}
        onClose={() => setIsBookingModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isSubmitting={isCreating}
      />
    </div>
  );
};

export default ResourceCalendarPage;

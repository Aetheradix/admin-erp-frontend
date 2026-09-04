import { useState } from 'react';
import { Search } from 'lucide-react';

import {
  useGetMyResourceBookingsQuery,
  useCancelResourceBookingMutation,
} from '../../store/api/resourceBookingSlice';

const MyBookingsPage = () => {
  const [search, setSearch] = useState('');

  const {
    data: bookings = [],
    isLoading,
  } = useGetMyResourceBookingsQuery();

  const [cancelBooking, { isLoading: cancelling }] =
    useCancelResourceBookingMutation();

  const filteredBookings = bookings.filter((booking) => {
    const value = search.toLowerCase();

    return (
      booking.resource_name
        ?.toLowerCase()
        .includes(value) ||
      booking.purpose
        ?.toLowerCase()
        .includes(value)
    );
  });

  const handleCancel = async (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this booking?'
    );

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
        <h1 className="text-2xl font-semibold">
          My Bookings
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your resource reservations.
        </p>
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

        {isLoading ? (
          <div className="p-6">
            Loading bookings...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium">
              No bookings found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">

              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Resource
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Purpose
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Date
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Time
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right text-sm font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">

                {filteredBookings.map((booking) => (
                  <tr key={booking.id}>

                    <td className="px-4 py-4">
                      <p className="font-medium">
                        {booking.resource_name}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {booking.resource_type}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {booking.purpose || '-'}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {new Date(
                        booking.start_datetime
                      ).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {new Date(
                        booking.start_datetime
                      ).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' - '}
                      {new Date(
                        booking.end_datetime
                      ).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                        {booking.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right">

                      {booking.status?.toLowerCase() !==
                        'cancelled' && (
                        <button
                          type="button"
                          disabled={cancelling}
                          onClick={() =>
                            handleCancel(booking.id)
                          }
                          className="text-sm font-medium text-red-600 hover:underline"
                        >
                          Cancel
                        </button>
                      )}

                    </td>

                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default MyBookingsPage;

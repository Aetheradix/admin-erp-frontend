import { useGetAllResourceBookingsQuery } from '../../store/api/resourceBookingSlice';

const AllBookingsPage = () => {
  const {
    data: bookings = [],
    isLoading,
  } = useGetAllResourceBookingsQuery();

  return (
    <div className="space-y-6 p-6">

      <div>
        <h1 className="text-2xl font-semibold">
          All Resource Bookings
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage company-wide resource reservations.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border">

        {isLoading ? (
          <div className="p-6">
            Loading bookings...
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Employee
                  </th>

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
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">

                {bookings.map((booking) => (
                  <tr key={booking.id}>

                    <td className="px-4 py-4">
                      <p className="font-medium">
                        {booking.username || '-'}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {booking.email || ''}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      {booking.resource_name}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {booking.purpose || '-'}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {new Date(
                        booking.start_datetime
                      ).toLocaleString()}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs text-green-700">
                        {booking.status}
                      </span>
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

export default AllBookingsPage;

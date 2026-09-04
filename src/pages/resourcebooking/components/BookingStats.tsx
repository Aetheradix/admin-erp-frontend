import {
  CalendarCheck,
  Clock3,
  CircleAlert,
  CheckCircle2,
} from 'lucide-react';

interface BookingStatsProps {
  bookings: any[];
}

const BookingStats = ({
  bookings,
}: BookingStatsProps) => {

  const total = bookings.length;

  const confirmed = bookings.filter(
    (booking) =>
      booking.status?.toLowerCase() === 'confirmed'
  ).length;

  const pending = bookings.filter(
    (booking) =>
      booking.status?.toLowerCase() === 'pending'
  ).length;

  const cancelled = bookings.filter(
    (booking) =>
      booking.status?.toLowerCase() === 'cancelled'
  ).length;

  const stats = [
    {
      label: 'My Bookings',
      value: total,
      icon: CalendarCheck,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Confirmed',
      value: confirmed,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Pending',
      value: pending,
      icon: Clock3,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Cancelled',
      value: cancelled,
      icon: CircleAlert,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-xl border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {stat.label}
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {stat.value}
                </p>
              </div>

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}
              >
                <Icon
                  className={`h-5 w-5 ${stat.color}`}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BookingStats;

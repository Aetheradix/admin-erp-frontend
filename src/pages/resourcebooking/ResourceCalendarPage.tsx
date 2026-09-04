import { CalendarDays } from 'lucide-react';

const ResourceCalendarPage = () => {
  return (
    <div className="space-y-6 p-6">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-semibold">
            Company Calendar
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            View resource bookings, meetings, training and
            company events in one calendar.
          </p>
        </div>

      </div>

      <div className="rounded-xl border bg-card p-6">

        <div className="flex items-center justify-center py-20 text-center">

          <div>
            <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground" />

            <h2 className="mt-4 text-lg font-semibold">
              Central Calendar
            </h2>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Resource bookings will appear here alongside
              meetings, training sessions and company events.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ResourceCalendarPage;

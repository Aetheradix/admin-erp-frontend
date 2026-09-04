import { useState } from 'react';
import { Plus, Search } from 'lucide-react';

import ResourceCard from './components/ResourceCard';
import ResourceBookingSheet from './components/ResourceBookingSheet';
import BookingStats from './components/BookingStats';

import {
  useGetMyResourceBookingsQuery,
  useGetAllResourceBookingsQuery,
} from '../../store/api/resourceBookingSlice';

import type { Resource } from './types/index.types';

const ResourceBookingPage = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [search, setSearch] = useState('');

  const {
    data: myBookings = [],
    isLoading: myBookingsLoading,
  } = useGetMyResourceBookingsQuery();

  // Prefixed with underscore to suppress TS6133 unused variable warning
  const {
    data: _allBookings = [],
  } = useGetAllResourceBookingsQuery();

  const resources: Resource[] = [
    {
      id: 1,
      name: 'Conference Room A',
      type: 'Room',
      location: '2nd Floor',
      capacity: 10,
      description: 'Large meeting room with display and whiteboard.',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Projector 01',
      type: 'Equipment',
      location: 'IT Department',
      capacity: null,
      description: 'HD projector for presentations and meetings.',
      status: 'Active',
    },
    {
      id: 3,
      name: 'Company Car 01',
      type: 'Vehicle',
      location: 'Parking Area',
      capacity: 5,
      description: 'Company sedan for official business travel.',
      status: 'Active',
    },
  ];

  const openBooking = (resource: Resource | null = null) => {
    setSelectedResource(resource);
    setBookingOpen(true);
  };

  const closeBooking = () => {
    setBookingOpen(false);
    setSelectedResource(null);
  };

  const filteredResources = resources.filter((resource) =>
    resource.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Resource Booking
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Book conference rooms, equipment, vehicles and other
            company resources.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openBooking()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Book Resource
        </button>
      </div>

      {/* Statistics */}
      <BookingStats bookings={myBookings} />

      {/* Resource Section */}
      <div className="space-y-4">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Available Resources
            </h2>

            <p className="text-sm text-muted-foreground">
              Select a resource to create a booking.
            </p>
          </div>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="text"
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onBook={() => openBooking(resource)}
            />
          ))}
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              My Upcoming Bookings
            </h2>

            <p className="text-sm text-muted-foreground">
              Your upcoming resource reservations.
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card">
          {myBookingsLoading ? (
            <div className="p-6 text-sm text-muted-foreground">
              Loading bookings...
            </div>
          ) : myBookings.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium">
                No upcoming bookings
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Book a resource to see it here.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {myBookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <p className="font-medium">
                      {booking.resource_name}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {booking.purpose || 'Resource booking'}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(
                        booking.start_datetime
                      ).toLocaleDateString()}
                    </p>

                    <p className="text-xs text-muted-foreground">
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
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Sheet */}
      <ResourceBookingSheet
        open={bookingOpen}
        resource={selectedResource}
        resources={resources}
        onClose={closeBooking}
      />
    </div>
  );
};

export default ResourceBookingPage;
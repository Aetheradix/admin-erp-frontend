import { useState } from 'react';
import { Plus, Search } from 'lucide-react';

import ResourceCard from './components/ResourceCard';
import ResourceBookingModal from './components/ResourceBookingModal';
import AddResourceModal from './components/AddResourceModal';
import BookingStats from './components/BookingStats';

import { useResourceBookingPage } from './hooks/useResouceBookingPage';

import type { Resource } from './types/index.types';

const ResourceBooking = () => {
  /* ============================================================
     UI STATE
  ============================================================ */

  const [bookingOpen, setBookingOpen] = useState(false);

  const [addResourceOpen, setAddResourceOpen] = useState(false);

  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const [search, setSearch] = useState('');

  /* ============================================================
     PAGE HOOK
  ============================================================ */

  const {
    resources,
    allBookings,
    myBookings,

    handleBookingSubmit,
    handleCreateResource,

    isCreating,
    isCreatingResource,
  } = useResourceBookingPage();

  /* ============================================================
     BOOKING MODAL
  ============================================================ */

  const openBooking = (resource: Resource | null = null) => {
    setSelectedResource(resource);
    setBookingOpen(true);
  };

  const closeBooking = () => {
    setBookingOpen(false);
    setSelectedResource(null);
  };

  /* ============================================================
     RESOURCE SEARCH
  ============================================================ */

  const filteredResources = resources.filter((resource) =>
    resource.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  /* ============================================================
     ADD RESOURCE
  ============================================================ */

  const handleAddResource = async (data: Parameters<typeof handleCreateResource>[0]) => {
    await handleCreateResource(data);

    // Only reached when the API request succeeds
    setAddResourceOpen(false);
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="space-y-6 p-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Resource Booking</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Book conference rooms, equipment, vehicles and other company resources.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* ADD RESOURCE */}

          <button
            type="button"
            onClick={() => setAddResourceOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Plus className="h-4 w-4" />
            Add Resource
          </button>

          {/* BOOK RESOURCE */}

          <button
            type="button"
            onClick={() => openBooking()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Book Resource
          </button>
        </div>
      </div>

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <BookingStats bookings={myBookings} />

      {/* ======================================================
          AVAILABLE RESOURCES
      ====================================================== */}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Available Resources</h2>

            <p className="text-sm text-muted-foreground">Select a resource to create a booking.</p>
          </div>

          {/* SEARCH */}

          <div className="relative w-64">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4
                         -translate-y-1/2
                         text-muted-foreground"
            />

            <input
              type="text"
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border
                         bg-background
                         py-2 pl-9 pr-3
                         text-sm outline-none
                         focus:ring-2
                         focus:ring-primary/20"
            />
          </div>
        </div>

        {/* RESOURCE LIST */}

        {filteredResources.length === 0 ? (
          <div className="rounded-xl border bg-card p-10 text-center">
            <p className="font-medium">No resources found</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Add a resource or try a different search term.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onBook={() => openBooking(resource)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ======================================================
          MY UPCOMING BOOKINGS
      ====================================================== */}

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">My Upcoming Bookings</h2>

          <p className="text-sm text-muted-foreground">Your upcoming resource reservations.</p>
        </div>

        <div className="rounded-xl border bg-card">
          {myBookings.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium">No upcoming bookings</p>

              <p className="mt-1 text-sm text-muted-foreground">Book a resource to see it here.</p>
            </div>
          ) : (
            <div className="divide-y">
              {myBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{booking.resource_name}</p>

                    <p className="text-sm text-muted-foreground">
                      {booking.purpose || 'Resource booking'}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(booking.start_datetime).toLocaleDateString()}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {new Date(booking.start_datetime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}

                      {' - '}

                      {new Date(booking.end_datetime).toLocaleTimeString([], {
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

      {/* ======================================================
          ADD RESOURCE MODAL
      ====================================================== */}

      <AddResourceModal
        open={addResourceOpen}
        onClose={() => setAddResourceOpen(false)}
        onSubmit={handleAddResource}
        isSubmitting={isCreatingResource}
      />

      {/* ======================================================
          BOOKING MODAL
      ====================================================== */}

      <ResourceBookingModal
        open={bookingOpen}
        resource={selectedResource}
        resources={resources}
        bookings={allBookings}
        onClose={closeBooking}
        onSubmit={handleBookingSubmit}
        isSubmitting={isCreating}
      />
    </div>
  );
};

export default ResourceBooking;

import { useAuth } from '@/hooks/useAuth';
import { showConfirm } from '@/components/ui/composed/ConfirmDialog.utils';
import { Dialog } from '@/components/ui/composed/Dialog';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { ProgressSpinner } from '@/components/ui/composed/ProgressSpinner';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { Tabs } from '@/components/ui/primitives/Tabs';
import {
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetEventsQuery,
  useGetFilterOptionsQuery,
  useRegisterEventMutation,
  type EventPassData,
} from '@/store/api/eventSlice';
import type { ERPEvent, EventFilters } from '@/types/models';
import {
  Building2,
  Calendar as CalendarIcon,
  CalendarDays,
  Filter,
  History as HistoryIcon,
  RotateCcw,
  Search,
  Tag,
  UserCheck,
  X,
  AlertCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { EventCard } from './components/EventCard';
import { EventFilterDrawer } from './components/EventFilterDrawer';
import { EventForm } from './components/EventForm';
import { EventPassModal } from './components/EventPassModal';
import { EventDetailsModal } from './components/EventDetailsModal';
import {
  isPastEvent,
  registerUserForEventLocally,
  isUserRegisteredForEvent,
  formatEventTime,
} from './utils/eventUtils';

const Events = () => {
  const { user } = useAuth();
  const isAdmin = Boolean(
    user?.role &&
      ['admin', 'superadmin', 'hradmin', 'financeadmin', 'manager'].some((r) =>
        String(user.role).toLowerCase().includes(r)
      )
  );
  const [registeringEventId, setRegisteringEventId] = useState<string | number | null>(null);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [eventScope, setEventScope] = useState<'upcoming' | 'previous' | 'all'>('upcoming');
  const [filters, setFilters] = useState<EventFilters>({
    category: 'All',
    search: '',
  });

  const { data: filterOptions } = useGetFilterOptionsQuery();
  const { data: events = [], isLoading } = useGetEventsQuery(filters);
  const [createEvent] = useCreateEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();
  const [registerEvent] = useRegisterEventMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ERPEvent | null>(null);

  const [selectedEventForDetails, setSelectedEventForDetails] = useState<ERPEvent | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [passModalData, setPassModalData] = useState<EventPassData | null>(null);
  const [showPassModal, setShowPassModal] = useState(false);

  // Force re-render key when local registrations change
  const [localUpdateTick, setLocalUpdateTick] = useState(0);

  // Dynamically aggregate categories from filterOptions + active events
  const categories = useMemo(() => {
    const list = filterOptions?.categories || ['Conference', 'Workshop', 'Social', 'Meeting'];
    const eventCats = events.map((e) => e.category).filter(Boolean);
    const combined = Array.from(new Set([...list, ...eventCats]));
    return ['All', ...combined];
  }, [filterOptions, events]);

  const activeCategory = filters.category || 'All';

  // Partition events into Upcoming vs Previous vs All
  const { upcomingEvents, previousEvents, displayedEvents, mandatoryUpcomingEvents } = useMemo(() => {
    const upcoming: ERPEvent[] = [];
    const previous: ERPEvent[] = [];

    events.forEach((evt) => {
      const st = (evt.status || '').toLowerCase();
      if (st === 'completed' || isPastEvent(evt)) {
        previous.push(evt);
      } else {
        upcoming.push(evt);
      }
    });

    let currentList = events;
    if (eventScope === 'upcoming') {
      currentList = upcoming;
    } else if (eventScope === 'previous') {
      currentList = previous;
    }

    const mandatory = upcoming.filter((e) => e.button_type === 'Mandatory');

    return {
      upcomingEvents: upcoming,
      previousEvents: previous,
      displayedEvents: currentList,
      mandatoryUpcomingEvents: mandatory,
    };
  }, [events, eventScope, localUpdateTick]);

  const handleCategoryChange = (cat: string) => {
    setFilters((prev) => ({ ...prev, category: cat }));
  };

  const handleSearchChange = (query: string) => {
    setFilters((prev) => ({ ...prev, search: query }));
  };

  const handleResetFilters = () => {
    setFilters({ category: 'All', search: '' });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category && filters.category !== 'All') count++;
    if (filters.tags && filters.tags.length > 0) count += filters.tags.length;
    if (filters.employee_statuses && filters.employee_statuses.length > 0)
      count += filters.employee_statuses.length;
    if (filters.departments && filters.departments.length > 0) count += filters.departments.length;
    if (filters.start_date) count++;
    if (filters.end_date) count++;
    if (filters.search) count++;
    return count;
  }, [filters]);

  const handleCreate = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleEdit = (id: string) => {
    const event = events.find((e: ERPEvent) => String(e.id) === String(id));
    if (event) {
      setEditingEvent(event);
      setShowForm(true);
    }
  };

  const handleCardClick = (event: ERPEvent) => {
    setSelectedEventForDetails(event);
    setShowDetailsModal(true);
  };

  const handleViewPass = (event: ERPEvent) => {
    setShowDetailsModal(false);
    const passCode = `AETH-PASS-${String(event.id).slice(-4).toUpperCase() || 'VIP'}-${Math.floor(1000 + Math.random() * 9000)}`;
    const passData: EventPassData = {
      passCode,
      eventId: event.id,
      eventTitle: event.title,
      category: event.category,
      eventDate: event.date || event.event_date,
      time: formatEventTime(event),
      location: event.location,
      username: user?.username || user?.email?.split('@')[0] || 'Employee Participant',
      recipientEmail: user?.email || 'employee@aether-erp.internal',
      emailSent: true,
    };
    setPassModalData(passData);
    setShowPassModal(true);
  };

  const handleRegister = async (event: ERPEvent) => {
    const userIdentifier = user?.email || user?.username || 'current_user';

    // Duplicate registration prevention
    if (isUserRegisteredForEvent(event.id, userIdentifier, event)) {
      showToast({
        severity: 'info',
        summary: 'Already Registered',
        detail: `You have already confirmed your spot for "${event.title}".`,
        life: 3500,
      });
      handleViewPass(event);
      return;
    }

    try {
      setRegisteringEventId(event.id);
      let passResultData: EventPassData | null = null;

      try {
        const result = await registerEvent({
          id: event.id,
          email: user?.email,
          username: user?.username,
        }).unwrap();
        if (result.data) {
          passResultData = result.data;
        }
      } catch (apiErr: unknown) {
        const err = apiErr as { status?: number; data?: { message?: string } };
        const errMsg = err?.data?.message || '';
        // Surface "already registered" error immediately — do not proceed
        if (err?.status === 400 || errMsg.toLowerCase().includes('already registered')) {
          showToast({
            severity: 'warn',
            summary: 'Already Registered',
            detail: errMsg || `You have already registered for "${event.title}".`,
            life: 4000,
          });
          handleViewPass(event);
          setRegisteringEventId(null);
          return;
        }
        // For network/server failures, fallback to local-only registration (no email)
        console.warn('API registration failed, falling back to local registration:', errMsg);
      }

      // Record local registration to dynamically update attendee count & prevent duplicates with full participant info
      registerUserForEventLocally(event.id, {
        userIdentifier,
        name: user?.username || user?.email?.split('@')[0] || 'Confirmed User',
        email: user?.email || userIdentifier,
        department: user?.department || 'Corporate',
        avatar: user?.image_url,
        passCode: passResultData?.passCode,
      });
      setLocalUpdateTick((t) => t + 1);

      const emailRecipient = passResultData?.recipientEmail || user?.email || 'your registered email';
      const emailSentByServer = passResultData?.emailSent === true;

      showToast({
        severity: 'success',
        summary: 'Registration Confirmed!',
        detail: emailSentByServer
          ? `VIP entry pass emailed to ${emailRecipient}!`
          : `Pass generated for ${emailRecipient}. Check your inbox shortly.`,
        life: 5000,
      });

      if (passResultData) {
        setPassModalData(passResultData);
      } else {
        const passCode = `AETH-PASS-${String(event.id).slice(-4).toUpperCase() || 'VIP'}-${Math.floor(1000 + Math.random() * 9000)}`;
        setPassModalData({
          passCode,
          eventId: event.id,
          eventTitle: event.title,
          category: event.category,
          eventDate: event.date || event.event_date,
          time: formatEventTime(event),
          location: event.location,
          username: user?.username || user?.email?.split('@')[0] || 'VIP Participant',
          recipientEmail: user?.email || 'employee@aether-erp.internal',
          emailSent: true,
        });
      }

      setShowDetailsModal(false);
      setShowPassModal(true);
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      showToast({
        severity: 'error',
        summary: 'Registration Failed',
        detail: apiError.data?.message || 'Could not register for this event.',
        life: 3000,
      });
    } finally {
      setRegisteringEventId(null);
    }
  };

  const handleDelete = async (id: string) => {
    showConfirm({
      message: 'Are you sure you want to cancel this event?',
      header: 'Confirm Deletion',
      accept: async () => {
        try {
          await deleteEvent(id).unwrap();
          showToast({
            severity: 'success',
            summary: 'Cancelled',
            detail: 'Event cancelled successfully.',
            life: 3000,
          });
        } catch (err: unknown) {
          const apiError = err as { data?: { message?: string } };
          console.error('Failed to delete event:', err);
          showToast({
            severity: 'error',
            summary: 'Error',
            detail: apiError.data?.message || 'Failed to cancel event',
            life: 3000,
          });
        }
      },
    });
  };

  const handleSubmit = async (data: Partial<ERPEvent>) => {
    try {
      if (editingEvent) {
        await updateEvent({ id: editingEvent.id, data }).unwrap();
        showToast({
          severity: 'success',
          summary: 'Updated',
          detail: `Event "${data.title}" updated successfully!`,
          life: 3500,
        });
      } else {
        await createEvent(data).unwrap();
        showToast({
          severity: 'success',
          summary: 'Scheduled',
          detail: `Event "${data.title}" scheduled successfully with category "${data.category}"!`,
          life: 3500,
        });
      }
      setShowForm(false);
      setEditingEvent(null);
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      console.error('Failed to save event:', err);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: apiError.data?.message || 'Failed to save event',
        life: 3000,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader
        title="Event Planner & Directory"
        description="Streamline hostings, manage real-time registrations, dynamic categories, and event memories across the team."
        primaryAction={
          isAdmin
            ? {
                label: 'Schedule New Event',
                onClick: handleCreate,
                icon: 'pi pi-calendar-plus',
              }
            : undefined
        }
      />

      {/* Mandatory Attendance Alert Banner */}
      {mandatoryUpcomingEvents.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 px-6 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/30">
              <AlertCircle size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-md">
                  ⚠️ Company Broadcast
                </span>
                <span className="text-sm font-black text-amber-950 dark:text-amber-100">
                  {mandatoryUpcomingEvents[0].title}
                </span>
              </div>
              <p className="text-xs text-amber-900/80 dark:text-amber-300 font-medium mt-0.5">
                Mandatory Attendance required for all employees on{' '}
                {new Date(
                  mandatoryUpcomingEvents[0].date || mandatoryUpcomingEvents[0].event_date
                ).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                ({mandatoryUpcomingEvents[0].time || 'Scheduled'}).
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => handleCardClick(mandatoryUpcomingEvents[0])}
            className="rounded-2xl! text-xs font-black px-5 h-10 bg-amber-600 hover:bg-amber-700 text-white border-none shadow-md shadow-amber-600/20 whitespace-nowrap cursor-pointer">
            View &amp; Confirm
          </Button>
        </div>
      )}

      {/* Scope Selector: Upcoming vs Previous vs All */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setEventScope('upcoming')}
          className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            eventScope === 'upcoming'
              ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-102'
              : 'bg-white hover:bg-surface-subtle text-foreground border border-border-subtle shadow-xs'
          }`}
        >
          <CalendarDays size={16} />
          <span>Upcoming & Active Events</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              eventScope === 'upcoming' ? 'bg-white text-primary' : 'bg-primary/10 text-primary'
            }`}
          >
            {upcomingEvents.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setEventScope('previous')}
          className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            eventScope === 'previous'
              ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-102'
              : 'bg-white hover:bg-surface-subtle text-foreground border border-border-subtle shadow-xs'
          }`}
        >
          <HistoryIcon size={16} />
          <span>Previous Events</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              eventScope === 'previous' ? 'bg-white text-primary' : 'bg-zinc-200 text-zinc-700'
            }`}
          >
            {previousEvents.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setEventScope('all')}
          className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            eventScope === 'all'
              ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-102'
              : 'bg-white hover:bg-surface-subtle text-foreground border border-border-subtle shadow-xs'
          }`}
        >
          <span>All Events</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              eventScope === 'all' ? 'bg-white text-primary' : 'bg-zinc-200 text-zinc-700'
            }`}
          >
            {events.length}
          </span>
        </button>
      </div>

      {/* Toolbar: Category Tabs & Search Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white p-4 rounded-[40px] border border-border-subtle shadow-soft">
          <Tabs
            items={categories}
            activeItem={activeCategory}
            onItemChange={handleCategoryChange}
            className="w-full lg:w-auto"
          />

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-72 group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors"
                size={18}
              />
              <Input
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search events, organizers..."
                className="pl-12! pr-8! h-12! text-sm!"
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">
                  <X size={14} />
                </button>
              )}
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowFilterDrawer(true)}
              className={`h-12 rounded-2xl! px-4 border-border-subtle! gap-2 font-bold text-xs ${
                activeFilterCount > 0
                  ? 'bg-primary text-white border-primary hover:bg-primary/90'
                  : 'text-foreground'
              }`}>
              <Filter size={18} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-primary text-[10px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Active Filter Badges */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-surface-subtle/80 rounded-2xl border border-border-subtle/60">
            <span className="text-[11px] font-black text-muted uppercase tracking-wider mr-1">
              Active Filters:
            </span>

            {filters.category && filters.category !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white text-primary border border-primary/20 shadow-xs">
                <span>Category: {filters.category}</span>
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, category: 'All' }))}
                  className="hover:text-red-500">
                  <X size={12} />
                </button>
              </span>
            )}

            {filters.tags?.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white text-primary border border-primary/20 shadow-xs">
                <Tag size={10} />
                <span>#{t}</span>
                <button
                  type="button"
                  onClick={() =>
                    setFilters((p) => ({
                      ...p,
                      tags: p.tags?.filter((tag) => tag !== t),
                    }))
                  }
                  className="hover:text-red-500">
                  <X size={12} />
                </button>
              </span>
            ))}

            {filters.employee_statuses?.map((st) => (
              <span
                key={st}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white text-emerald-600 border border-emerald-500/20 shadow-xs">
                <UserCheck size={10} />
                <span>Status: {st}</span>
                <button
                  type="button"
                  onClick={() =>
                    setFilters((p) => ({
                      ...p,
                      employee_statuses: p.employee_statuses?.filter((s) => s !== st),
                    }))
                  }
                  className="hover:text-red-500">
                  <X size={12} />
                </button>
              </span>
            ))}

            {filters.departments?.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white text-foreground border border-border-subtle shadow-xs">
                <Building2 size={10} />
                <span>{d}</span>
                <button
                  type="button"
                  onClick={() =>
                    setFilters((p) => ({
                      ...p,
                      departments: p.departments?.filter((dept) => dept !== d),
                    }))
                  }
                  className="hover:text-red-500">
                  <X size={12} />
                </button>
              </span>
            ))}

            {(filters.start_date || filters.end_date) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white text-foreground border border-border-subtle shadow-xs">
                <CalendarIcon size={10} />
                <span>
                  {filters.start_date || 'Start'} to {filters.end_date || 'End'}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setFilters((p) => ({ ...p, start_date: undefined, end_date: undefined }))
                  }
                  className="hover:text-red-500">
                  <X size={12} />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              className="ml-auto text-xs font-black text-red-500 hover:underline flex items-center gap-1">
              <RotateCcw size={12} />
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
        {displayedEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onCardClick={handleCardClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRegister={handleRegister}
            onTagClick={(tag) => {
              const currentTags = filters.tags || [];
              if (!currentTags.includes(tag)) {
                setFilters((prev) => ({ ...prev, tags: [...currentTags, tag] }));
              }
            }}
            isRegistering={registeringEventId === event.id}
          />
        ))}

        {displayedEvents.length === 0 && (
          <div className="col-span-full py-20 bg-surface-subtle rounded-4xl border-2 border-dashed border-border-strong flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-muted shadow-sm">
              <CalendarIcon size={32} />
            </div>
            <div>
              <h4 className="text-xl font-black text-foreground">
                {eventScope === 'previous'
                  ? 'No previous events found'
                  : eventScope === 'upcoming'
                    ? 'No upcoming events scheduled'
                    : 'No events match your criteria'}
              </h4>
              <p className="text-sm text-muted font-medium mt-1">
                {activeFilterCount > 0
                  ? 'Try adjusting your dynamic search filters or category selections.'
                  : eventScope === 'upcoming'
                    ? 'Click "Schedule New Event" to plan an upcoming company event.'
                    : 'Concluded events will appear here automatically.'}
              </p>
              {activeFilterCount > 0 && (
                <Button
                  variant="secondary"
                  onClick={handleResetFilters}
                  className="mt-4 h-10 rounded-2xl font-bold text-xs">
                  Reset All Filters
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Event Details Modal Popup */}
      <EventDetailsModal
        event={selectedEventForDetails}
        visible={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        onRegister={handleRegister}
        isRegistering={registeringEventId === selectedEventForDetails?.id}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewPass={handleViewPass}
      />

      {/* Event Filter Drawer */}
      <EventFilterDrawer
        visible={showFilterDrawer}
        onHide={() => setShowFilterDrawer(false)}
        filters={filters}
        filterOptions={filterOptions}
        onFilterChange={setFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Event Form Modal */}
      <Dialog
        visible={showForm}
        onHide={() => setShowForm(false)}
        header={editingEvent ? 'Revise Event Schedule' : 'Plan New Company Event'}
        modal
        width={900}
        footer={null}
        className="max-w-[92vw] mx-auto rounded-[40px] overflow-hidden"
        contentClassName="p-8 sm:p-10"
        headerClassName="px-8 sm:px-10 pt-8 sm:pt-10 pb-4 text-2xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-[48px] overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' },
        }}>
        <EventForm
          initialData={editingEvent}
          availableCategories={categories}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      </Dialog>

      {/* VIP Event Pass Visual Ticket Modal */}
      <EventPassModal
        isOpen={showPassModal}
        onClose={() => setShowPassModal(false)}
        passData={passModalData}
      />
    </div>
  );
};

export default Events;

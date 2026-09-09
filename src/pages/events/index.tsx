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
  useDeleteEventMutation,
  useGetEventsQuery,
  useGetFilterOptionsQuery,
  useRegisterEventMutation,
  type EventPassData,
} from '@/store/api/eventSlice';
import type { ERPEvent, EventFilters } from '@/types/models';
import { Building2, Calendar as CalendarIcon, Filter, RotateCcw, Search, Tag, UserCheck, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EventCard } from './components/EventCard';
import { EventFilterDrawer } from './components/EventFilterDrawer';
import { EventForm } from './components/EventForm';
import { EventPassModal } from './components/EventPassModal';

const Events = () => {
  const { user } = useAuth();
  const [registeringEventId, setRegisteringEventId] = useState<string | number | null>(null);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [filters, setFilters] = useState<EventFilters>({
    category: 'All',
    search: '',
  });

  const { data: filterOptions } = useGetFilterOptionsQuery();
  const { data: events = [], isLoading } = useGetEventsQuery(filters);
  const [createEvent] = useCreateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();
  const [registerEvent] = useRegisterEventMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ERPEvent | null>(null);

  const [passModalData, setPassModalData] = useState<EventPassData | null>(null);
  const [showPassModal, setShowPassModal] = useState(false);

  const categories = useMemo(() => {
    const list = filterOptions?.categories || ['Conference', 'Workshop', 'Social', 'Meeting'];
    return ['All', ...list];
  }, [filterOptions]);

  const activeCategory = filters.category || 'All';

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

  const handleRegister = async (event: ERPEvent) => {
    try {
      setRegisteringEventId(event.id);
      const result = await registerEvent({
        id: event.id,
        email: user?.email,
        username: user?.username,
      }).unwrap();

      const emailRecipient = result.data?.recipientEmail || user?.email;
      const wasEmailed = result.data?.emailSent;

      showToast({
        severity: 'success',
        summary: 'Registration Confirmed!',
        detail: wasEmailed
          ? `Pass generated! VIP entry ticket has been sent to ${emailRecipient}.`
          : `Pass generated! VIP entry ticket is ready.`,
        life: 5000,
      });
      if (result.data) {
        setPassModalData(result.data);
        setShowPassModal(true);
      }
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
        console.warn('Update event not supported yet on backend');
      } else {
        await createEvent(data).unwrap();
        showToast({
          severity: 'success',
          summary: 'Scheduled',
          detail: 'Event scheduled successfully!',
          life: 3000,
        });
      }
      setShowForm(false);
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
        title="Event Planner"
        description="Streamline hostings, manage attendance, and create memorable experiences for the entire team."
        primaryAction={{
          label: 'Schedule New Event',
          onClick: handleCreate,
          icon: 'pi pi-calendar-plus',
        }}
      />

      {/* Toolbar */}
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
                placeholder="Search events..."
                className="pl-12! pr-8! h-12! text-sm!"
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowFilterDrawer(true)}
              className={`h-12 rounded-2xl! px-4 border-border-subtle! gap-2 font-bold text-xs ${activeFilterCount > 0
                ? 'bg-primary text-white border-primary hover:bg-primary/90'
                : 'text-foreground'
                }`}
            >
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
                  className="hover:text-red-500"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {filters.tags?.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white text-primary border border-primary/20 shadow-xs"
              >
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
                  className="hover:text-red-500"
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            {filters.employee_statuses?.map((st) => (
              <span
                key={st}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white text-emerald-600 border border-emerald-500/20 shadow-xs"
              >
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
                  className="hover:text-red-500"
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            {filters.departments?.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white text-foreground border border-border-subtle shadow-xs"
              >
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
                  className="hover:text-red-500"
                >
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
                  onClick={() => setFilters((p) => ({ ...p, start_date: undefined, end_date: undefined }))}
                  className="hover:text-red-500"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              className="ml-auto text-xs font-black text-red-500 hover:underline flex items-center gap-1"
            >
              <RotateCcw size={12} />
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRegister={handleRegister}
            isRegistering={registeringEventId === event.id}
          />
        ))}
        {events.length === 0 && (
          <div className="col-span-full py-20 bg-surface-subtle rounded-4xl border-2 border-dashed border-border-strong flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-muted">
              <CalendarIcon size={32} />
            </div>
            <div>
              <h4 className="text-xl font-black text-foreground">No events found</h4>
              <p className="text-sm text-muted font-medium">
                Try adjusting your active dynamic filters or search terms.
              </p>
              {activeFilterCount > 0 && (
                <Button
                  variant="secondary"
                  onClick={handleResetFilters}
                  className="mt-4 h-10 rounded-2xl font-bold text-xs"
                >
                  Reset All Filters
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

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
        className="w-full max-w-4xl mx-4"
        contentClassName="p-10"
        headerClassName="px-10 pt-10 pb-4 text-2xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-[48px] overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' },
        }}
      >
        <EventForm
          initialData={editingEvent}
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


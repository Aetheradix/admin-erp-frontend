import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { Calendar as CalendarIcon, Filter, Search } from 'lucide-react';
import { Dialog } from '@/components/ui/composed/Dialog';
import { showConfirm } from '@/components/ui/composed/ConfirmDialog';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { useState } from 'react';
import { EventCard } from './components/EventCard';
import { EventForm } from './components/EventForm';
import { useGetEventsQuery, useCreateEventMutation, useDeleteEventMutation } from '@/store/api/eventApiSlice';
import { ProgressSpinner } from '@/components/ui/composed/ProgressSpinner';
import type { ERPEvent } from './hooks/mockEvents';
import { Tabs } from '@/components/ui/primitives/Tabs';

const Events = () => {
  const { data: events = [], isLoading } = useGetEventsQuery();
  const [createEvent] = useCreateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ERPEvent | null>(null);

  const categories = ['All', 'Conference', 'Workshop', 'Social', 'Meeting'];

  const filteredEvents = events.filter((event: ERPEvent) => {
    const matchesCategory = activeCategory === 'All' || event.category === activeCategory;
    const title = event.title || '';
    const description = event.description || '';
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

  const handleDelete = async (id: string) => {
    showConfirm({
      message: 'Are you sure you want to cancel this event?',
      header: 'Confirm Deletion',
      accept: async () => {
        try {
          await deleteEvent(id).unwrap();
          showToast({ severity: 'success', summary: 'Cancelled', detail: 'Event cancelled successfully.', life: 3000 });
        } catch (err: any) {
          console.error('Failed to delete event:', err);
          showToast({ severity: 'error', summary: 'Error', detail: err.data?.message || 'Failed to cancel event', life: 3000 });
        }
      }
    });
  };

  const handleSubmit = async (data: Partial<ERPEvent>) => {
    try {
      if (editingEvent) {
        console.warn('Update event not supported yet on backend');
      } else {
        await createEvent(data).unwrap();
        showToast({ severity: 'success', summary: 'Scheduled', detail: 'Event scheduled successfully!', life: 3000 });
      }
      setShowForm(false);
    } catch (err: any) {
      console.error('Failed to save event:', err);
      showToast({ severity: 'error', summary: 'Error', detail: err.data?.message || 'Failed to save event', life: 3000 });
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
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white p-4 rounded-[40px] border border-border-subtle shadow-soft">
        <Tabs
          items={categories}
          activeItem={activeCategory}
          onItemChange={setActiveCategory}
          className="w-full lg:w-auto"
        />

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="pl-12! h-12! text-sm!"
            />
          </div>
          <Button variant="secondary" className="h-12 w-12! rounded-2xl! border-border-subtle! p-0!">
            <Filter size={18} className="text-muted" />
          </Button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        {filteredEvents.length === 0 && (
          <div className="col-span-full py-20 bg-surface-subtle rounded-4xl border-2 border-dashed border-border-strong flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-muted">
              <CalendarIcon size={32} />
            </div>
            <div>
              <h4 className="text-xl font-black text-foreground">No events found</h4>
              <p className="text-sm text-muted font-medium">Try adjusting your filters or search keywords.</p>
            </div>
          </div>
        )}
      </div>

      {/* Event Form Modal */}
      <Dialog
        visible={showForm}
        onHide={() => setShowForm(false)}
        header={editingEvent ? "Revise Event Schedule" : "Plan New Company Event"}
        modal
        className="w-full max-w-4xl mx-4"
        contentClassName="p-10"
        headerClassName="px-10 pt-10 pb-4 text-2xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-[48px] overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' }
        }}
      >
        <EventForm
          initialData={editingEvent}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      </Dialog>
    </div>
  );
};

export default Events;

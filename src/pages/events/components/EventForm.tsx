import { FormField } from '@/components/ui/composed/FormField';
import { Button } from '@/components/ui/primitives/Button';
import { Calendar } from '@/components/ui/primitives/Calendar';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { useEffect, useState } from 'react';
import type { ERPEvent } from '@/types/models';

interface EventFormProps {
  initialData?: ERPEvent | null;
  onSubmit: (data: Partial<ERPEvent>) => void;
  onCancel: () => void;
}

export const EventForm = ({ initialData, onSubmit, onCancel }: EventFormProps) => {
  const [formData, setFormData] = useState<Partial<ERPEvent>>({
    title: '',
    description: '',
    category: 'Workshop',
    date: '',
    time: '10:00 AM - 1:00 PM',
    location: '',
    organizer: '',
    attendees: 0,
    image:
      'https://images.unsplash.com/photo-1540575861501-7ce058a877c3?q=80&w=2070&auto=format&fit=crop',
  });

  useEffect(() => {
    if (initialData) {
      queueMicrotask(() => {
        setFormData(initialData);
      });
    }
  }, [initialData]);

  const categories = [
    { label: 'Conference', value: 'Conference' },
    { label: 'Workshop', value: 'Workshop' },
    { label: 'Social', value: 'Social' },
    { label: 'Meeting', value: 'Meeting' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <FormField label="Event Title" required id="event-title">
            <Input
              id="event-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Annual Tech Summit"
            />
          </FormField>

          <FormField label="Description" id="event-description">
            <Textarea
              id="event-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell us what this event is about..."
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category" id="event-category">
              <Select
                id="event-category"
                options={categories}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.value })}
              />
            </FormField>
            <FormField label="Attendees" id="event-attendees">
              <Input
                id="event-attendees"
                type="number"
                value={formData.attendees?.toString() || ''}
                onChange={(e) =>
                  setFormData({ ...formData, attendees: parseInt(e.target.value) || 0 })
                }
              />
            </FormField>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <FormField label="Date" required id="event-date">
            <Calendar
              id="event-date"
              value={formData.date ? new Date(formData.date) : null}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  date:
                    e.value?.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    }) || '',
                })
              }
              placeholder="Select date"
              dateFormat="MM d, yy"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Time" id="event-time">
              <Input
                id="event-time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="10:00 AM - 1:00 PM"
              />
            </FormField>
            <FormField label="Location" id="event-location">
              <Input
                id="event-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Executive Suite"
              />
            </FormField>
          </div>

          <FormField label="Organizer" id="event-organizer">
            <Input
              id="event-organizer"
              value={formData.organizer}
              onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
              placeholder="Department or Team name"
            />
          </FormField>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border-subtle">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="px-8! rounded-3xl! font-bold text-muted!"
          aria-label="Discard event details"
        >
          Discard
        </Button>
        <Button
          variant="primary"
          onClick={() => onSubmit(formData)}
          className="px-10! h-12 rounded-3xl! font-black tracking-wide shadow-lg shadow-primary/20"
          aria-label={initialData ? 'Save changes to event' : 'Schedule this event'}
        >
          {initialData ? 'Save Changes' : 'Schedule Event'}
        </Button>
      </div>
    </div>
  );
};

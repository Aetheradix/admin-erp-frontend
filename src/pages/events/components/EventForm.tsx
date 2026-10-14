import { useUploadImageMutation } from '@/store/api/uploadSlice';
import { resolveImageUrl, cleanUploadPath } from '@/utils/imageUrl';
import { FileUpload } from '@/components/ui/composed/FileUpload';
import { FormField } from '@/components/ui/composed/FormField';
import { Button } from '@/components/ui/primitives/Button';
import { Calendar } from '@/components/ui/primitives/Calendar';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { useEffect, useState } from 'react';
import { Sparkles, PartyPopper, Wrench, Mic, Rocket, Plus, X } from 'lucide-react';
import type { ERPEvent } from '@/types/models';

interface EventFormProps {
  initialData?: ERPEvent | null;
  onSubmit: (data: Partial<ERPEvent>) => void;
  onCancel: () => void;
}

const TEMPLATE_PRESETS = [
  {
    label: 'Social Party',
    icon: PartyPopper,
    category: 'Social',
    title: 'Team Social Celebration',
    description: 'Monthly team gathering to celebrate wins, birthdays, and milestones together.',
    location: 'Rooftop Lounge & Terrace',
    organizer: 'Culture & Welfare Team',
    time: '5:00 PM - 8:00 PM',
    image:
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=60',
  },
  {
    label: 'Tech Workshop',
    icon: Wrench,
    category: 'Workshop',
    title: 'Frontend & AI Engineering Workshop',
    description:
      'Interactive hands-on session exploring next-gen frontend tools and LLM integrations.',
    location: 'Innovation Lab Room 4',
    organizer: 'Engineering Team',
    time: '2:00 PM - 5:00 PM',
    image:
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60',
  },
  {
    label: 'Town Hall',
    icon: Mic,
    category: 'Meeting',
    title: 'Quarterly All-Hands Town Hall',
    description:
      'Company-wide updates, strategic roadmap overview, and open Q&A session with leadership.',
    location: 'Main Auditorium / Hybrid',
    organizer: 'Executive Board',
    time: '11:00 AM - 1:00 PM',
    image:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=60',
  },
  {
    label: 'Product Launch',
    icon: Rocket,
    category: 'Conference',
    title: 'AetherERP v2.0 Keynote Launch',
    description: 'Official unveiling of the next-generation ERP platform and feature showcase.',
    location: 'Grand Conference Center',
    organizer: 'Product Operations',
    time: '10:00 AM - 12:30 PM',
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60',
  },
];

export const EventForm = ({ initialData, onSubmit, onCancel }: EventFormProps) => {
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadImageMutation();
  const [newTagInput, setNewTagInput] = useState('');
  const [formData, setFormData] = useState<Partial<ERPEvent>>({
    title: '',
    description: '',
    category: 'Workshop',
    date: '',
    time: '10:00 AM - 1:00 PM',
    location: '',
    organizer: '',
    attendees: 0,
    button_type: 'Register Now',
    event_link: '',
    tags: [],
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

  const applyTemplate = (preset: (typeof TEMPLATE_PRESETS)[0]) => {
    setFormData((prev) => ({
      ...prev,
      title: preset.title,
      category: preset.category,
      description: preset.description,
      location: preset.location,
      organizer: preset.organizer,
      time: preset.time,
      image: preset.image,
    }));
  };

  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    const currentTags = formData.tags || [];
    if (!currentTags.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, tags: [...currentTags, trimmed] }));
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tagToRemove),
    }));
  };

  const categories = [
    { label: 'Conference', value: 'Conference' },
    { label: 'Workshop', value: 'Workshop' },
    { label: 'Social', value: 'Social' },
    { label: 'Meeting', value: 'Meeting' },
  ];

  const buttonTypeOptions = [
    { label: 'Register Now (Standard RSVP)', value: 'Register Now' },
    { label: 'Mandatory (Required Attendance)', value: 'Mandatory' },
    { label: 'View Details (Informational / External)', value: 'View Details' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Quick Presets Bar */}
      {!initialData && (
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15 flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-black text-primary uppercase tracking-wider">
            <Sparkles size={14} />
            <span>Quick Event Presets (Click to autofill)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_PRESETS.map((preset) => {
              const IconComponent = preset.icon;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyTemplate(preset)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-primary hover:text-white text-xs font-bold text-foreground border border-border-subtle shadow-xs transition-all cursor-pointer group">
                  <IconComponent
                    size={14}
                    className="text-primary group-hover:text-white transition-colors"
                  />
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

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

          {/* Action Button Type & External Link */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Button Action Type" id="event-button-type">
              <Select
                id="event-button-type"
                options={buttonTypeOptions}
                value={formData.button_type || 'Register Now'}
                onChange={(e) => setFormData({ ...formData, button_type: e.value })}
              />
            </FormField>
            <FormField label="Registration / External URL" id="event-link">
              <Input
                id="event-link"
                value={formData.event_link || ''}
                onChange={(e) => setFormData({ ...formData, event_link: e.target.value })}
                placeholder="https://... (Optional)"
              />
            </FormField>
          </div>

          {/* Tags Management */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted">
              Event Tags & Dynamic Filters
            </label>
            <div className="flex gap-2">
              <Input
                id="event-new-tag"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag (e.g. AI, Q4, AllHands)..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddTag}
                className="rounded-xl! px-4! text-xs font-bold gap-1 cursor-pointer">
                <Plus size={14} /> Add
              </Button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-xl border border-primary/20">
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-500 cursor-pointer ml-1 p-0.5 rounded-full hover:bg-black/10">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <FormField label="Date" required id="event-date">
            <Calendar
              id="event-date"
              value={formData.date ? new Date(formData.date) : null}
              onChange={(e) => {
                const selected = e.value as Date | null;
                setFormData({
                  ...formData,
                  date: selected ? selected.toISOString() : '',
                });
              }}
              placeholder="Select date"
              dateFormat="yy-mm-dd"
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

          {/* Banner Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted">
              Event Banner
            </label>
            <div className="relative aspect-video w-full rounded-2xl border-2 border-dashed border-border-subtle bg-surface-subtle overflow-hidden flex items-center justify-center group hover:border-primary/50 transition-all">
              {formData.image ? (
                <>
                  <img
                    src={resolveImageUrl(formData.image)}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs font-bold text-white bg-black/60 px-3 py-1 rounded-lg">
                      Change Banner
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-center p-4">
                  <span className="text-xs font-bold text-foreground">Click to upload banner</span>
                  <span className="text-[10px] text-muted uppercase">
                    JPG, PNG, WebP (Max 10MB)
                  </span>
                </div>
              )}
              <FileUpload
                mode="basic"
                auto
                accept="image/*"
                maxFileSize={10485760}
                className="absolute inset-0 opacity-0 cursor-pointer"
                onUpload={async (e) => {
                  if (e.files && e.files[0]) {
                    try {
                      const res = await uploadImage({
                        file: e.files[0],
                        category: 'events',
                      }).unwrap();
                      const serverUrl = res.data?.url ? cleanUploadPath(res.data.url) : '';
                      if (serverUrl) {
                        setFormData((prev) => ({
                          ...prev,
                          image: serverUrl,
                          image_url: serverUrl,
                        }));
                      }
                    } catch (err) {
                      console.error('Event banner upload failed:', err);
                    }
                  }
                }}
              />
              {isUploadingImage && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-10">
                  <span className="text-xs font-black text-primary animate-pulse uppercase tracking-widest">
                    Uploading image...
                  </span>
                </div>
              )}
            </div>
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
          aria-label="Discard event details">
          Discard
        </Button>
        <Button
          variant="primary"
          onClick={() => onSubmit(formData)}
          className="px-10! h-12 rounded-3xl! font-black tracking-wide shadow-lg shadow-primary/20"
          aria-label={initialData ? 'Save changes to event' : 'Schedule this event'}>
          {initialData ? 'Save Changes' : 'Schedule Event'}
        </Button>
      </div>
    </div>
  );
};

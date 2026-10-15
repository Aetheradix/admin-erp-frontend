import { useUploadImageMutation } from '@/store/api/uploadSlice';
import { resolveImageUrl, cleanUploadPath } from '@/utils/imageUrl';
import { FileUpload } from '@/components/ui/composed/FileUpload';
import { FormField } from '@/components/ui/composed/FormField';
import { Button } from '@/components/ui/primitives/Button';
import { Calendar } from '@/components/ui/primitives/Calendar';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { useEffect, useState, useRef, useMemo } from 'react';
import {
  Sparkles,
  PartyPopper,
  Wrench,
  Mic,
  Rocket,
  Plus,
  X,
  Image as ImageIcon,
  Loader2,
  Upload,
  PlusCircle,
} from 'lucide-react';
import type { ERPEvent } from '@/types/models';
import { useUploadFileMutation } from '@/store/api/eventSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { TimePicker } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

interface EventFormProps {
  initialData?: ERPEvent | null;
  onSubmit: (data: Partial<ERPEvent>) => void;
  onCancel: () => void;
  availableCategories?: string[];
}

const DEFAULT_CATEGORIES = ['Conference', 'Workshop', 'Social', 'Meeting'];

interface EventTemplatePreset {
  label: string;
  icon: typeof PartyPopper;
  category: string;
  title: string;
  description: string;
  location: string;
  organizer: string;
  author_department: string;
  time: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  image: string;
}

const TEMPLATE_PRESETS: EventTemplatePreset[] = [
  {
    label: 'Social Party',
    icon: PartyPopper,
    category: 'Social',
    title: 'Team Social Celebration',
    description: 'Monthly team gathering to celebrate wins, birthdays, and milestones together.',
    location: 'Rooftop Lounge & Terrace',
    organizer: 'Culture & Welfare Team',
    author_department: 'People Operations',
    time: '5:00 PM - 8:00 PM',
    start_time: '05:00 PM',
    end_time: '08:00 PM',
    max_participants: 100,
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
    author_department: 'Engineering',
    time: '2:00 PM - 5:00 PM',
    start_time: '02:00 PM',
    end_time: '05:00 PM',
    max_participants: 50,
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
    author_department: 'Executive',
    time: '11:00 AM - 1:00 PM',
    start_time: '11:00 AM',
    end_time: '01:00 PM',
    max_participants: 250,
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
    author_department: 'Product',
    time: '10:00 AM - 12:30 PM',
    start_time: '10:00 AM',
    end_time: '12:30 PM',
    max_participants: 500,
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60',
  },
];

export const EventForm = ({
  initialData,
  onSubmit,
  onCancel,
  availableCategories,
}: EventFormProps) => {
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadImageMutation();
  const [uploadFile] = useUploadFileMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newTagInput, setNewTagInput] = useState('');

  const baseCategoryList = useMemo(() => {
    const list =
      availableCategories && availableCategories.length > 0
        ? availableCategories
        : DEFAULT_CATEGORIES;
    return Array.from(new Set([...list, ...DEFAULT_CATEGORIES]));
  }, [availableCategories]);

  const [selectedCategoryType, setSelectedCategoryType] = useState<string>(
    initialData?.category && !baseCategoryList.includes(initialData.category)
      ? 'Other'
      : initialData?.category || 'Workshop'
  );
  const [customCategoryInput, setCustomCategoryInput] = useState<string>(
    initialData?.category && !baseCategoryList.includes(initialData.category)
      ? initialData.category
      : ''
  );

  const categoryOptions = useMemo(() => {
    const opts = baseCategoryList.map((cat) => ({ label: cat, value: cat }));
    return [...opts, { label: 'Other (Enter Custom)', value: 'Other' }];
  }, [baseCategoryList]);

  const [formData, setFormData] = useState<Partial<ERPEvent>>({
    title: '',
    description: '',
    category: 'Workshop',
    date: '',
    time: '10:00 AM - 1:00 PM',
    start_time: '10:00 AM',
    end_time: '01:00 PM',
    location: '',
    organizer: '',
    author_department: '',
    employee_status: 'Active',
    attendees: 0,
    button_type: 'Register Now',
    event_link: '',
    tags: [],
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
  });

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadFile(file).unwrap();
      if (res.url) {
        setFormData((prev) => ({
          ...prev,
          image: res.url,
          image_url: res.url,
        }));
        showToast({
          severity: 'success',
          summary: 'Banner Uploaded',
          detail: 'Event banner image uploaded successfully!',
          life: 3000,
        });
      }
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string }; message?: string };
      console.error('Failed to upload image:', err);
      showToast({
        severity: 'error',
        summary: 'Upload Failed',
        detail: apiError?.data?.message || apiError?.message || 'Failed to upload banner image',
        life: 3500,
      });
    }
  };

  useEffect(() => {
    if (initialData) {
      queueMicrotask(() => {
        const rawDate = initialData.event_date || initialData.date || '';
        let startTime = initialData.start_time || '';
        let endTime = initialData.end_time || '';
        if ((!startTime || !endTime) && initialData.time) {
          const parts = initialData.time.split('-');
          if (!startTime && parts[0]) startTime = parts[0].trim();
          if (!endTime && parts[1]) endTime = parts[1].trim();
        }

        setFormData({
          ...initialData,
          date: rawDate,
          event_date: rawDate,
          start_time: startTime || '10:00 AM',
          end_time: endTime || '01:00 PM',
          employee_status: initialData.employee_status || 'Active',
        });

        // Check if existing category matches standard categories or if it is a custom category
        const initialCat = initialData.category || 'Workshop';
        if (baseCategoryList.includes(initialCat)) {
          setSelectedCategoryType(initialCat);
          setCustomCategoryInput('');
        } else {
          setSelectedCategoryType('Other');
          setCustomCategoryInput(initialCat);
        }
      });
    }
  }, [initialData, baseCategoryList.join(',')]);

  const handleCategorySelection = (val: string) => {
    setSelectedCategoryType(val);
    if (val !== 'Other') {
      setFormData((prev) => ({ ...prev, category: val }));
    } else {
      setFormData((prev) => ({ ...prev, category: customCategoryInput.trim() || 'Other' }));
    }
  };

  const handleCustomCategoryChange = (val: string) => {
    setCustomCategoryInput(val);
    setFormData((prev) => ({ ...prev, category: val.trim() || 'Other' }));
  };

  const applyTemplate = (preset: (typeof TEMPLATE_PRESETS)[0]) => {
    setFormData((prev) => ({
      ...prev,
      title: preset.title,
      category: preset.category,
      description: preset.description,
      location: preset.location,
      organizer: preset.organizer,
      author_department: preset.author_department,
      time: preset.time,
      start_time: preset.start_time,
      end_time: preset.end_time,
      max_participants: preset.max_participants,
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

      {/* Banner Image Uploader & Preview Box */}
      <div className="p-4.5 rounded-3xl bg-surface-subtle/70 border border-border-subtle flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon size={15} className="text-primary" />
            <span>Event Banner Image (Upload to Hostinger)</span>
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingImage}
            className="px-3.5 py-1.5 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-all disabled:opacity-50"
          >
            {isUploadingImage ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Uploading Image...</span>
              </>
            ) : (
              <>
                <Upload size={13} />
                <span>Upload New Banner Image</span>
              </>
            )}
          </button>
        </div>

        {/* Live Banner Preview */}
        <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-zinc-900 border border-border-subtle group/banner">
          <img
            src={formData.image || formData.image_url}
            alt="Event banner preview"
            className="w-full h-full object-cover group-hover/banner:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60';
            }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex items-end justify-between p-3.5">
            <span className="text-[11px] font-bold text-white/90 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg truncate max-w-[80%] border border-white/10">
              {formData.image || formData.image_url || 'Default Banner Image'}
            </span>
            {isUploadingImage && (
              <span className="text-[10px] font-black text-amber-300 bg-black/60 px-2 py-1 rounded-md animate-pulse">
                Saving to Hostinger...
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-5">
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
              rows={3}
            />
          </FormField>

          {/* Category Dropdown + Dynamic "Other" Custom Category Input */}
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-surface-subtle/70 border border-border-subtle">
            <FormField label="Category" required id="event-category">
              <Select
                id="event-category"
                options={categoryOptions}
                value={selectedCategoryType}
                onChange={(e) => handleCategorySelection(e.value)}
              />
            </FormField>

            {/* Dynamic Custom Category Text Input */}
            {selectedCategoryType === 'Other' && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-border-subtle/80 animate-in fade-in slide-in-from-top-2 duration-200">
                <label
                  htmlFor="custom-category-input"
                  className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5"
                >
                  <PlusCircle size={13} />
                  <span>Enter Custom Category</span>
                </label>
                <Input
                  id="custom-category-input"
                  value={customCategoryInput}
                  onChange={(e) => handleCustomCategoryChange(e.target.value)}
                  placeholder="e.g., Hackathon, Product Showcase, Webinar"
                  className="bg-white! border-primary/40! focus:border-primary! ring-primary/20!"
                  autoFocus
                />
                <span className="text-[11px] text-muted font-medium">
                  This custom category will be saved and dynamically attached to your event.
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Initial Joined Count" id="event-attendees">
              <Input
                id="event-attendees"
                type="number"
                value={formData.attendees?.toString() || ''}
                onChange={(e) =>
                  setFormData({ ...formData, attendees: parseInt(e.target.value, 10) || 0 })
                }
                placeholder="0"
              />
            </FormField>
            <FormField label="Max Capacity (Limit)" id="event-max-capacity">
              <Input
                id="event-max-capacity"
                type="number"
                value={formData.max_participants?.toString() || ''}
                onChange={(e) =>
                  setFormData({ ...formData, max_participants: parseInt(e.target.value, 10) || undefined })
                }
                placeholder="e.g. 50"
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

        <div className="flex flex-col gap-5">
          <FormField label="Date" required id="event-date">
            <Calendar
              id="event-date"
              value={
                formData.date || formData.event_date
                  ? new Date(formData.date || formData.event_date || '')
                  : null
              }
              onChange={(e) => {
                const selected = e.value as Date | null;
                if (selected) {
                  const year = selected.getFullYear();
                  const month = String(selected.getMonth() + 1).padStart(2, '0');
                  const day = String(selected.getDate()).padStart(2, '0');
                  const formatted = `${year}-${month}-${day} 10:00:00`;
                  setFormData((prev) => ({
                    ...prev,
                    date: formatted,
                    event_date: formatted,
                  }));
                } else {
                  setFormData((prev) => ({
                    ...prev,
                    date: '',
                    event_date: '',
                  }));
                }
              }}
              placeholder="Select date"
              dateFormat="yy-mm-dd"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Time" id="event-start-time">
              <TimePicker
                id="event-start-time"
                use12Hours
                format="hh:mm A"
                minuteStep={15}
                needConfirm={false}
                value={
                  formData.start_time
                    ? dayjs(formData.start_time, ['hh:mm A', 'h:mm A', 'HH:mm', 'H:mm'])
                    : null
                }
                onChange={(_time: dayjs.Dayjs | null, dateString: string | null) => {
                  const str = typeof dateString === 'string' ? dateString : '';
                  setFormData((prev) => ({
                    ...prev,
                    start_time: str,
                    time: str && prev.end_time ? `${str} - ${prev.end_time}` : str || prev.time,
                  }));
                }}
                placeholder="Select start time"
                className="w-full h-11 rounded-xl border border-border-subtle bg-white font-medium hover:border-primary/50 focus:border-primary shadow-xs"
              />
            </FormField>
            <FormField label="End Time" id="event-end-time">
              <TimePicker
                id="event-end-time"
                use12Hours
                format="hh:mm A"
                minuteStep={15}
                needConfirm={false}
                value={
                  formData.end_time
                    ? dayjs(formData.end_time, ['hh:mm A', 'h:mm A', 'HH:mm', 'H:mm'])
                    : null
                }
                onChange={(_time: dayjs.Dayjs | null, dateString: string | null) => {
                  const str = typeof dateString === 'string' ? dateString : '';
                  setFormData((prev) => ({
                    ...prev,
                    end_time: str,
                    time: prev.start_time && str ? `${prev.start_time} - ${str}` : str || prev.time,
                  }));
                }}
                placeholder="Select end time"
                className="w-full h-11 rounded-xl border border-border-subtle bg-white font-medium hover:border-primary/50 focus:border-primary shadow-xs"
              />
            </FormField>
          </div>

          <FormField label="Location / Venue" id="event-location">
            <Input
              id="event-location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Executive Suite / Innovation Lab / Remote"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Organizer / Host" id="event-organizer">
              <Input
                id="event-organizer"
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                placeholder="Team / Host Name"
              />
            </FormField>
            <FormField label="Department" id="event-department">
              <Input
                id="event-department"
                value={formData.author_department || ''}
                onChange={(e) => setFormData({ ...formData, author_department: e.target.value })}
                placeholder="e.g. Engineering, HR"
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

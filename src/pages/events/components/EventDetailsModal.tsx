import { useState, useMemo } from 'react';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Button } from '@/components/ui/primitives/Button';
import { Badge } from '@/components/ui/primitives/Badge';
import { Input } from '@/components/ui/primitives/Input';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Building2,
  Tag,
  CheckCircle2,
  ArrowUpRight,
  Edit2,
  Trash2,
  ClockAlert,
  Sparkles,
  Info,
  Layers,
  X,
  Search,
  UserCheck,
  Mail,
  ChevronRight,
} from 'lucide-react';
import type { ERPEvent } from '@/types/models';
import { useAuth } from '@/hooks/useAuth';
import {
  formatEventTime,
  getEventStatusInfo,
  getDynamicAttendeesCount,
  isUserRegisteredForEvent,
  isPastEvent,
  getEventParticipantsList,
} from '../utils/eventUtils';
import { EventMediaUploader } from './EventMediaUploader';

interface EventDetailsModalProps {
  event: ERPEvent | null;
  visible: boolean;
  onHide: () => void;
  onRegister: (event: ERPEvent) => void;
  isRegistering?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewPass?: (event: ERPEvent) => void;
}

const CATEGORY_IMAGES: Record<string, string> = {
  Conference:
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
  Workshop:
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=80',
  Social:
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&auto=format&fit=crop&q=80',
  Meeting:
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
};

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80';

const AVATAR_COLORS = [
  'bg-emerald-500 text-white',
  'bg-indigo-500 text-white',
  'bg-amber-500 text-white',
  'bg-rose-500 text-white',
  'bg-sky-500 text-white',
  'bg-purple-500 text-white',
  'bg-orange-500 text-white',
];

export const EventDetailsModal = ({
  event,
  visible,
  onHide,
  onRegister,
  isRegistering = false,
  onEdit,
  onDelete,
}: EventDetailsModalProps) => {
  const { user } = useAuth();
  const isAdmin = Boolean(
    user?.role &&
      ['admin', 'superadmin', 'hradmin', 'financeadmin', 'manager'].some((r) =>
        String(user.role).toLowerCase().includes(r)
      )
  );
  const [activeTab, setActiveTab] = useState<'details' | 'participants' | 'media'>('details');
  const [participantSearch, setParticipantSearch] = useState('');

  const statusInfo = event ? getEventStatusInfo(event) : null;
  const attendeesCount = event ? getDynamicAttendeesCount(event) : 0;
  const isRegistered = event
    ? isUserRegisteredForEvent(event.id, user?.email || user?.username, event)
    : false;
  const isPast = event ? isPastEvent(event) : false;
  const maxCapacity = event?.max_participants || 100;
  const capacityPct = Math.min(100, Math.round((attendeesCount / maxCapacity) * 100));

  const participantsList = useMemo(() => {
    if (!event) return [];
    return getEventParticipantsList(event);
  }, [event, attendeesCount]);

  const filteredParticipants = useMemo(() => {
    if (!participantSearch.trim()) return participantsList;
    const q = participantSearch.toLowerCase();
    return participantsList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.department?.toLowerCase().includes(q)
    );
  }, [participantsList, participantSearch]);

  if (!event || !statusInfo) return null;

  const eventDateObj = new Date(event.event_date || event.date || '');
  const formattedDate = !Number.isNaN(eventDateObj.getTime())
    ? eventDateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : event.date || event.event_date || 'Date TBD';

  const timeRange = formatEventTime(event);
  const imageBanner = event.image || CATEGORY_IMAGES[event.category] || DEFAULT_IMAGE;

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      modal
      header={null}
      footer={null}
      width={860}
      className="max-w-[92vw] mx-auto rounded-[36px] overflow-hidden"
      contentClassName="p-0 overflow-hidden"
      pt={{
        root: { className: 'rounded-[36px] overflow-hidden border-none shadow-2xl bg-white' },
        mask: { className: 'backdrop-blur-md bg-black/60' },
      }}
    >
      <div className="flex flex-col max-h-[88vh] overflow-y-auto bg-white rounded-[36px]">
        {/* Visual Banner Header */}
        <div className="relative h-60 sm:h-68 w-full bg-zinc-950 overflow-hidden flex-shrink-0">
          <img
            src={imageBanner}
            alt={event.title}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                CATEGORY_IMAGES[event.category] || DEFAULT_IMAGE;
            }}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-black/30" />

          {/* Top Controls: Status Badges & Action Buttons */}
          <div className="absolute top-5 inset-x-6 flex items-center justify-between z-10">
            {/* Status Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3.5 py-1.5 rounded-2xl backdrop-blur-md border text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md ${statusInfo.colorClasses}`}
              >
                <statusInfo.icon size={13} />
                <span>{statusInfo.label}</span>
              </span>

              {statusInfo.isLeave && (
                <span className="px-3.5 py-1.5 rounded-2xl backdrop-blur-md bg-amber-500/90 text-white border border-amber-400/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  <ClockAlert size={13} />
                  <span>Host On Leave</span>
                </span>
              )}
            </div>

            {/* Action Buttons & Close */}
            <div className="flex items-center gap-2">
              {isAdmin && onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onHide();
                    onEdit(String(event.id));
                  }}
                  className="w-9 h-9 rounded-2xl bg-black/50 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-primary flex items-center justify-center transition-all cursor-pointer shadow-lg"
                  title="Edit Event"
                >
                  <Edit2 size={15} />
                </button>
              )}
              {isAdmin && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onHide();
                    onDelete(String(event.id));
                  }}
                  className="w-9 h-9 rounded-2xl bg-black/50 backdrop-blur-md text-rose-300 border border-white/20 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
                  title="Delete Event"
                >
                  <Trash2 size={15} />
                </button>
              )}
              <button
                type="button"
                onClick={onHide}
                className="w-9 h-9 rounded-2xl bg-black/50 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-foreground flex items-center justify-center transition-all cursor-pointer shadow-lg"
                title="Close"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Bottom Banner Title & Category */}
          <div className="absolute bottom-5 inset-x-6 z-10 flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="primary"
                className="bg-primary backdrop-blur-md text-white border border-white/20 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-xl"
              >
                {event.category || 'General'}
              </Badge>
              {event.author_department && (
                <span className="text-xs font-bold text-white bg-white/15 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20 flex items-center gap-1.5">
                  <Building2 size={13} /> {event.author_department}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-snug tracking-tight">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Navigation Switcher Tabs */}
        <div className="flex items-center gap-2.5 px-6 sm:px-8 pt-5 pb-3 border-b border-border-subtle bg-surface-subtle/30 flex-shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-4.5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'details'
                ? 'bg-primary text-white shadow-md'
                : 'text-muted hover:text-foreground bg-white border border-border-subtle hover:bg-surface-subtle'
            }`}
          >
            <Info size={14} />
            <span>Event Information</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('participants')}
            className={`px-4.5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'participants'
                ? 'bg-primary text-white shadow-md'
                : 'text-muted hover:text-foreground bg-white border border-border-subtle hover:bg-surface-subtle'
            }`}
          >
            <Users size={14} />
            <span>Joined Participants ({attendeesCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`px-4.5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'media'
                ? 'bg-primary text-white shadow-md'
                : 'text-muted hover:text-foreground bg-white border border-border-subtle hover:bg-surface-subtle'
            }`}
          >
            <Sparkles size={14} />
            <span>Recap, Photos & Files</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 sm:p-8 flex flex-col gap-6 flex-1">
          {activeTab === 'details' ? (
            <>
              {/* Highlight Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date & Schedule */}
                <div className="p-5 rounded-3xl bg-surface-subtle/70 border border-border-subtle flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Calendar size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black text-muted uppercase tracking-wider block">
                      Date & Schedule
                    </span>
                    <p className="text-xs font-black text-foreground truncate mt-0.5">
                      {formattedDate}
                    </p>
                    <p className="text-[11px] font-bold text-primary flex items-center gap-1 mt-0.5 truncate">
                      <Clock size={11} className="flex-shrink-0" />
                      <span>{timeRange}</span>
                    </p>
                  </div>
                </div>

                {/* Venue & Location */}
                <div className="p-5 rounded-3xl bg-surface-subtle/70 border border-border-subtle flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 shadow-xs">
                    <MapPin size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black text-muted uppercase tracking-wider block">
                      Venue & Location
                    </span>
                    <p className="text-xs font-black text-foreground truncate mt-0.5">
                      {event.location || 'Executive Headquarters'}
                    </p>
                    <span className="text-[11px] text-muted font-medium block mt-0.5 truncate">
                      Check in upon arrival
                    </span>
                  </div>
                </div>

                {/* Participants Joined & Capacity (Clickable to switch tab!) */}
                <div
                  onClick={() => setActiveTab('participants')}
                  className="p-5 rounded-3xl bg-surface-subtle/70 border border-border-subtle flex items-center gap-4 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group/stat"
                  title="Click to view joined participants list"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary group-hover/stat:bg-primary group-hover/stat:text-white flex items-center justify-center flex-shrink-0 shadow-xs transition-colors">
                    <Users size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-muted uppercase tracking-wider block">
                        Participants Joined
                      </span>
                      <span className="text-[10px] font-bold text-primary group-hover/stat:underline flex items-center gap-0.5">
                        View List <ChevronRight size={10} />
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-sm font-black text-foreground">{attendeesCount} Joined</p>
                      {event.max_participants && (
                        <span className="text-[10px] font-bold text-muted">
                          / {event.max_participants} Max
                        </span>
                      )}
                    </div>
                    {event.max_participants && (
                      <div className="w-full bg-border-subtle h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-500"
                          style={{ width: `${capacityPct}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="flex flex-col gap-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Layers size={15} className="text-primary" />
                  <span>About This Event</span>
                </h3>
                <div className="p-6 rounded-3xl bg-surface-subtle/40 border border-border-subtle">
                  <p className="text-sm text-foreground/80 font-medium leading-relaxed whitespace-pre-line">
                    {event.description ||
                      'No detailed description has been added for this event. Join in and be part of the experience!'}
                  </p>
                </div>
              </div>

              {/* Quick Joined Participants Banner Preview */}
              <div
                onClick={() => setActiveTab('participants')}
                className="p-5 rounded-3xl bg-linear-to-r from-primary/10 via-surface-subtle to-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all group/part"
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2.5 overflow-hidden py-1">
                    {participantsList.slice(0, 4).map((p, idx) => (
                      <div
                        key={p.id}
                        className={`w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-black shadow-xs ${
                          AVATAR_COLORS[idx % AVATAR_COLORS.length]
                        }`}
                      >
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {attendeesCount > 4 && (
                      <div className="w-9 h-9 rounded-full border-2 border-white bg-zinc-800 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                        +{attendeesCount - 4}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-foreground group-hover/part:text-primary transition-colors">
                      {attendeesCount} Registered {attendeesCount === 1 ? 'Colleague' : 'Colleagues'}
                    </h4>
                    <p className="text-[11px] text-muted font-medium">
                      See who is attending from Engineering, Product, HR and other teams.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-black text-primary group-hover/part:translate-x-1 transition-transform">
                  <span>View Full Roster</span>
                  <ChevronRight size={14} />
                </div>
              </div>

              {/* Host & Department Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl bg-surface-subtle/50 border border-border-subtle flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-[10px] font-black text-muted uppercase tracking-wider block">
                      Organized By
                    </span>
                    <p className="text-sm font-black text-foreground mt-0.5 truncate">
                      {event.organizer || event.author_name || 'AetherERP Events Team'}
                    </p>
                    {event.author_email && (
                      <span className="text-xs text-muted font-medium truncate block mt-0.5">
                        {event.author_email}
                      </span>
                    )}
                  </div>
                  <span className="px-3 py-1 rounded-xl text-xs font-black bg-white border border-border-subtle text-foreground shadow-xs whitespace-nowrap">
                    {event.status || 'Upcoming'}
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-surface-subtle/50 border border-border-subtle flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-[10px] font-black text-muted uppercase tracking-wider block">
                      Department / Wing
                    </span>
                    <p className="text-sm font-black text-foreground mt-0.5 truncate">
                      {event.author_department || 'All Company Departments'}
                    </p>
                    <span className="text-xs text-muted font-medium block mt-0.5">
                      Internal Corporate Event
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-primary border border-border-subtle shadow-xs flex-shrink-0">
                    <Building2 size={18} />
                  </div>
                </div>
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black text-muted uppercase tracking-wider mr-1 flex items-center gap-1">
                    <Tag size={12} /> Tags:
                  </span>
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-xl text-xs font-bold text-primary bg-primary/10 border border-primary/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : activeTab === 'participants' ? (
            /* Joined Participants Roster View */
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              {/* Header with Search & Stats */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-surface-subtle/70 border border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 shadow-xs">
                    <UserCheck size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                        Registered Participants
                      </h3>
                      <Badge variant="primary" className="text-[10px] font-black px-2 py-0.5 rounded-lg">
                        {attendeesCount} Joined
                      </Badge>
                    </div>
                    <p className="text-xs text-muted font-medium mt-0.5">
                      Live attendee roster for {event.title}
                    </p>
                  </div>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <Input
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    placeholder="Search by name, email..."
                    className="pl-10! h-10! text-xs! bg-white! rounded-xl!"
                  />
                </div>
              </div>

              {/* Participant Cards List */}
              {filteredParticipants.length === 0 ? (
                <div className="py-14 px-6 rounded-3xl border-2 border-dashed border-border-strong bg-surface-subtle/50 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-muted border border-border-subtle shadow-xs">
                    <Users size={26} className="text-primary/70" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-foreground">
                      {participantSearch ? 'No matching participants found' : 'No participants registered yet'}
                    </h4>
                    <p className="text-xs text-muted font-medium mt-0.5">
                      {participantSearch
                        ? 'Try searching with another name or department.'
                        : 'Be the first to confirm attendance for this event!'}
                    </p>
                  </div>
                  {!isRegistered && !isPast && (
                    <Button
                      variant="primary"
                      onClick={() => onRegister(event)}
                      disabled={isRegistering}
                      className="mt-2 h-10 rounded-xl font-bold text-xs gap-1.5 cursor-pointer"
                    >
                      <ArrowUpRight size={14} />
                      <span>Register Now</span>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filteredParticipants.map((participant, index) => {
                    const isCurrentUser =
                      user?.email && participant.email.toLowerCase() === user.email.toLowerCase();
                    const avatarBg = AVATAR_COLORS[index % AVATAR_COLORS.length];

                    return (
                      <div
                        key={participant.id}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isCurrentUser
                            ? 'bg-primary/5 border-primary/30 shadow-sm'
                            : 'bg-white border-border-subtle shadow-xs hover:border-primary/20 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black shadow-xs flex-shrink-0 ${avatarBg}`}
                          >
                            {participant.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-black text-foreground truncate">
                                {participant.name}
                              </h4>
                              {isCurrentUser && (
                                <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-primary text-white uppercase tracking-wider">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-muted truncate mt-0.5 font-medium">
                              <Mail size={11} className="flex-shrink-0" />
                              <span className="truncate">{participant.email}</span>
                            </div>
                            <span className="text-[10px] text-muted/80 block mt-0.5">
                              {participant.joinedAt}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span className="px-2.5 py-0.8 rounded-lg text-[10px] font-bold bg-surface-subtle text-foreground border border-border-subtle whitespace-nowrap">
                            {participant.department || 'Corporate'}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md whitespace-nowrap">
                            <CheckCircle2 size={10} /> Confirmed
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <EventMediaUploader
              eventId={event.id}
              eventTitle={event.title}
              initialAttachments={event.media_attachments}
            />
          )}
        </div>

        {/* Modal Footer Action Bar */}

      </div>
    </Dialog>
  );
};

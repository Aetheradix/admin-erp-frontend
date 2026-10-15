import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/primitives/Badge';
import { Button } from '@/components/ui/primitives/Button';
import {
  Clock,
  Edit2,
  MapPin,
  Trash2,
  Users,
  Tag,
  Building2,
  ShieldCheck,
  ArrowUpRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Sparkles,
  Radio,
  ClockAlert,
  Ticket,
} from 'lucide-react';
import type { ERPEvent } from '@/types/models';
import { useAuth } from '@/hooks/useAuth';
import {
  formatEventTime,
  getEventStatusInfo,
  getDynamicAttendeesCount,
  isUserRegisteredForEvent,
  isPastEvent,
} from '../utils/eventUtils';

interface EventCardProps {
  event: ERPEvent;
  onCardClick?: (event: ERPEvent) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRegister?: (event: ERPEvent) => void;
  onViewPass?: (event: ERPEvent) => void;
  isRegistering?: boolean;
}

const CATEGORY_IMAGES: Record<string, string> = {
  Conference:
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60',
  Workshop:
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60',
  Social:
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=60',
  Meeting:
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=60',
};

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60';

export const EventCard = ({
  event,
  onCardClick,
  onEdit,
  onDelete,
  onRegister,
  onViewPass,
  isRegistering,
}: EventCardProps) => {
  const { user } = useAuth();
  const isAdmin = Boolean(
    user?.role &&
      ['admin', 'superadmin', 'hradmin', 'financeadmin', 'manager'].some((r) =>
        String(user.role).toLowerCase().includes(r)
      )
  );

  const fallbackCategoryImg = CATEGORY_IMAGES[event.category] || DEFAULT_IMAGE;
  const initialImage = event.image || fallbackCategoryImg;

  const [imageSrc, setImageSrc] = useState(initialImage);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageSrc(event.image || CATEGORY_IMAGES[event.category] || DEFAULT_IMAGE);
    setImageError(false);
  }, [event.image, event.category]);

  const handleImageError = () => {
    const fallback = CATEGORY_IMAGES[event.category] || DEFAULT_IMAGE;
    if (imageSrc !== fallback) {
      setImageSrc(fallback);
    } else {
      setImageError(true);
    }
  };

  const categoryVariants: Record<string, 'primary' | 'success' | 'warning' | 'secondary'> = {
    Conference: 'primary',
    Workshop: 'success',
    Social: 'warning',
    Meeting: 'secondary',
  };

  const statusInfo = getEventStatusInfo(event);
  const attendeesCount = getDynamicAttendeesCount(event);
  const isRegistered = isUserRegisteredForEvent(event.id, user?.email || user?.username, event);
  const isPast = isPastEvent(event);

  const eventDate = new Date(event.event_date || event.date || '');
  const month = Number.isNaN(eventDate.getTime())
    ? 'EVENT'
    : eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = Number.isNaN(eventDate.getDate()) ? '--' : eventDate.getDate();
  const formattedTime = formatEventTime(event);

  const handleCardClick = () => {
    onCardClick?.(event);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-3xl border border-border-subtle overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 flex flex-col h-full hover:-translate-y-1.5 cursor-pointer relative"
    >
      {/* Visual Header */}
      <div className="relative h-52 overflow-hidden bg-zinc-900">
        {!imageError ? (
          <img
            src={imageSrc}
            alt={event.title}
            onError={handleImageError}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-primary/30 via-zinc-800 to-zinc-900 flex items-center justify-center">
            <CalendarIcon size={48} className="text-white/20" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-black/30" />

        {/* Top Floating Bar: Date Pill & Action Buttons */}
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-10">
          {/* Glass Date Pill */}
          <div className="bg-black/50 backdrop-blur-md border border-white/20 rounded-2xl px-3 py-1.5 flex items-center gap-2 text-white shadow-lg">
            <span className="text-[10px] font-black text-primary uppercase tracking-wider bg-white/15 px-1.5 py-0.5 rounded-lg">
              {month}
            </span>
            <span className="text-sm font-black tracking-tight">{day}</span>
          </div>

          {/* Glass Action Capsule - Admin Only */}
          {isAdmin && (
            <div
              className="flex items-center gap-1 p-1 bg-black/50 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(String(event.id));
                }}
                className="w-8 h-8 rounded-xl bg-white/10 text-white hover:bg-white hover:text-primary flex items-center justify-center transition-all cursor-pointer"
                title="Edit Event"
              >
                <Edit2 size={14} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(String(event.id));
                }}
                className="w-8 h-8 rounded-xl bg-white/10 text-rose-300 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Delete Event"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Floating Bar: Category & Status */}
        <div className="absolute bottom-3.5 inset-x-3.5 flex items-center justify-between z-10">
          <Badge
            variant={categoryVariants[event.category] || 'primary'}
            className="rounded-xl px-3 py-1 text-[10px] font-black tracking-wider uppercase backdrop-blur-md bg-white/25 text-white border border-white/20 shadow-md"
          >
            {event.category || 'General'}
          </Badge>

          {/* Status Display: On Leave, Completed, Live Now, or Employee Status */}
          {statusInfo.isLeave ? (
            <span className="text-[10px] font-black px-2.5 py-1 rounded-xl backdrop-blur-md bg-amber-500/90 text-white uppercase tracking-wider flex items-center gap-1 border border-amber-400/40 shadow-md animate-pulse">
              <ClockAlert size={12} />
              On Leave
            </span>
          ) : statusInfo.isPast ? (
            <span className="text-[10px] font-black px-2.5 py-1 rounded-xl backdrop-blur-md bg-zinc-700/80 text-zinc-200 uppercase tracking-wider flex items-center gap-1 border border-zinc-500/30 shadow-md">
              <CheckCircle2 size={12} />
              Completed
            </span>
          ) : statusInfo.isLive ? (
            <span className="text-[10px] font-black px-2.5 py-1 rounded-xl backdrop-blur-md bg-emerald-500/90 text-white uppercase tracking-wider flex items-center gap-1 border border-emerald-400/30 shadow-md animate-pulse">
              <Radio size={12} />
              Live Now
            </span>
          ) : event.employee_status ? (
            <span className="text-[10px] font-black px-2.5 py-1 rounded-xl backdrop-blur-md bg-emerald-500/80 text-white uppercase tracking-wider flex items-center gap-1 border border-emerald-400/30 shadow-md">
              <ShieldCheck size={12} />
              {event.employee_status}
            </span>
          ) : null}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-1 gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-foreground leading-snug tracking-tight group-hover:text-primary transition-colors line-clamp-1">
              {event.title}
            </h3>
          </div>
          <p className="text-xs text-muted font-medium line-clamp-2 leading-relaxed">
            {event.description || 'No additional description provided for this event.'}
          </p>
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/8 px-2.5 py-0.5 rounded-lg border border-primary/15"
              >
                <Tag size={9} /> #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Info Grid */}
        <div className="mt-auto grid grid-cols-2 gap-y-2.5 pt-4 border-t border-border-subtle">
          {/* Time */}
          <div className="flex items-center gap-2 text-foreground font-bold text-xs">
            <Clock size={14} className="text-primary flex-shrink-0" />
            <span className="truncate">{formattedTime}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-foreground font-bold text-xs">
            <MapPin size={14} className="text-primary flex-shrink-0" />
            <span className="truncate">
              {event.location?.split(',')[0] || event.location || 'Company HQ'}
            </span>
          </div>

          {/* Participants Count */}
          <div className="flex items-center gap-2 text-muted font-bold text-[11px]">
            <Users size={13} className="text-primary flex-shrink-0" />
            <span>
              {attendeesCount} Joined
              {event.max_participants ? ` / ${event.max_participants}` : ''}
            </span>
          </div>

          {/* Department / Organizer */}
          <div className="flex items-center gap-2 text-muted font-bold text-[11px] truncate">
            {event.author_department ? (
              <>
                <Building2 size={13} className="text-primary flex-shrink-0" />
                <span className="truncate">{event.author_department}</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-primary/50 flex-shrink-0" />
                <span className="truncate">{event.organizer || 'Team Event'}</span>
              </>
            )}
          </div>
        </div>

        {/* Registration & Action CTA */}
        <div onClick={(e) => e.stopPropagation()} className="pt-2">
          {isPast ? (
            <Button
              variant="secondary"
              onClick={handleCardClick}
              className="w-full h-11 rounded-2xl! gap-2 font-black text-xs uppercase tracking-wider bg-surface-subtle hover:bg-primary hover:text-white border border-border-subtle transition-all cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Event Ended • View Recap</span>
            </Button>
          ) : isRegistered ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider">
                <CheckCircle2 size={14} />
                <span>Registered</span>
              </div>
              {onViewPass && (
                <button
                  type="button"
                  onClick={() => onViewPass(event)}
                  className="h-11 px-3.5 rounded-2xl bg-primary text-white hover:bg-primary/90 flex items-center justify-center gap-1 text-xs font-black transition-all cursor-pointer shadow-md"
                  title="View VIP Pass Ticket"
                >
                  <Ticket size={14} />
                  <span className="hidden sm:inline">Pass</span>
                </button>
              )}
            </div>
          ) : (
            <Button
              variant="primary"
              onClick={() => onRegister?.(event)}
              disabled={isRegistering}
              className="w-full h-11 rounded-2xl! gap-2 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isRegistering ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <div className="flex items-center gap-1">
                  <span>Register Now</span>
                  <ArrowUpRight size={14} />
                </div>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

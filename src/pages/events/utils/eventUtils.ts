import type { ERPEvent, EventAttachment, EventParticipant } from '@/types/models';
import {
  Calendar,
  CheckCircle2,
  Radio,
  ClockAlert,
} from 'lucide-react';

const REGISTRATIONS_STORAGE_KEY = 'aether_event_registrations_v1';
const ATTACHMENTS_STORAGE_KEY = 'aether_event_attachments_v1';

export type { EventParticipant };

interface EventLocalState {
  registeredUsers: string[];
  addedAttendees: number;
  participants?: EventParticipant[];
}

/**
 * Parses time string like "10:00 AM", "14:30", or "10:00 AM - 1:00 PM" into hours and minutes
 */
function parseTimeString(timeStr: string): { hours: number; minutes: number } | null {
  if (!timeStr) return null;
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridian = match[3]?.toUpperCase();

  if (meridian === 'PM' && hours < 12) hours += 12;
  if (meridian === 'AM' && hours === 12) hours = 0;

  return { hours, minutes };
}

/**
 * Extracts Start and End Date objects for an ERPEvent
 */
export function getEventDateTimes(event: ERPEvent): {
  start: Date | null;
  end: Date | null;
} {
  const dateStr = event.event_date || event.date;
  if (!dateStr) return { start: null, end: null };

  const baseDate = new Date(dateStr);
  if (Number.isNaN(baseDate.getTime())) return { start: null, end: null };

  // Parse time components
  let startTimeStr = event.start_time;
  let endTimeStr = event.end_time;

  if (!startTimeStr && event.time) {
    const parts = event.time.split(/\s*-\s*|\s*to\s*/i);
    startTimeStr = parts[0];
    if (parts.length > 1) {
      endTimeStr = parts[1];
    }
  }

  const startDate = new Date(baseDate);
  const parsedStart = startTimeStr ? parseTimeString(startTimeStr) : null;
  if (parsedStart) {
    startDate.setHours(parsedStart.hours, parsedStart.minutes, 0, 0);
  } else {
    // Default to start of day
    startDate.setHours(9, 0, 0, 0);
  }

  const endDate = new Date(baseDate);
  const parsedEnd = endTimeStr ? parseTimeString(endTimeStr) : null;
  if (parsedEnd) {
    endDate.setHours(parsedEnd.hours, parsedEnd.minutes, 0, 0);
    // If end time hour is less than start time hour, it might end the next day
    if (endDate.getTime() < startDate.getTime()) {
      endDate.setDate(endDate.getDate() + 1);
    }
  } else {
    // If no end time specified, assume event duration is 3 hours or end of day (23:59:59)
    endDate.setHours(23, 59, 59, 999);
  }

  return { start: startDate, end: endDate };
}

/**
 * Checks if an event is in the past (previous event)
 */
export function isPastEvent(event: ERPEvent): boolean {
  if (event.status?.toLowerCase() === 'completed' || event.status?.toLowerCase() === 'past') {
    return true;
  }
  const { end } = getEventDateTimes(event);
  if (!end) return false;
  return end.getTime() < Date.now();
}

/**
 * Checks if an event is currently live (happening right now)
 */
export function isLiveEvent(event: ERPEvent): boolean {
  const { start, end } = getEventDateTimes(event);
  if (!start || !end) return false;
  const now = Date.now();
  return now >= start.getTime() && now <= end.getTime();
}

/**
 * Determines comprehensive status badge metadata for an event
 */
export function getEventStatusInfo(event: ERPEvent) {
  const isLeave =
    event.employee_status?.toLowerCase() === 'on leave' ||
    event.employee_status?.toLowerCase() === 'on_leave' ||
    event.status?.toLowerCase() === 'on leave' ||
    event.status?.toLowerCase() === 'on_leave';

  if (isLeave) {
    return {
      label: 'On Leave',
      variant: 'warning' as const,
      colorClasses: 'bg-amber-500/15 text-amber-600 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-400',
      icon: ClockAlert,
      isLeave: true,
      isPast: isPastEvent(event),
      isLive: false,
    };
  }

  if (isPastEvent(event)) {
    return {
      label: 'Completed',
      variant: 'secondary' as const,
      colorClasses: 'bg-zinc-500/15 text-zinc-600 border-zinc-500/30 dark:bg-zinc-700/40 dark:text-zinc-300',
      icon: CheckCircle2,
      isLeave: false,
      isPast: true,
      isLive: false,
    };
  }

  if (isLiveEvent(event)) {
    return {
      label: 'Live Now',
      variant: 'success' as const,
      colorClasses: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40 animate-pulse dark:text-emerald-400',
      icon: Radio,
      isLeave: false,
      isPast: false,
      isLive: true,
    };
  }

  return {
    label: event.status || 'Upcoming',
    variant: 'primary' as const,
    colorClasses: 'bg-primary/10 text-primary border-primary/30',
    icon: Calendar,
    isLeave: false,
    isPast: false,
    isLive: false,
  };
}

/**
 * Formats time range nicely (e.g., "10:00 AM - 1:00 PM")
 */
export function formatEventTime(event: ERPEvent): string {
  if (event.start_time && event.end_time) {
    return `${event.start_time} - ${event.end_time}`;
  }
  if (event.start_time) {
    return event.start_time;
  }
  if (event.time && event.time.trim() && event.time.trim() !== 'Time: TBD') {
    return event.time;
  }
  if (event.event_date) {
    const d = new Date(event.event_date);
    if (!Number.isNaN(d.getTime())) {
      const hours = d.getHours();
      const minutes = d.getMinutes();
      if (hours !== 0 || minutes !== 0) {
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      }
    }
  }
  return 'Time: TBD';
}

/**
 * Local Storage Registrations Storage Helpers
 */
function getAllLocalRegistrations(): Record<string, EventLocalState> {
  try {
    const raw = localStorage.getItem(REGISTRATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function isUserRegisteredForEvent(
  eventId: string | number,
  userIdentifier?: string | null,
  eventData?: ERPEvent
): boolean {
  if (!eventId) return false;
  if (eventData?.is_registered) return true;

  const idStr = String(eventId);
  const identifier = (userIdentifier || '').trim().toLowerCase();
  if (!identifier) return false;

  // 1. Check registered_users from database
  if (
    eventData?.registered_users &&
    eventData.registered_users.some((u: string) => u && u.toLowerCase() === identifier)
  ) {
    return true;
  }

  // 2. Check participants from database
  if (
    eventData?.participants &&
    eventData.participants.some(
      (p: EventParticipant) =>
        (p.email && p.email.toLowerCase() === identifier) ||
        (p.name && p.name.toLowerCase() === identifier)
    )
  ) {
    return true;
  }

  // 3. Check local storage
  const all = getAllLocalRegistrations();
  const eventState = all[idStr];
  if (
    eventState &&
    (eventState.registeredUsers.includes(identifier) ||
      eventState.participants?.some(
        (p: EventParticipant) =>
          (p.email && p.email.toLowerCase() === identifier) ||
          (p.name && p.name.toLowerCase() === identifier)
      ))
  ) {
    return true;
  }

  return false;
}

export function getEventParticipantsList(event: ERPEvent): EventParticipant[] {
  // 1. Get backend participants from database
  const backendParticipants: EventParticipant[] = (event.participants || []).map((p: EventParticipant) => ({
    id: String(p.id || `bp_${Math.random()}`),
    name: p.name || 'Attendee',
    email: p.email || '',
    department: p.department || 'Corporate',
    joinedAt: p.joinedAt || 'Registered',
    passCode: p.passCode,
  }));

  // 2. Get local participants
  const all = getAllLocalRegistrations();
  const local = all[String(event.id)];
  const localList: EventParticipant[] = local?.participants || [];

  // Merge unique by email or id
  const map = new Map<string, EventParticipant>();
  backendParticipants.forEach((p) => {
    const key = (p.email || p.id).toLowerCase();
    map.set(key, p);
  });
  localList.forEach((p) => {
    const key = (p.email || p.id).toLowerCase();
    if (!map.has(key)) {
      map.set(key, p);
    }
  });

  return Array.from(map.values());
}

export function getDynamicAttendeesCount(event: ERPEvent): number {
  const baseAttendees = Number(event.attendees || 0);
  const participants = getEventParticipantsList(event);
  return Math.max(baseAttendees, participants.length);
}

/**
 * Local Storage Attachments / Photos Storage Helpers
 */
function getAllLocalAttachments(): Record<string, EventAttachment[]> {
  try {
    const raw = localStorage.getItem(ATTACHMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getEventAttachments(
  eventId: string | number,
  fallbackAttachments?: EventAttachment[]
): EventAttachment[] {
  const all = getAllLocalAttachments();
  const local = all[String(eventId)] || [];
  const base = fallbackAttachments || [];

  // Merge unique by id
  const map = new Map<string, EventAttachment>();
  base.forEach((item) => map.set(item.id, item));
  local.forEach((item) => map.set(item.id, item));

  return Array.from(map.values());
}

export function saveEventAttachmentLocally(
  eventId: string | number,
  attachment: EventAttachment
): EventAttachment[] {
  const idStr = String(eventId);
  const all = getAllLocalAttachments();
  const list = all[idStr] || [];

  list.unshift(attachment);
  all[idStr] = list;

  try {
    localStorage.setItem(ATTACHMENTS_STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to save local attachment', err);
  }

  return list;
}

export function removeEventAttachmentLocally(
  eventId: string | number,
  attachmentId: string
): EventAttachment[] {
  const idStr = String(eventId);
  const all = getAllLocalAttachments();
  const list = (all[idStr] || []).filter((a) => a.id !== attachmentId);
  all[idStr] = list;
  try {
    localStorage.setItem(ATTACHMENTS_STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to remove local attachment', err);
  }
  return list;
}


export interface RegisterOptions {
  userIdentifier?: string;
  name?: string;
  email?: string;
  department?: string;
  avatar?: string;
  role?: string;
  passCode?: string;
}

export function registerUserForEventLocally(
  eventId: string | number,
  options?: RegisterOptions | string
): void {
  if (!eventId) return;
  const idStr = String(eventId);
  const all = getAllLocalRegistrations();
  const state: EventLocalState = all[idStr] || { registeredUsers: [], addedAttendees: 0, participants: [] };

  let identifier = '';
  let participantObj: EventParticipant | null = null;

  if (typeof options === 'string') {
    identifier = options.trim().toLowerCase();
  } else if (options && typeof options === 'object') {
    identifier = (options.email || options.userIdentifier || options.name || '').trim().toLowerCase();
    participantObj = {
      id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: options.name || 'Confirmed Participant',
      email: options.email || identifier,
      department: options.department || 'Corporate',
      avatar: options.avatar,
      role: options.role || 'Participant',
      joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      passCode: options.passCode,
    };
  }

  if (identifier && !state.registeredUsers.includes(identifier)) {
    state.registeredUsers.push(identifier);
    state.addedAttendees += 1;
  }

  if (participantObj) {
    state.participants = state.participants || [];
    const exists = state.participants.some(
      (p) => (p.email && p.email.toLowerCase() === participantObj!.email.toLowerCase()) || p.name === participantObj!.name
    );
    if (!exists) {
      state.participants.unshift(participantObj);
    }
  }

  all[idStr] = state;
  try {
    localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to save local registration', err);
  }
}

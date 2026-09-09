import type { ERPEvent, EventAttachment } from '@/types/models';
import {
  Calendar,
  CheckCircle2,
  Radio,
  ClockAlert,
} from 'lucide-react';

const REGISTRATIONS_STORAGE_KEY = 'aether_event_registrations_v1';
const ATTACHMENTS_STORAGE_KEY = 'aether_event_attachments_v1';

export interface EventParticipant {
  id: string;
  name: string;
  email: string;
  department?: string;
  avatar?: string;
  role?: string;
  joinedAt: string;
  passCode?: string;
}

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
  if (event.time) {
    return event.time;
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

  // Check event model list
  if (
    identifier &&
    eventData?.registered_users &&
    eventData.registered_users.some((u) => u.toLowerCase() === identifier)
  ) {
    return true;
  }

  const all = getAllLocalRegistrations();
  const eventState = all[idStr];
  if (!eventState) return false;

  if (identifier && eventState.registeredUsers.includes(identifier)) {
    return true;
  }

  return false;
}

export interface RegisterUserParams {
  userIdentifier?: string | null;
  name?: string;
  email?: string;
  department?: string;
  avatar?: string;
  role?: string;
  passCode?: string;
}

export function registerUserForEventLocally(
  eventId: string | number,
  userParams: string | RegisterUserParams
): { newCountOffset: number; success: boolean } {
  if (!eventId) return { newCountOffset: 0, success: false };
  const idStr = String(eventId);

  const identifier =
    typeof userParams === 'string'
      ? userParams.trim().toLowerCase()
      : (userParams.email || userParams.userIdentifier || userParams.name || 'current_user')
          .trim()
          .toLowerCase();

  const all = getAllLocalRegistrations();
  const current = all[idStr] || { registeredUsers: [], addedAttendees: 0, participants: [] };
  if (!current.participants) current.participants = [];

  if (current.registeredUsers.includes(identifier)) {
    return { newCountOffset: current.addedAttendees, success: false };
  }

  current.registeredUsers.push(identifier);
  current.addedAttendees += 1;

  const displayName =
    typeof userParams === 'object' && userParams.name
      ? userParams.name
      : typeof userParams === 'object' && userParams.email
        ? userParams.email.split('@')[0]
        : identifier.includes('@')
          ? identifier.split('@')[0]
          : identifier;

  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const participant: EventParticipant = {
    id: `part_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
    email: typeof userParams === 'object' && userParams.email ? userParams.email : identifier,
    department: typeof userParams === 'object' ? userParams.department || 'Corporate' : 'Corporate',
    avatar: typeof userParams === 'object' ? userParams.avatar : undefined,
    role: typeof userParams === 'object' ? userParams.role || 'Attendee' : 'Attendee',
    joinedAt: `Joined ${dateFormatted} at ${timeFormatted}`,
    passCode:
      typeof userParams === 'object' && userParams.passCode ? userParams.passCode : undefined,
  };

  current.participants.unshift(participant);
  all[idStr] = current;

  try {
    localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to save local registration', err);
  }

  return { newCountOffset: current.addedAttendees, success: true };
}

const SAMPLE_COLLEAGUES = [
  { name: 'Priya Sharma', email: 'priya.sharma@aether.internal', department: 'Engineering' },
  { name: 'Rahul Verma', email: 'rahul.v@aether.internal', department: 'Product Design' },
  { name: 'Ananya Patel', email: 'ananya.p@aether.internal', department: 'People Operations' },
  { name: 'Vikram Singh', email: 'vikram.s@aether.internal', department: 'Finance' },
  { name: 'Neha Gupta', email: 'neha.g@aether.internal', department: 'Marketing' },
  { name: 'Rohan Mehta', email: 'rohan.m@aether.internal', department: 'Engineering' },
  { name: 'Aarav Nair', email: 'aarav.n@aether.internal', department: 'Operations' },
];

export function getEventParticipantsList(event: ERPEvent): EventParticipant[] {
  const all = getAllLocalRegistrations();
  const local = all[String(event.id)];
  const localList = local?.participants || [];

  // If we already have local registrations, return them
  if (localList.length > 0) {
    return localList;
  }

  // Otherwise, if attendees count > 0, generate matching seed participants for realistic presentation
  const baseAttendees = Number(event.attendees || 0);
  if (baseAttendees <= 0) {
    return [];
  }

  const list: EventParticipant[] = [];
  const countToGenerate = Math.min(baseAttendees, SAMPLE_COLLEAGUES.length);

  for (let i = 0; i < countToGenerate; i++) {
    const person = SAMPLE_COLLEAGUES[i % SAMPLE_COLLEAGUES.length];
    list.push({
      id: `seed_${event.id}_${i}`,
      name: person.name,
      email: person.email,
      department: person.department,
      role: i === 0 && event.author_department ? `${event.author_department} Lead` : 'Confirmed Attendee',
      joinedAt: 'Registered',
    });
  }

  return list;
}

export function getDynamicAttendeesCount(event: ERPEvent): number {
  const baseAttendees = Number(event.attendees || 0);
  const all = getAllLocalRegistrations();
  const local = all[String(event.id)];
  const added = local?.addedAttendees || 0;
  return baseAttendees + added;
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

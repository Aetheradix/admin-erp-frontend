import type { JoinDateInfo } from '../types';
import { FALLBACKS } from '../constants';

export function formatJoinDate(
  rawVal: string | number | Date | null | undefined,
  officeTimezone?: string | null
): JoinDateInfo {
  const timezone = officeTimezone || FALLBACKS.DEFAULT_TIMEZONE;

  if (!rawVal) {
    return {
      dateFormatted: 'Official Member',
      timeFormatted: '10:00 AM',
      timezone,
      fullDateTime: 'Active verified employee in company database',
    };
  }

  const d = new Date(rawVal);
  if (Number.isNaN(d.getTime())) {
    return {
      dateFormatted: String(rawVal),
      timeFormatted: '10:00 AM',
      timezone,
      fullDateTime: `${rawVal} (${timezone})`,
    };
  }

  const dateFormatted = d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const timeFormatted = d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return {
    dateFormatted,
    timeFormatted,
    timezone,
    fullDateTime: `${dateFormatted} at ${timeFormatted} (${timezone})`,
  };
}

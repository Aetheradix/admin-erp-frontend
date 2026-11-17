import type { DetailTab } from './types';

export const NODE_SIZES = {
  CENTRAL: { width: 300, height: 176 },
  SECONDARY: { width: 250, height: 136 },
  SUB: { width: 220, height: 120 },
  EMPTY: { width: 270, height: 96 },
} as const;

export const GAPS = {
  ROW: 56,
  CHILD_COL: 20,
  SUB_COL: 14,
} as const;

export const ZOOM_LIMITS = {
  MIN: 0.35,
  MAX: 1.8,
  DEFAULT: 0.9,
  FIT_MIN: 0.45,
  FIT_MAX: 1.0,
  STEP: 1.2,
  CANVAS_PADDING: 48,
} as const;

export const DETAIL_TABS: Array<{ id: DetailTab; label: string }> = [
  { id: 'contact', label: 'Contact & Work' },
  { id: 'organization', label: 'Organization' },
  { id: 'skills', label: 'Skills & Role' },
];

export const FALLBACKS = {
  PHONE: 'Not available',
  DEFAULT_WORKING_HOURS: '10:00 AM – 05:00 PM',
  DEFAULT_TIMEZONE: 'Asia/Kolkata',
  COMPANY_NAME: 'SFA Technologies',
  COMPANY_ADDRESS: '28, Chetak Bridge, Sector A, Kasturba Nagar, Bhopal, Madhya Pradesh 462011',
  HQ_LATITUDE: 23.2323,
  HQ_LONGITUDE: 77.4385,
  HQ_RADIUS: 100,
  NO_EMAIL: 'No email registered',
  GENERAL_DEPT: 'General',
  EMPLOYEE_ROLE: 'Member',
} as const;

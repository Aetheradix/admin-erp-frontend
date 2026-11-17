import type { DetailTab } from './types';

export const NODE_SIZES = {
  CENTRAL: { width: 340, height: 200 },
  SECONDARY: { width: 300, height: 152 },
  SUB: { width: 270, height: 136 },
  EMPTY: { width: 320, height: 110 },
} as const;

export const GAPS = {
  ROW: 76,
  CHILD_COL: 32,
  SUB_COL: 20,
} as const;

export const ZOOM_LIMITS = {
  MIN: 0.4,
  MAX: 1.8,
  DEFAULT: 1.0,
  FIT_MIN: 0.65,
  FIT_MAX: 1.05,
  STEP: 1.2,
  CANVAS_PADDING: 120,
} as const;

export const DETAIL_TABS: Array<{ id: DetailTab; label: string }> = [
  { id: 'contact', label: 'Contact & Work' },
  { id: 'organization', label: 'Organization' },
  { id: 'skills', label: 'Skills & Role' },
];

export const FALLBACKS = {
  PHONE: 'Not available',
  DEFAULT_WORKING_HOURS: '09:30 AM – 06:30 PM',
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

import type { OfficeFormData } from './types';

export const EMPTY_OFFICE_FORM: OfficeFormData = {
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  radius: 100,
  timezone: 'Asia/Kolkata',
  is_active: true,
  is_hq: false,
};

export const DEFAULT_OFFICE_TIMEZONE = 'Asia/Kolkata';

import type { Office } from '@/store/api/attendanceSlice';
import { DEFAULT_OFFICE_TIMEZONE } from './constants';
import type { OfficeFormData } from './types';

export function officeToFormData(office: Office): OfficeFormData {
  const active = office.is_active ?? office.isActive ?? true;
  const isHq = Boolean(office.is_hq ?? office.isHq);
  return {
    id: office.id,
    name: office.name,
    address: office.address || '',
    latitude: office.latitude,
    longitude: office.longitude,
    radius: office.radius,
    timezone: office.timezone || DEFAULT_OFFICE_TIMEZONE,
    is_active: active,
    is_hq: isHq,
  };
}

export interface OfficeValidationIssue {
  severity: 'warn' | 'error';
  detail: string;
}

export function validateOfficeForm(formData: OfficeFormData): OfficeValidationIssue | null {
  if (!formData.name.trim()) {
    return { severity: 'warn', detail: 'Office name is required.' };
  }
  if (formData.latitude === '' || formData.longitude === '') {
    return { severity: 'warn', detail: 'Latitude and longitude coordinates are required.' };
  }

  const lat = Number(formData.latitude);
  const lon = Number(formData.longitude);

  if (isNaN(lat) || lat < -90 || lat > 90) {
    return { severity: 'error', detail: 'Latitude must be between -90 and 90.' };
  }
  if (isNaN(lon) || lon < -180 || lon > 180) {
    return { severity: 'error', detail: 'Longitude must be between -180 and 180.' };
  }
  if (formData.radius < 20 || formData.radius > 5000) {
    return { severity: 'error', detail: 'Radius must be between 20 and 5000 meters.' };
  }
  return null;
}

export function buildOfficePayload(formData: OfficeFormData, latitude: number, longitude: number) {
  return {
    name: formData.name.trim(),
    address: formData.address.trim(),
    latitude,
    longitude,
    radius: Number(formData.radius),
    timezone: formData.timezone,
    is_active: formData.is_active,
    isActive: formData.is_active,
    is_hq: Boolean(formData.is_hq),
  };
}

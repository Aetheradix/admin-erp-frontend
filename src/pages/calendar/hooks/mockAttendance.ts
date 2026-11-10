export type { AttendanceRecord } from '@/types/models';

export interface AttendanceRequest {
  id: string;
  type: 'WFH' | 'Day Off' | 'Sick Leave';
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
  startDate: string;
  endDate: string;
  appliedDate: string;
}

export const mockAttendance: import('@/types/models').AttendanceRecord[] = [];

export const mockRequests: AttendanceRequest[] = [];

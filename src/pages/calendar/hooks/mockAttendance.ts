export interface AttendanceRecord {
  id: string;
  date: string;
  type: 'Work from Office' | 'Work from Home' | 'On Leave' | 'Holiday';
  checkIn?: string;
  checkOut?: string;
}

export interface AttendanceRequest {
  id: string;
  type: 'WFH' | 'Day Off' | 'Sick Leave';
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
  startDate: string;
  endDate: string;
  appliedDate: string;
}

export const mockAttendance: AttendanceRecord[] = [
  { id: '1', date: '2026-03-01', type: 'Work from Office', checkIn: '09:05', checkOut: '18:10' },
  { id: '2', date: '2026-03-02', type: 'Work from Office', checkIn: '08:55', checkOut: '17:50' },
  { id: '3', date: '2026-03-03', type: 'Work from Home', checkIn: '09:00', checkOut: '18:00' },
  { id: '4', date: '2026-03-04', type: 'Work from Home', checkIn: '09:15', checkOut: '18:05' },
  { id: '5', date: '2026-03-05', type: 'Work from Office', checkIn: '08:50', checkOut: '18:30' },
  { id: '6', date: '2026-03-08', type: 'Holiday' }, // Sunday
  { id: '7', date: '2026-03-09', type: 'Work from Office', checkIn: '09:00', checkOut: '18:00' },
];

export const mockRequests: AttendanceRequest[] = [
  {
    id: 'req1',
    type: 'WFH',
    status: 'Approved',
    reason: 'Family visit from hometown',
    startDate: '2026-03-03',
    endDate: '2026-03-04',
    appliedDate: '2026-02-28',
  },
  {
    id: 'req2',
    type: 'Day Off',
    status: 'Pending',
    reason: 'Personal errands and documentation',
    startDate: '2026-03-25',
    endDate: '2026-03-25',
    appliedDate: '2026-03-20',
  }
];

export type { GuestPass } from '@/types/models';

export const mockGuestPasses: import('@/types/models').GuestPass[] = [
  {
    id: 'GP1',
    guestName: 'Robert Vance',
    hostName: 'Sarah Chen',
    purpose: 'Technical Interview',
    visitDate: '2026-03-22',
    expiryDate: '2026-03-22T18:00:00',
    status: 'Active',
    accessCode: 'AX-9921-V',
  },
  {
    id: 'GP2',
    guestName: 'Emily Blunt',
    hostName: 'Marcus Bell',
    purpose: 'Vendor Consultation',
    visitDate: '2026-03-25',
    expiryDate: '2026-03-25T14:00:00',
    status: 'Pending',
    accessCode: 'AX-1025-E',
  },
];

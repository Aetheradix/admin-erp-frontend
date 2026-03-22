export interface Grievance {
  id: string;
  title: string;
  category: 'Work Environment' | 'Management' | 'Harassment' | 'Software/Tools' | 'Other';
  description: string;
  date: string;
  isAnonymous: boolean;
  status: 'Received' | 'In Review' | 'Resolved' | 'Closed';
  response?: string;
}

export const mockGrievances: Grievance[] = [
  {
    id: 'G1',
    title: 'Keyboard noise in open office',
    category: 'Work Environment',
    description: 'The mechanical keyboards in the engineering bay are very loud and distracting for those focusing on design work.',
    date: '2026-03-18',
    isAnonymous: true,
    status: 'In Review',
    response: 'We are looking into providing noise-canceling headphones or quiet hours.'
  },
  {
    id: 'G2',
    title: 'Need for better project management tool',
    category: 'Software/Tools',
    description: 'The current tool is slow and lacks task dependencies which we critical for the Aether project.',
    date: '2026-03-20',
    isAnonymous: false,
    status: 'Received'
  }
];

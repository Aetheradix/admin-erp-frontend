export type { Career } from '@/types/models';

export const mockCareers: import('@/types/models').Career[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote / Hybrid (NYC)',
    type: 'Full-time',
    salary: '$140k - $180k',
    description:
      'We are looking for a visionary Frontend Engineer to help us build the next generation of ERP systems with React and TypeScript.',
    requirements: [
      '5+ years of experience with React/TypeScript',
      'Strong understanding of modern CSS and animations',
      'Experience with complex state management',
    ],
    benefits: [
      'Competitive equity package',
      'Health, Dental, and Vision insurance',
      'Flexible PTO',
    ],
    postedDate: '2026-03-20',
    status: 'Open',
  },
  {
    id: '2',
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    salary: '$120k - $160k',
    description:
      'Join our design team to create beautiful, intuitive interfaces for enterprise users.',
    requirements: [
      'Strong portfolio demonstrating UI/UX excellence',
      'Proficiency in Figma and design systems',
      'Experience with motion design is a plus',
    ],
    benefits: [
      'Modern hardware setup stipend',
      'Annual learning & development budget',
      'Remote-first culture',
    ],
    postedDate: '2026-03-18',
    status: 'Open',
  },
  {
    id: '3',
    title: 'Marketing Manager',
    department: 'Marketing',
    location: 'On-site (San Francisco)',
    type: 'Full-time',
    salary: '$110k - $150k',
    description: 'Help us tell the story of Aetheradix to the world and drive our growth strategy.',
    requirements: [
      '4+ years in B2B SaaS marketing',
      'Excellent storytelling and communication skills',
      'Data-driven approach to growth',
    ],
    benefits: ['On-site gourmet meals', 'Gym membership reimbursement', 'Relocation assistance'],
    postedDate: '2026-03-15',
    status: 'Open',
  },
];

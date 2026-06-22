export type { Project } from '@/types/models';

export interface Node {
  id: string;
  name: string;
  role: string;
  parentId?: string;
  image: string;
}

export const mockProjects: import('@/types/models').Project[] = [
  {
    id: 'P1',
    name: 'AetherCore 2.0',
    title: 'AetherCore 2.0',
    client: 'Internal',
    progress: 75,
    status: 'Ongoing',
    category: 'AI',
    leadId: '1',
    startDate: '2024-01-15'
  },
  {
    id: 'P2',
    name: 'Radix Bridge',
    title: 'Radix Bridge',
    client: 'Stellar Corp',
    progress: 100,
    status: 'Completed',
    category: 'Infrastructure',
    leadId: '3',
    startDate: '2024-06-10',
    endDate: '2025-02-15'
  },
  {
    id: 'P3',
    name: 'Lumina UI Kit',
    title: 'Lumina UI Kit',
    client: 'Open Source',
    progress: 20,
    status: 'Ongoing',
    category: 'Web3',
    leadId: '2',
    startDate: '2025-01-01'
  },
  {
    id: 'P4',
    name: 'Legacy Sync',
    title: 'Legacy Sync',
    client: 'Internal',
    progress: 10,
    status: 'Archived',
    category: 'Enterprise',
    leadId: '4',
    startDate: '2023-05-20',
    endDate: '2024-03-10'
  }
];

export const mockHierarchy: Node[] = [
  { id: '1', name: 'Jonathan Reeves', role: 'CEO & Founder', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CEO' },
  { id: '2', name: 'Sarah Chen', role: 'VP Engineering', parentId: '1', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { id: '3', name: 'Marcus Bell', role: 'Design Director', parentId: '1', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
  { id: '4', name: 'Elena Rodriguez', role: 'Lead Architect', parentId: '2', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' },
  { id: '5', name: 'James Wilson', role: 'Product Manager', parentId: '3', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James' }
];

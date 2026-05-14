import { Project } from '../types';

export const mockProjects: Project[] = [
  { id: 'p1', name: 'Website Redesign', status: 'in-progress', progress: 75, team: 'Design', lead: 'Mike Ross', deadline: '2026-06-15', priority: 'High', members: 6 },
  { id: 'p2', name: 'Mobile App v2.0', status: 'in-progress', progress: 45, team: 'Engineering', lead: 'Sarah Chen', deadline: '2026-07-01', priority: 'Critical', members: 12 },
  { id: 'p3', name: 'Q2 Marketing Campaign', status: 'completed', progress: 100, team: 'Marketing', lead: 'Emily Watson', deadline: '2026-05-30', priority: 'Medium', members: 4 },
  { id: 'p4', name: 'Data Migration', status: 'in-progress', progress: 30, team: 'DevOps', lead: 'Tom Baker', deadline: '2026-08-15', priority: 'High', members: 3 },
  { id: 'p5', name: 'Customer Portal', status: 'in-progress', progress: 60, team: 'Product', lead: 'Nina Gupta', deadline: '2026-07-20', priority: 'Medium', members: 8 },
  { id: 'p6', name: 'API v3 Launch', status: 'pending', progress: 10, team: 'Engineering', lead: 'Marcus Johnson', deadline: '2026-09-01', priority: 'High', members: 5 },
  { id: 'p7', name: 'Annual Report', status: 'draft', progress: 0, team: 'Finance', lead: 'David Kim', deadline: '2026-12-31', priority: 'Low', members: 2 },
];

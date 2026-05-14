import { Task } from '../types';

export const mockTasks: Task[] = [
  { id: '1', title: 'Design homepage hero section', assignee: 'Lisa Park', priority: 'High', status: 'completed', project: 'Website Redesign', dueDate: '2026-03-15' },
  { id: '2', title: 'Create component library', assignee: 'Mike Ross', priority: 'Critical', status: 'in-progress', project: 'Website Redesign', dueDate: '2026-04-01' },
  { id: '3', title: 'Build auth module', assignee: 'Sarah Chen', priority: 'High', status: 'in-progress', project: 'Mobile App v2.0', dueDate: '2026-04-15' },
  { id: '4', title: 'Setup CI/CD pipeline', assignee: 'Tom Baker', priority: 'Medium', status: 'todo', project: 'Data Migration', dueDate: '2026-05-01' },
  { id: '5', title: 'Write API documentation', assignee: 'Marcus Johnson', priority: 'Medium', status: 'todo', project: 'API v3 Launch', dueDate: '2026-05-15' },
  { id: '6', title: 'Design email templates', assignee: 'Lisa Park', priority: 'Low', status: 'todo', project: 'Q2 Marketing', dueDate: '2026-06-01' },
  { id: '7', title: 'User testing round 2', assignee: 'Ana Martinez', priority: 'High', status: 'review', project: 'Customer Portal', dueDate: '2026-05-20' },
  { id: '8', title: 'Database schema review', assignee: 'Sarah Chen', priority: 'Critical', status: 'review', project: 'Data Migration', dueDate: '2026-05-10' },
  { id: '9', title: 'Performance audit', assignee: 'Tom Baker', priority: 'High', status: 'in-progress', project: 'Mobile App v2.0', dueDate: '2026-05-25' },
  { id: '10', title: 'Onboarding flow redesign', assignee: 'Mike Ross', priority: 'Medium', status: 'completed', project: 'Customer Portal', dueDate: '2026-04-30' },
];

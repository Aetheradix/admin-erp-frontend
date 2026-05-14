import { Role } from '../types';

export const mockRoles: Role[] = [
  { id: '1', name: 'Super Admin', description: 'Full access to all features', users: 2, color: '#e11d48', permissions: { projects: true, finance: true, users: true, settings: true, reports: true, inventory: true } },
  { id: '2', name: 'Admin', description: 'Administrative access with some restrictions', users: 4, color: '#E8583A', permissions: { projects: true, finance: true, users: true, settings: true, reports: true, inventory: true } },
  { id: '3', name: 'Manager', description: 'Team and project management', users: 12, color: '#0284c7', permissions: { projects: true, finance: false, users: true, settings: false, reports: true, inventory: false } },
  { id: '4', name: 'Developer', description: 'Project and task access', users: 45, color: '#7c3aed', permissions: { projects: true, finance: false, users: false, settings: false, reports: false, inventory: false } },
  { id: '5', name: 'Viewer', description: 'Read-only access to assigned resources', users: 28, color: '#6b635e', permissions: { projects: false, finance: false, users: false, settings: false, reports: true, inventory: false } },
];

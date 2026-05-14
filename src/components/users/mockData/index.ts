import { User } from '../types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'John Doe', email: 'john@acme.com', role: 'Admin', department: 'Management', status: 'active', lastActive: '2 min ago', avatar: 'JD' },
  { id: 'u2', name: 'Sarah Chen', email: 'sarah@acme.com', role: 'Team Lead', department: 'Engineering', status: 'active', lastActive: '5 min ago', avatar: 'SC' },
  { id: 'u3', name: 'Marcus Johnson', email: 'marcus@acme.com', role: 'Developer', department: 'Engineering', status: 'active', lastActive: '1 hour ago', avatar: 'MJ' },
  { id: 'u4', name: 'Emily Watson', email: 'emily@acme.com', role: 'HR Manager', department: 'HR', status: 'active', lastActive: '3 hours ago', avatar: 'EW' },
  { id: 'u5', name: 'Alex Rivera', email: 'alex@acme.com', role: 'Sales Lead', department: 'Sales', status: 'inactive', lastActive: '2 days ago', avatar: 'AR' },
  { id: 'u6', name: 'Lisa Park', email: 'lisa@acme.com', role: 'Designer', department: 'Design', status: 'active', lastActive: '30 min ago', avatar: 'LP' },
  { id: 'u7', name: 'David Kim', email: 'david@acme.com', role: 'Finance Manager', department: 'Finance', status: 'active', lastActive: '1 hour ago', avatar: 'DK' },
  { id: 'u8', name: 'Nina Gupta', email: 'nina@acme.com', role: 'Support Lead', department: 'Support', status: 'pending', lastActive: 'Never', avatar: 'NG' },
];

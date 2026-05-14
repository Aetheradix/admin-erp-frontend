import React from 'react';
import {
  DollarOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  TeamOutlined,
  FileTextOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { DashboardStat, QuickAction, ActiveProject } from '../types';

export const stats: DashboardStat[] = [
  {
    title: 'Total Revenue',
    value: '$284,500',
    icon: React.createElement(DollarOutlined),
    trend: { value: '+12.5%', direction: 'up' },
    color: '#059669',
    bgColor: 'rgba(5, 150, 105, 0.08)',
    accentColor: '#059669',
  },
  {
    title: 'Active Projects',
    value: '24',
    icon: React.createElement(ProjectOutlined),
    trend: { value: '+3 this month', direction: 'up' },
    color: 'var(--primary)',
    bgColor: 'var(--primary-soft)',
    accentColor: 'var(--primary)',
  },
  {
    title: 'Tasks Completed',
    value: '1,847',
    icon: React.createElement(CheckSquareOutlined),
    trend: { value: '+8.2%', direction: 'up' },
    color: '#0284c7',
    bgColor: 'rgba(2, 132, 199, 0.08)',
    accentColor: '#0284c7',
  },
  {
    title: 'Team Members',
    value: '156',
    icon: React.createElement(TeamOutlined),
    trend: { value: '+5 new', direction: 'up' },
    color: '#7c3aed',
    bgColor: 'rgba(124, 58, 237, 0.08)',
    accentColor: '#7c3aed',
  },
];

export const quickActions: QuickAction[] = [
  {
    title: 'New Project',
    icon: React.createElement(ProjectOutlined, { style: { fontSize: 20 } }),
    color: 'var(--primary)',
    bg: 'var(--primary-soft)',
  },
  {
    title: 'Create Invoice',
    icon: React.createElement(FileTextOutlined, { style: { fontSize: 20 } }),
    color: '#0284c7',
    bg: 'rgba(2, 132, 199, 0.08)',
  },
  {
    title: 'Add Member',
    icon: React.createElement(UserAddOutlined, { style: { fontSize: 20 } }),
    color: '#7c3aed',
    bg: 'rgba(124, 58, 237, 0.08)',
  },
  {
    title: 'New Task',
    icon: React.createElement(CheckSquareOutlined, { style: { fontSize: 20 } }),
    color: '#059669',
    bg: 'rgba(5, 150, 105, 0.08)',
  },
];

export const activeProjects: ActiveProject[] = [
  { name: 'Website Redesign', progress: 75, team: 'Design', status: 'On Track' },
  { name: 'Mobile App v2.0', progress: 45, team: 'Engineering', status: 'At Risk' },
  { name: 'Q2 Marketing Campaign', progress: 90, team: 'Marketing', status: 'On Track' },
  { name: 'Data Migration', progress: 30, team: 'DevOps', status: 'Behind' },
  { name: 'Customer Portal', progress: 60, team: 'Product', status: 'On Track' },
];

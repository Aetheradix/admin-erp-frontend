import { ReactNode } from 'react';

export interface DashboardStat {
  title: string;
  value: string;
  icon: ReactNode;
  trend: { value: string; direction: 'up' | 'down' };
  color: string;
  bgColor: string;
  accentColor: string;
}

export interface ActivityItem {
  color: string;
  children: ReactNode;
}

export interface QuickAction {
  title: string;
  icon: ReactNode;
  color: string;
  bg: string;
}

export interface ActiveProject {
  name: string;
  progress: number;
  team: string;
  status: 'On Track' | 'At Risk' | 'Behind';
}

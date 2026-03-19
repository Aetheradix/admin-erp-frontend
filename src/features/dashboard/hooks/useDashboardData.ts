import { useMemo } from 'react';
import { Lock } from 'lucide-react';

export const useDashboardData = () => {
  const stats = useMemo(() => [
    {
      icon: Lock,
      value: '$ 21,339',
      label: 'Total budget of all projects',
      trend: 'week',
      trendValue: '+14%'
    },
    {
      icon: Lock,
      value: '+ 21,339',
      label: 'Total number of completed tasks',
      trend: 'today',
      trendValue: '+178'
    }
  ], []);

  const projects = useMemo(() => [
    {
      title: 'Decem App',
      category: 'Finance',
      amount: '$ 391,991',
      tasksCount: 908,
      colorClass: 'bg-blue-600 shadow-blue-900/20',
      members: ['A', 'B'],
      extraMembers: 12
    },
    {
      title: 'SkyLux',
      category: 'Education',
      amount: '$ 51,792',
      tasksCount: 12,
      colorClass: 'bg-orange-500 shadow-orange-900/20',
      members: ['C', 'D', 'E']
    },
    {
      title: 'DushMash',
      category: 'Finance',
      amount: '$ 31,955',
      tasksCount: 32,
      colorClass: 'bg-purple-500 shadow-purple-900/20'
    },
    {
      title: 'Biofarm',
      category: 'Healthcare',
      amount: '$ 11,538',
      tasksCount: 19,
      colorClass: 'bg-emerald-500 shadow-emerald-900/20',
      members: ['F'],
      extraMembers: 4
    },
    {
      title: 'PAD move',
      category: 'Travel',
      amount: '$ 21,688',
      tasksCount: 35,
      colorClass: 'bg-rose-500 shadow-rose-900/20',
      members: ['G', 'H'],
      extraMembers: 2
    }
  ], []);

  const chartData = useMemo(() => [
    { label: 'Jan', value: 30 },
    { label: 'Feb', value: 40 },
    { label: 'Mar', value: 35 },
    { label: 'Apr', value: 20 },
    { label: 'May', value: 15 },
    { label: 'Jun', value: 60 },
    { label: 'Jul', value: 45 },
    { label: 'Aug', value: 100 },
    { label: 'Sep', value: 30 },
    { label: 'Oct', value: 40 }
  ], []);

  return {
    stats,
    projects,
    chartData
  };
};

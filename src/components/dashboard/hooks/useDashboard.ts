import { useState, useEffect } from 'react';
import { DashboardStat, QuickAction, ActiveProject } from '../types';
import { stats as mockStats, quickActions as mockActions, activeProjects as mockProjects } from '../mockData';

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [activeProjects, setActiveProjects] = useState<ActiveProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        setStats(mockStats);
        setQuickActions(mockActions);
        setActiveProjects(mockProjects);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return {
    stats,
    quickActions,
    activeProjects,
    loading,
  };
};

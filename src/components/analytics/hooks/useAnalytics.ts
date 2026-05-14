import { useState, useEffect } from 'react';
import { Metric, Department, Report } from '../types';
import { topMetrics as mockMetrics, departmentPerformance as mockDepts, recentReports as mockReports } from '../mockData';

export const useAnalytics = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        setMetrics(mockMetrics);
        setDepartments(mockDepts);
        setReports(mockReports);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return {
    metrics,
    departments,
    reports,
    loading,
  };
};

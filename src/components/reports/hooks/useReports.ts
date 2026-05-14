import { useState, useEffect, useMemo } from 'react';
import { AnalyticsReport } from '../types';
import { mockReports } from '../mockData';

export const useReports = () => {
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        setReports(mockReports);
      } catch (error) {
        console.error('Failed to fetch reports', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()));
  }, [reports, search]);

  return {
    reports: filteredReports,
    totalReports: reports.length,
    loading,
    search,
    setSearch,
  };
};

import { useState, useEffect, useMemo } from 'react';
import { AuditEntry } from '../types';
import { mockAuditLogs } from '../mockData';

export const useAuditLog = () => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        setLogs(mockAuditLogs);
      } catch (error) {
        console.error('Failed to fetch logs', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch = l.action.toLowerCase().includes(search.toLowerCase()) || l.user.toLowerCase().includes(search.toLowerCase());
      const matchSeverity = !severityFilter || l.severity === severityFilter;
      return matchSearch && matchSeverity;
    });
  }, [logs, search, severityFilter]);

  return {
    logs: filteredLogs,
    loading,
    search,
    setSearch,
    setSeverityFilter,
  };
};

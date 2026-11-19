import { useState } from 'react';
import type { AuditLogEntry } from '@/services/auditService';
import type { AuditView } from '../types';

export function useAuditLogState() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [activeView, setActiveView] = useState<AuditView>('stream');

  return {
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    selectedLog,
    setSelectedLog,
    activeView,
    setActiveView,
  };
}

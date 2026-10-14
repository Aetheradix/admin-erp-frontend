import { PageHeader } from '@/components/ui/composed/PageHeader';
import { motion } from 'framer-motion';
import {
  Clock,
  User,
  Terminal,
  Search,
  Shield,
  UserPlus,
  KeyRound,
  FileText,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Table, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getAuditLogs, type AuditLogEntry } from '@/services/auditService';

const statusColors: Record<string, string> = {
  Success: 'text-success bg-success/10 border-success/20',
  Warning: 'text-warning bg-warning/10 border-warning/20',
  Critical: 'text-error bg-error/10 border-error/20',
  Info: 'text-info bg-info/10 border-info/20',
};

const categoryIcons: Record<string, any> = {
  invitation: UserPlus,
  profile: FileText,
  security: KeyRound,
  user_management: User,
  admin: Shield,
};

export function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>(() => getAuditLogs());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  // Sync when audit logs update across the application
  useEffect(() => {
    const handleUpdate = () => {
      setLogs(getAuditLogs());
    };
    window.addEventListener('aether_audit_logs_updated', handleUpdate);
    return () => window.removeEventListener('aether_audit_logs_updated', handleUpdate);
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      // Category filter
      if (categoryFilter !== 'all' && l.category !== categoryFilter) return false;
      // Status filter
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      // Text search
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        l.action.toLowerCase().includes(term) ||
        l.user.toLowerCase().includes(term) ||
        l.userEmail.toLowerCase().includes(term) ||
        l.target.toLowerCase().includes(term) ||
        (l.details && l.details.toLowerCase().includes(term))
      );
    });
  }, [logs, search, categoryFilter, statusFilter]);

  const columns: ColumnsType<AuditLogEntry> = [
    {
      title: 'Activity / Event',
      key: 'action',
      render: (_, record) => {
        const Icon = categoryIcons[record.category] || Terminal;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Icon size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">{record.action}</span>
              {record.details && (
                <span className="text-[11px] text-muted line-clamp-1 max-w-xs">
                  {record.details}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Actor (Initiator)',
      key: 'actor',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-surface-subtle flex items-center justify-center text-muted">
            <User size={12} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-foreground">{record.user}</span>
            <span className="text-[10px] text-muted">{record.userEmail}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Target Entity',
      key: 'target',
      render: (_, record) => (
        <span className="px-2.5 py-1 bg-surface-subtle border border-border-subtle rounded-lg text-xs font-medium text-foreground tracking-wide">
          {record.target}
        </span>
      ),
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (ts) => (
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Clock size={12} />
          <span>{ts ? new Date(ts).toLocaleString() : 'Just now'}</span>
        </div>
      ),
    },
    {
      title: 'Origin IP',
      dataIndex: 'ip',
      key: 'ip',
      render: (ip) => <span className="text-[11px] font-mono text-muted/70">{ip}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
            statusColors[status] || 'text-muted border-border-subtle'
          }`}>
          {status}
        </span>
      ),
    },
    {
      title: 'Details',
      key: 'view',
      width: 80,
      render: (_, record) => (
        <button
          onClick={() => setSelectedLog(record)}
          className="text-xs font-bold text-primary hover:underline cursor-pointer">
          View
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Security & System Audit Log"
        description="Immutable chronological record of invitations, user profile updates, authentication changes, and system administration events."
        breadcrumbs={[
          { label: 'Home', url: '/' },
          { label: 'Settings', url: '/settings' },
          { label: 'Audit Log' },
        ]}
      />

      {/* Search and Category Filters */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-soft p-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search logs by action, actor, email, or target..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-subtle border-none text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-muted uppercase tracking-wider mr-1">
              Status:
            </span>
            {['all', 'Success', 'Warning', 'Critical'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-surface-subtle text-muted hover:text-foreground'
                }`}>
                {st === 'all' ? 'All Outcomes' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 border-t border-border-subtle/60 pt-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Activities', icon: Terminal },
            { id: 'invitation', label: 'User Invitations', icon: UserPlus },
            { id: 'profile', label: 'Profile Changes', icon: FileText },
            { id: 'security', label: 'Security & Password', icon: KeyRound },
            { id: 'admin', label: 'Administration', icon: Shield },
          ].map((cat) => {
            const Icon = cat.icon;
            const active = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  active
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-surface-subtle text-muted hover:text-foreground hover:bg-surface-subtle/80'
                }`}>
                <Icon size={13} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl border border-border-subtle shadow-soft overflow-hidden">
        <div className="p-6 pb-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal size={18} className="text-primary" />
            <span className="text-sm font-black text-foreground uppercase tracking-wider">
              System Activity Stream
            </span>
          </div>
          <span className="text-xs font-bold text-muted">
            {filteredLogs.length} {filteredLogs.length === 1 ? 'event' : 'events'} recorded
          </span>
        </div>

        <Table
          columns={columns}
          dataSource={filteredLogs}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          className="premium-table"
          locale={{
            emptyText: (
              <div className="py-12 text-center text-muted text-sm">
                No audit entries match the selected filters.
              </div>
            ),
          }}
        />
      </motion.div>

      {/* Detail Modal */}
      <Modal
        open={!!selectedLog}
        onCancel={() => setSelectedLog(null)}
        footer={null}
        title={
          <div className="flex items-center gap-2 text-base font-black text-foreground pt-2">
            <Shield size={18} className="text-primary" />
            <span>Audit Event Details</span>
          </div>
        }
        className="rounded-2xl overflow-hidden">
        {selectedLog && (
          <div className="flex flex-col gap-5 pt-3 text-xs">
            <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle space-y-2">
              <div className="flex justify-between">
                <span className="text-muted font-semibold">Event ID:</span>
                <span className="font-mono text-foreground font-bold">{selectedLog.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted font-semibold">Action:</span>
                <span className="font-bold text-foreground">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted font-semibold">Category:</span>
                <span className="font-bold text-primary uppercase text-[10px]">
                  {selectedLog.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted font-semibold">Outcome:</span>
                <span
                  className={`font-black uppercase text-[10px] px-2 py-0.5 rounded ${
                    statusColors[selectedLog.status]
                  }`}>
                  {selectedLog.status}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                Actor & Target
              </span>
              <div className="p-3 rounded-xl border border-border-subtle space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted">Initiated By:</span>
                  <span className="font-semibold text-foreground">
                    {selectedLog.user} ({selectedLog.userEmail})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Target Resource:</span>
                  <span className="font-semibold text-foreground">{selectedLog.target}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Origin IP Address:</span>
                  <span className="font-mono text-muted">{selectedLog.ip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Timestamp:</span>
                  <span className="text-foreground">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {selectedLog.details && (
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                  Description / Event Log
                </span>
                <p className="p-3 rounded-xl bg-surface-subtle text-foreground/90 leading-relaxed border border-border-subtle">
                  {selectedLog.details}
                </p>
              </div>
            )}

            {/* Changes Diff Table if applicable */}
            {selectedLog.changes && selectedLog.changes.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                  Recorded Attribute Changes
                </span>
                <div className="rounded-xl border border-border-subtle overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-subtle/60 border-b border-border-subtle font-bold text-muted text-[10px] uppercase">
                      <tr>
                        <th className="p-2.5">Field</th>
                        <th className="p-2.5">Previous Value</th>
                        <th className="p-2.5">New Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {selectedLog.changes.map((ch, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-bold text-foreground">{ch.field}</td>
                          <td className="p-2.5 text-error font-medium line-through">
                            {String(ch.from || '(empty)')}
                          </td>
                          <td className="p-2.5 text-success font-semibold">
                            {String(ch.to || '(empty)')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

import { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  MessageSquare,
  Home,
  Building2,
  Search,
  Table as TableIcon,
  LayoutGrid,
  Eye,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Sun,
} from 'lucide-react';
import { formatDate, parseDateOnly } from '@/utils/date';
import { cn } from '@/utils/cn';
import type { AttendanceRequest } from '@/types/models';

interface RecentRequestsProps {
  requests: AttendanceRequest[];
  onRequestClick?: (request: AttendanceRequest) => void;
  title?: string;
  subtitle?: string;
}

const calculateDays = (startStr?: string, endStr?: string): number => {
  if (!startStr) return 1;
  const start = parseDateOnly(startStr);
  const end = parseDateOnly(endStr || startStr);
  if (!start || !end) return 1;
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 1;
};

export const RecentRequests = ({
  requests,
  onRequestClick,
  title = 'Recent Requests',
  subtitle = 'Track the status and history of WFH and Leave applications',
}: RecentRequestsProps) => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>(
    'all'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filter and search
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const status = (req.status || '').toLowerCase();
      if (statusFilter !== 'all' && status !== statusFilter) {
        return false;
      }
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        (req.username || '').toLowerCase().includes(term) ||
        (req.department || '').toLowerCase().includes(term) ||
        (req.type || '').toLowerCase().includes(term) ||
        (req.reason || '').toLowerCase().includes(term)
      );
    });
  }, [requests, statusFilter, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / pageSize) || 1;
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRequests.slice(start, start + pageSize);
  }, [filteredRequests, currentPage, pageSize]);

  // Counts for tabs
  const counts = useMemo(() => {
    const pending = requests.filter((r) => (r.status || '').toLowerCase() === 'pending').length;
    const approved = requests.filter((r) => (r.status || '').toLowerCase() === 'approved').length;
    const rejected = requests.filter((r) => (r.status || '').toLowerCase() === 'rejected').length;
    return { all: requests.length, pending, approved, rejected };
  }, [requests]);

  const getStatusBadge = (status?: string) => {
    const lower = (status || '').toLowerCase();
    switch (lower) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
            <CheckCircle2 size={12} /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-700 border border-rose-500/30">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Pending
          </span>
        );
    }
  };

  const getTypeIcon = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('home')) return <Home size={13} className="text-blue-500 shrink-0" />;
    if (lower.includes('holiday')) return <Sun size={13} className="text-amber-500 shrink-0" />;
    return <CalendarIcon size={13} className="text-primary shrink-0" />;
  };

  return (
    <div className="bg-white rounded-[40px] p-8 border border-border-subtle shadow-soft transition-all duration-500 hover:shadow-lg overflow-hidden flex flex-col gap-6">
      {/* Header with Title and View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-subtle/50">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black text-foreground uppercase tracking-widest">
              {title}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-surface-subtle text-muted border border-border-subtle">
              {requests.length} Total
            </span>
          </div>
          <span className="text-xs font-bold text-muted italic">{subtitle}</span>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface-subtle border border-border-subtle shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer',
              viewMode === 'table'
                ? 'bg-white text-primary shadow-xs'
                : 'text-muted hover:text-foreground'
            )}
            title="Tabular View">
            <TableIcon size={14} />
            <span>Table</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer',
              viewMode === 'grid'
                ? 'bg-white text-primary shadow-xs'
                : 'text-muted hover:text-foreground'
            )}
            title="Cards View">
            <LayoutGrid size={14} />
            <span>Cards</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { key: 'all', label: 'All', count: counts.all },
              { key: 'pending', label: 'Pending', count: counts.pending },
              { key: 'approved', label: 'Approved', count: counts.approved },
              { key: 'rejected', label: 'Rejected', count: counts.rejected },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setStatusFilter(tab.key);
                setCurrentPage(1);
              }}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap',
                statusFilter === tab.key
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-subtle/80 text-muted hover:text-foreground hover:bg-surface-elevated'
              )}>
              <span>{tab.label}</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-md text-[10px]',
                  statusFilter === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-muted border border-border-subtle'
                )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px] max-w-xs w-full sm:w-auto">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search employee, type, reason..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-xs font-bold text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Main Content: Tabular or Cards */}
      {viewMode === 'table' ? (
        <div className="rounded-3xl border border-border-subtle overflow-hidden bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-subtle/50 text-[10px] font-black uppercase text-muted tracking-widest">
                  <th className="py-4 px-6">Employee</th>
                  <th className="py-4 px-6">Request Type</th>
                  <th className="py-4 px-6">Schedule Duration</th>
                  <th className="py-4 px-6">Reason</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Feedback</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/40 text-xs font-bold">
                {paginatedRequests.map((request) => {
                  const days = calculateDays(request.start_date, request.end_date);
                  const isSingleDay =
                    !request.end_date ||
                    formatDate(request.end_date) === formatDate(request.start_date);

                  return (
                    <tr
                      key={request.id}
                      onClick={() => onRequestClick?.(request)}
                      className="hover:bg-primary/5 transition-colors cursor-pointer group">
                      {/* Employee Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-primary to-primary-light text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {(request.username || 'E').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-black text-foreground text-xs block truncate group-hover:text-primary transition-colors">
                              {request.username || 'Employee'}
                            </span>
                            <span className="text-[10px] text-muted font-medium flex items-center gap-1 truncate">
                              {request.department && <Building2 size={10} className="shrink-0" />}
                              {request.department || request.email || 'Team Member'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Request Type */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-surface-subtle text-foreground border border-border-subtle">
                          {getTypeIcon(request.type)}
                          <span className="truncate">{request.type}</span>
                        </span>
                      </td>

                      {/* Schedule Duration */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-foreground font-black text-xs">
                            <CalendarIcon size={12} className="text-primary shrink-0" />
                            <span>
                              {request.start_date ? formatDate(request.start_date) : '---'}
                              {!isSingleDay && request.end_date
                                ? ` to ${formatDate(request.end_date)}`
                                : ''}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted font-bold ml-4">
                            {days} {days === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="py-4 px-6 max-w-xs">
                        <p className="text-xs font-medium text-foreground/80 line-clamp-2 italic leading-relaxed">
                          "{request.reason || 'No description provided.'}"
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>

                      {/* Admin Feedback */}
                      <td className="py-4 px-6 max-w-xs">
                        {request.admin_comment ? (
                          <div className="flex items-center gap-1.5 text-[11px] text-foreground/80 italic line-clamp-1">
                            <MessageSquare size={12} className="text-primary shrink-0" />
                            <span className="truncate">"{request.admin_comment}"</span>
                          </div>
                        ) : (
                          <span className="text-muted/50 text-xs font-medium">—</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRequestClick?.(request);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black text-primary bg-primary/10 hover:bg-primary hover:text-white transition-all cursor-pointer shadow-2xs">
                          <Eye size={12} />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-muted font-bold">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <CalendarIcon size={36} className="text-muted/40" />
                        <p className="text-sm font-black text-foreground">No requests found</p>
                        <p className="text-xs text-muted">
                          {searchTerm
                            ? `No results matching "${searchTerm}". Try adjusting your search or filters.`
                            : 'No attendance or leave requests in this category.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards / Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedRequests.map((request) => {
            const isSingleDay =
              !request.end_date || formatDate(request.end_date) === formatDate(request.start_date);

            return (
              <div
                key={request.id}
                onClick={() => onRequestClick?.(request)}
                className="group relative bg-surface-subtle/50 hover:bg-white rounded-3xl p-6 border border-border-subtle hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    {getStatusBadge(request.status)}
                    <span className="text-[10px] font-black text-primary uppercase bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10 flex items-center gap-1.5">
                      {getTypeIcon(request.type)}
                      {request.type}
                    </span>
                  </div>

                  {request.username && (
                    <div className="flex items-center gap-2 mb-2 text-xs font-black text-foreground">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">
                        {request.username.charAt(0).toUpperCase()}
                      </div>
                      <span>{request.username}</span>
                      {request.department && (
                        <span className="text-[10px] text-muted font-normal">
                          ({request.department})
                        </span>
                      )}
                    </div>
                  )}

                  <h4 className="text-sm font-black text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    "{request.reason || 'No description provided.'}"
                  </h4>
                </div>

                <div className="flex flex-col gap-2 pt-3 border-t border-border-subtle/30 mt-2">
                  <div className="flex items-center justify-between text-[10px] text-muted font-bold">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon size={12} className="text-primary/70 shrink-0" />
                      <span>
                        {request.start_date ? formatDate(request.start_date) : '---'}
                        {!isSingleDay && request.end_date
                          ? ` - ${formatDate(request.end_date)}`
                          : ''}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-surface-subtle text-muted text-[9px] font-black">
                      {calculateDays(request.start_date, request.end_date)}d
                    </span>
                  </div>

                  {request.admin_comment && (
                    <div className="mt-2 p-3 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col gap-1 animate-in slide-in-from-top-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                        <MessageSquare size={10} /> Feedback
                      </span>
                      <p className="text-[10px] font-medium leading-relaxed italic text-foreground/80 line-clamp-2">
                        "{request.admin_comment}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredRequests.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-40">
              <CalendarIcon size={48} />
              <p className="text-sm font-black mt-2">No active requests found.</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle/50 text-xs">
          <span className="text-muted font-bold">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredRequests.length)} of {filteredRequests.length}{' '}
            entries
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="p-2 rounded-xl bg-surface-subtle hover:bg-surface-elevated text-foreground disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer">
              <ChevronLeft size={16} />
            </button>

            <span className="px-3 py-1 rounded-xl bg-surface-subtle text-foreground font-black text-xs">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="p-2 rounded-xl bg-surface-subtle hover:bg-surface-elevated text-foreground disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

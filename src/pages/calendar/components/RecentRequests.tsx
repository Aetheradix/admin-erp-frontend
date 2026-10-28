import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
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
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { formatDate, parseDateOnly } from '@/utils/date';
import { cn } from '@/utils/cn';
import type { AttendanceRequest } from '@/types/models';
import {
  generateDateRange,
  formatDayComponents,
  type DayApproval,
} from '@/types/dayApproval';

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
  const [expandedRequestIds, setExpandedRequestIds] = useState<Record<string | number, boolean>>({});
  const pageSize = 8;

  const toggleExpand = (id: string | number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedRequestIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter and search
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const status = (req.status || '').toLowerCase();
      if (statusFilter !== 'all') {
        if (statusFilter === 'pending' && !status.includes('pending') && !status.includes('partial')) {
          return false;
        }
        if (statusFilter === 'approved' && status !== 'approved') {
          return false;
        }
        if (
          statusFilter === 'rejected' &&
          !status.includes('rejected')
        ) {
          return false;
        }
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
    const pending = requests.filter((r) => {
      const s = (r.status || '').toLowerCase();
      return s === 'pending' || s.includes('partial');
    }).length;
    const approved = requests.filter((r) => (r.status || '').toLowerCase() === 'approved').length;
    const rejected = requests.filter((r) => (r.status || '').toLowerCase().includes('rejected')).length;
    return { all: requests.length, pending, approved, rejected };
  }, [requests]);

  const getStatusBadge = (status?: string) => {
    const lower = (status || '').toLowerCase();
    if (lower === 'approved') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
          <CheckCircle2 size={12} /> Approved
        </span>
      );
    }
    if (lower === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-700 border border-rose-500/30">
          <XCircle size={12} /> Rejected
        </span>
      );
    }
    if (lower === 'pending') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
        <Layers size={11} /> {status}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('home')) return <Home size={13} className="text-blue-500 shrink-0" />;
    if (lower.includes('holiday')) return <Sun size={13} className="text-amber-500 shrink-0" />;
    return <CalendarIcon size={13} className="text-primary shrink-0" />;
  };

  /**
   * Helper to resolve individual day approval records for display.
   */
  const getDayListForRequest = (request: AttendanceRequest): DayApproval[] => {
    const dates = generateDateRange(request.start_date, request.end_date || request.start_date);
    return dates.map((dateStr) => {
      const existing = request.day_approvals?.find((d) => d.date === dateStr);
      if (existing) return existing;
      return {
        id: `day-${request.id}-${dateStr}`,
        leave_request_id: request.id,
        date: dateStr,
        status: ['Approved', 'Rejected'].includes(request.status)
          ? (request.status as 'Approved' | 'Rejected')
          : 'Pending',
        remark: request.admin_comment || null,
        approver_name: request.approver_name || null,
      };
    });
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
                  <th className="py-4 px-4 w-10 text-center"></th>
                  <th className="py-4 px-5">Employee</th>
                  <th className="py-4 px-5">Request Type</th>
                  <th className="py-4 px-5">Schedule Duration</th>
                  <th className="py-4 px-5">Submission Date</th>
                  <th className="py-4 px-5">Reason</th>
                  <th className="py-4 px-5">Overall Status</th>
                  <th className="py-4 px-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/40 text-xs font-bold">
                {paginatedRequests.map((request) => {
                  const days = calculateDays(request.start_date, request.end_date);
                  const isSingleDay =
                    !request.end_date ||
                    formatDate(request.end_date) === formatDate(request.start_date);
                  const isExpanded = Boolean(expandedRequestIds[request.id]);
                  const dayList = getDayListForRequest(request);

                  return (
                    <React.Fragment key={request.id}>
                      <tr
                        onClick={() => toggleExpand(request.id)}
                        className="hover:bg-primary/5 transition-colors cursor-pointer group">
                        {/* Expand / Collapse Icon */}
                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={(e) => toggleExpand(request.id, e)}
                            className="p-1 rounded-lg hover:bg-surface-elevated text-muted hover:text-foreground transition-all cursor-pointer">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </td>

                        {/* Employee Column */}
                        <td className="py-4 px-5">
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
                        <td className="py-4 px-5">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-surface-subtle text-foreground border border-border-subtle">
                            {getTypeIcon(request.type)}
                            <span className="truncate">{request.type}</span>
                          </span>
                        </td>

                        {/* Schedule Duration */}
                        <td className="py-4 px-5">
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

                        {/* Submission Date */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          <span className="text-muted text-[11px] font-medium flex items-center gap-1">
                            <Clock size={11} className="text-muted/60" />
                            {request.created_at ? formatDate(request.created_at) : '---'}
                          </span>
                        </td>

                        {/* Reason */}
                        <td className="py-4 px-5 max-w-xs">
                          <p className="text-xs font-medium text-foreground/80 line-clamp-2 italic leading-relaxed">
                            "{request.reason || 'No description provided.'}"
                          </p>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          {getStatusBadge(request.status)}
                        </td>

                        {/* Action */}
                        <td className="py-4 px-5 text-right whitespace-nowrap">
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

                      {/* ─── Expandable Day-Wise Approval Breakdown Row ─── */}
                      {isExpanded && (
                        <tr className="bg-surface-subtle/40 border-b border-border-subtle/60">
                          <td colSpan={8} className="p-6">
                            <div className="rounded-2xl border border-border-subtle/80 bg-white p-5 shadow-xs flex flex-col gap-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <CalendarIcon size={14} className="text-primary" />
                                  <h5 className="text-xs font-black text-foreground uppercase tracking-wider">
                                    Day-Wise Approval Breakdown
                                  </h5>
                                </div>
                                <span className="text-[10px] text-muted font-bold">
                                  {dayList.length} Day(s) Scheduled
                                </span>
                              </div>

                              <div className="divide-y divide-border-subtle/40 rounded-xl border border-border-subtle overflow-hidden">
                                {dayList.map((day) => {
                                  const { dateFormatted, dayName } = formatDayComponents(day.date);
                                  const dayLower = day.status.toLowerCase();

                                  return (
                                    <div
                                      key={day.date}
                                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-surface-subtle/40 transition-colors">
                                      {/* Date & Day */}
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-surface-subtle flex items-center justify-center text-primary font-black text-xs shrink-0">
                                          {dateFormatted.split(' ')[0]}
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-black text-foreground text-xs">
                                              {dateFormatted}
                                            </span>
                                            <span className="text-[10px] text-muted font-bold">
                                              ({dayName})
                                            </span>
                                          </div>
                                          {day.approver_name && (
                                            <span className="text-[10px] text-muted font-medium flex items-center gap-1">
                                              <ShieldCheck size={10} className="text-primary" />
                                              Decided by {day.approver_name}
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Status Badge */}
                                      <div className="flex items-center gap-3">
                                        {dayLower === 'approved' ? (
                                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-700 border border-emerald-400/40">
                                            <CheckCircle2 size={11} /> Approved
                                          </span>
                                        ) : dayLower === 'rejected' ? (
                                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-700 border border-rose-400/40">
                                            <XCircle size={11} /> Rejected
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-700 border border-amber-400/40">
                                            <Clock size={11} /> Pending
                                          </span>
                                        )}

                                        {/* Manager's Remark for this Day */}
                                        <div className="text-xs italic text-muted max-w-sm min-w-[140px]">
                                          {day.remark ? (
                                            <span className="text-foreground/90 font-medium">
                                              "{day.remark}"
                                            </span>
                                          ) : (
                                            <span className="text-muted/40 font-normal">
                                              No remark
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-muted font-bold">
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
        /* Cards / Grid View with Expandable Day Breakdown */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedRequests.map((request) => {
            const isSingleDay =
              !request.end_date || formatDate(request.end_date) === formatDate(request.start_date);
            const isExpanded = Boolean(expandedRequestIds[request.id]);
            const dayList = getDayListForRequest(request);

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

                  {request.created_at && (
                    <span className="text-[10px] text-muted/70 font-medium">
                      Submitted on {formatDate(request.created_at)}
                    </span>
                  )}

                  {/* Expand / Collapse Day Breakdown Toggle */}
                  <button
                    type="button"
                    onClick={(e) => toggleExpand(request.id, e)}
                    className="flex items-center justify-between mt-2 pt-2 border-t border-border-subtle/40 text-[10px] font-black text-primary hover:underline">
                    <span>View Day-by-Day Status ({dayList.length} days)</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {/* Inline Day-Wise Breakdown in Card */}
                  {isExpanded && (
                    <div
                      className="mt-2 flex flex-col gap-1.5 p-3 rounded-2xl bg-white border border-border-subtle shadow-xs"
                      onClick={(e) => e.stopPropagation()}>
                      {dayList.map((day) => {
                        const { dateFormatted } = formatDayComponents(day.date);
                        const s = day.status.toLowerCase();

                        return (
                          <div
                            key={day.date}
                            className="flex flex-col gap-0.5 pb-1.5 border-b border-border-subtle/30 last:border-none last:pb-0 text-[11px]">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-foreground">{dateFormatted}</span>
                              <span
                                className={cn(
                                  'px-2 py-0.2 rounded-full text-[9px] font-black uppercase',
                                  s === 'approved'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : s === 'rejected'
                                      ? 'bg-rose-50 text-rose-700'
                                      : 'bg-amber-50 text-amber-700'
                                )}>
                                {day.status}
                              </span>
                            </div>
                            {day.remark && (
                              <p className="text-[10px] text-muted italic line-clamp-1">
                                "{day.remark}"
                              </p>
                            )}
                          </div>
                        );
                      })}
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

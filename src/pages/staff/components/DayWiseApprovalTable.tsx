import { useState, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  AlertCircle,
  ShieldCheck,
  CheckCheck,
  Edit2,
  FileText,
  Calendar,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { Dialog } from '@/components/ui/composed/Dialog';
import { showToast } from '@/components/ui/composed/Toast.utils';
import {
  useGetLeaveRequestDaysQuery,
  useApproveLeaveDayMutation,
  useRejectLeaveDayMutation,
  useBulkApproveLeaveMutation,
  useBulkRejectLeaveMutation,
} from '@/store/api/leaveSlice';
import {
  generateDateRange,
  formatDayComponents,
  computeOverallStatus,
  type DayApproval,
} from '@/types/dayApproval';
import type { AttendanceRequest } from '@/types/models';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/date';

interface DayWiseApprovalTableProps {
  request: AttendanceRequest;
  /** If true, action buttons are shown (manager/admin). If false, read-only (employee). */
  isAdmin?: boolean;
  /** Whether to show the top Request Summary box. Default true. */
  showSummary?: boolean;
  /** Called whenever a day action or bulk action completes */
  onDecisionChange?: () => void;
}

const STATUS_CONFIG = {
  Pending: {
    row: 'hover:bg-amber-50/40',
    badge: 'bg-amber-500/10 text-amber-700 border-amber-400/40',
    dot: 'bg-amber-500 animate-pulse',
    icon: <Clock size={12} className="shrink-0" />,
  },
  Approved: {
    row: 'hover:bg-emerald-50/30',
    badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-400/40',
    dot: 'bg-emerald-500',
    icon: <CheckCircle2 size={12} className="shrink-0" />,
  },
  Rejected: {
    row: 'hover:bg-rose-50/30',
    badge: 'bg-rose-500/10 text-rose-700 border-rose-400/40',
    dot: 'bg-rose-500',
    icon: <XCircle size={12} className="shrink-0" />,
  },
} as const;

type ActionDialogState = {
  visible: boolean;
  date: string;
  type: 'Approved' | 'Rejected';
  remark: string;
  isChangeDecision?: boolean;
};

export function DayWiseApprovalTable({
  request,
  isAdmin = false,
  showSummary = true,
  onDecisionChange,
}: DayWiseApprovalTableProps) {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [actionDialog, setActionDialog] = useState<ActionDialogState>({
    visible: false,
    date: '',
    type: 'Approved',
    remark: '',
    isChangeDecision: false,
  });

  const [bulkApproveDialog, setBulkApproveDialog] = useState(false);
  const [bulkApproveRemark, setBulkApproveRemark] = useState('');

  const [bulkRejectDialog, setBulkRejectDialog] = useState(false);
  const [bulkRejectRemark, setBulkRejectRemark] = useState('');

  // Fetch server day records
  const {
    data: serverDays = [],
    isLoading: daysLoading,
    refetch,
  } = useGetLeaveRequestDaysQuery(request.id, {
    refetchOnMountOrArgChange: true,
  });

  const [approveDay, { isLoading: isApproving }] = useApproveLeaveDayMutation();
  const [rejectDay, { isLoading: isRejecting }] = useRejectLeaveDayMutation();
  const [bulkApprove, { isLoading: isBulkApproving }] = useBulkApproveLeaveMutation();
  const [bulkReject, { isLoading: isBulkRejecting }] = useBulkRejectLeaveMutation();

  // Build display rows: use server data when available, otherwise generate from date range
  const dateRange = useMemo(
    () => generateDateRange(request.start_date, request.end_date || request.start_date),
    [request.start_date, request.end_date]
  );

  const displayRows: DayApproval[] = useMemo(() => {
    return dateRange.map((dateStr) => {
      const serverRecord = serverDays.find((d) => d.date === dateStr);
      if (serverRecord) return serverRecord;
      const embedded = request.day_approvals?.find((d) => d.date === dateStr);
      if (embedded) return embedded;
      return {
        id: `pending-${request.id}-${dateStr}`,
        leave_request_id: request.id,
        date: dateStr,
        status: 'Pending',
      };
    });
  }, [dateRange, serverDays, request.day_approvals, request.id]);

  const pendingDays = useMemo(() => displayRows.filter((d) => d.status === 'Pending'), [displayRows]);
  const overallStatus = useMemo(() => computeOverallStatus(displayRows), [displayRows]);

  const actionLoading = isApproving || isRejecting;

  const openActionDialog = (date: string, type: 'Approved' | 'Rejected', isChangeDecision = false) => {
    const existing = displayRows.find((d) => d.date === date);
    setActionDialog({
      visible: true,
      date,
      type,
      remark: existing?.remark || '',
      isChangeDecision,
    });
  };

  const closeActionDialog = () => {
    setActionDialog((prev) => ({ ...prev, visible: false, remark: '', isChangeDecision: false }));
  };

  const handleConfirmAction = async () => {
    const { date, type, remark } = actionDialog;

    if (type === 'Rejected' && !remark.trim()) {
      showToast({
        severity: 'warn',
        summary: 'Remark Required',
        detail: 'A mandatory remark is required when rejecting a day.',
        life: 3000,
      });
      return;
    }

    try {
      if (type === 'Approved') {
        await approveDay({
          leaveRequestId: request.id,
          date,
          remark: remark.trim() || undefined,
        }).unwrap();
        showToast({
          severity: 'success',
          summary: 'Day Approved',
          detail: `${formatDayComponents(date).dateFormatted} has been approved.`,
          life: 3000,
        });
      } else {
        await rejectDay({
          leaveRequestId: request.id,
          date,
          remark: remark.trim(),
        }).unwrap();
        showToast({
          severity: 'info',
          summary: 'Day Rejected',
          detail: `${formatDayComponents(date).dateFormatted} has been rejected.`,
          life: 3000,
        });
      }
      closeActionDialog();
      refetch();
      onDecisionChange?.();
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message || 'Action failed. Please try again.';
      showToast({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
    }
  };

  const handleBulkApprove = async () => {
    try {
      const result = await bulkApprove({
        leaveRequestId: request.id,
        remark: bulkApproveRemark.trim() || undefined,
      }).unwrap();
      showToast({
        severity: 'success',
        summary: 'Bulk Approved',
        detail: `${result.updated} pending day(s) approved successfully.`,
        life: 3000,
      });
      setBulkApproveDialog(false);
      setBulkApproveRemark('');
      refetch();
      onDecisionChange?.();
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message || 'Bulk approval failed.';
      showToast({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
    }
  };

  const handleBulkRejectSelected = async () => {
    if (!bulkRejectRemark.trim()) {
      showToast({
        severity: 'warn',
        summary: 'Remark Required',
        detail: 'A remark is required when rejecting selected days.',
        life: 3000,
      });
      return;
    }

    try {
      const result = await bulkReject({
        leaveRequestId: request.id,
        dates: selectedDates,
        remark: bulkRejectRemark.trim(),
      }).unwrap();
      showToast({
        severity: 'info',
        summary: 'Days Rejected',
        detail: `${result.updated} day(s) rejected successfully.`,
        life: 3000,
      });
      setBulkRejectDialog(false);
      setBulkRejectRemark('');
      setSelectedDates([]);
      refetch();
      onDecisionChange?.();
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message || 'Bulk rejection failed.';
      showToast({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
    }
  };

  const toggleSelectDate = (date: string) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const toggleSelectAllPending = () => {
    if (selectedDates.length === pendingDays.length) {
      setSelectedDates([]);
    } else {
      setSelectedDates(pendingDays.map((d) => d.date));
    }
  };

  const getOverallStatusBadge = () => {
    const s = overallStatus;
    if (s === 'Approved') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-700 border border-emerald-400/40">
          <CheckCircle2 size={13} /> Approved
        </span>
      );
    }
    if (s === 'Rejected') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/10 text-rose-700 border border-rose-400/40">
          <XCircle size={13} /> Rejected
        </span>
      );
    }
    if (s === 'Pending') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-700 border border-amber-400/40">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/20">
        <Layers size={13} /> {s}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ─── 1. Request Summary Card ─── */}
      {showSummary && (
        <div className="rounded-3xl border border-border-subtle bg-white p-6 shadow-xs flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle/60">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-primary-light text-white font-black text-sm flex items-center justify-center shadow-xs">
                {(request.username || 'E').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-foreground">
                    {request.username || 'Employee'}
                  </h4>
                  {(request.employee_code || request.user_id) && (
                    <span className="px-2 py-0.5 rounded-md bg-surface-subtle text-[10px] font-black text-muted border border-border-subtle">
                      ID: {request.employee_code || `#${request.user_id}`}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted font-medium">
                  {request.department || request.email || 'Team Member'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                  Overall Status
                </span>
                <div className="mt-0.5">{getOverallStatusBadge()}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-surface-subtle/50 border border-border-subtle flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                Request Type
              </span>
              <span className="text-xs font-black text-primary truncate">{request.type}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-subtle/50 border border-border-subtle flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                Requested Date Range
              </span>
              <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                <Calendar size={13} className="text-primary shrink-0" />
                <span>
                  {request.start_date ? formatDate(request.start_date) : '---'}
                  {request.end_date && request.end_date !== request.start_date
                    ? ` to ${formatDate(request.end_date)}`
                    : ''}
                </span>
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-subtle/50 border border-border-subtle flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                Submission Date
              </span>
              <span className="text-xs font-bold text-muted flex items-center gap-1.5">
                <Clock size={13} className="text-muted/70 shrink-0" />
                <span>{request.created_at ? formatDate(request.created_at) : '---'}</span>
              </span>
            </div>
          </div>

          {/* Employee's Original Reason Displayed Separately */}
          <div className="p-4 rounded-2xl bg-surface-subtle/30 border border-border-subtle flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5">
              <FileText size={12} className="text-primary" /> Employee's Original Reason
            </span>
            <p className="text-xs font-medium text-foreground leading-relaxed italic">
              "{request.reason || 'No description provided.'}"
            </p>
          </div>
        </div>
      )}

      {/* ─── 2. Day-Wise Approval Table ─── */}
      <div className="rounded-3xl border border-border-subtle overflow-hidden bg-white shadow-xs">
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-surface-subtle/60 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <h4 className="text-xs font-black text-foreground uppercase tracking-widest">
              Day-Wise Approval Table
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-surface-subtle text-muted border border-border-subtle">
              {displayRows.length} {displayRows.length === 1 ? 'Date' : 'Dates'}
            </span>
            {pendingDays.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-700 border border-amber-500/30">
                {pendingDays.length} Pending
              </span>
            )}
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              {selectedDates.length > 0 && (
                <button
                  type="button"
                  onClick={() => setBulkRejectDialog(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer">
                  <XCircle size={13} /> Reject Selected ({selectedDates.length})
                </button>
              )}

              {pendingDays.length > 0 && (
                <button
                  type="button"
                  onClick={() => setBulkApproveDialog(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all cursor-pointer">
                  <CheckCheck size={13} /> Approve All Pending ({pendingDays.length})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-subtle/30 text-[10px] font-black uppercase text-muted tracking-widest">
                {isAdmin && (
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={pendingDays.length > 0 && selectedDates.length === pendingDays.length}
                      onChange={toggleSelectAllPending}
                      disabled={pendingDays.length === 0}
                      className="rounded border-border-subtle cursor-pointer"
                      title="Select all pending"
                    />
                  </th>
                )}
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-5">Day</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Approver Remark</th>
                {isAdmin && <th className="py-3.5 px-5 text-right">Action</th>}
              </tr>
            </thead>

            <tbody className="divide-y divide-border-subtle/40">
              {daysLoading ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="py-12 text-center text-muted font-bold">
                    <div className="flex items-center justify-center gap-2">
                      <Clock size={16} className="animate-spin text-primary" />
                      <span>Loading daily schedule records...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                displayRows.map((day) => {
                  const { dateFormatted, dayName } = formatDayComponents(day.date);
                  const statusStyle =
                    STATUS_CONFIG[day.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.Pending;
                  const isPending = day.status === 'Pending';
                  const isSelected = selectedDates.includes(day.date);

                  return (
                    <tr
                      key={day.date}
                      className={cn(
                        'transition-colors',
                        statusStyle.row,
                        isSelected && 'bg-primary/5'
                      )}>
                      {/* Checkbox for bulk actions (admin only) */}
                      {isAdmin && (
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectDate(day.date)}
                            className="rounded border-border-subtle cursor-pointer"
                          />
                        </td>
                      )}

                      {/* Date */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className="font-black text-foreground">{dateFormatted}</span>
                      </td>

                      {/* Day */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className="font-bold text-muted">{dayName}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border',
                            statusStyle.badge
                          )}>
                          {statusStyle.icon}
                          {day.status}
                        </span>
                      </td>

                      {/* Approver Remark */}
                      <td className="py-3.5 px-5 max-w-xs">
                        {day.remark ? (
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-start gap-1.5 text-xs text-foreground font-medium">
                              <MessageSquare size={12} className="shrink-0 mt-0.5 text-primary" />
                              <span className="italic leading-relaxed line-clamp-2">"{day.remark}"</span>
                            </div>
                            {day.approver_name && (
                              <span className="text-[10px] text-muted font-bold ml-4">
                                -- {day.approver_name}
                                {day.approved_at ? `, ${formatDate(day.approved_at)}` : ''}
                              </span>
                            )}
                          </div>
                        ) : day.approver_name && !isPending ? (
                          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                            <ShieldCheck size={12} />
                            <span>Processed by {day.approver_name}</span>
                          </div>
                        ) : (
                          <span className="text-muted/40 text-xs font-bold">--</span>
                        )}
                      </td>

                      {/* Action buttons (admin only) */}
                      {isAdmin && (
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => openActionDialog(day.date, 'Rejected')}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer disabled:opacity-50">
                                <XCircle size={13} /> Reject
                              </button>
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => openActionDialog(day.date, 'Approved')}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all cursor-pointer disabled:opacity-50">
                                <CheckCircle2 size={13} /> Approve
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-[10px] text-muted font-bold italic">Decided</span>
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() =>
                                  openActionDialog(
                                    day.date,
                                    day.status === 'Approved' ? 'Rejected' : 'Approved',
                                    true
                                  )
                                }
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black text-muted hover:text-foreground bg-surface-subtle hover:bg-surface-elevated border border-border-subtle transition-all cursor-pointer"
                                title="Change decision for this day">
                                <Edit2 size={11} /> Change
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 3. Single Day Approve / Reject Confirmation Dialog ─── */}
      <Dialog
        visible={actionDialog.visible}
        onHide={closeActionDialog}
        header={
          <div
            className={cn(
              'flex items-center gap-2 font-black text-base',
              actionDialog.type === 'Approved' ? 'text-emerald-700' : 'text-rose-700'
            )}>
            {actionDialog.type === 'Approved' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
            <span>
              {actionDialog.isChangeDecision ? 'Change Decision: ' : ''}
              {actionDialog.type} --{' '}
              {actionDialog.date ? formatDayComponents(actionDialog.date).dateFormatted : ''} (
              {actionDialog.date ? formatDayComponents(actionDialog.date).dayName : ''})
            </span>
          </div>
        }
        modal
        className="w-full max-w-md mx-4"
        contentClassName="p-6"
        headerClassName="px-6 pt-6 pb-2"
        pt={{
          root: {
            className: 'rounded-3xl overflow-hidden border border-border-subtle shadow-2xl bg-white',
          },
          mask: { className: 'backdrop-blur-md bg-black/40' },
        }}>
        <div className="flex flex-col gap-4">
          {/* Warning / Attention Notice */}
          <div
            className={cn(
              'p-3.5 rounded-2xl flex items-start gap-3 text-xs font-medium',
              actionDialog.type === 'Approved'
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-rose-50 text-rose-800'
            )}>
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>
              You are about to{' '}
              <strong className="underline">{actionDialog.type.toLowerCase()}</strong> the{' '}
              {request.type} request for <strong>{request.username}</strong> on{' '}
              <strong>
                {actionDialog.date ? formatDayComponents(actionDialog.date).dateFormatted : ''}
              </strong>
              .
            </span>
          </div>

          {/* Remark Input Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MessageSquare size={12} />
                {actionDialog.type === 'Rejected'
                  ? 'Rejection Remark (Mandatory)'
                  : 'Approver Remark (Optional)'}
              </span>
              {actionDialog.type === 'Rejected' && (
                <span className="text-[10px] text-rose-600 font-bold tracking-normal">
                  * Required
                </span>
              )}
            </label>
            <Textarea
              value={actionDialog.remark}
              onChange={(e) =>
                setActionDialog((prev) => ({ ...prev, remark: e.target.value }))
              }
              placeholder={
                actionDialog.type === 'Rejected'
                  ? 'Enter clear reason for rejecting this specific day (e.g. Critical sprint milestone, team coverage needed)...'
                  : 'Optional note for employee (e.g. Approved as per team policy)...'
              }
              rows={3}
              className="text-xs"
            />
            {actionDialog.type === 'Rejected' && !actionDialog.remark.trim() && (
              <p className="text-[11px] text-rose-600 font-bold italic flex items-center gap-1">
                <AlertCircle size={11} /> You must enter a remark before rejecting this day.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button
              variant="ghost"
              onClick={closeActionDialog}
              disabled={actionLoading}
              className="text-xs font-bold text-muted">
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={
                actionLoading || (actionDialog.type === 'Rejected' && !actionDialog.remark.trim())
              }
              onClick={handleConfirmAction}
              loading={actionLoading}
              className={cn(
                'text-xs font-black px-6 rounded-xl',
                actionDialog.type === 'Approved'
                  ? 'bg-emerald-600! hover:bg-emerald-700! shadow-emerald-500/20!'
                  : 'bg-rose-600! hover:bg-rose-700! shadow-rose-500/20!'
              )}>
              Confirm {actionDialog.type}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ─── 4. Bulk Approve Dialog ─── */}
      <Dialog
        visible={bulkApproveDialog}
        onHide={() => {
          setBulkApproveDialog(false);
          setBulkApproveRemark('');
        }}
        header={
          <div className="flex items-center gap-2 font-black text-emerald-700">
            <CheckCheck size={18} /> Approve All Pending Days
          </div>
        }
        modal
        className="w-full max-w-md mx-4"
        contentClassName="p-6"
        headerClassName="px-6 pt-6 pb-2"
        pt={{
          root: {
            className: 'rounded-3xl overflow-hidden border border-border-subtle shadow-2xl bg-white',
          },
          mask: { className: 'backdrop-blur-md bg-black/40' },
        }}>
        <div className="flex flex-col gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-medium flex items-start gap-3">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>
              This action will approve <strong>{pendingDays.length} pending day(s)</strong> for{' '}
              <strong>{request.username}</strong>'s {request.type} request.
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
              <MessageSquare size={12} /> Bulk Approval Note (Optional)
            </label>
            <Textarea
              value={bulkApproveRemark}
              onChange={(e) => setBulkApproveRemark(e.target.value)}
              placeholder="Add an optional note applied to all approved days..."
              rows={3}
              className="text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button
              variant="ghost"
              onClick={() => {
                setBulkApproveDialog(false);
                setBulkApproveRemark('');
              }}
              disabled={isBulkApproving}
              className="text-xs font-bold text-muted">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleBulkApprove}
              loading={isBulkApproving}
              className="text-xs font-black px-6 rounded-xl bg-emerald-600! hover:bg-emerald-700! shadow-emerald-500/20!">
              Approve {pendingDays.length} Day(s)
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ─── 5. Bulk Reject Selected Days Dialog ─── */}
      <Dialog
        visible={bulkRejectDialog}
        onHide={() => {
          setBulkRejectDialog(false);
          setBulkRejectRemark('');
        }}
        header={
          <div className="flex items-center gap-2 font-black text-rose-700">
            <XCircle size={18} /> Reject Selected Days ({selectedDates.length})
          </div>
        }
        modal
        className="w-full max-w-md mx-4"
        contentClassName="p-6"
        headerClassName="px-6 pt-6 pb-2"
        pt={{
          root: {
            className: 'rounded-3xl overflow-hidden border border-border-subtle shadow-2xl bg-white',
          },
          mask: { className: 'backdrop-blur-md bg-black/40' },
        }}>
        <div className="flex flex-col gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-800 text-xs font-medium flex items-start gap-3">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>
              You are rejecting <strong>{selectedDates.length} selected day(s)</strong> for{' '}
              <strong>{request.username}</strong>. A reason is required.
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MessageSquare size={12} /> Rejection Reason (Mandatory)
              </span>
              <span className="text-[10px] text-rose-600 font-bold">* Required</span>
            </label>
            <Textarea
              value={bulkRejectRemark}
              onChange={(e) => setBulkRejectRemark(e.target.value)}
              placeholder="State the reason for rejecting these dates..."
              rows={3}
              className="text-xs"
            />
            {!bulkRejectRemark.trim() && (
              <p className="text-[11px] text-rose-600 font-bold italic flex items-center gap-1">
                <AlertCircle size={11} /> You must enter a remark to reject selected days.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button
              variant="ghost"
              onClick={() => {
                setBulkRejectDialog(false);
                setBulkRejectRemark('');
              }}
              disabled={isBulkRejecting}
              className="text-xs font-bold text-muted">
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={isBulkRejecting || !bulkRejectRemark.trim()}
              onClick={handleBulkRejectSelected}
              loading={isBulkRejecting}
              className="text-xs font-black px-6 rounded-xl bg-rose-600! hover:bg-rose-700! text-white">
              Reject {selectedDates.length} Day(s)
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

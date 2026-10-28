import { useState } from 'react';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Button } from '@/components/ui/primitives/Button';
import { Textarea } from '@/components/ui/primitives/Textarea';
import {
  Calendar,
  Building2,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Home,
  ShieldCheck,
  ListChecks,
} from 'lucide-react';
import type { AttendanceRequest } from '@/types/models';
import { formatDate } from '@/utils/date';
import { computeOverallStatus, generateDateRange } from '@/types/dayApproval';
import { DayWiseApprovalTable } from '@/pages/staff/components/DayWiseApprovalTable';

interface AttendanceDetailModalProps {
  request: AttendanceRequest | null;
  visible: boolean;
  onHide: () => void;
  isAdmin?: boolean;
  onApprove?: (id: string | number, comment?: string) => Promise<boolean | void>;
  onReject?: (id: string | number, comment?: string) => Promise<boolean | void>;
}

export function AttendanceDetailModal({
  request,
  visible,
  onHide,
  isAdmin,
  onApprove,
  onReject,
}: AttendanceDetailModalProps) {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  if (!request) return null;

  const isPending = (request.status || '').toLowerCase() === 'pending';

  // Compute if the request is multi-day
  const dateRange = generateDateRange(request.start_date, request.end_date || request.start_date);
  const isMultiDay = dateRange.length > 1;

  // Compute overall status from day approvals if available
  const computedStatus =
    request.day_approvals && request.day_approvals.length > 0
      ? computeOverallStatus(request.day_approvals)
      : request.status;

  const handleConfirmApprove = async () => {
    if (!onApprove) return;
    setActionLoading(true);
    try {
      const res = await onApprove(request.id);
      if (res !== false) {
        onHide();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!onReject) return;
    setActionLoading(true);
    try {
      const res = await onReject(request.id, rejectReason.trim());
      if (res !== false) {
        setShowRejectInput(false);
        setRejectReason('');
        onHide();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = () => {
    const status = computedStatus;
    if (status === 'Approved' || status === 'Pending' || status === 'Rejected') {
      if (status === 'Pending') {
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Pending Approval
          </span>
        );
      }
      if (status === 'Approved') {
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <CheckCircle2 size={13} />
            Approved
          </span>
        );
      }
      if (status === 'Rejected') {
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 border border-rose-500/20">
            <XCircle size={13} />
            Rejected
          </span>
        );
      }
    }
    // Partial statuses
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
        <ListChecks size={13} />
        {status}
      </span>
    );
  };

  return (
    <Dialog
      visible={visible}
      onHide={() => {
        setShowRejectInput(false);
        setRejectReason('');
        onHide();
      }}
      header={
        <div className="flex items-center justify-between w-full pr-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              {request.type.toLowerCase().includes('home') ? (
                <Home size={20} />
              ) : (
                <Calendar size={20} />
              )}
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground">Attendance Request Details</h3>
              <p className="text-xs text-muted font-medium">Reference #{request.id}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      }
      modal
      width="min(1100px, 94vw)"
      style={{ maxWidth: '94vw' }}
      className="w-full max-w-5xl mx-4"
      contentClassName="p-8"
      headerClassName="px-8 pt-8 pb-4 border-b border-border-subtle/40"
      pt={{
        root: {
          className:
            'rounded-[36px] overflow-hidden border border-border-subtle shadow-2xl bg-white',
        },
        mask: { className: 'backdrop-blur-md bg-black/40' },
      }}>
      <div className="flex flex-col gap-6">
        {/* Employee Info Card */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-subtle border border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-primary-light text-white font-black text-lg flex items-center justify-center shadow-xs">
              {(request.username || 'E').charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="text-sm font-black text-foreground">
                {request.username || 'Employee'}
              </h4>
              <p className="text-xs text-muted font-medium">
                {request.email || 'Internal Team Member'}
              </p>
            </div>
          </div>
          {request.department && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white text-muted border border-border-subtle shadow-xs">
              <Building2 size={13} className="text-primary" />
              {request.department}
            </span>
          )}
        </div>

        {/* Request Metadata Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-surface-subtle/50 border border-border-subtle flex flex-col gap-1">
            <span className="text-[10px] font-black text-muted uppercase tracking-wider">
              Request Type
            </span>
            <span className="text-sm font-black text-primary flex items-center gap-1.5">
              {request.type}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-subtle/50 border border-border-subtle flex flex-col gap-1">
            <span className="text-[10px] font-black text-muted uppercase tracking-wider">
              Schedule Duration
            </span>
            <span className="text-xs font-black text-foreground flex items-center gap-1">
              <Calendar size={13} className="text-muted" />
              {request.start_date ? formatDate(request.start_date) : '---'}
              {request.end_date && formatDate(request.end_date) !== formatDate(request.start_date)
                ? ` to ${formatDate(request.end_date)}`
                : ''}
            </span>
            {isMultiDay && (
              <span className="text-[10px] text-muted font-bold mt-0.5">
                {dateRange.length} days total
              </span>
            )}
          </div>
        </div>

        {/* Reason Section */}
        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-surface-subtle/30 border border-border-subtle">
          <span className="text-[10px] font-black text-muted uppercase tracking-wider flex items-center gap-1.5">
            <FileText size={13} className="text-primary" /> Reason for Request
          </span>
          <p className="text-xs font-medium text-foreground leading-relaxed italic">
            "{request.reason || 'No specific reason provided.'}"
          </p>
        </div>

        {/* Day-Wise Approval Breakdown */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-muted uppercase tracking-wider flex items-center gap-1.5">
            <ListChecks size={13} className="text-primary" /> Day-Wise Approval Status
          </span>
          <DayWiseApprovalTable request={request} isAdmin={isAdmin} showSummary={false} />
        </div>

        {/* Legacy single-request approver info (kept for backward compatibility) */}
        {(request.approver_name || request.admin_comment) && !isMultiDay && (
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
              <ShieldCheck size={13} /> Approver Assessment
            </span>
            {request.approver_name && (
              <p className="text-xs font-bold text-foreground">
                Action by: <span className="text-primary font-black">{request.approver_name}</span>
              </p>
            )}
            {request.admin_comment && (
              <p className="text-xs italic text-muted leading-relaxed">
                Feedback: "{request.admin_comment}"
              </p>
            )}
          </div>
        )}

        {/* Rejection input prompt (for single-request whole-reject fallback) */}
        {showRejectInput && !isMultiDay && (
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-rose-50/50 border border-rose-200 animate-in fade-in">
            <label className="text-xs font-black text-rose-800 flex items-center gap-1.5">
              <AlertCircle size={14} /> Reason for Rejection (Optional)
            </label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide a constructive reason or alternative dates..."
              rows={3}
              className="text-xs bg-white border-rose-200"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowRejectInput(false)}
                className="text-xs text-muted">
                Cancel
              </Button>
              <Button
                variant="danger"
                disabled={actionLoading}
                onClick={handleConfirmReject}
                className="text-xs font-black bg-rose-600 hover:bg-rose-700 text-white rounded-xl">
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        )}

        {/* Admin Quick Action Footer — only for single-day requests (multi-day uses DayWiseApprovalTable) */}
        {isAdmin && isPending && !isMultiDay && !showRejectInput && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => setShowRejectInput(true)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer">
              <XCircle size={14} /> Reject Request
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleConfirmApprove}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all cursor-pointer">
              <CheckCircle2 size={14} /> {actionLoading ? 'Approving...' : 'Approve Request'}
            </button>
          </div>
        )}

        {/* Note for multi-day: tell admin to use the table */}
        {isAdmin && isPending && isMultiDay && (
          <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/10 text-xs font-medium text-primary flex items-center gap-2">
            <ListChecks size={14} className="shrink-0" />
            Use the day-wise table above to approve or reject each day individually.
          </div>
        )}
      </div>
    </Dialog>
  );
}

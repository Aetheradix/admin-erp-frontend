import { useState } from 'react';
import { Calendar, CheckCircle2, XCircle, Home, Clock, ShieldAlert } from 'lucide-react';
import { formatDate } from '@/utils/date';
import type { AttendanceRequest } from '@/types/models';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { Button } from '@/components/ui/primitives/Button';

interface PendingApprovalsProps {
  requests: AttendanceRequest[];
  onApprove: (id: string | number, comment?: string) => Promise<boolean | void>;
  onReject: (id: string | number, comment?: string) => Promise<boolean | void>;
  onSelectRequest?: (request: AttendanceRequest) => void;
}

export function PendingApprovals({
  requests,
  onApprove,
  onReject,
  onSelectRequest,
}: PendingApprovalsProps) {
  const [rejectingItem, setRejectingItem] = useState<AttendanceRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState<string | number | null>(null);

  const pendingRequests = requests.filter((r) => (r.status || '').toLowerCase() === 'pending');

  const handleApprove = async (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    setProcessingId(id);
    try {
      await onApprove(id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    setProcessingId(rejectingItem.id);
    try {
      const res = await onReject(rejectingItem.id, rejectReason.trim());
      if (res !== false) {
        setRejectingItem(null);
        setRejectReason('');
      }
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-white rounded-[40px] p-8 border border-border-subtle shadow-soft transition-all duration-500 hover:shadow-lg overflow-hidden">
      {/* Header with Title and Pending Count Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border-subtle/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shadow-xs">
            <ShieldAlert size={22} />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-black text-foreground tracking-tight">
                Pending Approvals
              </h3>
              <span className="px-3 py-0.5 rounded-full text-xs font-black bg-amber-500/15 text-amber-700 border border-amber-500/30">
                {pendingRequests.length} Requiring Action
              </span>
            </div>
            <p className="text-xs text-muted font-medium">
              Review and act on employee work from home and leave requests
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Pending Requests */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingRequests.map((request) => {
          const isWfh = request.type.toLowerCase().includes('home');
          const isProcessing = processingId === request.id;

          return (
            <div
              key={request.id}
              onClick={() => onSelectRequest?.(request)}
              className="group relative bg-surface-subtle/60 hover:bg-white rounded-3xl p-6 border border-border-subtle hover:border-amber-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer">
              <div>
                {/* Top User & Type Bar */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {(request.username || 'E').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">
                        {request.username || 'Employee'}
                      </h4>
                      <p className="text-[11px] text-muted font-medium truncate">
                        {request.department || request.email || 'Team Member'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-black tracking-wider uppercase shrink-0 ${
                      isWfh
                        ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                        : 'bg-primary/10 text-primary border border-primary/20'
                    }`}>
                    {isWfh ? <Home size={11} /> : <Calendar size={11} />}
                    {request.type}
                  </span>
                </div>

                {/* Date Duration & Submission Info */}
                <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-white/80 border border-border-subtle/60 mb-3">
                  <div className="flex items-center gap-2 text-xs font-black text-foreground">
                    <Calendar size={13} className="text-primary shrink-0" />
                    <span>
                      {request.start_date ? formatDate(request.start_date) : '---'}
                      {request.end_date && request.end_date !== request.start_date
                        ? ` - ${formatDate(request.end_date)}`
                        : ''}
                    </span>
                  </div>
                  {request.created_at && (
                    <div className="flex items-center gap-1.5 text-[10px] text-muted font-medium">
                      <Clock size={11} />
                      <span>Applied on {formatDate(request.created_at)}</span>
                    </div>
                  )}
                </div>

                {/* Reason */}
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
                    Reason:
                  </span>
                  <p className="text-xs font-medium text-foreground/80 line-clamp-2 italic leading-relaxed">
                    "{request.reason || 'No description provided.'}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-border-subtle/50 mt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={(e) => {
                    e.stopPropagation();
                    setRejectingItem(request);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer disabled:opacity-50">
                  <XCircle size={14} /> Reject
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={(e) => handleApprove(e, request.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50">
                  <CheckCircle2 size={14} />
                  {isProcessing ? 'Saving...' : 'Approve'}
                </button>
              </div>
            </div>
          );
        })}

        {pendingRequests.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center gap-3 bg-surface-subtle/30 rounded-3xl border border-dashed border-border-strong/40">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={28} />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-black text-foreground">All Clear & Up to Date</h4>
              <p className="text-xs text-muted max-w-sm">
                No attendance or leave requests are currently pending approval.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Reject Confirmation Dialog */}
      <Dialog
        visible={!!rejectingItem}
        onHide={() => {
          setRejectingItem(null);
          setRejectReason('');
        }}
        header={
          <div className="flex items-center gap-2.5 text-rose-600 font-black">
            <XCircle size={20} />
            <span>Reject Request #{rejectingItem?.id}</span>
          </div>
        }
        modal
        className="w-full max-w-md mx-4"
        contentClassName="p-6"
        headerClassName="px-6 pt-6 pb-2"
        pt={{
          root: {
            className: 'rounded-3xl overflow-hidden border border-border-subtle shadow-xl bg-white',
          },
          mask: { className: 'backdrop-blur-md bg-black/40' },
        }}>
        <div className="flex flex-col gap-4">
          <p className="text-xs text-muted leading-relaxed">
            Are you sure you want to reject the{' '}
            <strong className="text-foreground">{rejectingItem?.type}</strong> request submitted by{' '}
            <strong className="text-foreground">{rejectingItem?.username}</strong>?
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black text-foreground uppercase tracking-wider">
              Feedback / Rejection Reason (Optional)
            </label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Critical sprint milestone on that day; please reschedule."
              rows={3}
              className="text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setRejectingItem(null);
                setRejectReason('');
              }}
              className="text-xs font-bold text-muted">
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={processingId === rejectingItem?.id}
              onClick={handleConfirmReject}
              className="text-xs font-black bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-5">
              {processingId === rejectingItem?.id ? 'Rejecting...' : 'Reject Request'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

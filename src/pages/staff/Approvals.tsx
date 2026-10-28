import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Column, DataTable } from '@/components/ui/composed/DataTable';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Button } from '@/components/ui/primitives/Button';
import { Badge } from '@/components/ui/primitives/Badge';
import { ApprovalDialog } from './components/ApprovalDialog';
import { ApprovalStats } from './components/ApprovalStats';
import { DayWiseApprovalTable } from './components/DayWiseApprovalTable';
import { useApprovals } from './hooks/useApprovals';
import { Clock, CheckCircle2, XCircle, Calendar, Layers, Eye, ShieldAlert } from 'lucide-react';
import { formatDate } from '@/utils/date';
import { useNavigate } from 'react-router-dom';
import { generateDateRange } from '@/types/dayApproval';
import type { AttendanceRequest } from '@/types/models';

export function Approvals() {
  const navigate = useNavigate();
  const {
    pendingLeaves,
    counts,
    isLoading,
    isUpdating,
    selectedRequest,
    showDayApprovalModal,
    showApprovalDialog,
    actionType,
    setShowDayApprovalModal,
    setShowApprovalDialog,
    handleReviewRequest,
    handleAction,
    onConfirmAction,
    refetch,
  } = useApprovals();

  const statusTemplate = (rowData: AttendanceRequest) => {
    const status = rowData.status || 'Pending';
    const lower = status.toLowerCase();

    if (lower === 'approved') {
      return (
        <Badge
          variant="success"
          className="rounded-lg! px-3! py-1! font-bold! text-[10px]! tracking-wider! uppercase!">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={12} /> Approved
          </span>
        </Badge>
      );
    }

    if (lower === 'rejected') {
      return (
        <Badge
          variant="danger"
          className="rounded-lg! px-3! py-1! font-bold! text-[10px]! tracking-wider! uppercase!">
          <span className="flex items-center gap-1.5">
            <XCircle size={12} /> Rejected
          </span>
        </Badge>
      );
    }

    if (lower === 'pending') {
      return (
        <Badge
          variant="warning"
          className="rounded-lg! px-3! py-1! font-bold! text-[10px]! tracking-wider! uppercase!">
          <span className="flex items-center gap-1.5">
            <Clock size={12} /> Pending
          </span>
        </Badge>
      );
    }

    // Partial statuses
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
        <Layers size={11} /> {status}
      </span>
    );
  };

  const actionTemplate = (rowData: AttendanceRequest) => {
    return (
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="primary"
          size="small"
          className="h-9 px-3.5! rounded-xl! font-black text-xs gap-1.5 bg-primary! text-white! hover:bg-primary/90! shadow-xs"
          onClick={() => handleReviewRequest(rowData)}>
          <Eye size={13} />
          <span>Review Days</span>
        </Button>

        <Button
          variant="outline"
          size="small"
          className="h-9 px-3! rounded-xl! border-emerald-500/20! text-emerald-600! hover:bg-emerald-50! text-xs font-bold"
          onClick={() => handleAction(rowData, 'Approved')}
          title="Approve entire request in one go">
          Approve All
        </Button>

        <Button
          variant="outline"
          size="small"
          className="h-9 px-3! rounded-xl! border-rose-500/20! text-rose-600! hover:bg-rose-50! text-xs font-bold"
          onClick={() => handleAction(rowData, 'Rejected')}
          title="Reject entire request">
          Reject All
        </Button>
      </div>
    );
  };

  const userTemplate = (rowData: AttendanceRequest) => {
    const code = rowData.employee_code || (rowData.user_id ? `#${rowData.user_id}` : null);
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-black text-foreground text-sm uppercase tracking-tight">
            {rowData.username}
          </span>
          {code && (
            <span className="text-[10px] font-black text-muted px-1.5 py-0.2 rounded bg-surface-subtle border border-border-subtle">
              {code}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
            {rowData.type}
          </span>
          {rowData.department && (
            <span className="text-[10px] text-muted font-medium">-- {rowData.department}</span>
          )}
        </div>
      </div>
    );
  };

  const dateTemplate = (rowData: AttendanceRequest) => {
    const days = generateDateRange(rowData.start_date, rowData.end_date || rowData.start_date);
    return (
      <div className="flex flex-col text-xs font-bold text-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="text-primary/70 shrink-0" />
          <span>{formatDate(rowData.start_date)}</span>
          {rowData.end_date && rowData.end_date !== rowData.start_date && (
            <span>to {formatDate(rowData.end_date)}</span>
          )}
        </div>
        <span className="text-[10px] text-muted font-bold ml-4 mt-0.5">
          {days.length} {days.length === 1 ? 'day' : 'days'}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Administrative Approvals"
        description="Review and process personnel requests for leave, remote work, and time-off with day-wise oversight."
        primaryAction={{
          label: 'View History Logs',
          onClick: () => {
            navigate('/staff/history');
          },
          icon: 'pi pi-history',
          className: 'px-6! py-3! rounded-lg! font-black! tracking-widest! text-[10px]!',
        }}
      />

      <ApprovalStats counts={counts} />

      <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-border-subtle overflow-hidden shadow-2xl shadow-primary/5">
        <DataTable
          value={pendingLeaves}
          loading={isLoading}
          paginator
          rows={10}
          className="p-4"
          emptyMessage="No pending requests requiring action found.">
          <Column field="user" header="Employee" body={userTemplate} className="py-6" />
          <Column field="dates" header="Duration" body={dateTemplate} />
          <Column
            field="reason"
            header="Employee Reason"
            className="text-xs font-medium text-foreground/80 max-w-xs italic line-clamp-2"
          />
          <Column field="status" header="Overall Status" body={statusTemplate} />
          <Column header="Operations" body={actionTemplate} className="text-right" />
        </DataTable>
      </div>

      {/* ─── Day-Wise Approval Modal for Selected Request ─── */}
      <Dialog
        visible={showDayApprovalModal && !!selectedRequest}
        onHide={() => setShowDayApprovalModal(false)}
        header={
          <div className="flex items-center gap-2.5 text-foreground font-black text-lg">
            <ShieldAlert size={22} className="text-primary" />
            <span>Review & Day-Wise Approval: {selectedRequest?.username}</span>
          </div>
        }
        modal
        className="w-full max-w-4xl mx-4"
        contentClassName="p-8"
        headerClassName="px-8 pt-8 pb-3 border-b border-border-subtle/50"
        pt={{
          root: {
            className:
              'rounded-[36px] overflow-hidden border border-border-subtle shadow-2xl bg-white',
          },
          mask: { className: 'backdrop-blur-md bg-black/40' },
        }}>
        {selectedRequest && (
          <DayWiseApprovalTable
            request={selectedRequest}
            isAdmin={true}
            showSummary={true}
            onDecisionChange={() => refetch()}
          />
        )}
      </Dialog>

      {/* ─── Legacy Whole-Request Approve / Reject Confirmation Dialog ─── */}
      <Dialog
        visible={showApprovalDialog}
        onHide={() => setShowApprovalDialog(false)}
        header={`${actionType} Entire Request`}
        modal
        className="w-full max-w-md"
        contentClassName="p-8"
        headerClassName="px-8 pt-8 pb-2 text-xl font-black tracking-tight"
        pt={{
          root: { className: 'rounded-2xl overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/20' },
        }}>
        <ApprovalDialog
          type={actionType}
          request={selectedRequest}
          onConfirm={onConfirmAction}
          onCancel={() => setShowApprovalDialog(false)}
          loading={isUpdating}
        />
      </Dialog>
    </div>
  );
}

import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { DataTable } from '@/components/ui/composed/DataTable';
import { Column } from '@/components/ui/composed/DataTable';
import { Badge } from '@/components/ui/primitives/Badge';
import { Dialog } from '@/components/ui/composed/Dialog';
import { useGetLeavesQuery } from '@/store/api/leaveSlice';
import { CheckCircle2, XCircle, Calendar as CalendarIcon, Eye, Layers } from 'lucide-react';
import { formatDate } from '@/utils/date';
import { DayWiseApprovalTable } from './components/DayWiseApprovalTable';
import type { AttendanceRequest } from '@/types/models';

export function ApprovalHistory() {
  const { data: allLeaves = [], isLoading, refetch } = useGetLeavesQuery();
  const [selectedRequest, setSelectedRequest] = useState<AttendanceRequest | null>(null);

  // Filter for processed requests (not purely pending)
  const historyLeaves = allLeaves.filter(
    (l: AttendanceRequest) => (l.status || '').toLowerCase() !== 'pending'
  );

  const statusTemplate = (rowData: AttendanceRequest) => {
    const status = rowData.status || '';
    const lower = status.toLowerCase();

    if (lower === 'approved') {
      return (
        <Badge
          variant="success"
          className="rounded-lg! px-3! py-1! font-bold! text-[11px]! uppercase!">
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
          className="rounded-lg! px-3! py-1! font-bold! text-[11px]! uppercase!">
          <span className="flex items-center gap-1.5">
            <XCircle size={12} /> Rejected
          </span>
        </Badge>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
        <Layers size={11} /> {status}
      </span>
    );
  };

  const userTemplate = (rowData: AttendanceRequest) => (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
        {(rowData.username || 'E').substring(0, 2).toUpperCase()}
      </div>
      <div className="flex flex-col">
        <span className="font-black text-foreground text-sm uppercase tracking-tight">
          {rowData.username}
        </span>
        <span className="text-[10px] text-muted font-black uppercase tracking-widest">
          {rowData.type}
        </span>
      </div>
    </div>
  );

  const dateTemplate = (rowData: AttendanceRequest) => (
    <div className="flex flex-col text-xs font-bold text-muted">
      <div className="flex items-center gap-1.5">
        <CalendarIcon size={12} className="text-primary/60" />
        <span>{formatDate(rowData.start_date)}</span>
      </div>
      {rowData.end_date && rowData.end_date !== rowData.start_date && (
        <span className="text-[10px] opacity-60 ml-4">to {formatDate(rowData.end_date)}</span>
      )}
    </div>
  );

  const actionTemplate = (rowData: AttendanceRequest) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setSelectedRequest(rowData);
      }}
      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black text-primary bg-primary/10 hover:bg-primary hover:text-white transition-all cursor-pointer">
      <Eye size={12} />
      <span>Details</span>
    </button>
  );

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Approval History"
        description="Comprehensive archive of all processed personnel requests and administrative decisions with day-wise audit."
        back
      />

      <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-border-subtle overflow-hidden shadow-2xl shadow-primary/5">
        <DataTable
          value={historyLeaves}
          loading={isLoading}
          paginator
          rows={10}
          className="p-4"
          emptyMessage="No processed history found."
          rowHover
          stripedRows>
          <Column
            header="Employee"
            body={userTemplate}
            className="py-6"
            sortable
            field="username"
          />
          <Column header="Duration" body={dateTemplate} sortable field="start_date" />
          <Column
            field="reason"
            header="Reason"
            className="text-xs font-bold text-muted max-w-xs"
          />
          <Column field="status" header="Decision" body={statusTemplate} sortable />
          <Column
            field="updated_at"
            header="Processed On"
            body={(rowData: { updated_at?: string }) => (
              <span className="text-[10px] font-black text-muted/60 uppercase">
                {formatDate(rowData.updated_at)}
              </span>
            )}
            sortable
          />
          <Column header="Day Breakdown" body={actionTemplate} className="text-right" />
        </DataTable>
      </div>

      {/* Details Dialog */}
      <Dialog
        visible={!!selectedRequest}
        onHide={() => setSelectedRequest(null)}
        header={`Decision Archive: ${selectedRequest?.username} (${selectedRequest?.type})`}
        modal
        width="min(1100px, 94vw)"
        style={{ maxWidth: '94vw' }}
        className="w-full max-w-5xl mx-4"
        contentClassName="p-8"
        headerClassName="px-8 pt-8 pb-3 border-b border-border-subtle/50 font-black"
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
    </div>
  );
}

import { PageHeader } from '@/components/ui/composed/PageHeader';
import { DataTable } from '@/components/ui/composed/DataTable';
import { Column } from '@/components/ui/composed/DataTable';
import { Badge } from '@/components/ui/primitives/Badge';
import { useGetLeavesQuery } from '@/store/api/leaveSlice';
import { Clock, CheckCircle2, XCircle, Calendar as CalendarIcon } from 'lucide-react';
import { formatDate } from '@/utils/date';


export function ApprovalHistory() {
  const { data: allLeaves = [], isLoading } = useGetLeavesQuery();

  // Filter for ONLY Approved or Rejected requests
  const historyLeaves = allLeaves.filter((l: any) => l.status !== 'Pending');

  const statusTemplate = (rowData: any) => {
    const status = rowData.status;
    let variant: 'success' | 'danger' | 'warning' = 'warning';
    let icon = <Clock size={12} />;

    if (status === 'Approved') {
      variant = 'success';
      icon = <CheckCircle2 size={12} />;
    } else if (status === 'Rejected') {
      variant = 'danger';
      icon = <XCircle size={12} />;
    }

    return (
      <Badge variant={variant} className="rounded-lg! px-3! py-1! font-bold! text-[11px]! uppercase!">
        <span className="flex items-center gap-1.5">{icon} {status}</span>
      </Badge>
    );
  };

  const userTemplate = (rowData: any) => (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
        {rowData.username.substring(0, 2).toUpperCase()}
      </div>
      <div className="flex flex-col">
        <span className="font-black text-foreground text-sm uppercase tracking-tight">{rowData.username}</span>
        <span className="text-[10px] text-muted font-black uppercase tracking-widest">{rowData.type}</span>
      </div>
    </div>
  );

  const dateTemplate = (rowData: any) => (
    <div className="flex flex-col text-xs font-bold text-muted">
      <div className="flex items-center gap-1.5">
        <CalendarIcon size={12} className="text-primary/60" />
        <span>{formatDate(rowData.start_date)}</span>
      </div>
      {rowData.end_date && (
        <span className="text-[10px] opacity-60 ml-4">to {formatDate(rowData.end_date)}</span>
      )}
    </div>
  );

  const commentTemplate = (rowData: any) => (
    <div className="max-w-xs group cursor-help">
      <p className="text-xs font-medium text-foreground/80 line-clamp-2 italic">
        {rowData.admin_comment ? `"${rowData.admin_comment}"` : <span className="opacity-30">No feedback provided</span>}
      </p>
    </div>
  );

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Approval History"
        description="Comprehensive archive of all processed personnel requests and administrative decisions."
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
          stripedRows
        >
          <Column header="Employee" body={userTemplate} className="py-6" sortable field="username" />
          <Column header="Duration" body={dateTemplate} sortable field="start_date" />
          <Column field="reason" header="Reason" className="text-xs font-bold text-muted max-w-xs" />
          <Column field="status" header="Decision" body={statusTemplate} sortable />
          <Column header="Admin Feedback" body={commentTemplate} />
          <Column
            field="updated_at"
            header="Processed On"
            body={(rowData: { updated_at?: string }) => <span className="text-[10px] font-black text-muted/60 uppercase">{formatDate(rowData.updated_at)}</span>}
            sortable
          />
        </DataTable>
      </div>
    </div>
  );
}

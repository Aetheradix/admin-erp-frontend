import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { DataTable } from '@/components/ui/composed/DataTable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from '@/components/ui/primitives/Button';
import { Badge } from '@/components/ui/primitives/Badge';
import { useGetLeavesQuery, useGetLeaveStatsQuery, useUpdateLeaveStatusMutation } from '@/store/api/leaveSlice';
import { ApprovalDialog } from './components/ApprovalDialog';
import { Clock, CheckCircle2, XCircle, ListTodo, ShieldCheck, AlertCircle } from 'lucide-react';
import { formatDate } from '@/utils/date';
import { useNavigate } from 'react-router-dom';

export function Approvals() {
  const navigate = useNavigate();
  const { data: leaves = [], isLoading } = useGetLeavesQuery();
  const { data: stats } = useGetLeaveStatsQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateLeaveStatusMutation();
  
  const pendingLeaves = leaves.filter((l: any) => l.status === 'Pending');

  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [actionType, setActionType] = useState<'Approved' | 'Rejected'>('Approved');

  const counts = stats?.byStatus || {};


  const handleAction = (request: any, type: 'Approved' | 'Rejected') => {
    setSelectedRequest(request);
    setActionType(type);
    setShowApprovalDialog(true);
  };

  const onConfirmAction = async (comment: string) => {
    if (!selectedRequest) return;
    
    try {
      await updateStatus({
        id: selectedRequest.id,
        status: actionType,
        comment
      }).unwrap();
      setShowApprovalDialog(false);
      setSelectedRequest(null);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const statusTemplate = (rowData: any) => {
    const status = rowData.status;
    let variant: 'success' | 'danger' | 'warning' | 'info' = 'warning';
    let icon = <Clock size={12} />;

    if (status === 'Approved') {
      variant = 'success';
      icon = <CheckCircle2 size={12} />;
    } else if (status === 'Rejected') {
      variant = 'danger';
      icon = <XCircle size={12} />;
    }

    return (
      <div className="flex items-center gap-2">
        <Badge variant={variant} className="rounded-lg! px-3! py-1! font-bold! text-[10px]! tracking-wider! uppercase!">
          <span className="flex items-center gap-1.5">{icon} {status}</span>
        </Badge>
      </div>
    );
  };

  const actionTemplate = (rowData: any) => {
    if (rowData.status !== 'Pending') {
      return (
        <div className="flex items-center gap-2 text-muted text-xs font-medium italic">
          Processed
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="small"
          className="h-9 px-4! rounded-xl! border-green-500/20! text-green-600! hover:bg-green-50!"
          onClick={() => handleAction(rowData, 'Approved')}
        >
          Approve
        </Button>
        <Button 
          variant="outline" 
          size="small"
          className="h-9 px-4! rounded-xl! border-red-500/20! text-red-600! hover:bg-red-50!"
          onClick={() => handleAction(rowData, 'Rejected')}
        >
          Reject
        </Button>
      </div>
    );

  };

  const userTemplate = (rowData: any) => (
    <div className="flex flex-col">
      <span className="font-black text-foreground text-sm uppercase tracking-tight">{rowData.username}</span>
      <span className="text-[10px] text-muted font-bold uppercase tracking-widest">{rowData.type}</span>
    </div>
  );

  const dateTemplate = (rowData: any) => (
    <div className="flex flex-col text-xs font-bold text-muted">
      <span>{formatDate(rowData.start_date)}</span>
      {rowData.end_date && <span className="text-[10px] opacity-60">to {formatDate(rowData.end_date)}</span>}
    </div>
  );

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Administrative Approvals"
        description="Review and process personnel requests for leave, remote work, and time-off with full oversight."
        primaryAction={{
          label: 'View History Logs',
          onClick: () => { navigate('/staff/history'); },
          icon: 'pi pi-history',
          className: 'px-6! py-3! rounded-2xl! font-black! tracking-widest! text-[10px]!'
        }}


      />


      {/* Stats Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[32px] border border-border-subtle shadow-soft transition-all hover:shadow-lg hover:-translate-y-1 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-warning/10 text-warning flex items-center justify-center group-hover:scale-110 transition-transform">
              <ListTodo size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-foreground">{counts.Pending || 0}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted">Pending Review</span>
            </div>
          </div>
          <p className="text-[10px] text-muted font-bold italic leading-relaxed">Requests awaiting administrative decision.</p>
        </div>

        <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[32px] border border-border-subtle shadow-soft transition-all hover:shadow-lg hover:-translate-y-1 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-foreground">{counts.Approved || 0}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted">Approved Requests</span>
            </div>
          </div>
          <p className="text-[10px] text-muted font-bold italic leading-relaxed">Successfully processed and admitted applications.</p>
        </div>

        <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[32px] border border-border-subtle shadow-soft transition-all hover:shadow-lg hover:-translate-y-1 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-error/10 text-error flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-foreground">{counts.Rejected || 0}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted">Rejected Requests</span>
            </div>
          </div>
          <p className="text-[10px] text-muted font-bold italic leading-relaxed">Applications that did not meet specific criteria.</p>
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-xl rounded-[40px] border border-border-subtle overflow-hidden shadow-2xl shadow-primary/5">

        <DataTable 
          value={pendingLeaves} 
          loading={isLoading}
          paginator 
          rows={10}
          className="p-4"
          emptyMessage="No pending requests found."
        >
          <Column field="user" header="Employee" body={userTemplate} className="py-6" />
          <Column field="dates" header="Duration" body={dateTemplate} />
          <Column field="reason" header="Reason / Notes" className="text-sm font-medium text-muted max-w-xs truncate" />
          <Column field="status" header="Current Status" body={statusTemplate} />
          <Column header="Operations" body={actionTemplate} className="text-right" />
        </DataTable>
      </div>

      <Dialog
        visible={showApprovalDialog}
        onHide={() => setShowApprovalDialog(false)}
        header={`${actionType} Request`}
        modal
        className="w-full max-w-md"
        contentClassName="p-8"
        headerClassName="px-8 pt-8 pb-2 text-xl font-black tracking-tight"
        pt={{
          root: { className: 'rounded-[32px] overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/20' }
        }}
      >
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

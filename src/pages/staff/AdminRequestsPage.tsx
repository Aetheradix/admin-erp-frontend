import { PageHeader } from '@/components/ui/composed/PageHeader';
import { EmptySlate } from '@/components/ui/composed/EmptySlate';
import { AdminRequestCard } from './components/AdminRequestCard';
import { AdminRequestDialog } from './components/AdminRequestDialog';
import { useAdminRequests } from './hooks/useAdminRequests';
import { Shield } from 'lucide-react';
import { Dialog } from '@/components/ui/composed/Dialog';
import { ProgressSpinner } from '@/components/ui/composed/ProgressSpinner';

export default function AdminRequestsPage() {
  const {
    requests,
    isLoading,
    comment,
    setComment,
    isApprove,
    showDialog,
    setShowDialog,
    handleAction,
    handleSubmit,
  } = useAdminRequests();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Elevation Requests"
        description="Manage employee requests for administrative access. Every promotion requires careful review."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {requests.map((request: any) => (
          <AdminRequestCard key={request.id} request={request} onAction={handleAction} />
        ))}

        {requests.length === 0 && (
          <EmptySlate
            variant="ghost"
            icon={Shield}
            title="No Pending Requests"
            message="AetherERP is running securely. No promotion requests found."
          />
        )}
      </div>

      <Dialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        header={isApprove ? 'Approve Elevation' : 'Reject Elevation'}
        modal
        className="w-full max-w-lg mx-4"
        pt={{
          root: { className: 'rounded-[48px] overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' },
        }}
      >
        <AdminRequestDialog
          isApprove={isApprove}
          comment={comment}
          onCommentChange={setComment}
          onCancel={() => setShowDialog(false)}
          onSubmit={handleSubmit}
        />
      </Dialog>
    </div>
  );
}

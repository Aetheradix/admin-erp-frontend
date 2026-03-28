import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { useGetAdminElevationRequestsQuery, useProcessAdminElevationMutation } from '@/store/api/authApiSlice';
import { Shield, Check, X, MessageSquare, User, Clock } from 'lucide-react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { ProgressSpinner } from 'primereact/progressspinner';
import { formatDate } from '@/utils/date';


export default function AdminRequestsPage() {
    const { data: requests = [], isLoading, refetch } = useGetAdminElevationRequestsQuery();
    const [processRequest] = useProcessAdminElevationMutation();
    
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [comment, setComment] = useState('');
    const [isApprove, setIsApprove] = useState(true);
    const [showDialog, setShowDialog] = useState(false);

    const handleAction = (request: any, approve: boolean) => {
        setSelectedRequest(request);
        setIsApprove(approve);
        setShowDialog(true);
    };

    const handleSubmit = async () => {
        try {
            await processRequest({
                requestId: selectedRequest.id,
                status: isApprove ? 'Approved' : 'Rejected',
                adminComment: comment
            }).unwrap();
            setShowDialog(false);
            setComment('');
            refetch();
        } catch (error) {
            console.error('Failed to process request:', error);
        }
    };

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
                    <div key={request.id} className="bg-white rounded-[40px] p-8 border border-border-subtle shadow-soft hover:shadow-lg transition-all duration-500 overflow-hidden group">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                <User size={24} />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-lg font-black text-foreground uppercase tracking-tight">{request.username}</h3>
                                <span className="text-xs font-bold text-muted italic">{request.email}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 p-5 rounded-3xl bg-surface-subtle/50 border border-border-subtle mb-8">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                                <MessageSquare size={12} /> Reason for Request
                            </div>
                            <p className="text-xs font-medium italic text-foreground/80 leading-relaxed">"{request.reason}"</p>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-border-subtle/50">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest">
                                <Clock size={12} /> {formatDate(request.created_at)}
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleAction(request, false)}
                                    className="w-10 h-10 rounded-xl border border-error/20 text-error hover:bg-error hover:text-white flex items-center justify-center transition-all"
                                    title="Reject Request"
                                >
                                    <X size={18} />
                                </button>
                                <button 
                                    onClick={() => handleAction(request, true)}
                                    className="px-6 py-2.5 rounded-xl bg-success text-white font-black text-[10px] uppercase tracking-widest hover:bg-success-dark shadow-lg shadow-success/20 transition-all flex items-center gap-2"
                                >
                                    <Check size={14} /> Approve
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {requests.length === 0 && (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center text-center opacity-40">
                        <Shield size={64} className="mb-4" />
                        <h3 className="text-xl font-black uppercase tracking-widest text-foreground">No Pending Requests</h3>
                        <p className="text-sm font-bold text-muted">AetherERP is running securely. No promotion requests found.</p>
                    </div>
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
                    mask: { className: 'backdrop-blur-md bg-black/40' }
                }}
            >
                <div className="flex flex-col gap-6 p-8">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted">Admin Feedback (Optional)</label>
                        <InputTextarea 
                            rows={4} 
                            value={comment} 
                            onChange={(e) => setComment(e.target.value)} 
                            placeholder="Add a note for the user regarding this decision..."
                            className="w-full p-6 rounded-3xl border border-border-subtle focus:border-primary transition-colors text-sm font-medium"
                        />
                    </div>
                    
                    <div className="flex gap-4">
                        <Button 
                            label="Cancel" 
                            onClick={() => setShowDialog(false)} 
                            className="flex-1 py-4 rounded-2xl border-none bg-surface-subtle font-black text-[10px] uppercase tracking-widest text-muted hover:bg-surface-elevated transition-all"
                        />
                        <Button 
                            label={isApprove ? 'Confirm Approval' : 'Confirm Rejection'} 
                            onClick={handleSubmit} 
                            className={`flex-1 py-4 rounded-2xl border-none font-black text-[10px] uppercase tracking-widest text-white shadow-xl transition-all ${isApprove ? 'bg-success shadow-success/20' : 'bg-error shadow-error/20'}`}
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}

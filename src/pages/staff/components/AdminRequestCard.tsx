import { User, MessageSquare, Clock, Check, X } from 'lucide-react';
import { formatDate } from '@/utils/date';

interface AdminRequestCardProps {
    request: any;
    onAction: (request: any, approve: boolean) => void;
}

export const AdminRequestCard = ({ request, onAction }: AdminRequestCardProps) => {
    return (
        <div className="bg-white rounded-[40px] p-8 border border-border-subtle shadow-soft hover:shadow-lg transition-all duration-500 overflow-hidden group">
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
                        onClick={() => onAction(request, false)}
                        className="w-10 h-10 rounded-xl border border-error/20 text-error hover:bg-error hover:text-white flex items-center justify-center transition-all"
                        title="Reject Request"
                    >
                        <X size={18} />
                    </button>
                    <button 
                        onClick={() => onAction(request, true)}
                        className="px-6 py-2.5 rounded-xl bg-success text-white font-black text-[10px] uppercase tracking-widest hover:bg-success-dark shadow-lg shadow-success/20 transition-all flex items-center gap-2"
                    >
                        <Check size={14} /> Approve
                    </button>
                </div>
            </div>
        </div>
    );
};

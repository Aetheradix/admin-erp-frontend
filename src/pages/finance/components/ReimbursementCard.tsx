import { Receipt, Clock, CheckCircle2, XCircle, FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Reimbursement } from '../hooks/mockFinance';

interface ReimbursementCardProps {
  request: Reimbursement;
}

export function ReimbursementCard({ request }: ReimbursementCardProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-success/10 text-success border-success/20';
      case 'Pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Paid':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'Rejected':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-muted/10 text-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle2 size={14} />;
      case 'Pending':
        return <Clock size={14} />;
      case 'Paid':
        return <Receipt size={14} />;
      case 'Rejected':
        return <XCircle size={14} />;
      default:
        return null;
    }
  };

  return (
    <div className="group bg-white p-8 rounded-4xl border border-border-subtle shadow-soft hover:shadow-lg transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
      {/* Category Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-12 -mt-12 blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />

      <div className="flex flex-col gap-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-3xl bg-surface-subtle flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
              <FileText size={24} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-lg font-black text-foreground group-hover:text-primary transition-colors">
                {request.item}
              </h3>
              <span className="text-[10px] font-black text-muted uppercase tracking-widest">
                {request.category}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xl font-black text-foreground">₹{request.amount.toFixed(2)}</span>
            <span className="text-[10px] font-bold text-muted uppercase">{request.date}</span>
          </div>
        </div>

        <p className="text-sm font-medium text-muted-foreground leading-relaxed line-clamp-2 italic">
          "{request.description}"
        </p>

        <div className="flex items-center justify-between pt-6 border-t border-border-subtle/50">
          <div
            className={cn(
              'flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border',
              getStatusStyles(request.status)
            )}
          >
            {getStatusIcon(request.status)}
            <span>{request.status}</span>
          </div>

          <button
            className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:underline group/btn"
            aria-label={`View details for ${request.item} reimbursement`}
          >
            View Details
            <ChevronRight
              size={14}
              className="group-hover/btn:translate-x-1 transition-transform"
            />
          </button>
        </div>
      </div>
    </div>
  );
}

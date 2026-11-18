import { FileText, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import type { Reimbursement } from '../reimbursements/types';
import {
  REIMBURSEMENT_STATUS_ICONS,
  getReimbursementStatusStyles,
} from '../reimbursements/status';
import { FALLBACK } from '@/shared/constants/fallbacks';

interface ReimbursementCardProps {
  request: Reimbursement;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function ReimbursementCard({ request, onApprove, onReject }: ReimbursementCardProps) {
  const StatusIcon = REIMBURSEMENT_STATUS_ICONS[(request.status ?? '').toLowerCase()] ?? null;

  return (
    <div className="group bg-white p-8 rounded-4xl border border-border-subtle shadow-soft hover:shadow-lg transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
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

              <span className="text-xs font-semibold text-muted-foreground mt-1">
                Raised by {request.employee_name ?? FALLBACK.UNKNOWN}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-xl font-black text-foreground">
              {formatCurrency(request.amount, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>

            <span className="text-[10px] font-bold text-muted uppercase">{request.date}</span>
          </div>
        </div>

        <p className="text-sm font-medium text-muted-foreground leading-relaxed line-clamp-2 italic">
          "{request.description}"
        </p>

        <div className="pt-6 border-t border-border-subtle/50">
          <div className="flex items-center justify-between">
            <div
              className={cn(
                'flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border',
                getReimbursementStatusStyles(request.status)
              )}>
              {StatusIcon && <StatusIcon size={14} />}
              <span>{request.status}</span>
            </div>

            <button
              type="button"
              className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:underline group/btn"
              aria-label={`View details for ${request.item} reimbursement`}>
              View Details
              <ChevronRight
                size={14}
                className="group-hover/btn:translate-x-1 transition-transform"
              />
            </button>
          </div>

          {request.status === 'Pending' && (
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => onApprove(String(request.id))}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-700 transition-colors">
                <CheckCircle2 size={16} />
                Approve
              </button>

              <button
                type="button"
                onClick={() => onReject(String(request.id))}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-red-700 transition-colors">
                <XCircle size={16} />
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

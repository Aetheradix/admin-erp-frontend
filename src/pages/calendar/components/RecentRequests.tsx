import { Calendar as CalendarIcon, MessageSquare } from 'lucide-react';
import { formatDate } from '@/utils/date';

interface RecentRequestsProps {
  requests: any[];
}

export const RecentRequests = ({ requests }: RecentRequestsProps) => {
  return (
    <div className="bg-white rounded-[40px] p-8 border border-border-subtle shadow-soft transition-all duration-500 hover:shadow-lg overflow-hidden">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-border-subtle/50">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-black text-foreground uppercase tracking-widest">Recent Requests</h3>
          <span className="text-xs font-bold text-muted italic">Track the status of your WFH and Leave applications</span>
        </div>
        <div className="flex items-center gap-2 text-primary font-black text-xs uppercase cursor-pointer hover:underline">
          View History
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((request: any) => (
          <div key={request.id} className="group relative bg-surface-subtle/50 rounded-3xl p-6 border border-border-subtle hover:bg-white hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                request.status === 'Approved' ? 'bg-success/10 text-success' : 
                request.status === 'Pending' ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
              }`}>
                {request.status}
              </span>
              <span className="text-[10px] font-black text-primary uppercase bg-primary/5 px-3 py-1.5 rounded-xl">{request.type}</span>
            </div>
            <h4 className="text-sm font-black text-foreground mb-2 group-hover:text-primary transition-colors">{request.reason}</h4>
            <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle/30">
              <div className="flex items-center gap-2 text-[10px] text-muted font-bold">
                <CalendarIcon size={12} className="text-primary/70" />
                <span>
                  {request.start_date ? formatDate(request.start_date) : '---'}
                  {request.end_date && request.end_date !== request.start_date ? ` - ${formatDate(request.end_date)}` : ''}
                </span>
              </div>
              {request.admin_comment && (
                <div className="mt-4 p-3 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col gap-1.5 animate-in slide-in-from-top-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                    <MessageSquare size={10} /> Admin Feedback
                  </span>
                  <p className="text-[10px] font-medium leading-relaxed italic text-foreground/80">"{request.admin_comment}"</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-40">
            <CalendarIcon size={48} />
            <p className="text-sm font-black">No active requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

import { useNavigate } from 'react-router-dom';
import { Calendar, Home } from 'lucide-react';
import type { MyUpcomingLeaveItem } from '@/types/dashboard';
import { cn } from '@/utils/cn';
import { WorkDeliveryEmpty, WorkDeliveryList, WorkDeliveryRow } from './WorkDeliveryPrimitives';

const STATUS_CLASSES: Record<string, string> = {
  Approved: 'bg-emerald-50 text-emerald-700',
  Rejected: 'bg-rose-50 text-rose-700',
};

export function LeavesTab({ leaves }: { leaves: MyUpcomingLeaveItem[] }) {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col pt-1">
      {leaves.length === 0 ? (
        <WorkDeliveryEmpty
          icon={Calendar}
          title="No pending or upcoming leave applications"
          action={
            <button
              type="button"
              onClick={() => navigate('/calendar')}
              className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer">
              Apply for Leave
            </button>
          }
        />
      ) : (
        <WorkDeliveryList padded={false}>
          {leaves.map((leave) => (
            <WorkDeliveryRow key={leave.id} onClick={() => navigate('/calendar')}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {leave.type === 'Work from home' ? <Home size={13} /> : <Calendar size={13} />}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-foreground truncate">{leave.type}</h4>
                  <p className="text-[10px] text-muted truncate mt-0.5">
                    {leave.startDate}{' '}
                    {leave.endDate && leave.endDate !== leave.startDate ? `to ${leave.endDate}` : ''}
                    {leave.reason ? ` · "${leave.reason}"` : ''}
                  </p>
                </div>
              </div>

              <span
                className={cn(
                  'text-[9px] font-bold px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wider',
                  STATUS_CLASSES[leave.status] ?? 'bg-amber-50 text-amber-700'
                )}>
                {leave.status}
              </span>
            </WorkDeliveryRow>
          ))}
        </WorkDeliveryList>
      )}
    </div>
  );
}
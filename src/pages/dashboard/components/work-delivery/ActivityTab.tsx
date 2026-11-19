import { Activity } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { DashboardActivityItem } from '../../types';
import { WorkDeliveryEmpty, WorkDeliveryList } from './WorkDeliveryPrimitives';

export function ActivityTab({ items }: { items: DashboardActivityItem[] }) {
  return (
    <div className="flex-1 flex flex-col pt-1">
      {items.length === 0 ? (
        <WorkDeliveryEmpty
          icon={Activity}
          title="No recent activity logs"
          message="Your daily punch, leave, and system events will show here."
        />
      ) : (
        <WorkDeliveryList>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-surface-subtle/40 hover:bg-surface-elevated border border-border-subtle/50 transition-all flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                      item.color
                    )}>
                    <Icon size={13} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-foreground truncate">{item.title}</h4>
                    <p className="text-[10px] text-muted mt-0.5">{item.time}</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-surface-subtle text-muted shrink-0 uppercase tracking-wider">
                  {item.type}
                </span>
              </div>
            );
          })}
        </WorkDeliveryList>
      )}
    </div>
  );
}
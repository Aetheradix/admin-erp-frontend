import { RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/ui/composed/PageHeader';

interface AuditLogHeaderProps {
  isFetchingLogs: boolean;
  onRefresh: () => void;
}

export function AuditLogHeader({ isFetchingLogs, onRefresh }: AuditLogHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <PageHeader
        title="Security & System Audit Log"
        description="Immutable chronological record of invitations, onboarding journeys, authentication changes, and system administration events."
        breadcrumbs={[
          { label: 'Home', url: '/' },
          { label: 'Settings', url: '/settings' },
          { label: 'Audit Log' },
        ]}
      />
      <div className="flex items-center gap-2 pt-1 shrink-0">
        {/* Live backend sync badge */}
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-[10px] font-black uppercase tracking-wider">
          <span
            className={`w-1.5 h-1.5 rounded-full bg-success ${isFetchingLogs ? 'animate-ping' : 'animate-pulse'}`}
          />
          Live DB Sync
        </span>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-border-subtle text-muted text-xs font-bold hover:text-foreground hover:border-primary/30 transition-all cursor-pointer"
          title="Refresh from database">
          <RefreshCw size={13} className={isFetchingLogs ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>
    </div>
  );
}

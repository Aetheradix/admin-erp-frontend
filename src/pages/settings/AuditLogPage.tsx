import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FALLBACK_ADMIN_EMAIL, FALLBACK_ADMIN_NAME, FALLBACK_ADMIN_ROLE } from './audit/constants';
import { useAuditLogData } from './audit/hooks/useAuditLogData';
import { useAuditLogState } from './audit/hooks/useAuditLogState';
import type { AuditActorInfo } from './audit/types';
import { filterAuditLogs, filterInvitations } from './audit/utils';
import { AuditLogHeader } from './audit/components/AuditLogHeader';
import { AuditViewToggle } from './audit/components/AuditViewToggle';
import { AuditFilters } from './audit/components/AuditFilters';
import { AuditStreamTable } from './audit/components/AuditStreamTable';
import { JourneyView } from './audit/components/JourneyView';
import { AuditDetailModal } from './audit/components/AuditDetailModal';

export function AuditLogPage() {
  const { user: currentAuthUser } = useAuth();
  const data = useAuditLogData();
  const state = useAuditLogState();

  const actor = useMemo<AuditActorInfo>(
    () => ({
      name: currentAuthUser?.username || FALLBACK_ADMIN_NAME,
      role: currentAuthUser?.role || FALLBACK_ADMIN_ROLE,
      email: currentAuthUser?.email || FALLBACK_ADMIN_EMAIL,
    }),
    [currentAuthUser]
  );

  const filteredLogs = useMemo(
    () => filterAuditLogs(data.logs, state.search, state.categoryFilter, state.statusFilter),
    [data.logs, state.search, state.categoryFilter, state.statusFilter]
  );

  const filteredInvitations = useMemo(
    () => filterInvitations(data.invitations, state.search),
    [data.invitations, state.search]
  );

  const handleRefresh = () => {
    data.refetchLogs();
    data.refetchInvitations();
  };

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AuditLogHeader isFetchingLogs={data.isFetchingLogs} onRefresh={handleRefresh} />

      {/* Loading skeleton */}
      {(data.isLoadingLogs || data.isLoadingInvitations) && (
        <div className="flex items-center gap-3 text-sm text-muted">
          <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading audit data from database...
        </div>
      )}

      <AuditViewToggle
        activeView={state.activeView}
        invitationCount={data.invitations.length}
        onChange={state.setActiveView}
      />

      <AuditFilters
        activeView={state.activeView}
        search={state.search}
        onSearchChange={state.setSearch}
        statusFilter={state.statusFilter}
        onStatusChange={state.setStatusFilter}
        categoryFilter={state.categoryFilter}
        onCategoryChange={state.setCategoryFilter}
      />

      {state.activeView === 'stream' && (
        <AuditStreamTable
          logs={filteredLogs}
          currentAuthUser={currentAuthUser}
          actor={actor}
          invitations={data.invitations}
          onView={state.setSelectedLog}
        />
      )}

      {state.activeView === 'journey' && (
        <JourneyView
          invitations={data.invitations}
          filteredInvitations={filteredInvitations}
          logs={data.logs}
          search={state.search}
          actor={actor}
        />
      )}

      <AuditDetailModal
        log={state.selectedLog}
        invitations={data.invitations}
        currentAuthUser={currentAuthUser}
        actor={actor}
        onClose={() => state.setSelectedLog(null)}
      />
    </div>
  );
}

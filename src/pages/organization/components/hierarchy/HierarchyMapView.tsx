import { Network, RefreshCw } from 'lucide-react';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import { OrgCanvasMap } from '../OrgCanvasMap';

interface HierarchyMapViewProps {
  isLoading: boolean;
  rootUsers: HierarchyNodeUser[];
  flatUsers: HierarchyNodeUser[];
  searchQuery: string;
  selectedDepartment: string;
  selectedUserId: number | null;
  onSelectUser: (user: HierarchyNodeUser) => void;
  onAddDirectReport: (user: HierarchyNodeUser) => void;
  onRemoveUser: (user: HierarchyNodeUser) => void;
  expandedNodes: Record<number, boolean>;
  onToggleNode: (id: number) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onHiddenCountChange: (count: number) => void;
}

export function HierarchyMapView({
  isLoading,
  rootUsers,
  flatUsers,
  searchQuery,
  selectedDepartment,
  selectedUserId,
  onSelectUser,
  onAddDirectReport,
  onRemoveUser,
  expandedNodes,
  onToggleNode,
  onExpandAll,
  onCollapseAll,
  onHiddenCountChange,
}: HierarchyMapViewProps) {
  return (
    <div className="w-full h-[calc(100vh-210px)] min-h-[640px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative bg-[#faf9f8]">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
          <RefreshCw size={24} className="animate-spin text-[#e8583a]" />
          <span className="text-xs font-bold">Loading interactive organizational map...</span>
        </div>
      ) : rootUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-2">
          <Network className="w-10 h-10 text-slate-400 opacity-50 mb-1" />
          <p className="text-sm font-bold text-slate-800">No personnel records found</p>
          <p className="text-xs text-slate-500 font-medium max-w-sm">
            No active employee hierarchy records were returned from the system.
          </p>
        </div>
      ) : (
        <OrgCanvasMap
          rootUsers={rootUsers}
          flatUsers={flatUsers}
          searchQuery={searchQuery}
          selectedDepartment={selectedDepartment}
          selectedUserId={selectedUserId}
          onSelectUser={onSelectUser}
          onAddDirectReport={onAddDirectReport}
          onRemoveUser={onRemoveUser}
          expandedNodes={expandedNodes}
          onToggleNode={onToggleNode}
          onExpandAll={onExpandAll}
          onCollapseAll={onCollapseAll}
          onHiddenCountChange={onHiddenCountChange}
        />
      )}
    </div>
  );
}

import { useMemo } from 'react';
import { Network, RefreshCw } from 'lucide-react';
import { Tree } from 'antd';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import { buildHierarchyTreeData } from './hierarchyTreeData';

interface HierarchyListViewProps {
  isLoading: boolean;
  filteredTree: HierarchyNodeUser[];
  canManageHierarchy: boolean;
  onSelectEmployee: (user: HierarchyNodeUser) => void;
  onEditManager: (user: HierarchyNodeUser) => void;
}

export function HierarchyListView({
  isLoading,
  filteredTree,
  canManageHierarchy,
  onSelectEmployee,
  onEditManager,
}: HierarchyListViewProps) {
  const treeData = useMemo(
    () =>
      buildHierarchyTreeData(filteredTree, {
        canManageHierarchy,
        onSelectEmployee,
        onEditManager,
      }),
    [filteredTree, canManageHierarchy, onSelectEmployee, onEditManager]
  );

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm p-6 min-h-[640px] overflow-x-auto">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
          <RefreshCw size={24} className="animate-spin text-[#e8583a]" />
          <span className="text-xs font-bold">Loading organization tree list...</span>
        </div>
      ) : filteredTree.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center p-8 gap-2">
          <Network className="w-10 h-10 text-slate-400 opacity-50 mb-1" />
          <p className="text-sm font-bold text-slate-800">No personnel records found</p>
          <p className="text-xs text-slate-500 font-medium max-w-sm">
            No active employee records match your search query or department filter.
          </p>
        </div>
      ) : (
        <div className="py-2">
          <Tree
            showLine={{ showLeafIcon: false }}
            defaultExpandAll
            treeData={treeData}
            blockNode
            className="bg-transparent"
          />
        </div>
      )}
    </div>
  );
}

import { FolderTree, GitBranch } from 'lucide-react';
import type { OrganizationHierarchyData } from '@/store/api/organizationApiSlice';
import type { HierarchyViewMode } from './types';

interface HierarchyHeaderProps {
  viewMode: HierarchyViewMode;
  onViewModeChange: (mode: HierarchyViewMode) => void;
  stats: OrganizationHierarchyData['stats'];
  flatUsersCount: number;
  departmentFiltersCount: number;
  hiddenCount: number;
  unassignedCount: number;
  canManageHierarchy: boolean;
}

const pillClass = (active: boolean) =>
  `px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
    active ? 'bg-white text-primary font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'
  }`;

const plainPillClass = (active: boolean) =>
  `px-3 py-1 rounded-full transition-all cursor-pointer ${
    active ? 'bg-white text-primary font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'
  }`;

export function HierarchyHeader({
  viewMode,
  onViewModeChange,
  stats,
  flatUsersCount,
  departmentFiltersCount,
  hiddenCount,
  unassignedCount,
  canManageHierarchy,
}: HierarchyHeaderProps) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Organization map</h1>

        <div className="flex items-center p-0.5 bg-surface-subtle rounded-full border border-border-subtle text-xs font-medium">
          <button type="button" onClick={() => onViewModeChange('map')} className={pillClass(viewMode === 'map')}>
            <GitBranch size={12} />
            <span>Map</span>
          </button>
          <button type="button" onClick={() => onViewModeChange('list')} className={pillClass(viewMode === 'list')}>
            <FolderTree size={12} />
            <span>Tree List</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('departments')}
            className={plainPillClass(viewMode === 'departments')}>
            Teams
          </button>
          {canManageHierarchy && (
            <button
              type="button"
              onClick={() => onViewModeChange('reorg')}
              className={plainPillClass(viewMode === 'reorg')}>
              Reorg Studio
            </button>
          )}
          {canManageHierarchy && (
            <button
              type="button"
              onClick={() => onViewModeChange('audit')}
              className={plainPillClass(viewMode === 'audit')}>
              Audit
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground font-medium mt-1">
        {stats.totalEmployees || flatUsersCount} people ·{' '}
        {stats.totalDepartments || departmentFiltersCount} teams · {hiddenCount} hidden in collapsed
        branches
        {unassignedCount > 0 && (
          <span className="text-amber-700 font-bold ml-1.5 px-2 py-0.5 rounded-full bg-amber-100/70 border border-amber-200">
            {unassignedCount} awaiting manager
          </span>
        )}
      </p>
    </div>
  );
}

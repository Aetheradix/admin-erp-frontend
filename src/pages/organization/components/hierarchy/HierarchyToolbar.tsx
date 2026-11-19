import { Download, Maximize2, Minimize2, Plus, RefreshCw, Search } from 'lucide-react';

interface HierarchyToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onExport: () => void;
  onAddEmployee: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  canManageHierarchy: boolean;
}

export function HierarchyToolbar({
  searchQuery,
  onSearchChange,
  onExpandAll,
  onCollapseAll,
  onExport,
  onAddEmployee,
  onRefresh,
  isLoading,
  canManageHierarchy,
}: HierarchyToolbarProps) {
  const pillButtonClass =
    'h-8 px-3 rounded-full bg-surface-elevated hover:bg-surface-subtle border border-border-subtle text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search Pill */}
      <div className="relative">
        <Search
          size={13}
          className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search name, role or team"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-56 text-xs pl-8 pr-7 py-1.5 rounded-full border border-border-subtle bg-surface-elevated text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs">
            ✕
          </button>
        )}
      </div>

      <button type="button" onClick={onExpandAll} className={pillButtonClass}>
        <Maximize2 size={12} className="text-muted-foreground" />
        <span>Expand all</span>
      </button>

      <button type="button" onClick={onCollapseAll} className={pillButtonClass}>
        <Minimize2 size={12} className="text-muted-foreground" />
        <span>Collapse all</span>
      </button>

      <button type="button" onClick={onExport} className={pillButtonClass}>
        <Download size={12} className="text-muted-foreground" />
        <span>Export</span>
      </button>

      {canManageHierarchy && (
        <button
          type="button"
          onClick={onAddEmployee}
          className="h-8 px-4 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm">
          <Plus size={14} />
          <span>Add employee</span>
        </button>
      )}

      <button
        type="button"
        onClick={onRefresh}
        className="w-8 h-8 rounded-full bg-surface-elevated hover:bg-surface-subtle border border-border-subtle text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer shadow-xs"
        title="Refresh tree data">
        <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
      </button>
    </div>
  );
}

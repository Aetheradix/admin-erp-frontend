import { Search, LayoutGrid, List, X, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/primitives/Input';
import { Tabs } from '@/components/ui/primitives/Tabs';

interface BlogTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  categories?: string[];
  viewMode?: 'table' | 'grid';
  onViewModeChange?: (mode: 'table' | 'grid') => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  totalResults?: number;
}

const DEFAULT_CATEGORIES = [
  'All',
  'Technology',
  'Management',
  'Business',
  'Lifestyle',
  'Engineering',
];

export function BlogTableToolbar({
  searchValue,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  categories = DEFAULT_CATEGORIES,
  viewMode = 'table',
  onViewModeChange,
  statusFilter = 'All',
  onStatusFilterChange,
  totalResults,
}: BlogTableToolbarProps) {
  const categoryList = Array.from(new Set(['All', ...categories]));

  return (
    <div className="flex flex-col p-6 gap-5 border-b border-border-subtle/60">
      {/* Top search & layout switcher bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors"
            size={18}
          />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, category, or author..."
            className="pl-11! pr-10! h-12! rounded-2xl! border-border-subtle! bg-surface-subtle/50! focus:bg-white!"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-1">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Status Quick Filter */}
          {onStatusFilterChange && (
            <div className="flex items-center p-1 rounded-2xl bg-surface-subtle/80 border border-border-subtle">
              {['All', 'Published', 'Draft'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => onStatusFilterChange(status)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                    statusFilter === status
                      ? 'bg-white shadow-xs text-primary'
                      : 'text-muted hover:text-foreground'
                  }`}>
                  {status}
                </button>
              ))}
            </div>
          )}

          {/* View Mode Toggle */}
          {onViewModeChange && (
            <div className="flex items-center p-1 rounded-2xl bg-surface-subtle/80 border border-border-subtle">
              <button
                type="button"
                onClick={() => onViewModeChange('table')}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'table'
                    ? 'bg-white shadow-xs text-primary'
                    : 'text-muted hover:text-foreground'
                }`}
                title="Data Table View">
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-xs text-primary'
                    : 'text-muted hover:text-foreground'
                }`}
                title="Magazine Card Grid View">
                <LayoutGrid size={16} />
              </button>
            </div>
          )}

          {totalResults !== undefined && (
            <span className="text-xs font-bold text-muted hidden lg:inline-block px-2">
              {totalResults} {totalResults === 1 ? 'article' : 'articles'}
            </span>
          )}
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="overflow-x-auto pb-1 scrollbar-none flex items-center gap-2">
        <Sparkles size={14} className="text-primary shrink-0 opacity-60 ml-1 mr-1" />
        <Tabs items={categoryList} activeItem={activeCategory} onItemChange={onCategoryChange} />
      </div>
    </div>
  );
}

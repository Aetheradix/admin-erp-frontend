import { Search } from 'lucide-react';
import { CATEGORY_FILTERS, STATUS_FILTERS } from '../constants';
import type { AuditView } from '../types';

interface AuditFiltersProps {
  activeView: AuditView;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
}

export function AuditFilters({
  activeView,
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
}: AuditFiltersProps) {
  return (
    <div className="bg-white rounded-2xl border border-border-subtle shadow-soft p-6 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search logs by action, actor, email, or target..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-subtle border-none text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {activeView === 'stream' && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-muted uppercase tracking-wider mr-1">
              Status:
            </span>
            {STATUS_FILTERS.map((st) => (
              <button
                key={st}
                onClick={() => onStatusChange(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-surface-subtle text-muted hover:text-foreground'
                }`}>
                {st === 'all' ? 'All Outcomes' : st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category Filter Pills — only for Activity Stream */}
      {activeView === 'stream' && (
        <div className="flex items-center gap-2 border-t border-border-subtle/60 pt-4 overflow-x-auto no-scrollbar">
          {CATEGORY_FILTERS.map((cat) => {
            const Icon = cat.icon;
            const active = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  active
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-surface-subtle text-muted hover:text-foreground hover:bg-surface-subtle/80'
                }`}>
                <Icon size={13} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

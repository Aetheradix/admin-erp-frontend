import { Dialog } from '@/components/ui/composed/Dialog';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import {
  Filter,
  Calendar as CalendarIcon,
  Tag,
  UserCheck,
  Building2,
  RotateCcw,
} from 'lucide-react';
import type { EventFilters, FilterOptions } from '@/types/models';

interface EventFilterDrawerProps {
  visible: boolean;
  onHide: () => void;
  filters: EventFilters;
  filterOptions?: FilterOptions;
  onFilterChange: (newFilters: EventFilters) => void;
  onResetFilters: () => void;
}

export const EventFilterDrawer = ({
  visible,
  onHide,
  filters,
  filterOptions,
  onFilterChange,
  onResetFilters,
}: EventFilterDrawerProps) => {
  const categories = filterOptions?.categories || [];
  const tags = filterOptions?.tags || [];
  const employeeStatuses = filterOptions?.employeeStatuses || [];
  const departments = filterOptions?.departments || [];

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    onFilterChange({ ...filters, tags: newTags });
  };

  const handleStatusToggle = (status: string) => {
    const currentStatuses = filters.employee_statuses || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];
    onFilterChange({ ...filters, employee_statuses: newStatuses });
  };

  const handleDepartmentToggle = (dept: string) => {
    const currentDepts = filters.departments || [];
    const newDepts = currentDepts.includes(dept)
      ? currentDepts.filter((d) => d !== dept)
      : [...currentDepts, dept];
    onFilterChange({ ...filters, departments: newDepts });
  };

  const activeCount =
    (filters.category && filters.category !== 'All' ? 1 : 0) +
    (filters.tags?.length || 0) +
    (filters.employee_statuses?.length || 0) +
    (filters.departments?.length || 0) +
    (filters.start_date ? 1 : 0) +
    (filters.end_date ? 1 : 0) +
    (filters.search ? 1 : 0);

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Filter Calendar & Events"
      modal
      className="w-full max-w-2xl mx-4"
      contentClassName="p-8"
      headerClassName="px-8 pt-8 pb-4 text-2xl font-black tracking-tight border-none"
      pt={{
        root: { className: 'rounded-[40px] overflow-hidden border-none shadow-2xl bg-white' },
        mask: { className: 'backdrop-blur-md bg-black/40' },
      }}
    >
      <div className="flex flex-col gap-6">
        {/* Subtitle & Active Filters Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
            <Filter size={16} className="text-primary" />
            <span>Refine event results with active database dynamic filters</span>
          </div>
          {activeCount > 0 && (
            <Button
              variant="ghost"
              onClick={onResetFilters}
              className="text-xs font-black text-red-500 hover:text-red-600 gap-1.5 p-0! h-auto!"
            >
              <RotateCcw size={14} />
              Reset All ({activeCount})
            </Button>
          )}
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <Tag size={14} className="text-primary" />
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`px-4 py-2 rounded-2xl font-black text-xs transition-all border ${
                  !filters.category || filters.category === 'All'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface-subtle text-foreground border-border-subtle hover:border-primary/40'
                }`}
                onClick={() => onFilterChange({ ...filters, category: 'All' })}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all border ${
                    filters.category === cat
                      ? 'bg-primary text-white border-primary font-black'
                      : 'bg-surface-subtle text-foreground border-border-subtle hover:border-primary/40'
                  }`}
                  onClick={() => onFilterChange({ ...filters, category: cat })}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Employee Status (Single Source of Truth) */}
        {employeeStatuses.length > 0 && (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <UserCheck size={14} className="text-primary" />
              Employee Status Filter
            </label>
            <p className="text-[11px] text-muted font-medium">
              Dynamically matches author status in real-time
            </p>
            <div className="flex flex-wrap gap-2">
              {employeeStatuses.map((st) => {
                const isSelected = filters.employee_statuses?.includes(st);
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusToggle(st)}
                    className={`px-3 py-1.5 rounded-2xl text-xs font-black tracking-wide border transition-all ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-surface-subtle text-foreground border-border-subtle hover:border-primary/30'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Event Tags */}
        {tags.length > 0 && (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <Tag size={14} className="text-primary" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 border border-border-subtle/50 rounded-2xl">
              {tags.map((t) => {
                const isSelected = filters.tags?.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTagToggle(t)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                      isSelected
                        ? 'bg-primary/10 text-primary border-primary font-black'
                        : 'bg-white text-muted border-border-subtle hover:text-foreground'
                    }`}
                  >
                    #{t}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Department Filter */}
        {departments.length > 0 && (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <Building2 size={14} className="text-primary" />
              Department
            </label>
            <div className="flex flex-wrap gap-2">
              {departments.map((dept) => {
                const isSelected = filters.departments?.includes(dept);
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => handleDepartmentToggle(dept)}
                    className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-foreground text-white border-foreground font-black'
                        : 'bg-surface-subtle text-muted border-border-subtle hover:text-foreground'
                    }`}
                  >
                    {dept}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Date Range Filter */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
            <CalendarIcon size={14} className="text-primary" />
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-muted uppercase">From</span>
              <Input
                type="date"
                value={filters.start_date || ''}
                onChange={(e) => onFilterChange({ ...filters, start_date: e.target.value })}
                className="h-10! text-xs!"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-muted uppercase">To</span>
              <Input
                type="date"
                value={filters.end_date || ''}
                onChange={(e) => onFilterChange({ ...filters, end_date: e.target.value })}
                className="h-10! text-xs!"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-border-subtle">
          <Button
            variant="secondary"
            onClick={onHide}
            className="h-11 rounded-2xl! px-6 font-bold text-xs border-border-subtle!"
          >
            Close
          </Button>
          <Button
            onClick={onHide}
            className="h-11 rounded-2xl! px-8 font-black text-xs uppercase tracking-wider bg-primary text-white"
          >
            Apply Filters {activeCount > 0 ? `(${activeCount})` : ''}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

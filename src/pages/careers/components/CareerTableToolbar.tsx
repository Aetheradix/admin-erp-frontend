import { Search, Filter, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/primitives/Input';
import { Button } from '@/components/ui/primitives/Button';
import { Tabs } from '@/components/ui/primitives/Tabs';
import { mockCareers } from '../hooks/mockCareers';

interface CareerTableToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeDepartment: string;
  onDepartmentChange: (value: string) => void;
}

const DEPARTMENTS = ['All', ...new Set(mockCareers.map((c) => c.department))];

export function CareerTableToolbar({
  searchQuery,
  onSearchChange,
  activeDepartment,
  onDepartmentChange,
}: CareerTableToolbarProps) {
  return (
    <div className="flex flex-col gap-6 bg-white p-6 rounded-[40px] border border-border-subtle shadow-soft transition-all duration-500 hover:shadow-lg">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Search Input */}
        <div className="relative w-full lg:max-w-md group">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors"
            size={20}
          />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search roles (e.g. Engineer, Designer)..."
            className="pl-14! h-14! rounded-2xl! text-sm! font-medium! border-border-subtle! group-hover:border-primary/30 transition-all duration-300"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Button
            variant="secondary"
            className="flex-1 lg:flex-none h-14 px-8 rounded-2xl! gap-3 border-border-subtle! hover:bg-surface-subtle transition-all duration-300"
          >
            <Filter size={18} className="text-primary" />
            <span className="font-bold text-sm uppercase tracking-wider">Advanced Filters</span>
          </Button>

          <div className="hidden lg:flex w-14 h-14 bg-surface-subtle border border-border-subtle rounded-2xl items-center justify-center text-muted hover:text-primary transition-colors cursor-pointer">
            <Briefcase size={20} />
          </div>
        </div>
      </div>

      {/* Department Tabs */}
      <div className="overflow-x-auto pb-2 no-scrollbar">
        <Tabs items={DEPARTMENTS} activeItem={activeDepartment} onItemChange={onDepartmentChange} />
      </div>
    </div>
  );
}

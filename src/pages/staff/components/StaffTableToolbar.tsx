import { Search, Filter, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/primitives/Input';
import { Button } from '@/components/ui/primitives/Button';
import { Tabs } from '@/components/ui/primitives/Tabs';
import { mockStaff } from '../hooks/mockStaff';

interface StaffTableToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeDepartment: string;
  onDepartmentChange: (value: string) => void;
  onAddNewStaff: () => void;
}

const DEPARTMENTS = ['All', ...new Set(mockStaff.map((s) => s.department))];

export function StaffTableToolbar({
  searchQuery,
  onSearchChange,
  activeDepartment,
  onDepartmentChange,
  onAddNewStaff,
}: StaffTableToolbarProps) {
  return (
    <div className="flex flex-col gap-6 bg-white p-6 rounded-[40px] border border-border-subtle shadow-soft hover:shadow-lg transition-all duration-500">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Search Input */}
        <div className="relative w-full lg:max-w-md group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={20} />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, role, or skills..."
            className="pl-14! h-14! rounded-2xl! text-sm! font-medium! border-border-subtle! group-hover:border-primary/30 transition-all duration-300"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Button
            variant="secondary"
            className="flex-1 lg:flex-none h-14 px-8 rounded-2xl! gap-3 border-border-subtle! hover:bg-surface-subtle"
          >
            <Filter size={18} className="text-primary" />
            <span className="font-bold text-sm uppercase tracking-wider">Filters</span>
          </Button>
          
          <Button
            onClick={onAddNewStaff}
            variant="primary"
            className="flex-1 lg:flex-none h-14 px-8 rounded-2xl! gap-3 shadow-lg shadow-primary/20"
          >
            <UserPlus size={18} />
            <span className="font-black text-sm uppercase tracking-widest">Add Member</span>
          </Button>
        </div>
      </div>

      {/* Department Tabs */}
      <div className="overflow-x-auto pb-2 no-scrollbar">
        <Tabs
          items={DEPARTMENTS}
          activeItem={activeDepartment}
          onItemChange={onDepartmentChange}
        />
      </div>
    </div>
  );
}

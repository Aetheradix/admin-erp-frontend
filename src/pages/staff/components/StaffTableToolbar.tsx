import { Input } from '@/components/ui/primitives/Input';
import { Tabs } from '@/components/ui/primitives/Tabs';
import { useGetDepartmentsQuery } from '@/store/api/authApiSlice';
import { Search } from 'lucide-react';

interface StaffTableToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeDepartment: string;
  onDepartmentChange: (value: string) => void;
}

export function StaffTableToolbar({
  searchQuery,
  onSearchChange,
  activeDepartment,
  onDepartmentChange,
}: StaffTableToolbarProps) {
  const { data: departmentsData } = useGetDepartmentsQuery({});
  const departments = departmentsData?.data ?? [];
  const DEPARTMENTS = ['All', ...departments.map((d: any) => d.department_name)];
  console.log(DEPARTMENTS);

  return (
    <div className="flex flex-col gap-6 bg-white p-6 rounded-[40px] border border-border-subtle shadow-soft hover:shadow-lg transition-all duration-500">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Search Input */}
        <div className="relative w-full lg:max-w-md group">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors"
            size={20}
          />
          <Input
            value={searchQuery}
            onChange={(e: any) => onSearchChange(e.target.value)}
            placeholder="Search by name, role, or skills..."
            className="pl-14! h-14! rounded-2xl! text-sm! font-medium! border-border-subtle! group-hover:border-primary/30 transition-all duration-300"
          />
        </div>
      </div>

      {/* Department Tabs */}
      <div className="overflow-x-auto pb-2 no-scrollbar">
        <Tabs items={DEPARTMENTS} activeItem={activeDepartment} onItemChange={onDepartmentChange} />
      </div>
    </div>
  );
}

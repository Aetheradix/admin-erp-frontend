import { SearchInput, TabbedLayout } from '@/shared';
import { useGetDepartmentsQuery } from '@/store/api/authApiSlice';

interface StaffTableToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeDepartment: string;
  onDepartmentChange: (value: string) => void;
}

interface DepartmentRecord {
  department_name?: string | null;
}

export function StaffTableToolbar({
  searchQuery,
  onSearchChange,
  activeDepartment,
  onDepartmentChange,
}: StaffTableToolbarProps) {
  const { data: departmentsData } = useGetDepartmentsQuery({});
  const departments: DepartmentRecord[] = Array.isArray(departmentsData?.data)
    ? departmentsData.data
    : [];
  const DEPARTMENTS = [
    'All',
    ...departments
      .map((department) => department.department_name)
      .filter((name): name is string => Boolean(name)),
  ];

  return (
    <div className="flex flex-col gap-6 bg-white p-6 rounded-[40px] border border-border-subtle shadow-soft hover:shadow-lg transition-all duration-500">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Search Input */}
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search by name, role, or skills..."
          className="lg:max-w-md"
          iconClassName="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors"
          iconSize={20}
          inputClassName="pl-14! h-14! rounded-2xl! text-sm! font-medium! border-border-subtle! group-hover:border-primary/30 transition-all duration-300"
        />
      </div>

      {/* Department Tabs */}
      <TabbedLayout
        items={DEPARTMENTS}
        activeItem={activeDepartment}
        onItemChange={onDepartmentChange}
        className="pb-2 no-scrollbar"
      />
    </div>
  );
}

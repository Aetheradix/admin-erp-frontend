import { getDepartmentColor } from '../../utils/orgLayoutEngine';

interface DepartmentFilterChipsProps {
  departmentFilters: Array<{ name: string; count: number }>;
  totalEmployees: number;
  selectedDepartment: string;
  onSelectDepartment: (department: string) => void;
}

const activeChipClass = 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs';
const idleChipClass =
  'bg-surface-elevated hover:bg-surface-subtle border border-border-subtle text-muted-foreground hover:text-foreground';

export function DepartmentFilterChips({
  departmentFilters,
  totalEmployees,
  selectedDepartment,
  onSelectDepartment,
}: DepartmentFilterChipsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap pt-1">
      <button
        type="button"
        onClick={() => onSelectDepartment('ALL')}
        className={`h-7 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
          selectedDepartment === 'ALL' ? activeChipClass : idleChipClass
        }`}>
        <span>All Teams ({totalEmployees})</span>
      </button>

      {departmentFilters.map((dept) => {
        const color = getDepartmentColor(dept.name);
        const isActive = selectedDepartment.toLowerCase() === dept.name.toLowerCase();
        return (
          <button
            key={dept.name}
            type="button"
            onClick={() => onSelectDepartment(isActive ? 'ALL' : dept.name)}
            className={`h-7 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isActive ? activeChipClass : idleChipClass
            }`}>
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: color.dot }}
            />
            <span>{dept.name}</span>
          </button>
        );
      })}
    </div>
  );
}

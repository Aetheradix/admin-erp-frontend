import { EXPENSE_CATEGORIES, EXPENSE_STATUSES } from '../constants';

interface ExpenseFiltersBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  onReset: () => void;
}

export function ExpenseFiltersBar({
  searchQuery,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  onReset,
}: ExpenseFiltersBarProps) {
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search by title, employee, vendor, or #"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {EXPENSE_CATEGORIES.map((option) => (
              <option key={option} value={option}>
                Category: {option}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {EXPENSE_STATUSES.map((option) => (
              <option key={option} value={option}>
                Status: {option}
              </option>
            ))}
          </select>

          <button
            onClick={onReset}
            className="text-sm text-gray-500 hover:text-gray-800 underline px-2 py-1">
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}

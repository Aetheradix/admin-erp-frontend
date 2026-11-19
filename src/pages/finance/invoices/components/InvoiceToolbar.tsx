import { Filter, Plus } from 'lucide-react';

interface InvoiceToolbarProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onCreateNew: () => void;
  isGenerating: boolean;
}

export function InvoiceToolbar({
  searchText,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onCreateNew,
  isGenerating,
}: InvoiceToolbarProps) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search invoice id, client, amount..."
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 w-64 shadow-xs"
        />

        <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs shadow-xs">
          <Filter size={14} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="bg-transparent border-none text-xs font-semibold text-slate-700 outline-none cursor-pointer">
            <option value="ALL">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          disabled={isGenerating}
          onClick={onCreateNew}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 transition disabled:opacity-50 shadow-xs active:scale-95 cursor-pointer">
          <Plus size={16} />
          {isGenerating ? 'Generating...' : 'Create Invoice'}
        </button>
      </div>
    </div>
  );
}

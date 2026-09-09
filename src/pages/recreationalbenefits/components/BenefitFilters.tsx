import { Search, X } from 'lucide-react';

interface Props {
  search: string;
  status: string;
  benefitType: string;

  onSearchChange: (value: string) => void;

  onStatusChange: (value: string) => void;

  onBenefitTypeChange: (value: string) => void;

  onClear: () => void;
}

export default function BenefitFilters({
  search,
  status,
  benefitType,
  onSearchChange,
  onStatusChange,
  onBenefitTypeChange,
  onClear,
}: Props) {
  const hasFilters = search || status || benefitType;

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 lg:flex-row">
      <div className="relative flex-1">
        <Search
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />

        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search benefits..."
          className="w-full rounded-lg border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="rounded-lg border bg-background px-3 py-2.5 text-sm"
      >
        <option value="">All Status</option>

        <option value="Active">Active</option>

        <option value="Inactive">Inactive</option>
      </select>

      <input
        value={benefitType}
        onChange={(e) => onBenefitTypeChange(e.target.value)}
        placeholder="Benefit type"
        className="rounded-lg border bg-background px-3 py-2.5 text-sm"
      />

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm hover:bg-muted"
        >
          <X size={16} />
          Clear
        </button>
      )}
    </div>
  );
}

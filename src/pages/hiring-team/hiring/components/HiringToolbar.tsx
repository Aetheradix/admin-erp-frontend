import { Search } from 'lucide-react';
import { Tabs } from '@/components/ui/primitives/Tabs';
import { HIRING_TABS } from '../constants';

interface HiringToolbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function HiringToolbar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
}: HiringToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      <Tabs items={HIRING_TABS} activeItem={activeTab} onItemChange={onTabChange} />
      <div className="relative min-w-[280px]">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search by name, email, ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border-subtle bg-white text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>
    </div>
  );
}

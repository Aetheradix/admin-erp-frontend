import { Search } from 'lucide-react';
import { Tabs } from '@/components/ui/primitives/Tabs';
import { USERS_TABS } from '../constants';
import type { UsersTab } from '../types';

interface UsersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeTab: UsersTab;
  onTabChange: (tab: UsersTab) => void;
}

export function UsersToolbar({
  search,
  onSearchChange,
  activeTab,
  onTabChange,
}: UsersToolbarProps) {
  return (
    <div className="bg-white rounded-2xl border border-border-subtle shadow-soft p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="relative flex-1 max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder={
            activeTab === 'Invite Audit Log'
              ? 'Search invitations by name, email, or admin...'
              : 'Search users by name, email, department, role...'
          }
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-subtle border-none text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <Tabs
        items={USERS_TABS}
        activeItem={activeTab}
        onItemChange={(item) => onTabChange(item as UsersTab)}
      />
    </div>
  );
}

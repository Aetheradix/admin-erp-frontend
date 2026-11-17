import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import { EmployeeAvatar } from '../nodes/EmployeeAvatar';

interface PersonListItemProps {
  user: HierarchyNodeUser;
  onClick: (user: HierarchyNodeUser) => void;
  size?: 'sm' | 'md';
}

export const PersonListItem: React.FC<PersonListItemProps> = React.memo(({
  user,
  onClick,
  size = 'sm',
}) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(user)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(user);
        }
      }}
      className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs cursor-pointer group transition-all focus:outline-none focus:ring-2 focus:ring-[#0078d4]"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <EmployeeAvatar user={user} size={size} presence={false} />
        <div className="min-w-0">
          <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-[#0078d4] transition-colors">
            {user.username}
          </span>
          <span className="text-[10px] text-slate-500 block truncate">
            {user.designation || user.role}
          </span>
        </div>
      </div>
      <ChevronRight size={13} className="text-slate-400 group-hover:text-[#0078d4] transition-transform group-hover:translate-x-0.5 shrink-0" />
    </div>
  );
});

PersonListItem.displayName = 'PersonListItem';

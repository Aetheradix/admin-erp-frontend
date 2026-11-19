import { memo } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { PersonSummary } from '../types/common';
import { FALLBACK } from '../constants/fallbacks';
import { Avatar } from './Avatar';

export interface PersonListItemProps<T extends PersonSummary = PersonSummary> {
  user: T;
  onClick: (user: T) => void;
  size?: 'sm' | 'md';
  color?: string;
  className?: string;
}

function PersonListItemInner<T extends PersonSummary>({
  user,
  onClick,
  size = 'sm',
  color,
  className,
}: PersonListItemProps<T>) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(user)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick(user);
        }
      }}
      className={cn(
        'flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs cursor-pointer group transition-all focus:outline-none focus:ring-2 focus:ring-[#0078d4]',
        className
      )}>
      <div className="flex items-center gap-2.5 min-w-0">
        <Avatar
          name={user.username || user.name || FALLBACK.DEFAULT_NAME}
          imageUrl={user.image_url || user.image}
          size={size}
          backgroundColor={color}
          presence={false}
        />
        <div className="min-w-0">
          <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-[#0078d4] transition-colors">
            {user.username || user.name || FALLBACK.DEFAULT_NAME}
          </span>
          <span className="text-[10px] text-slate-500 block truncate">
            {user.designation || user.role || ''}
          </span>
        </div>
      </div>
      <ChevronRight
        size={13}
        className="text-slate-400 group-hover:text-[#0078d4] transition-transform group-hover:translate-x-0.5 shrink-0"
      />
    </div>
  );
}

export const PersonListItem = memo(PersonListItemInner) as typeof PersonListItemInner;

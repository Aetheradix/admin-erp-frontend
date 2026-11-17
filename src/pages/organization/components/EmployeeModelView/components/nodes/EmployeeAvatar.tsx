import React from 'react';
import { Tooltip } from 'antd';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import { getDepartmentColor } from '@/pages/organization/utils/orgLayoutEngine';

interface EmployeeAvatarProps {
  user: HierarchyNodeUser | null;
  size?: 'xl' | 'lg' | 'md' | 'sm';
  presence?: boolean;
}

const SIZE_MAP = {
  xl: 'w-20 h-20 text-2xl',
  lg: 'w-14 h-14 text-lg',
  md: 'w-10 h-10 text-xs',
  sm: 'w-8 h-8 text-[11px]',
} as const;

export const EmployeeAvatar: React.FC<EmployeeAvatarProps> = React.memo(({
  user,
  size = 'md',
  presence = true,
}) => {
  if (!user) return null;

  const initials =
    (user.username || 'User')
      .split(' ')
      .map((w) => w[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  const color = getDepartmentColor(user.department);

  return (
    <div className="relative shrink-0">
      {user.image_url ? (
        <div className={`${SIZE_MAP[size]} rounded-full overflow-hidden border-2 border-white shadow-md`}>
          <img src={user.image_url} alt={user.username} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div
          className={`${SIZE_MAP[size]} rounded-full flex items-center justify-center font-black text-white shadow-md border-2 border-white`}
          style={{ backgroundColor: color.text }}
        >
          {initials}
        </div>
      )}
      {presence && (
        <Tooltip title="Available / Active">
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#107c41] border-2 border-white shadow-xs cursor-default" />
        </Tooltip>
      )}
    </div>
  );
});

EmployeeAvatar.displayName = 'EmployeeAvatar';

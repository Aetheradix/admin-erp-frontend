import React from 'react';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import { Avatar } from '@/shared/components/Avatar';
import { getDepartmentColor } from '@/pages/organization/utils/orgLayoutEngine';

interface EmployeeAvatarProps {
  user: HierarchyNodeUser | null;
  size?: 'xl' | 'lg' | 'md' | 'sm';
  presence?: boolean;
}

export const EmployeeAvatar: React.FC<EmployeeAvatarProps> = React.memo(({
  user,
  size = 'md',
  presence = true,
}) => {
  if (!user) return null;

  return (
    <Avatar
      name={user.username}
      imageUrl={user.image_url}
      alt={user.username}
      size={size}
      backgroundColor={getDepartmentColor(user.department).text}
      presence={presence}
    />
  );
});

EmployeeAvatar.displayName = 'EmployeeAvatar';

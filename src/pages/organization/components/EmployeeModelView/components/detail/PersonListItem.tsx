import React from 'react';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import { PersonListItem as SharedPersonListItem } from '@/shared/components/PersonListItem';
import { getDepartmentColor } from '@/pages/organization/utils/orgLayoutEngine';

interface PersonListItemProps {
  user: HierarchyNodeUser;
  onClick: (user: HierarchyNodeUser) => void;
  size?: 'sm' | 'md';
}

export const PersonListItem: React.FC<PersonListItemProps> = React.memo(({
  user,
  onClick,
  size = 'sm',
}) => (
  <SharedPersonListItem
    user={user}
    onClick={onClick}
    size={size}
    color={getDepartmentColor(user.department).text}
  />
));

PersonListItem.displayName = 'PersonListItem';

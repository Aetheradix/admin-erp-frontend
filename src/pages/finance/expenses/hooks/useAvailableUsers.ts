import { useMemo } from 'react';
import { useGetUsersQuery } from '@/store/api/userSlice';
import { FALLBACK } from '@/shared/constants/fallbacks';
import type { UserOption } from '../types';

export function useAvailableUsers(): UserOption[] {
  const { data: apiUsers = [] } = useGetUsersQuery();

  return useMemo(
    () =>
      apiUsers.map((user) => ({
        id: user.id,
        name: user.name || user.username || user.email,
        department: user.department || FALLBACK.GENERAL_DEPARTMENT,
        email: user.email,
      })),
    [apiUsers]
  );
}

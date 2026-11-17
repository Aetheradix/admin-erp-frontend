import { useCallback } from 'react';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import type { StaffMember } from '@/types/models';
import type { EmployeeInput } from '../types';
import {
  extractTargetIdentifiers,
  matchesUser,
  mapDbUserToHierarchy,
  fallbackFromTarget,
} from '../utils/resolveUser';

export function useResolveUser(
  flatUsers: HierarchyNodeUser[],
  flatUsersById: Map<number, HierarchyNodeUser>,
  dbUsers: StaffMember[]
) {
  return useCallback(
    (target: EmployeeInput | null | undefined): HierarchyNodeUser | null => {
      if (target === null || target === undefined) return null;

      const targetInfo = extractTargetIdentifiers(target);

      // 1. Fast O(1) ID lookup
      if (targetInfo.id) {
        const direct = flatUsersById.get(Number(targetInfo.id));
        if (direct) return direct;
      }

      // 2. Scan flatUsers for code, email, name match
      const foundInFlat = flatUsers.find((u) => matchesUser(u, targetInfo));
      if (foundInFlat) return foundInFlat;

      // 3. Fallback scan in dbUsers
      if (dbUsers.length > 0) {
        const foundInDb = dbUsers.find((u) => {
          if (targetInfo.id && String(u.id) === targetInfo.id) return true;
          const uCode = u.employee_code || u.employee_id;
          if (targetInfo.code && uCode && uCode.toLowerCase() === targetInfo.code.toLowerCase()) {
            return true;
          }
          if (targetInfo.email && u.email && u.email.toLowerCase() === targetInfo.email) {
            return true;
          }
          const uName = u.username || u.name;
          if (targetInfo.name && uName && uName.toLowerCase() === targetInfo.name) {
            return true;
          }
          return false;
        });

        if (foundInDb) {
          return mapDbUserToHierarchy(foundInDb);
        }
      }

      // 4. Construct synthetic fallback from target object
      return fallbackFromTarget(target);
    },
    [flatUsers, flatUsersById, dbUsers]
  );
}

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  useLoginMutation,
  useLogoutMutation,
  useLazyGetMyPermissionsQuery,
} from '../store/api/authApiSlice';
import type { User, LoginCredentials, TeamScope } from '../types/auth';
import {
  aggregateRolePermissions,
  matchesPermission,
  isUserSuperadmin,
  extractUserRoles,
} from '@/utils/rbac';

import { AuthContext } from './AuthContext.base';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    return !!(token && savedUser && savedUser !== 'undefined');
  });

  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && savedUser !== 'undefined') {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [permissions, setPermissions] = useState<string[]>(() => {
    try {
      const savedUserStr = localStorage.getItem('user');
      const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
      const saved = localStorage.getItem('erp_permissions');
      const directPerms = saved ? JSON.parse(saved) : [];
      if (savedUser) {
        const userRoles = extractUserRoles(savedUser);
        return aggregateRolePermissions(userRoles, undefined, directPerms);
      }
      return directPerms;
    } catch {
      return [];
    }
  });

  const [roles, setRoles] = useState<string[]>(() => {
    try {
      const savedUserStr = localStorage.getItem('user');
      const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
      const saved = localStorage.getItem('erp_roles_list');
      const parsedRoles = saved ? JSON.parse(saved) : [];
      if (savedUser) {
        const userRoles = extractUserRoles(savedUser).map((r) => r.name);
        return Array.from(new Set([...parsedRoles, ...userRoles]));
      }
      return parsedRoles;
    } catch {
      return [];
    }
  });

  const [teamScopes, setTeamScopes] = useState<TeamScope[]>(() => {
    try {
      const saved = localStorage.getItem('erp_team_scopes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isSuperadmin, setIsSuperadmin] = useState<boolean>(() => {
    try {
      const savedUserStr = localStorage.getItem('user');
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        return isUserSuperadmin(parsed) || localStorage.getItem('erp_is_superadmin') === 'true';
      }
    } catch {
      return false;
    }
    return false;
  });

  const [isLoading, setIsLoading] = useState(true);

  const [loginApi] = useLoginMutation();
  const [logoutApi] = useLogoutMutation();
  const [fetchMyPermissionsTrigger] = useLazyGetMyPermissionsQuery();

  const fetchPermissions = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const result = await fetchMyPermissionsTrigger().unwrap();
      if (result && result.data) {
        const rawPerms = result.data.permissions || [];
        const roleList = result.data.roles || [];
        const scopes = result.data.teamScopes || [];

        // Extract all roles assigned to user
        const assignedRoleList = extractUserRoles(result.data.user || user);
        const combinedRoles = Array.from(
          new Set([...roleList, ...assignedRoleList.map((r) => r.name)])
        );

        // Aggregate permissions across all assigned roles into a union
        const effectivePerms = aggregateRolePermissions(combinedRoles, undefined, rawPerms);
        const superadmin =
          Boolean(result.data.isSuperadmin) ||
          isUserSuperadmin(result.data.user || user, combinedRoles);

        setPermissions(effectivePerms);
        setRoles(combinedRoles);
        setTeamScopes(scopes);
        setIsSuperadmin(superadmin);

        localStorage.setItem('erp_permissions', JSON.stringify(effectivePerms));
        localStorage.setItem('erp_roles_list', JSON.stringify(combinedRoles));
        localStorage.setItem('erp_team_scopes', JSON.stringify(scopes));
        localStorage.setItem('erp_is_superadmin', String(superadmin));

        if (result.data.user) {
          setUser((prev) => {
            const updated = {
              ...(prev || {}),
              ...result.data.user,
              employeeId:
                result.data.user.employee_code ||
                result.data.user.employeeId ||
                (prev as any)?.employeeId,
              employee_id:
                result.data.user.employee_code ||
                result.data.user.employee_id ||
                (prev as any)?.employee_id,
            };
            try {
              localStorage.setItem('user', JSON.stringify(updated));
            } catch {}
            return updated as User;
          });
        }
      }
    } catch (err: any) {
      console.warn('[RBAC] Could not fetch permissions from /me/permissions:', err);
      // Reset permissions if server rejected verification
      if (err?.status === 401 || err?.status === 403) {
        setPermissions([]);
        setRoles([]);
        setIsSuperadmin(false);
        localStorage.removeItem('erp_permissions');
        localStorage.removeItem('erp_roles_list');
        localStorage.removeItem('erp_is_superadmin');
      }
    }
  }, [fetchMyPermissionsTrigger]);

  const login = async (credentials: LoginCredentials) => {
    try {
      localStorage.removeItem('aether_last_activity');

      const response = await loginApi(credentials).unwrap();
      if (response && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('aether_last_activity', String(Date.now()));
        setIsAuthenticated(true);
        setUser(response.user);

        // Fetch permissions immediately after login
        await fetchPermissions();
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  /**
   * Called after each onboarding step to persist new token + updated user fields.
   * Does NOT re-fetch permissions (onboarded users will get them on next full login).
   */
  const updateUser = useCallback((partial: Partial<User>, newToken?: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      localStorage.setItem('user', JSON.stringify(updated));

      // Re-aggregate permissions if roles, role, or permissions updated
      if (
        partial.roles !== undefined ||
        partial.role !== undefined ||
        partial.permissions !== undefined
      ) {
        const assignedRoleList = extractUserRoles(updated);
        const combinedRoles = Array.from(
          new Set([
            ...assignedRoleList.map((r) => r.name),
            ...(Array.isArray(partial.roles)
              ? partial.roles.map((r) => (typeof r === 'string' ? r : (r as any).name))
              : []),
          ])
        );
        const effectivePerms = aggregateRolePermissions(
          assignedRoleList,
          undefined,
          partial.permissions || updated.permissions || []
        );
        const superadmin = isUserSuperadmin(updated, combinedRoles);

        setPermissions(effectivePerms);
        setRoles(combinedRoles);
        setIsSuperadmin(superadmin);

        localStorage.setItem('erp_permissions', JSON.stringify(effectivePerms));
        localStorage.setItem('erp_roles_list', JSON.stringify(combinedRoles));
        localStorage.setItem('erp_is_superadmin', String(superadmin));
      }

      return updated;
    });
    if (newToken) {
      localStorage.setItem('token', newToken);
    }
  }, []);

  const logout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (error) {
      console.warn('Logout API call failed, clearing session locally:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('aether_last_activity');
      localStorage.removeItem('erp_permissions');
      localStorage.removeItem('erp_roles_list');
      localStorage.removeItem('erp_team_scopes');
      localStorage.removeItem('erp_is_superadmin');

      setIsAuthenticated(false);
      setUser(null);
      setPermissions([]);
      setRoles([]);
      setTeamScopes([]);
      setIsSuperadmin(false);
    }
  };

  const hasPermission = useCallback(
    (permissionKey: string): boolean => {
      const isSuper = isSuperadmin || isUserSuperadmin(user, roles);
      if (isSuper) return true;
      return matchesPermission(permissions, permissionKey, false);
    },
    [isSuperadmin, roles, permissions, user]
  );

  useEffect(() => {
    const handleUserUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<User>;
      if (customEvent.detail) {
        setUser(customEvent.detail);
      } else {
        const raw = localStorage.getItem('user');
        if (raw) {
          try {
            setUser(JSON.parse(raw));
          } catch {}
        }
      }
    };
    window.addEventListener('aether_user_updated', handleUserUpdate);
    window.addEventListener('auth_user_updated', handleUserUpdate);
    return () => {
      window.removeEventListener('aether_user_updated', handleUserUpdate);
      window.removeEventListener('auth_user_updated', handleUserUpdate);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchPermissions().finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [fetchPermissions]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        permissions,
        roles,
        teamScopes,
        isSuperadmin,
        hasPermission,
        refreshPermissions: fetchPermissions,
        login,
        logout,
        isLoading,
        updateUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

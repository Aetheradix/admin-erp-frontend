import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useLoginMutation, useLogoutMutation, useLazyGetMyPermissionsQuery } from '../store/api/authApiSlice';
import type { User, LoginCredentials, TeamScope } from '../types/auth';

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
      const saved = localStorage.getItem('erp_permissions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [roles, setRoles] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('erp_roles_list');
      return saved ? JSON.parse(saved) : [];
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
    return localStorage.getItem('erp_is_superadmin') === 'true';
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
        const perms = result.data.permissions || [];
        const roleList = result.data.roles || [];
        const scopes = result.data.teamScopes || [];
        const superadmin = Boolean(result.data.isSuperadmin);

        setPermissions(perms);
        setRoles(roleList);
        setTeamScopes(scopes);
        setIsSuperadmin(superadmin);

        localStorage.setItem('erp_permissions', JSON.stringify(perms));
        localStorage.setItem('erp_roles_list', JSON.stringify(roleList));
        localStorage.setItem('erp_team_scopes', JSON.stringify(scopes));
        localStorage.setItem('erp_is_superadmin', String(superadmin));
      }
    } catch (err) {
      console.warn('[RBAC] Could not fetch permissions from /me/permissions:', err);
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
      if (isSuperadmin) return true;
      if (roles.includes('Superadmin') || roles.includes('SuperAdmin')) return true;
      return permissions.includes(permissionKey);
    },
    [isSuperadmin, roles, permissions]
  );

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


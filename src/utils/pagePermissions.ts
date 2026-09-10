import type { User } from '@/types/auth';

export const PAGE_PERMISSIONS_STORAGE_KEY = 'erp_page_permissions';
export const ERP_CONFIG_CHANGED_EVENT = 'erp_config_changed';
export const ERP_BROADCAST_CHANNEL = 'erp_permissions_channel';

export interface RoleDefinition {
  id: string;
  label: string;
  isSuperAdmin?: boolean;
}

export const AVAILABLE_ROLES: RoleDefinition[] = [
  { id: 'SuperAdmin', label: 'Super Admin', isSuperAdmin: true },
  { id: 'Admin', label: 'Admin' },
  { id: 'HrAdmin', label: 'HR' },
  { id: 'FinanceAdmin', label: 'Finance' },
  { id: 'Manager', label: 'Manager' },
  { id: 'Employee', label: 'Employee' },
];

/**
 * Check if the given user is a Super Admin.
 * Handles role names, designations, and legacy casing.
 */
export const isSuperAdmin = (user: User | null | undefined): boolean => {
  if (!user) return false;
  const role = (user.role || '').toLowerCase().replace(/[\s_-]/g, '');
  if (role === 'superadmin') return true;
  const designation = (user.designation || '').toLowerCase();
  if (designation.includes('super admin') || designation.includes('superadmin')) return true;
  return false;
};

/**
 * Normalizes user role or role identifier to standard comparison keys.
 */
export const normalizeRole = (roleStr: string | undefined): string => {
  if (!roleStr) return '';
  const clean = roleStr.toLowerCase().replace(/[\s_-]/g, '');
  if (clean === 'superadmin') return 'SuperAdmin';
  if (clean === 'admin') return 'Admin';
  if (clean === 'hr' || clean === 'hradmin' || clean === 'humanresources') return 'HrAdmin';
  if (clean === 'finance' || clean === 'financeadmin') return 'FinanceAdmin';
  if (clean === 'manager') return 'Manager';
  if (
    clean === 'employee' ||
    clean === 'staff' ||
    clean === 'user' ||
    clean === 'regular' ||
    clean === 'normal' ||
    clean === 'viewer'
  ) {
    return 'Employee';
  }
  return roleStr;
};

/**
 * Extracts all assigned normalized roles from a user object.
 */
export const getUserRoles = (user: User | null | undefined): string[] => {
  if (!user) return [];
  const roles: string[] = [];
  if (user.role) roles.push(String(user.role));
  if (Array.isArray((user as any).roles)) {
    (user as any).roles.forEach((r: any) => {
      if (typeof r === 'string') roles.push(r);
      else if (r && typeof r.name === 'string') roles.push(r.name);
    });
  }
  if (roles.length === 0) {
    roles.push('Employee');
  }
  return [...new Set(roles.map(normalizeRole))];
};

/**
 * Retrieve the saved page-level permissions map from localStorage.
 * Format: { [pagePath: string]: string[] (allowed role ids) }
 */
export const getStoredPagePermissions = (): Record<string, string[]> => {
  try {
    const raw = localStorage.getItem(PAGE_PERMISSIONS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to parse erp_page_permissions:', err);
  }
  return {};
};

/**
 * Save updated page permissions to localStorage, server sync endpoint, and broadcast across tabs.
 */
export const saveStoredPagePermissions = (permissions: Record<string, string[]>) => {
  try {
    localStorage.setItem(PAGE_PERMISSIONS_STORAGE_KEY, JSON.stringify(permissions));
    window.dispatchEvent(new Event(ERP_CONFIG_CHANGED_EVENT));

    // Broadcast across other browser tabs/windows
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel(ERP_BROADCAST_CHANNEL);
        bc.postMessage({ type: ERP_CONFIG_CHANGED_EVENT, timestamp: Date.now() });
        bc.close();
      } catch {
        // BroadcastChannel fallback ignored
      }
    }

    // Sync to dev server endpoint so Incognito and other browsers get the permissions
    if (typeof fetch !== 'undefined') {
      fetch('/__erp_permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(permissions),
      }).catch(() => {
        // server endpoint optional in pure static builds
      });
    }
  } catch (err) {
    console.error('Failed to save erp_page_permissions:', err);
  }
};

/**
 * Fetch permissions from the server endpoint (allows Incognito to receive permissions from Normal window)
 */
export const syncRemotePermissions = async () => {
  if (typeof fetch === 'undefined') return;
  try {
    const res = await fetch('/__erp_permissions');
    if (res.ok) {
      const serverPerms = await res.json();
      if (serverPerms && Object.keys(serverPerms).length > 0) {
        const local = getStoredPagePermissions();
        // If different from local, update localStorage and notify listeners
        if (JSON.stringify(serverPerms) !== JSON.stringify(local)) {
          localStorage.setItem(PAGE_PERMISSIONS_STORAGE_KEY, JSON.stringify(serverPerms));
          window.dispatchEvent(new Event(ERP_CONFIG_CHANGED_EVENT));
        }
      }
    }
  } catch {
    // ignore
  }
};

// Auto-sync permissions on startup and when user switches between windows/tabs (e.g. Incognito to Normal)
if (typeof window !== 'undefined') {
  syncRemotePermissions();
  window.addEventListener('focus', () => {
    syncRemotePermissions();
  });
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncRemotePermissions();
    }
  });
}

/**
 * Get active allowed roles for a given page path.
 * Falls back to default roles from nav items or standard default.
 */
export const getEffectivePageRoles = (
  path: string,
  defaultRoles?: string[]
): string[] => {
  const stored = getStoredPagePermissions();
  if (stored[path] && Array.isArray(stored[path])) {
    const roles = stored[path];
    if (!roles.includes('SuperAdmin')) {
      return ['SuperAdmin', ...roles];
    }
    return roles;
  }

  // Fallback to defaultRoles or standard all-role default
  const defaults =
    defaultRoles && defaultRoles.length > 0
      ? defaultRoles
      : ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin', 'Employee', 'Manager'];

  if (!defaults.includes('SuperAdmin')) {
    return ['SuperAdmin', ...defaults];
  }
  return defaults;
};

/**
 * Checks whether a specific role (e.g. Employee) is allowed to access a given page path.
 */
export const isRoleAllowedForPage = (
  path: string,
  roleId: string,
  defaultRoles?: string[]
): boolean => {
  if (roleId === 'SuperAdmin') return true;
  const roles = getEffectivePageRoles(path, defaultRoles);
  const targetNorm = normalizeRole(roleId);
  return roles.some((r) => normalizeRole(r) === targetNorm);
};

/**
 * Checks whether the current user has access to a given page path.
 * Super Admin always has full access.
 */
export const canAccessPage = (
  pagePath: string,
  user: User | null | undefined,
  defaultRoles?: string[]
): boolean => {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;

  const allowedRoles = getEffectivePageRoles(pagePath, defaultRoles).map(normalizeRole);
  const userRoles = getUserRoles(user);

  return userRoles.some((uRole) => allowedRoles.includes(uRole));
};

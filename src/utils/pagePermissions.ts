import type { User } from '@/types/auth';

export const PAGE_PERMISSIONS_STORAGE_KEY = 'erp_page_permissions';
export const ERP_CONFIG_CHANGED_EVENT = 'erp_config_changed';

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
  if (clean === 'employee' || clean === 'staff') return 'Employee';
  return roleStr;
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
 * Save updated page permissions to localStorage and dispatch event.
 */
export const saveStoredPagePermissions = (permissions: Record<string, string[]>) => {
  try {
    localStorage.setItem(PAGE_PERMISSIONS_STORAGE_KEY, JSON.stringify(permissions));
    window.dispatchEvent(new Event(ERP_CONFIG_CHANGED_EVENT));
  } catch (err) {
    console.error('Failed to save erp_page_permissions:', err);
  }
};

/**
 * Get active allowed roles for a given page path.
 * Falls back to default roles from nav items or default roles for all.
 */
export const getEffectivePageRoles = (
  path: string,
  defaultRoles?: string[]
): string[] => {
  const stored = getStoredPagePermissions();
  if (stored[path] && Array.isArray(stored[path])) {
    // Ensure SuperAdmin is always included
    const roles = stored[path];
    if (!roles.includes('SuperAdmin')) {
      return ['SuperAdmin', ...roles];
    }
    return roles;
  }

  // Fallback to defaultRoles or standard all-role default
  const defaults = defaultRoles && defaultRoles.length > 0
    ? defaultRoles
    : ['SuperAdmin', 'Admin', 'HrAdmin', 'FinanceAdmin', 'Employee', 'Manager'];

  if (!defaults.includes('SuperAdmin')) {
    return ['SuperAdmin', ...defaults];
  }
  return defaults;
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

  const allowedRoles = getEffectivePageRoles(pagePath, defaultRoles);
  const userNormalized = normalizeRole(user.role);

  // Check if any normalized allowed role matches the normalized user role
  return allowedRoles.some((r) => normalizeRole(r) === userNormalized);
};

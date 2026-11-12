/**
 * Role-Based Access Control (RBAC) Utility
 * Supports multi-role assignments, permission aggregation across roles,
 * and robust permission matching with backward compatibility.
 */

export interface PermissionDefinition {
  id: number | string;
  name: string;
  module: string;
  action: string;
  description?: string;
}

export interface RoleDefinition {
  id: number | string;
  name: string;
  description?: string;
  is_system?: boolean;
  permissions: Array<PermissionDefinition | string>;
  color?: string;
}

// Built-in system role permission defaults
export const SYSTEM_ROLE_PERMISSIONS: Record<string, string[]> = {
  SuperAdmin: ['*'], // SuperAdmin has all permissions
  Admin: [
    'user:view',
    'user:create',
    'user:edit',
    'user:delete',
    'View Users',
    'Edit Users',
    'Create Users',
    'Delete Users',
    'role:view',
    'role:create',
    'role:edit',
    'role:delete',
    'role:assign',
    'Manage Roles',
    'report:view',
    'report:manage',
    'report:delete',
    'Manage Reports',
    'Delete Reports',
    'View Reports',
    'finance:view',
    'finance:manage',
    'payroll:view',
    'payroll:manage',
    'invoice:view',
    'expense:view',
    'inventory:view',
    'inventory:manage',
    'task:view',
    'task:manage',
    'audit:view',
    'settings:manage',
  ],
  HrAdmin: [
    'user:view',
    'user:create',
    'user:edit',
    'View Users',
    'Edit Users',
    'staff:view',
    'staff:manage',
    'onboarding:manage',
    'attendance:view',
    'attendance:manage',
    'leave:view',
    'leave:manage',
    'report:view',
    'View Reports',
  ],
  FinanceAdmin: [
    'finance:view',
    'finance:manage',
    'payroll:view',
    'payroll:manage',
    'invoice:view',
    'invoice:manage',
    'expense:view',
    'expense:manage',
    'report:view',
    'report:manage',
    'Manage Reports',
    'View Reports',
    'audit:view',
  ],
  Manager: [
    'user:view',
    'View Users',
    'team:view',
    'team:manage',
    'task:view',
    'task:manage',
    'attendance:view',
    'leave:approve',
    'report:view',
    'View Reports',
  ],
  Employee: [
    'profile:view',
    'profile:edit',
    'attendance:checkin',
    'attendance:view',
    'leave:request',
    'task:view',
    'reimbursement:request',
    'social:view',
  ],
};

const COMMON_PERMISSION_MAPPINGS: Record<string, string[]> = {
  'user:view': ['View Users', 'view users', 'users:view', 'users:read', 'user:read'],
  'user:edit': ['Edit Users', 'edit users', 'users:edit', 'users:update', 'user:update'],
  'user:create': ['Create Users', 'create users', 'users:create', 'user:add', 'Add Users'],
  'user:delete': ['Delete Users', 'delete users', 'users:delete', 'user:remove'],
  'role:view': ['View Roles', 'view roles', 'roles:view', 'role:read'],
  'role:edit': ['Edit Roles', 'edit roles', 'roles:edit', 'role:update'],
  'role:assign': ['Assign Roles', 'assign roles', 'Manage Roles', 'manage roles'],
  'role:delete': ['Delete Roles', 'delete roles', 'roles:delete'],
  'report:view': ['View Reports', 'view reports', 'reports:view', 'report:read'],
  'report:manage': ['Manage Reports', 'manage reports', 'reports:manage', 'reports:edit'],
  'report:delete': ['Delete Reports', 'delete reports', 'reports:delete', 'report:remove'],
  'finance:view': ['View Finance', 'view finance', 'finance:read'],
  'finance:manage': ['Manage Finance', 'manage finance'],
  'payroll:view': ['View Payroll', 'view payroll', 'payroll:read'],
  'payroll:manage': ['Manage Payroll', 'manage payroll'],
  'expense:view': ['View Expenses', 'view expenses', 'expenses:view'],
  'task:view': ['View Tasks', 'view tasks', 'tasks:view'],
  'task:manage': ['Manage Tasks', 'manage tasks', 'tasks:manage'],
  'inventory:view': ['View Inventory', 'view inventory', 'inventory:read'],
  'inventory:manage': ['Manage Inventory', 'manage inventory'],
  'audit:view': ['View Audit Logs', 'view audit logs', 'audit:read'],
};

/**
 * Normalizes a permission string to a clean alphanumeric lowercase form
 * for fuzzy/cross-format matching.
 * E.g. "View Users" -> "viewusers", "user:view" -> "userview", "view_users" -> "viewusers"
 */
export const cleanPermissionKey = (perm: string): string => {
  return perm.toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Expands a permission key to include known synonymous formats.
 */
export const getPermissionAliases = (permission: string): string[] => {
  const result = new Set<string>();
  const trimmed = permission.trim();
  result.add(trimmed);
  result.add(trimmed.toLowerCase());

  // Check in dictionary
  for (const [canonical, aliases] of Object.entries(COMMON_PERMISSION_MAPPINGS)) {
    if (canonical.toLowerCase() === trimmed.toLowerCase() || aliases.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
      result.add(canonical);
      aliases.forEach((a) => result.add(a));
    }
  }

  // Derive "Action Module" from "module:action" (e.g. "user:view" -> "View User", "View Users")
  if (trimmed.includes(':')) {
    const [mod, act] = trimmed.split(':');
    if (mod && act) {
      const capAct = act.charAt(0).toUpperCase() + act.slice(1);
      const capMod = mod.charAt(0).toUpperCase() + mod.slice(1);
      result.add(`${capAct} ${capMod}`);
      result.add(`${capAct} ${capMod}s`);
      result.add(`${mod}_${act}`);
      result.add(`${act}_${mod}`);
    }
  }

  // Derive "module:action" from "Action Module" (e.g. "View Users" -> "user:view")
  const parts = trimmed.split(/\s+/);
  if (parts.length === 2) {
    const [act, mod] = parts;
    const singularMod = mod.endsWith('s') ? mod.slice(0, -1) : mod;
    result.add(`${singularMod.toLowerCase()}:${act.toLowerCase()}`);
    result.add(`${mod.toLowerCase()}:${act.toLowerCase()}`);
  }

  return Array.from(result);
};

/**
 * Extracts a normalized list of role objects from a user record.
 * Supports strings, object representations, and legacy roles.
 */
export const extractUserRoles = (
  user: any
): Array<{ id: string; name: string; color?: string; permissions?: string[] }> => {
  if (!user) return [];

  const roleMap = new Map<string, { id: string; name: string; color?: string; permissions?: string[] }>();
  const defaultColors = ['red', 'blue', 'emerald', 'amber', 'indigo', 'rose', 'purple', 'teal'];

  const getRoleColor = (roleName: string, index: number) => {
    const clean = roleName.toLowerCase();
    if (clean.includes('superadmin')) return 'red';
    if (clean.includes('admin')) return 'blue';
    if (clean.includes('hr')) return 'purple';
    if (clean.includes('finance')) return 'emerald';
    if (clean.includes('manager')) return 'amber';
    return defaultColors[index % defaultColors.length];
  };

  // 1. Process explicit user.roles array
  if (Array.isArray(user.roles)) {
    user.roles.forEach((r: any, idx: number) => {
      if (typeof r === 'string' && r.trim()) {
        const name = r.trim();
        const key = name.toLowerCase();
        if (!roleMap.has(key)) {
          roleMap.set(key, {
            id: String(idx + 1),
            name,
            color: getRoleColor(name, idx),
          });
        }
      } else if (r && typeof r === 'object' && r.name) {
        const name = String(r.name).trim();
        const key = name.toLowerCase();
        if (!roleMap.has(key)) {
          roleMap.set(key, {
            id: String(r.id || idx + 1),
            name,
            color: r.color || getRoleColor(name, idx),
            permissions: Array.isArray(r.permissions)
              ? r.permissions.map((p: any) => (typeof p === 'string' ? p : p.name || ''))
              : undefined,
          });
        }
      }
    });
  }

  // 2. Process primary user.role
  if (user.role && typeof user.role === 'string' && user.role.trim()) {
    const name = user.role.trim();
    const key = name.toLowerCase();
    if (!roleMap.has(key)) {
      roleMap.set(key, {
        id: String(Date.now()),
        name,
        color: getRoleColor(name, roleMap.size),
      });
    }
  }

  // Fallback to Employee if empty
  if (roleMap.size === 0) {
    roleMap.set('employee', {
      id: '1',
      name: 'Employee',
      color: 'emerald',
    });
  }

  return Array.from(roleMap.values());
};

/**
 * Aggregates permissions across all assigned roles.
 *
 * Implements RBAC union functionality:
 * If a user has Role A and Role B:
 * Effective Permissions = (Permissions of Role A) ∪ (Permissions of Role B) ∪ (Direct user permissions).
 *
 * For example:
 * Role A grants: View Users, Edit Users
 * Role B grants: Manage Reports, Delete Reports
 * Resulting permissions contain all four permissions!
 */
export const aggregateRolePermissions = (
  userRoles: Array<string | { id?: any; name?: string; permissions?: any[] }>,
  allRoleDefinitions: any[] = [],
  directPermissions: string[] = []
): string[] => {
  const aggregated = new Set<string>();

  // Add all direct permissions provided to the user
  if (Array.isArray(directPermissions)) {
    directPermissions.forEach((p) => {
      if (typeof p === 'string' && p.trim()) {
        getPermissionAliases(p).forEach((alias) => aggregated.add(alias));
      }
    });
  }

  // Helper to load role permissions from localStorage 'erp_roles' if definitions not passed
  let storedRoles: any[] = allRoleDefinitions;
  if (!storedRoles || storedRoles.length === 0) {
    try {
      const raw = localStorage.getItem('erp_roles');
      if (raw) storedRoles = JSON.parse(raw);
    } catch {}
  }

  for (const roleEntry of userRoles) {
    let roleName = '';
    let rolePermsFromEntry: any[] = [];

    if (typeof roleEntry === 'string') {
      roleName = roleEntry.trim();
    } else if (roleEntry && typeof roleEntry === 'object') {
      roleName = (roleEntry.name || '').trim();
      if (Array.isArray(roleEntry.permissions)) {
        rolePermsFromEntry = roleEntry.permissions;
      }
    }

    if (!roleName) continue;

    // Check if SuperAdmin
    const cleanRoleName = roleName.toLowerCase().replace(/[\s_-]/g, '');
    if (cleanRoleName === 'superadmin') {
      aggregated.add('*');
    }

    // 1. If role entry directly has permissions attached
    if (rolePermsFromEntry.length > 0) {
      rolePermsFromEntry.forEach((p) => {
        const pName = typeof p === 'string' ? p : p?.name;
        if (pName && typeof pName === 'string') {
          getPermissionAliases(pName).forEach((alias) => aggregated.add(alias));
        }
      });
    }

    // 2. Check in allRoleDefinitions (e.g. from backend /roles or erp_roles)
    const matchingDef = storedRoles?.find(
      (r) =>
        r.name?.toLowerCase().trim() === roleName.toLowerCase().trim() ||
        String(r.id) === String((roleEntry as any)?.id)
    );

    if (matchingDef && Array.isArray(matchingDef.permissions)) {
      matchingDef.permissions.forEach((p: any) => {
        const pName = typeof p === 'string' ? p : p?.name;
        if (pName && typeof pName === 'string') {
          getPermissionAliases(pName).forEach((alias) => aggregated.add(alias));
        }
      });
    }

    // 3. Fallback to system role defaults
    const systemPerms = SYSTEM_ROLE_PERMISSIONS[roleName] || SYSTEM_ROLE_PERMISSIONS[cleanRoleName];
    if (systemPerms && Array.isArray(systemPerms)) {
      systemPerms.forEach((p) => {
        getPermissionAliases(p).forEach((alias) => aggregated.add(alias));
      });
    }
  }

  return Array.from(aggregated);
};

/**
 * Checks if a set of permissions satisfies the required permission.
 * Accounts for superadmin wildcard, exact match, normalized match, and alias match.
 */
export const matchesPermission = (
  userPermissions: string[],
  requiredPermission: string,
  isSuperadmin = false
): boolean => {
  if (!requiredPermission) return true;
  if (isSuperadmin) return true;

  if (!Array.isArray(userPermissions) || userPermissions.length === 0) {
    return false;
  }

  if (userPermissions.includes('*')) {
    return true;
  }

  const reqTrimmed = requiredPermission.trim();

  // 1. Direct exact match
  if (userPermissions.includes(reqTrimmed)) return true;

  // 2. Direct case-insensitive match
  const reqLower = reqTrimmed.toLowerCase();
  if (userPermissions.some((p) => p.toLowerCase() === reqLower)) return true;

  // 3. Known aliases match
  const aliases = getPermissionAliases(reqTrimmed);
  if (aliases.some((alias) => userPermissions.some((p) => p.toLowerCase() === alias.toLowerCase()))) {
    return true;
  }

  // 4. Fuzzy alphanumeric match (e.g. "View Users" vs "user:view" vs "view_users")
  const reqClean = cleanPermissionKey(reqTrimmed);
  const reqActionModuleFlipped = (() => {
    if (reqTrimmed.includes(':')) {
      const [mod, act] = reqTrimmed.split(':');
      return cleanPermissionKey(`${act}${mod}`);
    }
    const parts = reqTrimmed.split(/\s+/);
    if (parts.length === 2) {
      return cleanPermissionKey(`${parts[1]}${parts[0]}`);
    }
    return '';
  })();

  for (const perm of userPermissions) {
    const cleanPerm = cleanPermissionKey(perm);
    if (cleanPerm === reqClean) return true;
    if (reqActionModuleFlipped && cleanPerm === reqActionModuleFlipped) return true;
    // Handle singular vs plural (e.g. user vs users, report vs reports)
    if (cleanPerm.replace(/s$/, '') === reqClean.replace(/s$/, '')) return true;
  }

  return false;
};

/**
 * Check if any of the user's assigned roles is SuperAdmin.
 */
export const isUserSuperadmin = (user: any, extraRoles: string[] = []): boolean => {
  if (!user && extraRoles.length === 0) return false;

  const rolesToCheck: string[] = [];
  if (user?.role) rolesToCheck.push(String(user.role));
  if (Array.isArray(user?.roles)) {
    user.roles.forEach((r: any) => {
      if (typeof r === 'string') rolesToCheck.push(r);
      else if (r && typeof r.name === 'string') rolesToCheck.push(r.name);
    });
  }
  rolesToCheck.push(...extraRoles);

  const designation = (user?.designation || '').toLowerCase();
  if (designation.includes('super admin') || designation.includes('superadmin')) {
    return true;
  }

  return rolesToCheck.some((r) => {
    const clean = r.toLowerCase().replace(/[\s_-]/g, '');
    return clean === 'superadmin';
  });
};


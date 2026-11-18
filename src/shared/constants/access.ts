export const ADMIN_ROLES = ['Admin', 'SuperAdmin', 'HrAdmin'] as const;

export function normalizeRole(role: string): string {
  return role.toLowerCase().replace(/[\s_-]/g, '');
}

export function isAdminRole(role?: string | null): boolean {
  if (!role) return false;
  const normalized = normalizeRole(role);
  return ADMIN_ROLES.some((adminRole) => normalizeRole(adminRole) === normalized);
}

export function hasAdminRole(roles: readonly string[]): boolean {
  return roles.some((role) => isAdminRole(role));
}

import type { RoleFormData } from './types';

export const EMPTY_ROLE_FORM: RoleFormData = {
  name: '',
  description: '',
  permissionIds: [],
};

export const DEFAULT_USER_ROLE = 'Employee';

export const FALLBACK_ADMIN_NAME = 'Administrator';
export const FALLBACK_ADMIN_EMAIL = 'admin@aetheradix.com';

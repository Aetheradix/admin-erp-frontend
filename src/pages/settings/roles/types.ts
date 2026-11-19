import type { StaffMember } from '@/types/models';

export type RolesTab = 'roles' | 'matrix' | 'assignments' | 'audit';

export interface RoleFormData {
  name: string;
  description: string;
  permissionIds: number[];
}

export type RoleAssignmentUser = StaffMember & { avatar?: string };

export interface StaffRoleObject {
  id?: number;
  name: string;
  is_system: boolean;
}

export interface RoleOption {
  label: string;
  value: string;
}

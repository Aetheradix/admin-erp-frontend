import type { InvitationRecord } from '@/services/auditService';

export interface AssignableRole {
  id: number;
  name: string;
  is_system: boolean;
}

export interface UserRecord {
  id: number | string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  avatar: string;
  contactNo?: string;
  address?: string;
  roles?: AssignableRole[];
  reportingManagerId?: number | null;
  reportingManagerName?: string | null;
  createdAt?: string;
}

export interface InviteForm {
  name: string;
  email: string;
  role: string;
  department: string;
}

export interface EditUserForm {
  name: string;
  email: string;
  role: string;
  roleIds: number[];
  reportingManagerId: number | null;
  department: string;
  status: string;
  contactNo: string;
  address: string;
}

export interface EditUserModalState {
  open: boolean;
  user: UserRecord | null;
  form: EditUserForm;
}

export interface InviteResultState {
  open: boolean;
  email: string;
  role: string;
  link: string;
  tempPass: string;
}

export type InvitationStatusFilter = 'all' | 'pending' | 'accepted' | 'expired' | 'revoked';

export type ConfirmActionType = 'offboard' | 'reactivate' | 'delete' | 'revoke_invitation';

export interface ConfirmModalState {
  open: boolean;
  type: ConfirmActionType;
  targetUser?: UserRecord | null;
  targetInvitation?: InvitationRecord | null;
}

export interface OptionItem {
  label: string;
  value: string;
}

export interface ChangedField {
  field: string;
  from: string;
  to: string;
}

export type UsersTab =
  | 'All Users'
  | 'Active'
  | 'Away'
  | 'Inactive'
  | 'Invite Audit Log'
  | 'System Audit Trail';

export interface InvitationCounts {
  all: number;
  pending: number;
  accepted: number;
  expired: number;
  revoked: number;
}

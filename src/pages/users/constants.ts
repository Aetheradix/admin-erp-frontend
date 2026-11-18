import type {
  EditUserForm,
  EditUserModalState,
  InvitationStatusFilter,
  InviteForm,
  InviteResultState,
  UsersTab,
} from './types';

export const BADGE_PALETTES = [
  { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/20' },
  { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
  { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20' },
  { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20' },
  { bg: 'bg-sky-500/10', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-500/20' },
  { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20' },
  { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/20' },
  { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-500/20' },
  { bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-500/20' },
  { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
  { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-600 dark:text-fuchsia-400', border: 'border-fuchsia-500/20' },
  { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/20' },
];

export const USERS_TABS: UsersTab[] = [
  'All Users',
  'Active',
  'Away',
  'Inactive',
  'Invite Audit Log',
  'System Audit Trail',
];

export const STATUS_COLORS: Record<string, string> = {
  Active: 'text-success bg-success/10 border-success/20',
  Away: 'text-warning bg-warning/10 border-warning/20',
  Inactive: 'text-muted bg-surface-subtle border-border-subtle',
};

export const EMPTY_INVITE_FORM: InviteForm = { name: '', email: '', role: '', department: '' };

export const EMPTY_EDIT_FORM: EditUserForm = {
  name: '',
  email: '',
  role: 'Employee',
  roleIds: [],
  reportingManagerId: null,
  department: 'Engineering',
  status: 'Active',
  contactNo: '',
  address: '',
};

export const EMPTY_EDIT_MODAL: EditUserModalState = {
  open: false,
  user: null,
  form: EMPTY_EDIT_FORM,
};

export const EMPTY_INVITE_RESULT: InviteResultState = {
  open: false,
  email: '',
  role: '',
  link: '',
  tempPass: '',
};

export const EDIT_STATUS_OPTIONS = [
  { label: 'Active', value: 'Active' },
  { label: 'Away', value: 'Away' },
  { label: 'Inactive', value: 'Inactive' },
];

export const INVITATION_FILTERS: ReadonlyArray<{ id: InvitationStatusFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'expired', label: 'Expired' },
  { id: 'revoked', label: 'Revoked' },
];

export const ADMIN_FALLBACK_NAME = 'Administrator';
export const ADMIN_FALLBACK_EMAIL = 'admin@aetheradix.com';
export const ADMIN_FALLBACK_ROLE = 'SuperAdmin';

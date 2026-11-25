import type { RoleItem } from '@/store/api/roleApiSlice';
import type { StaffMember } from '@/types/models';
import type { User } from '@/types/auth';
import { getUserRoles, isSuperAdmin } from '@/utils/pagePermissions';
import type { ChangedField, EditUserForm, OptionItem, UserRecord, UsersTab } from '../types';

export type ApiUser = StaffMember & {
  contact_number?: string;
  contactNo?: string;
  address?: string;
  reportingManagerId?: number | null;
  reportingManagerName?: string | null;
};

export function getInitials(name: string): string {
  return (
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  );
}

export function canManageUsers(
  currentAuthUser: User | null | undefined,
  isRbacSuperadmin: boolean,
  can: (permission: string) => boolean
): boolean {
  if (isSuperAdmin(currentAuthUser) || isRbacSuperadmin) return true;
  if (can('user:manage') || can('user:edit') || can('role:assign')) return true;
  return getUserRoles(currentAuthUser).some((r) => ['Admin', 'SuperAdmin', 'HrAdmin'].includes(r));
}

export function mapApiUser(u: ApiUser): UserRecord {
  const name = u.name || u.username || u.email.split('@')[0];
  return {
    id: u.id,
    name,
    email: u.email,
    role: u.role || u.designation || 'Employee',
    department: u.department || 'Operations',
    status: u.status === 'On Leave' ? 'Away' : u.status || 'Active',
    avatar: getInitials(name),
    contactNo: u.contact_number || u.contactNo || '',
    address: u.address || '',
    roles: u.roles || [],
    reportingManagerId: u.reporting_manager_id ?? u.reportingManagerId ?? null,
    reportingManagerName: u.reporting_manager_name ?? u.reportingManagerName ?? null,
    createdAt: u.join_date || u.joinDate || 'Recently',
  };
}

export function mergeUserRecords(
  apiUsers: StaffMember[] | undefined,
  localUsers: UserRecord[]
): UserRecord[] {
  if (!apiUsers) return localUsers;
  const mapped = apiUsers.map((u) => mapApiUser(u as ApiUser));
  const apiEmails = new Set(mapped.map((u) => u.email.toLowerCase()));
  const extraLocal = localUsers.filter((lu) => !apiEmails.has(lu.email.toLowerCase()));
  return [...extraLocal, ...mapped];
}

export function filterUserRecords(
  users: UserRecord[],
  activeTab: UsersTab,
  search: string
): UserRecord[] {
  return users
    .filter((u) => {
      if (activeTab === 'All Users') return true;
      return u.status === activeTab;
    })
    .filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.department.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
    );
}

export function buildRoleOptions(
  roles: RoleItem[] | undefined,
  apiUsers: StaffMember[] | undefined
): OptionItem[] {
  const rolesMap = new Map<string, string>();

  roles?.forEach((r) => {
    if (r.name && r.name.trim()) {
      rolesMap.set(r.name.trim().toLowerCase(), r.name.trim());
    }
  });

  apiUsers?.forEach((u) => {
    const role = u.role || u.designation;
    if (role && typeof role === 'string' && role.trim()) {
      rolesMap.set(role.trim().toLowerCase(), role.trim());
    }
  });

  return Array.from(rolesMap.values())
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ label: name, value: name }));
}

export function buildDepartmentOptions(
  deptResponse: unknown,
  apiUsers: StaffMember[] | undefined
): OptionItem[] {
  const deptsMap = new Map<string, string>();
  const rawDepts =
    (deptResponse as { data?: unknown } | null | undefined)?.data ?? deptResponse ?? [];

  if (Array.isArray(rawDepts)) {
    rawDepts.forEach((d: unknown) => {
      const name =
        typeof d === 'string'
          ? d
          : ((d as { department_name?: string; name?: string })?.department_name ??
            (d as { name?: string })?.name);
      if (name && typeof name === 'string' && name.trim()) {
        deptsMap.set(name.trim().toLowerCase(), name.trim());
      }
    });
  }

  apiUsers?.forEach((u) => {
    if (u.department && typeof u.department === 'string' && u.department.trim()) {
      deptsMap.set(u.department.trim().toLowerCase(), u.department.trim());
    }
  });

  return Array.from(deptsMap.values())
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ label: name, value: name }));
}

export function buildChangedFields(orig: UserRecord, edited: EditUserForm): ChangedField[] {
  const changed: ChangedField[] = [];
  if (orig.name !== edited.name) changed.push({ field: 'name', from: orig.name, to: edited.name });
  if (orig.email !== edited.email)
    changed.push({ field: 'email', from: orig.email, to: edited.email });
  if (orig.role !== edited.role) changed.push({ field: 'role', from: orig.role, to: edited.role });
  if (orig.department !== edited.department) {
    changed.push({ field: 'department', from: orig.department, to: edited.department });
  }
  if (orig.status !== edited.status) {
    changed.push({ field: 'status', from: orig.status, to: edited.status });
  }
  if ((orig.contactNo || '') !== (edited.contactNo || '')) {
    changed.push({ field: 'contactNo', from: orig.contactNo || '', to: edited.contactNo || '' });
  }
  if ((orig.address || '') !== (edited.address || '')) {
    changed.push({ field: 'address', from: orig.address || '', to: edited.address || '' });
  }
  return changed;
}

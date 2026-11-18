import type { AssignableRole } from '../types';
import { STATUS_COLORS } from '../constants';
import { getDepartmentBadgeClass, getRoleBadgeClass } from '../utils';

export function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getRoleBadgeClass(
        role
      )}`}>
      {role}
    </span>
  );
}

export function RoleBadgeList({ roles }: { roles: AssignableRole[] }) {
  return (
    <div className="flex flex-wrap gap-1 max-w-[220px]">
      {roles.map((r) => (
        <span
          key={r.id}
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getRoleBadgeClass(
            r.name
          )}`}>
          {r.name}
        </span>
      ))}
    </div>
  );
}

export function DepartmentBadge({ department }: { department?: string }) {
  return (
    <span
      className={`px-2.5 py-1 rounded text-xs font-semibold border inline-block ${getDepartmentBadgeClass(
        department
      )}`}>
      {department || 'Unassigned'}
    </span>
  );
}

export function UserStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${
        STATUS_COLORS[status] || 'text-muted border-border-subtle'
      }`}>
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'Active' ? 'bg-success' : status === 'Away' ? 'bg-warning' : 'bg-muted'
        }`}
      />
      {status}
    </span>
  );
}

import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import type { EmployeeInput } from '../types';
import type { StaffMember } from '@/types/models';
import { FALLBACKS } from '../constants';

interface ExtractedTarget {
  id: string | null;
  code: string | null;
  email: string | null;
  name: string | null;
}

export function extractTargetIdentifiers(
  target: EmployeeInput | null | undefined
): ExtractedTarget {
  if (target === null || target === undefined) {
    return { id: null, code: null, email: null, name: null };
  }
  if (typeof target === 'number' || typeof target === 'string') {
    return { id: String(target), code: String(target), email: null, name: null };
  }

  const obj = target as Record<string, unknown>;
  const rawId = obj.id ?? obj.userId;
  const rawCode = obj.employeeCode ?? obj.employee_code ?? obj.employeeId;
  const rawEmail = obj.email;
  const rawName = obj.username ?? obj.name;

  return {
    id: rawId !== undefined && rawId !== null ? String(rawId) : null,
    code: rawCode ? String(rawCode) : null,
    email: typeof rawEmail === 'string' ? rawEmail.toLowerCase() : null,
    name: typeof rawName === 'string' ? rawName.toLowerCase() : null,
  };
}

export function matchesUser(u: HierarchyNodeUser, target: ExtractedTarget): boolean {
  if (target.id && String(u.id) === target.id) return true;
  if (
    target.code &&
    u.employee_code &&
    u.employee_code.toLowerCase() === target.code.toLowerCase()
  ) {
    return true;
  }
  if (target.id && u.employee_code && u.employee_code.toLowerCase() === target.id.toLowerCase()) {
    return true;
  }
  if (target.email && u.email && u.email.toLowerCase() === target.email) return true;
  if (target.name && u.username && u.username.toLowerCase() === target.name) return true;
  return false;
}

export function mapDbUserToHierarchy(dbU: StaffMember): HierarchyNodeUser {
  const code = dbU.employee_code || dbU.employee_id || `EMP-${dbU.id}`;
  return {
    id: Number(dbU.id) || 0,
    username: dbU.username || dbU.name || 'Employee',
    email: dbU.email || '',
    role: dbU.role || FALLBACKS.EMPLOYEE_ROLE,
    department: dbU.department || FALLBACKS.GENERAL_DEPT,
    designation: dbU.designation || dbU.role,
    employee_code: code,
    image_url: dbU.image_url || dbU.image,
    reporting_manager_id:
      (dbU as { reporting_manager_id?: number | null }).reporting_manager_id ?? null,
    directReports: [],
    subordinatesCount: 0,
  };
}

export function fallbackFromTarget(target: EmployeeInput): HierarchyNodeUser | null {
  if (typeof target !== 'object' || target === null) return null;
  const obj = target as Record<string, unknown>;
  const name = (obj.username || obj.name) as string | undefined;
  if (!name) return null;

  return {
    id: Number(obj.id) || 9999,
    username: name,
    email: (obj.email as string) || '',
    role: (obj.designation || obj.role || FALLBACKS.EMPLOYEE_ROLE) as string,
    department: (obj.department || FALLBACKS.GENERAL_DEPT) as string,
    designation: (obj.designation || obj.role) as string | undefined,
    employee_code: (obj.employeeCode || obj.employee_code || obj.employeeId || 'EMP') as string,
    image_url: (obj.image || obj.image_url) as string | undefined,
    reporting_manager_id: (obj.reporting_manager_id as number | null) ?? (obj.manager ? 1 : null),
    directReports: [],
    subordinatesCount: 0,
  };
}

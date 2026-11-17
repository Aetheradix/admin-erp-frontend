import { useMemo } from 'react';
import type { HierarchyNodeUser, CompanyProfileData } from '@/store/api/organizationApiSlice';
import type { StaffMember } from '@/types/models';
import type { Office } from '@/store/api/attendanceSlice';
import type { EmployeeInput } from '../types';
import { getEmployeeProfile } from '@/services/employeeProfileService';
import { resolveOffice, type OfficeTargetUser } from '../utils/resolveOffice';
import { formatJoinDate } from '../utils/formatJoinDate';

interface UseInspectedProfileParams {
  inspectedNode: HierarchyNodeUser | null;
  dbUsers: StaffMember[];
  offices: Office[];
  companyProfile?: CompanyProfileData | null;
  flatUsersById: Map<number, HierarchyNodeUser>;
  childrenByManagerId: Map<number, HierarchyNodeUser[]>;
  resolveUser: (target: EmployeeInput | null | undefined) => HierarchyNodeUser | null;
}

export function useInspectedProfile({
  inspectedNode,
  dbUsers,
  offices,
  companyProfile,
  flatUsersById,
  childrenByManagerId,
  resolveUser,
}: UseInspectedProfileParams) {
  const inspectedDbUser = useMemo(() => {
    if (!inspectedNode) return null;
    return (
      dbUsers.find(
        (u) =>
          String(u.id) === String(inspectedNode.id) ||
          (inspectedNode.email && u.email?.toLowerCase() === inspectedNode.email.toLowerCase()) ||
          (inspectedNode.employee_code &&
            (u.employee_code === inspectedNode.employee_code ||
              u.employee_id === inspectedNode.employee_code))
      ) || null
    );
  }, [inspectedNode, dbUsers]);

  const empStored = useMemo(() => {
    if (!inspectedNode) return null;
    return (
      getEmployeeProfile(inspectedNode.id) ||
      (inspectedNode.email ? getEmployeeProfile(inspectedNode.email) : null)
    );
  }, [inspectedNode]);

  const resolvedOffice = useMemo(() => {
    const targetObj = (inspectedDbUser || inspectedNode) as OfficeTargetUser | null;
    return resolveOffice(targetObj, offices, companyProfile);
  }, [inspectedDbUser, inspectedNode, offices, companyProfile]);

  const joinDate = useMemo(() => {
    const rawVal =
      inspectedDbUser?.join_date ||
      (inspectedDbUser as { joinDate?: string })?.joinDate ||
      (inspectedDbUser as { createdAt?: string })?.createdAt ||
      (inspectedNode as { join_date?: string })?.join_date ||
      (inspectedNode as { joinDate?: string })?.joinDate ||
      (inspectedNode as { created_at?: string })?.created_at ||
      empStored?.employeeIdAssignedAt ||
      empStored?.approvedAt ||
      empStored?.submittedAt;

    return formatJoinDate(rawVal, resolvedOffice?.timezone);
  }, [inspectedDbUser, inspectedNode, empStored, resolvedOffice]);

  const inspectedManager = useMemo<HierarchyNodeUser | null>(() => {
    if (!inspectedNode?.reporting_manager_id) return null;
    return (
      flatUsersById.get(inspectedNode.reporting_manager_id) ||
      resolveUser(inspectedNode.reporting_manager_id)
    );
  }, [inspectedNode, flatUsersById, resolveUser]);

  const inspectedReports = useMemo<HierarchyNodeUser[]>(() => {
    if (!inspectedNode) return [];
    return childrenByManagerId.get(inspectedNode.id) || [];
  }, [inspectedNode, childrenByManagerId]);

  const skills = useMemo<string[]>(() => {
    const rawSkills =
      (empStored as unknown as { skills?: string[] })?.skills ||
      (inspectedDbUser as unknown as { skills?: string[] })?.skills;
    if (Array.isArray(rawSkills) && rawSkills.length > 0) {
      return rawSkills;
    }
    return [];
  }, [empStored, inspectedDbUser]);

  return {
    inspectedDbUser,
    empStored,
    resolvedOffice,
    joinDate,
    inspectedManager,
    inspectedReports,
    skills,
  };
}

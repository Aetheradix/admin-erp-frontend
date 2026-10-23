import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useUpdateProfileMutation } from '@/store/api/authApiSlice';
import { useGetUsersQuery } from '@/store/api/userSlice';
import { useGetAutoApproveQuery, useUpdateAutoApproveMutation } from '@/store/api/settingslice';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { recordAuditLog } from '@/services/auditService';

export interface ManagerInfo {
  name: string;
  role: string;
  code: string;
  reportsCount: number;
  image?: string;
}

export interface TeamMemberInfo {
  id: string;
  name: string;
  role: string;
  initials: string;
  image?: string;
}

export interface ProfileUserData {
  name: string;
  designation: string;
  employeeId: string;
  employeeCode: string;
  email: string;
  contactNo: string;
  department: string;
  joinDate: string;
  image: string;
  workLocation: string;
  company: string;
  country: string;
  employeeType: string;
  tNumber: string;
  costCenter: string;
  subOrganization: string;
  statusText: string;
  lastSeen: string;
  workHours: string;
  autoApprove: boolean;
  address?: string;
  roles: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
  manager: ManagerInfo | null;
  lineLeader: ManagerInfo | null;
  teamMembers: TeamMemberInfo[];
}

const resolveEmployeeCode = (
  auth: any,
  record?: Record<string, unknown> | null,
  fallbackStaff?: { employee_code?: string; employee_id?: string; id?: string | number } | null
): string => {
  const code =
    auth?.employee_code ||
    record?.employee_code ||
    auth?.employeeCode ||
    record?.employeeCode ||
    fallbackStaff?.employee_code ||
    auth?.employee_id ||
    record?.employee_id ||
    fallbackStaff?.employee_id ||
    (auth?.id ? `EMP-${String(auth.id).padStart(3, '0')}` : undefined) ||
    (fallbackStaff?.id ? `EMP-${String(fallbackStaff.id).padStart(3, '0')}` : undefined) ||
    'N/A';
  return String(code);
};

const resolveEmployeeId = (
  auth: any,
  record?: Record<string, unknown> | null,
  fallbackStaff?: { employee_id?: string; employee_code?: string; id?: string | number } | null
): string => {
  const idVal =
    auth?.employee_id ||
    record?.employee_id ||
    fallbackStaff?.employee_id ||
    auth?.employee_code ||
    record?.employee_code ||
    fallbackStaff?.employee_code ||
    (auth?.id ? String(auth.id) : undefined) ||
    (fallbackStaff?.id ? String(fallbackStaff.id) : undefined) ||
    'N/A';
  return String(idVal);
};

export const useProfile = () => {
  const { user: authUser, logout: authLogout, updateUser } = useAuth();
  const { data: usersList } = useGetUsersQuery(undefined, { skip: !authUser });

  const matchedStaff = usersList?.find(
    (u) =>
      (authUser?.id && String(u.id) === String(authUser.id)) ||
      (authUser?.email && u.email?.toLowerCase() === authUser.email.toLowerCase())
  );

  /**
   * Only these roles can manage Auto Approve.
   */
  const canManageAutoApprove = ['Admin', 'SuperAdmin', 'HrAdmin'].includes(authUser?.role ?? '');

  const isAdmin = authUser?.role === 'Admin';

  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const [updateAutoApprove, { isLoading: isUpdatingAutoApprove }] = useUpdateAutoApproveMutation();

  /**
   * Get current Auto Approve setting.
   *
   * The query is skipped for users who don't have
   * permission to manage Auto Approve.
   */
  const { data: autoApproveFromApi, isLoading: isLoadingAutoApprove } = useGetAutoApproveQuery(
    undefined,
    {
      skip: !canManageAutoApprove,
    }
  );

  const [isEditing, setIsEditing] = useState(false);
  const [showElevationDialog, setShowElevationDialog] = useState(false);

  const authUserRecord = authUser as unknown as Record<string, unknown> | null;

  const [user, setUser] = useState<ProfileUserData>(() => {
    const name = authUser?.username || '';
    const email = authUser?.email || '';

    const userRole = authUser?.role || 'User';
    const initialRoles = (authUserRecord?.roles as Array<{
      id: string;
      name: string;
      color?: string;
    }>) || [
      {
        id: '1',
        name: userRole,
        color: userRole === 'SuperAdmin' ? 'red' : userRole === 'Admin' ? 'blue' : 'emerald',
      },
    ];

    const initialCode = resolveEmployeeCode(authUser, authUserRecord);
    const initialId = resolveEmployeeId(authUser, authUserRecord);

    return {
      name,
      designation: authUser?.designation || (isAdmin ? 'Administrator' : 'Staff Member'),

      employeeId: initialId,

      employeeCode: initialCode,

      email,

      contactNo: authUser?.contact_number || '',

      department: authUser?.department || '',

      joinDate: authUser?.join_date || '',

      image:
        authUser?.image_url ||
        `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name || 'User')}`,

      workLocation: (authUserRecord?.work_location as string) || '',

      company: (authUserRecord?.company as string) || '',

      country: (authUserRecord?.country as string) || '',

      employeeType:
        (authUserRecord?.employee_type as string) ||
        (authUser?.role === 'SuperAdmin' || authUser?.role === 'Admin' ? authUser.role : ''),

      tNumber: (authUserRecord?.t_number as string) || '',

      costCenter: (authUserRecord?.cost_center as string) || '',

      subOrganization: (authUserRecord?.sub_organization as string) || authUser?.department || '',

      statusText: (authUserRecord?.status_text as string) || 'Active',

      lastSeen: (authUserRecord?.last_seen as string) || 'Recently active',

      workHours: (authUserRecord?.work_hours as string) || 'Standard Hours',

      address: (authUserRecord?.address as string) || '',

      /**
       * This gets updated from useGetAutoApproveQuery()
       * after the API response arrives.
       */
      autoApprove: false,

      roles: initialRoles,

      manager: (authUserRecord?.manager as ManagerInfo) || null,

      lineLeader: (authUserRecord?.line_leader as ManagerInfo) || null,

      teamMembers: (authUserRecord?.team_members as TeamMemberInfo[]) || [],
    };
  });

  /**
   * Sync Auto Approve value from backend.
   */
  useEffect(() => {
    if (typeof autoApproveFromApi === 'boolean') {
      setUser((prev) => ({
        ...prev,
        autoApprove: autoApproveFromApi,
      }));
    }
  }, [autoApproveFromApi]);

  /**
   * Sync authenticated user data.
   */
  useEffect(() => {
    if (!authUser) return;

    const record = authUser as unknown as Record<string, unknown>;
    const code = resolveEmployeeCode(authUser, record, matchedStaff);
    const id = resolveEmployeeId(authUser, record, matchedStaff);

    setUser((prev) => ({
      ...prev,

      name: authUser.username || prev.name,

      designation: authUser.designation || (isAdmin ? 'Administrator' : prev.designation),

      employeeId: id !== 'N/A' ? id : prev.employeeId,

      employeeCode: code !== 'N/A' ? code : prev.employeeCode,

      email: authUser.email || prev.email,

      contactNo: authUser.contact_number || prev.contactNo,

      image: authUser.image_url || prev.image,

      department: authUser.department || prev.department,

      joinDate: authUser.join_date || prev.joinDate,

      workLocation: (record.work_location as string) ?? prev.workLocation,

      company: (record.company as string) ?? prev.company,

      country: (record.country as string) ?? prev.country,

      employeeType: (record.employee_type as string) ?? prev.employeeType,

      tNumber: (record.t_number as string) ?? prev.tNumber,

      costCenter: (record.cost_center as string) ?? prev.costCenter,

      subOrganization: (record.sub_organization as string) ?? prev.subOrganization,

      statusText: (record.status_text as string) ?? prev.statusText,

      lastSeen: (record.last_seen as string) ?? prev.lastSeen,

      workHours: (record.work_hours as string) ?? prev.workHours,
      address: (record.address as string) ?? prev.address,

      manager: (record.manager as ManagerInfo) ?? prev.manager,

      lineLeader: (record.line_leader as ManagerInfo) ?? prev.lineLeader,

      teamMembers: (record.team_members as TeamMemberInfo[]) ?? prev.teamMembers,
    }));

    // If authUser does not yet have employee_code, populate it into AuthContext + localStorage
    if (code && code !== 'N/A' && !authUser.employee_code) {
      updateUser({ employee_code: code, employeeCode: code });
    }
  }, [authUser, matchedStaff, isAdmin, updateUser]);

  /**
   * Toggle Auto Approve.
   *
   * Backend mutation is only allowed for:
   * Admin
   * SuperAdmin
   * HrAdmin
   */
  const handleAutoApproveToggle = async () => {
    if (!canManageAutoApprove) {
      showToast({
        severity: 'warn',
        summary: 'Permission Denied',
        detail: 'You do not have permission to change Auto Approve.',
        life: 3000,
      });

      return;
    }

    const newValue = !user.autoApprove;

    try {
      await updateAutoApprove({
        autoapprove: newValue,
      }).unwrap();

      setUser((prev) => ({
        ...prev,
        autoApprove: newValue,
      }));

      showToast({
        severity: 'success',
        summary: 'Auto Approve Updated',
        detail: `Auto approve ${newValue ? 'enabled' : 'disabled'}`,
        life: 2500,
      });
    } catch (err: unknown) {
      const apiError = err as {
        data?: {
          message?: string;
        };
      };

      console.error('Failed to update auto approve:', err);

      showToast({
        severity: 'error',
        summary: 'Error',
        detail: apiError.data?.message || 'Failed to update auto approve',
        life: 3000,
      });
    }
  };

  /**
   * Add role.
   */
  const addRole = (roleName: string) => {
    if (!roleName.trim()) return;

    const colors = ['emerald', 'amber', 'indigo', 'rose', 'sky', 'purple', 'teal'];

    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newRole = {
      id: Date.now().toString(),
      name: roleName.trim(),
      color: randomColor,
    };

    setUser((prev) => ({
      ...prev,

      roles: [
        ...prev.roles.filter((r) => r.name.toLowerCase() !== roleName.trim().toLowerCase()),
        newRole,
      ],
    }));

    showToast({
      severity: 'success',
      summary: 'Role Added',
      detail: `Role "${roleName}" added successfully`,
      life: 2000,
    });
  };

  /**
   * Remove role.
   */
  const removeRole = (roleId: string) => {
    setUser((prev) => ({
      ...prev,

      roles: prev.roles.filter((r) => r.id !== roleId),
    }));

    showToast({
      severity: 'info',
      summary: 'Role Removed',
      detail: 'Role removed from profile',
      life: 2000,
    });
  };

  /**
   * Save profile.
   */
  const handleEditSave = async (updatedData: {
    name: string;
    email: string;
    contactNo: string;
    designation: string;
    department: string;
    employeeCode?: string;
    workLocation?: string;
    company?: string;
    country?: string;
    employeeType?: string;
    subOrganization?: string;
    address?: string;
  }) => {
    try {
      // Calculate field diffs for audit log
      const changedFields: Array<{ field: string; from: any; to: any }> = [];
      if (user.name !== updatedData.name) {
        changedFields.push({ field: 'name', from: user.name, to: updatedData.name });
      }
      if (user.email !== updatedData.email) {
        changedFields.push({ field: 'email', from: user.email, to: updatedData.email });
      }
      if (user.contactNo !== updatedData.contactNo) {
        changedFields.push({ field: 'contactNo', from: user.contactNo, to: updatedData.contactNo });
      }
      if (user.designation !== updatedData.designation) {
        changedFields.push({
          field: 'designation',
          from: user.designation,
          to: updatedData.designation,
        });
      }
      if (user.department !== updatedData.department) {
        changedFields.push({
          field: 'department',
          from: user.department,
          to: updatedData.department,
        });
      }
      if (user.workLocation !== (updatedData.workLocation || '')) {
        changedFields.push({
          field: 'workLocation',
          from: user.workLocation,
          to: updatedData.workLocation || '',
        });
      }
      if (user.address !== (updatedData.address || '')) {
        changedFields.push({
          field: 'address',
          from: user.address || '',
          to: updatedData.address || '',
        });
      }
      if (user.company !== (updatedData.company || '')) {
        changedFields.push({ field: 'company', from: user.company, to: updatedData.company || '' });
      }

      const payload = {
        username: updatedData.name,
        email: updatedData.email,
        contact_no: updatedData.contactNo,
        designation: updatedData.designation,
        department: updatedData.department,
        work_location: updatedData.workLocation,
        company: updatedData.company,
        country: updatedData.country,
        employee_type: updatedData.employeeType,
        sub_organization: updatedData.subOrganization,
        address: updatedData.address,
      };

      const result = await updateProfile(payload)
        .unwrap()
        .catch(() => null);

      setUser((prev) => ({
        ...prev,
        ...updatedData,
        employeeCode: updatedData.employeeCode || prev.employeeCode,
      }));

      // Update stored user in AuthContext + localStorage
      const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...existingUser,
        username: updatedData.name,
        email: updatedData.email,
        contact_number: updatedData.contactNo,
        designation: updatedData.designation,
        department: updatedData.department,
        employee_code: updatedData.employeeCode || user.employeeCode,
        employeeCode: updatedData.employeeCode || user.employeeCode,
        work_location: updatedData.workLocation,
        address: updatedData.address,
        company: updatedData.company,
        country: updatedData.country,
        ...(result?.user || {}),
      };

      updateUser(updatedUser);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aether_user_updated', { detail: updatedUser }));
      }

      // Record in centralized audit log
      if (changedFields.length > 0) {
        recordAuditLog({
          action: 'Profile Updated',
          category: 'profile',
          user: user.name || authUser?.username || 'User',
          userEmail: user.email || authUser?.email || '',
          target: `${updatedData.name} Profile`,
          targetEmail: updatedData.email,
          status: 'Success',
          details: `Updated personal information: ${changedFields.map((c) => c.field).join(', ')}.`,
          changes: changedFields,
        });
      }

      setIsEditing(false);

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Profile updated successfully and reflected across the application.',
        life: 3000,
      });
    } catch (err: unknown) {
      const apiError = err as {
        data?: {
          message?: string;
        };
      };

      console.error('Failed to update profile:', err);

      showToast({
        severity: 'error',
        summary: 'Error',
        detail: apiError.data?.message || 'Failed to update profile',
        life: 3000,
      });
    }
  };

  /**
   * Logout.
   */
  const handleLogout = async () => {
    try {
      await authLogout();
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    user,

    isAdmin,

    // Auto Approve
    canManageAutoApprove,
    isUpdatingAutoApprove,
    isLoadingAutoApprove,
    handleAutoApproveToggle,

    // Profile
    isUpdating,
    isEditing,
    setIsEditing,

    // Elevation
    showElevationDialog,
    setShowElevationDialog,

    // Actions
    handleEditSave,
    handleLogout,
    addRole,
    removeRole,
  };
};

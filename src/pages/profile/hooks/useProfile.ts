import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useUpdateProfileMutation } from '@/store/api/authApiSlice';
import { useGetAutoApproveQuery, useUpdateAutoApproveMutation } from '@/store/api/settingslice';
import { useGetUsersQuery } from '@/store/api/userSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { recordAuditLog } from '@/services/auditService';
import { getEmployeeProfile } from '@/services/employeeProfileService';

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
  id?: number | string;
  name: string;
  designation: string;
  employeeId: string;
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

export const useProfile = () => {
  const { user: authUser, logout: authLogout } = useAuth();

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

  const { data: dbUsers = [] } = useGetUsersQuery();

  const currentDbUser = useMemo(() => {
    if (!authUser || !dbUsers || dbUsers.length === 0) return null;
    return (
      dbUsers.find(
        (u) =>
          (authUser.email && u.email?.toLowerCase().trim() === authUser.email.toLowerCase().trim()) ||
          (authUser.id && String(u.id) === String(authUser.id))
      ) || null
    );
  }, [authUser, dbUsers]);

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

    const emp = (email ? getEmployeeProfile(email) : null) ?? (authUser?.id ? getEmployeeProfile(authUser.id) : null);
    let resolvedEmployeeId =
      (emp?.employeeId && emp.employeeId !== 'N/A' && emp.employeeId !== 'NA')
        ? emp.employeeId
        : (authUser?.employee_id && authUser.employee_id !== 'N/A' && authUser.employee_id !== 'NA')
          ? authUser.employee_id
          : (authUser?.employee_code && authUser.employee_code !== 'N/A')
            ? authUser.employee_code
            : (authUser?.employeeId && authUser.employeeId !== 'N/A')
              ? authUser.employeeId
              : null;

    if (!resolvedEmployeeId) {
      try {
        const staffStr = localStorage.getItem('aether_staff_list');
        if (staffStr) {
          const staffList = JSON.parse(staffStr);
          const found = staffList.find((s: any) =>
            (email && s.email?.toLowerCase() === email.toLowerCase()) ||
            (authUser?.id && String(s.id) === String(authUser.id))
          );
          if (found && (found.employee_id || found.employee_code || found.employeeId)) {
            resolvedEmployeeId = found.employee_id || found.employee_code || found.employeeId;
          }
        }
      } catch {}
    }

    return {
      name,
      designation: authUser?.designation || (isAdmin ? 'Administrator' : 'Staff Member'),

      employeeId: resolvedEmployeeId || 'N/A',

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
    const emp = (authUser.email ? getEmployeeProfile(authUser.email) : null) ?? (authUser.id ? getEmployeeProfile(authUser.id) : null);
    const resolvedEmployeeId =
      (currentDbUser?.employee_code && currentDbUser.employee_code !== 'N/A' && currentDbUser.employee_code !== 'NA')
        ? currentDbUser.employee_code
        : (currentDbUser?.employee_id && currentDbUser.employee_id !== 'N/A' && currentDbUser.employee_id !== 'NA')
          ? currentDbUser.employee_id
          : (authUser.employee_id && authUser.employee_id !== 'N/A' && authUser.employee_id !== 'NA')
            ? authUser.employee_id
            : (authUser.employee_code && authUser.employee_code !== 'N/A' && authUser.employee_code !== 'NA')
              ? authUser.employee_code
              : (emp?.employeeId && emp.employeeId !== 'N/A' && emp.employeeId !== 'NA')
                ? emp.employeeId
                : null;

    setUser((prev) => ({
      ...prev,

      name: authUser.username || prev.name,

      designation: currentDbUser?.designation || authUser.designation || prev.designation,

      employeeId: resolvedEmployeeId || prev.employeeId,

      email: authUser.email || prev.email,

      contactNo: currentDbUser?.contact_no || currentDbUser?.phone || authUser.contact_number || prev.contactNo,

      image: authUser.image_url || prev.image,

      department: currentDbUser?.department || authUser.department || prev.department,

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
  }, [authUser, currentDbUser]);

  /**
   * Real-time sync when employee profile or ID is updated
   */
  useEffect(() => {
    const syncEmployeeProfile = () => {
      const emp = (authUser?.email ? getEmployeeProfile(authUser.email) : null) ?? (authUser?.id ? getEmployeeProfile(authUser.id) : null);
      let newId = (emp?.employeeId && emp.employeeId !== 'N/A' && emp.employeeId !== 'NA') ? emp.employeeId : null;
      if (!newId) {
        try {
          const staffStr = localStorage.getItem('aether_staff_list');
          if (staffStr) {
            const staffList = JSON.parse(staffStr);
            const found = staffList.find((s: any) =>
              (authUser?.email && s.email?.toLowerCase() === authUser.email.toLowerCase()) ||
              (authUser?.id && String(s.id) === String(authUser.id))
            );
            if (found && (found.employee_id || found.employee_code || found.employeeId)) {
              newId = found.employee_id || found.employee_code || found.employeeId;
            }
          }
        } catch {}
      }
      if (newId) {
        setUser((prev) => ({
          ...prev,
          employeeId: newId,
        }));
      }
    };

    window.addEventListener('aether_employee_profiles_updated', syncEmployeeProfile);
    window.addEventListener('auth_user_updated', syncEmployeeProfile);
    window.addEventListener('storage', syncEmployeeProfile);
    return () => {
      window.removeEventListener('aether_employee_profiles_updated', syncEmployeeProfile);
      window.removeEventListener('auth_user_updated', syncEmployeeProfile);
      window.removeEventListener('storage', syncEmployeeProfile);
    };
  }, [authUser?.email, authUser?.id]);

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
      }));

      // Update stored user in localStorage and dispatch sync event
      const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...existingUser,
        username: updatedData.name,
        email: updatedData.email,
        contact_number: updatedData.contactNo,
        designation: updatedData.designation,
        department: updatedData.department,
        work_location: updatedData.workLocation,
        address: updatedData.address,
        company: updatedData.company,
        country: updatedData.country,
        ...(result?.user || {}),
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));

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

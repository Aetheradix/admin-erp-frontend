import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useUpdateProfileMutation } from '@/store/api/authApiSlice';
import { useGetAutoApproveQuery, useUpdateAutoApproveMutation } from '@/store/api/settingslice';
import { showToast } from '@/components/ui/composed/Toast.utils';

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

  const authUserRecord = authUser as unknown as Record<string, unknown> | null;

  const [user, setUser] = useState<ProfileUserData>(() => {
    const name = authUser?.username || '';
    const email = authUser?.email || '';

    const initialRoles = (authUserRecord?.roles as Array<{
      id: string;
      name: string;
      color?: string;
    }>) || [
      {
        id: '1',
        name: authUser?.designation || (isAdmin ? 'Software Developer' : 'Employee'),
        color: 'emerald',
      },
      {
        id: '2',
        name: (authUserRecord?.employee_type as string) || (isAdmin ? 'Admin' : 'Employee'),
        color: 'amber',
      },
    ];

    return {
      name,
      designation: authUser?.designation || (isAdmin ? 'Administrator' : 'Staff Member'),

      employeeId: authUser?.employee_id || 'N/A',

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

      employeeType: (authUserRecord?.employee_type as string) || (isAdmin ? 'Admin' : 'Employee'),

      tNumber: (authUserRecord?.t_number as string) || '',

      costCenter: (authUserRecord?.cost_center as string) || '',

      subOrganization: (authUserRecord?.sub_organization as string) || authUser?.department || '',

      statusText: (authUserRecord?.status_text as string) || 'Active',

      lastSeen: (authUserRecord?.last_seen as string) || 'Recently active',

      workHours: (authUserRecord?.work_hours as string) || 'Standard Hours',

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

    setUser((prev) => ({
      ...prev,

      name: authUser.username || prev.name,

      designation: authUser.designation || prev.designation,

      employeeId: authUser.employee_id || prev.employeeId,

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

      manager: (record.manager as ManagerInfo) ?? prev.manager,

      lineLeader: (record.line_leader as ManagerInfo) ?? prev.lineLeader,

      teamMembers: (record.team_members as TeamMemberInfo[]) ?? prev.teamMembers,
    }));
  }, [authUser]);

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
  }) => {
    try {
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
      };

      const result = await updateProfile(payload)
        .unwrap()
        .catch(() => null);

      setUser((prev) => ({
        ...prev,
        ...updatedData,
      }));

      if (result?.user) {
        const existingUser = JSON.parse(localStorage.getItem('user') || '{}');

        const updatedUser = {
          ...existingUser,
          ...result.user,
        };

        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      setIsEditing(false);

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Profile updated successfully',
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

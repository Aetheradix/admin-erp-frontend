import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useUpdateProfileMutation } from '@/store/api/authApiSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';

export const useProfile = () => {
  const { user: authUser, logout: authLogout } = useAuth();
  const isAdmin = authUser?.role === 'Admin';
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [showElevationDialog, setShowElevationDialog] = useState(false);

  const [user, setUser] = useState({
    name: authUser?.username || '',
    designation: authUser?.designation || (isAdmin ? 'Administrator' : 'Staff Member'),
    employeeId: authUser?.employee_id || 'N/A',
    email: authUser?.email || '',
    contactNo: authUser?.contact_number || '',
    department: authUser?.department,
    joinDate: authUser?.join_date,
    image:
      authUser?.image_url ||
      `https://api.dicebear.com/7.x/notionists/svg?seed=${authUser?.username || 'User'}`,
  });

  console.log(user);

  useEffect(() => {
    if (authUser) {
      setUser((prev) => ({
        ...prev,
        name: authUser.username,
        designation: authUser.designation || 'Staff Member',
        employeeId: authUser.employee_id || 'N/A',
        email: authUser.email || '',
        contactNo: authUser.contact_number || '',
        image: authUser.image_url || prev.image,
        department: authUser.department,
        joinDate: authUser.join_date,
      }));
    }
  }, [authUser]);

  const handleEditSave = async (updatedData: {
    name: string;
    email: string;
    contactNo: string;
    designation: string;
    department: string;
  }) => {
    try {
      const payload = {
        username: updatedData.name,
        email: updatedData.email,
        contact_no: updatedData.contactNo,
        designation: updatedData.designation,
        department: updatedData.department,
      };
      const result = await updateProfile(payload).unwrap();
      const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...existingUser, ...result.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
      window.location.reload();
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      console.error('Failed to update profile:', err);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: apiError.data?.message || 'Failed to update profile',
        life: 3000,
      });
    }
  };

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
    isUpdating,
    isEditing,
    setIsEditing,
    showElevationDialog,
    setShowElevationDialog,
    handleEditSave,
    handleLogout,
  };
};

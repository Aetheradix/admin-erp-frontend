import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUpdateProfileMutation } from '@/store/api/authApiSlice';

export const useProfile = () => {
  const { user: authUser, logout: authLogout } = useAuth();
  const isAdmin = authUser?.role === 'admin';
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [showElevationDialog, setShowElevationDialog] = useState(false);

  const [user, setUser] = useState({
    name: authUser?.username || '',
    designation: authUser?.designation || (isAdmin ? 'Administrator' : 'Staff Member'),
    employeeId: authUser?.employee_id || 'N/A',
    email: authUser?.email || '',
    contactNo: authUser?.contact_no || '',
    department: 'General',
    joinDate: 'Jan 2024',
    image: authUser?.image_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${authUser?.username || 'User'}`
  });

  useEffect(() => {
    if (authUser) {
      setUser(prev => ({
        ...prev,
        name: authUser.username,
        designation: authUser.designation || 'Staff Member',
        employeeId: authUser.employee_id || 'N/A',
        email: authUser.email || '',
        contactNo: authUser.contact_no || '',
        image: authUser.image_url || prev.image
      }));
    }
  }, [authUser]);

  const handleEditSave = async (updatedData: any) => {
    try {
      const payload = {
        username: updatedData.name,
        email: updatedData.email,
        contact_no: updatedData.contactNo,
        designation: updatedData.designation,
      };
      const result = await updateProfile(payload).unwrap();
      const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...existingUser, ...result.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
      window.location.reload();
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      alert(err.data?.message || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    authLogout();
    window.location.href = '/auth/login';
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
    handleLogout
  };
};

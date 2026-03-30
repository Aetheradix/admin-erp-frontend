import { useState } from 'react';
import { showToast } from '@/components/ui/composed/Toast';
import { showConfirm } from '@/components/ui/composed/ConfirmDialog';
import { useGetStaffQuery, useCreateStaffMutation, useUpdateStaffMutation, useDeleteStaffMutation } from '@/store/api/staffApiSlice';
import { usePromoteToAdminMutation } from '@/store/api/authApiSlice';
import { useStaffFilters } from './useStaffFilters';
import type { StaffMember } from './mockStaff';

export const useStaff = () => {
  const { data: staff = [], isLoading, isError } = useGetStaffQuery();
  const [createStaff] = useCreateStaffMutation();
  const [updateStaff] = useUpdateStaffMutation();
  const [deleteStaff] = useDeleteStaffMutation();
  const [promoteToAdmin] = usePromoteToAdminMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);

  const { searchQuery, setSearchQuery, activeDepartment, setActiveDepartment } = useStaffFilters();

  const handlePromote = async (id: string) => {
    showConfirm({
      message: 'Are you sure you want to promote this member to Administrator?',
      header: 'Confirm Promotion',
      accept: async () => {
        try {
          await promoteToAdmin(id).unwrap();
          showToast({ severity: 'success', summary: 'Success', detail: 'Member promoted to administrator successfully!', life: 3000 });
        } catch (err: any) {
          showToast({ severity: 'error', summary: 'Error', detail: err.data?.message || 'Failed to promote member.', life: 3000 });
        }
      }
    });
  };

  const handleEdit = (id: string) => {
    const member = staff.find((m: any) => String(m.id) === String(id));
    if (member) {
      setEditingMember({
        ...member,
        name: member.username || member.name,
        role: member.designation || member.role,
        phone: member.contact_no || member.phone,
        image: member.image_url || member.image,
        joinDate: member.join_date || member.joinDate
      });
      setShowForm(true);
    }
  };

  const handleDelete = async (id: string) => {
    showConfirm({
      message: 'Are you sure you want to remove this staff member?',
      header: 'Confirm Deletion',
      accept: async () => {
        try {
          await deleteStaff(id).unwrap();
          showToast({ severity: 'success', summary: 'Success', detail: 'Staff member removed successfully.', life: 3000 });
        } catch (err) {
          console.error('Failed to remove member', err);
          showToast({ severity: 'error', summary: 'Error', detail: 'Failed to remove member.', life: 3000 });
        }
      }
    });
  };

  const handleSubmit = async (data: any) => {
    try {
      const payload = {
        username: data.name,
        email: data.email,
        designation: data.role,
        department: data.department,
        contact_no: data.phone,
        status: data.status,
        join_date: data.joinDate,
        skills: data.skills,
        image_url: data.image
      };

      if (editingMember) {
        await updateStaff({ id: editingMember.id, ...payload }).unwrap();
        showToast({ severity: 'success', summary: 'Success', detail: 'Staff member updated successfully.', life: 3000 });
      } else {
        await createStaff(payload).unwrap();
        showToast({ severity: 'success', summary: 'Success', detail: 'Staff member added successfully.', life: 3000 });
      }
      setShowForm(false);
    } catch (err) {
      console.error('Operation failed', err);
      showToast({ severity: 'error', summary: 'Error', detail: 'Operation failed.', life: 3000 });
    }
  };

  const filteredStaff = staff.filter((member: StaffMember) => {
    const matchesDepartment = activeDepartment === 'All' || member.department === activeDepartment;
    const name = member.username || member.name || '';
    const role = member.designation || member.role || '';
    const skills = member.skills || [];

    const matchesSearch = 
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDepartment && matchesSearch;
  });

  return {
    staff: filteredStaff,
    allStaffCount: staff.length,
    isLoading,
    isError,
    showForm,
    editingMember,
    setShowForm,
    searchQuery,
    setSearchQuery,
    activeDepartment,
    setActiveDepartment,
    handlePromote,
    handleEdit,
    handleDelete,
    handleSubmit,
    onAddMember: () => { setEditingMember(null); setShowForm(true); }
  };
};

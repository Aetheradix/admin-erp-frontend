import { useState } from 'react';
import { useGetUsersQuery } from '@/store/api/userSlice';
import { useStaffFilters } from './useStaffFilters';
import { useStaffMutations } from './useStaffMutations';
import { toStaffFormMember } from '../utils/staffPayload';
import type { StaffMember } from '@/types/models';

export const useStaff = () => {
  const { data: staff = [], isLoading, isError } = useGetUsersQuery();
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const { searchQuery, setSearchQuery, activeDepartment, setActiveDepartment } = useStaffFilters();
  const { handlePromote, handleDelete, handleSubmit } = useStaffMutations(editingMember, () =>
    setShowForm(false)
  );

  const handleEdit = (id: string) => {
    const member = staff.find((m) => String(m.id) === String(id));
    if (member) {
      setEditingMember(toStaffFormMember(member));
      setShowForm(true);
    }
  };

  const filteredStaff = staff.filter((member) => {
    const matchesDepartment = activeDepartment === 'All' || member.department === activeDepartment;
    const name = member.username || member.name || '';
    const role = member.designation || member.role || '';
    const skills = member.skills || [];

    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()));
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
    onAddMember: () => {
      setEditingMember(null);
      setShowForm(true);
    },
  };
};

import { useState } from 'react';
import { message } from 'antd';
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  type RoleItem,
} from '@/store/api/roleApiSlice';
import { EMPTY_ROLE_FORM } from '../constants';
import type { RoleFormData } from '../types';

function getErrorMessage(err: unknown, fallback: string): string {
  const e = err as { data?: { message?: string }; message?: string } | null;
  return e?.data?.message || e?.message || fallback;
}

export function useRoleForm() {
  const [createRoleApi, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRoleApi, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [deleteRoleApi, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [targetRole, setTargetRole] = useState<RoleItem | null>(null);
  const [formData, setFormData] = useState<RoleFormData>(EMPTY_ROLE_FORM);

  const openCreateModal = () => {
    setFormData({ name: '', description: '', permissionIds: [] });
    setCreateModalVisible(true);
  };

  const closeCreateModal = () => setCreateModalVisible(false);

  const openEditModal = (role: RoleItem) => {
    setTargetRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissionIds: role.permissions.map((p) => p.id),
    });
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setTargetRole(null);
  };

  const openDeleteModal = (role: RoleItem) => {
    setTargetRole(role);
    setDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setTargetRole(null);
  };

  const handleCreateSubmit = async () => {
    if (!formData.name.trim()) {
      message.error('Please enter a role name');
      return;
    }

    try {
      await createRoleApi({
        name: formData.name.trim(),
        description: formData.description.trim(),
        permissionIds: formData.permissionIds,
      }).unwrap();

      message.success(`Custom role "${formData.name}" created successfully`);
      setCreateModalVisible(false);
    } catch (err: unknown) {
      message.error(getErrorMessage(err, 'Failed to create role'));
    }
  };

  const handleEditSubmit = async () => {
    if (!targetRole) return;

    try {
      await updateRoleApi({
        id: targetRole.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        permissionIds: formData.permissionIds,
      }).unwrap();

      message.success(`Role "${formData.name}" updated successfully`);
      setEditModalVisible(false);
      setTargetRole(null);
    } catch (err: unknown) {
      message.error(getErrorMessage(err, 'Failed to update role'));
    }
  };

  const handleDeleteSubmit = async () => {
    if (!targetRole) return;

    try {
      await deleteRoleApi(targetRole.id).unwrap();
      message.success(`Role "${targetRole.name}" deleted successfully`);
      setDeleteModalVisible(false);
      setTargetRole(null);
    } catch (err: unknown) {
      message.error(getErrorMessage(err, 'Failed to delete role'));
    }
  };

  return {
    createModalVisible,
    editModalVisible,
    deleteModalVisible,
    targetRole,
    formData,
    setFormData,
    isCreating,
    isUpdating,
    isDeleting,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    handleCreateSubmit,
    handleEditSubmit,
    handleDeleteSubmit,
  };
}

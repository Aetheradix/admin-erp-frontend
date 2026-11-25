import { useState } from 'react';
import { message } from 'antd';
import {
  useUpdateDepartmentHierarchyMutation,
  useUpdateReportingManagerMutation,
} from '@/store/api/organizationApiSlice';
import type { DepartmentHierarchyItem, HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import { getApiErrorMessage } from '@/shared/utils/apiError';
import type {
  AddEmployeeModalState,
  ChangeManagerModalState,
  EditDepartmentModalState,
  EditManagerModalState,
  MatrixManagerModalState,
  RemoveEmployeeModalState,
} from './types';

const CLOSED_ADD: AddEmployeeModalState = { open: false, preselectedManagerId: null };
const CLOSED_REMOVE: RemoveEmployeeModalState = { open: false, user: null };
const CLOSED_MATRIX: MatrixManagerModalState = { open: false, userId: null };

export function useHierarchyModals(refetch: () => unknown) {
  const [updateReportingManager, { isLoading: isUpdatingManager }] =
    useUpdateReportingManagerMutation();
  const [updateDepartmentHierarchy, { isLoading: isUpdatingDept }] =
    useUpdateDepartmentHierarchyMutation();

  const [addEmployeeModal, setAddEmployeeModal] = useState<AddEmployeeModalState>(CLOSED_ADD);
  const [removeEmployeeModal, setRemoveEmployeeModal] =
    useState<RemoveEmployeeModalState>(CLOSED_REMOVE);
  const [editManagerModal, setEditManagerModal] = useState<EditManagerModalState>({
    open: false,
    user: null,
    selectedManagerId: null,
  });
  const [editDeptModal, setEditDeptModal] = useState<EditDepartmentModalState>({
    open: false,
    department: null,
    selectedHeadId: null,
    parentDeptId: null,
  });
  const [changeManagerModal, setChangeManagerModal] = useState<ChangeManagerModalState>({
    open: false,
    user: null,
  });
  const [bulkHandoverModal, setBulkHandoverModal] = useState(false);
  const [replaceManagerModal, setReplaceManagerModal] = useState(false);
  const [offboardRollupModal, setOffboardRollupModal] = useState(false);
  const [matrixModal, setMatrixModal] = useState<MatrixManagerModalState>(CLOSED_MATRIX);

  const openAddEmployee = (managerId: number | null) =>
    setAddEmployeeModal({ open: true, preselectedManagerId: managerId });
  const closeAddEmployee = () => setAddEmployeeModal(CLOSED_ADD);

  const openRemoveEmployee = (user: HierarchyNodeUser) =>
    setRemoveEmployeeModal({ open: true, user });
  const closeRemoveEmployee = () => setRemoveEmployeeModal(CLOSED_REMOVE);

  const openEditManager = (user: HierarchyNodeUser) =>
    setEditManagerModal({
      open: true,
      user,
      selectedManagerId: user.reporting_manager_id || null,
    });
  const closeEditManager = () =>
    setEditManagerModal({ open: false, user: null, selectedManagerId: null });

  const openEditDepartment = (department: DepartmentHierarchyItem) =>
    setEditDeptModal({
      open: true,
      department,
      selectedHeadId: department.head_user_id || null,
      parentDeptId: department.parent_department_id || null,
    });
  const closeEditDepartment = () =>
    setEditDeptModal({
      open: false,
      department: null,
      selectedHeadId: null,
      parentDeptId: null,
    });

  const openChangeManager = (user?: HierarchyNodeUser) =>
    setChangeManagerModal({ open: true, user: user || null });
  const closeChangeManager = () => setChangeManagerModal({ open: false, user: null });

  const openMatrixManager = (user?: HierarchyNodeUser) =>
    setMatrixModal({ open: true, userId: user?.id || null });
  const closeMatrixManager = () => setMatrixModal(CLOSED_MATRIX);

  const saveManager = async () => {
    if (!editManagerModal.user) return;
    try {
      await updateReportingManager({
        userId: editManagerModal.user.id,
        reportingManagerId: editManagerModal.selectedManagerId,
        reason: 'Reporting line updated via Organization Chart',
      }).unwrap();
      message.success(`Reporting relationship updated for ${editManagerModal.user.username}`);
      closeEditManager();
      refetch();
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Failed to update reporting manager.'));
    }
  };

  const saveDepartment = async () => {
    if (!editDeptModal.department) return;
    try {
      await updateDepartmentHierarchy({
        departmentId: editDeptModal.department.id,
        headUserId: editDeptModal.selectedHeadId,
        parentDepartmentId: editDeptModal.parentDeptId,
      }).unwrap();
      message.success(
        `Department ${editDeptModal.department.department_name} updated successfully.`
      );
      closeEditDepartment();
      refetch();
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Failed to update department leadership.'));
    }
  };

  return {
    editManagerModal,
    setEditManagerModal,
    editDeptModal,
    setEditDeptModal,
    addEmployeeModal,
    removeEmployeeModal,
    changeManagerModal,
    bulkHandoverModal,
    setBulkHandoverModal,
    replaceManagerModal,
    setReplaceManagerModal,
    offboardRollupModal,
    setOffboardRollupModal,
    matrixModal,
    isUpdatingManager,
    isUpdatingDept,
    openAddEmployee,
    closeAddEmployee,
    openRemoveEmployee,
    closeRemoveEmployee,
    openEditManager,
    closeEditManager,
    openEditDepartment,
    closeEditDepartment,
    openChangeManager,
    closeChangeManager,
    openMatrixManager,
    closeMatrixManager,
    saveManager,
    saveDepartment,
  };
}

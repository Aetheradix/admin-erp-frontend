import type { DepartmentHierarchyItem, HierarchyNodeUser } from '@/store/api/organizationApiSlice';

export type HierarchyViewMode = 'map' | 'list' | 'departments' | 'reorg' | 'audit';

export interface AddEmployeeModalState {
  open: boolean;
  preselectedManagerId: number | null;
}

export interface RemoveEmployeeModalState {
  open: boolean;
  user: HierarchyNodeUser | null;
}

export interface EditManagerModalState {
  open: boolean;
  user: HierarchyNodeUser | null;
  selectedManagerId: number | null;
}

export interface EditDepartmentModalState {
  open: boolean;
  department: DepartmentHierarchyItem | null;
  selectedHeadId: number | null;
  parentDeptId: number | null;
}

export interface ChangeManagerModalState {
  open: boolean;
  user: HierarchyNodeUser | null;
}

export interface MatrixManagerModalState {
  open: boolean;
  userId: number | null;
}

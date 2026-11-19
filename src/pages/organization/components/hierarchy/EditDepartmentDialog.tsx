import type { Dispatch, SetStateAction } from 'react';
import { Select } from 'antd';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Button } from '@/components/ui/primitives/Button';
import type {
  DepartmentHierarchyItem,
  HierarchyNodeUser,
} from '@/store/api/organizationApiSlice';
import type { EditDepartmentModalState } from './types';

interface EditDepartmentDialogProps {
  state: EditDepartmentModalState;
  setState: Dispatch<SetStateAction<EditDepartmentModalState>>;
  flatUsers: HierarchyNodeUser[];
  departments: DepartmentHierarchyItem[];
  isUpdating: boolean;
  onSave: () => void;
  onClose: () => void;
}

export function EditDepartmentDialog({
  state,
  setState,
  flatUsers,
  departments,
  isUpdating,
  onSave,
  onClose,
}: EditDepartmentDialogProps) {
  return (
    <Dialog
      visible={state.open}
      onHide={onClose}
      header="Configure Department Leadership"
      className="max-w-md">
      {state.department && (
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Department Name
            </label>
            <p className="text-sm font-black text-foreground">{state.department.department_name}</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              Designate Department Head
            </label>
            <Select
              showSearch
              placeholder="Select an employee as Department Head..."
              allowClear
              className="w-full"
              value={state.selectedHeadId || undefined}
              onChange={(val) =>
                setState((prev) => ({
                  ...prev,
                  selectedHeadId: val ? Number(val) : null,
                }))
              }
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={flatUsers.map((user) => ({
                value: user.id,
                label: `${user.username} (${user.email}) -- ${user.role}`,
              }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              Parent Department (Optional)
            </label>
            <Select
              placeholder="Select parent department..."
              allowClear
              className="w-full"
              value={state.parentDeptId || undefined}
              onChange={(val) =>
                setState((prev) => ({
                  ...prev,
                  parentDeptId: val ? Number(val) : null,
                }))
              }
              options={departments
                .filter((department) => department.id !== state.department?.id)
                .map((department) => ({
                  value: department.id,
                  label: department.department_name,
                }))}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onSave} loading={isUpdating} className="px-6">
              Save Department
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

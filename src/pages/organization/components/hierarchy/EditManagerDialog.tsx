import type { Dispatch, SetStateAction } from 'react';
import { Select } from 'antd';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Button } from '@/components/ui/primitives/Button';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import type { EditManagerModalState } from './types';

interface EditManagerDialogProps {
  state: EditManagerModalState;
  setState: Dispatch<SetStateAction<EditManagerModalState>>;
  flatUsers: HierarchyNodeUser[];
  isUpdating: boolean;
  onSave: () => void;
  onClose: () => void;
}

export function EditManagerDialog({
  state,
  setState,
  flatUsers,
  isUpdating,
  onSave,
  onClose,
}: EditManagerDialogProps) {
  return (
    <Dialog
      visible={state.open}
      onHide={onClose}
      header="Change Reporting Manager"
      className="max-w-md">
      {state.user && (
        <div className="space-y-4 pt-2">
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-black flex items-center justify-center text-xs">
              {state.user.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="font-bold text-foreground text-sm block">
                {state.user.username}
              </span>
              <span className="text-xs text-muted-foreground">
                {state.user.designation || state.user.role} • {state.user.department}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              Select Direct Reporting Manager
            </label>
            <Select
              showSearch
              placeholder="Select manager (or leave empty for root/executive)..."
              allowClear
              className="w-full"
              value={state.selectedManagerId || undefined}
              onChange={(val) =>
                setState((prev) => ({
                  ...prev,
                  selectedManagerId: val ? Number(val) : null,
                }))
              }
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={flatUsers
                .filter((user) => user.id !== state.user?.id)
                .map((user) => ({
                  value: user.id,
                  label: `${user.username} (${user.email}) -- ${user.role}`,
                }))}
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              The selected manager will review this employee's leave and WFH requests when
              hierarchy-based approvals are active.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onSave} loading={isUpdating} className="px-6">
              Update Manager
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

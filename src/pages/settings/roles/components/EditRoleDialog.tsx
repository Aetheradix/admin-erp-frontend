import type { Dispatch, SetStateAction } from 'react';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Input } from '@/components/ui/primitives/Input';
import { Button } from '@/components/ui/primitives/Button';
import { Textarea } from '@/components/ui/primitives/Textarea';
import type { PermissionItem, RoleItem } from '@/store/api/roleApiSlice';
import type { RoleFormData } from '../types';
import { PermissionPicker } from './PermissionPicker';

interface EditRoleDialogProps {
  visible: boolean;
  targetRole: RoleItem | null;
  formData: RoleFormData;
  setFormData: Dispatch<SetStateAction<RoleFormData>>;
  modules: Record<string, PermissionItem[]>;
  isUpdating: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

export function EditRoleDialog({
  visible,
  targetRole,
  formData,
  setFormData,
  modules,
  isUpdating,
  onSubmit,
  onClose,
}: EditRoleDialogProps) {
  const togglePermission = (permId: number) =>
    setFormData((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permId)
        ? prev.permissionIds.filter((id) => id !== permId)
        : [...prev.permissionIds, permId],
    }));

  return (
    <Dialog
      visible={visible}
      onHide={onClose}
      header={`Edit Role: ${targetRole?.name}`}
      className="max-w-2xl">
      <div className="space-y-4 pt-4">
        <div>
          <label className="text-xs font-bold text-foreground block mb-1">
            Role Name {targetRole?.is_system && '(System roles cannot be renamed)'}
          </label>
          <Input
            disabled={targetRole?.is_system}
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-foreground block mb-1">Description</label>
          <Textarea
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <PermissionPicker
          label={`Permissions (${formData.permissionIds.length} granted)`}
          modules={modules}
          selectedIds={formData.permissionIds}
          onToggle={togglePermission}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSubmit} disabled={isUpdating}>
            {isUpdating ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

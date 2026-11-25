import type { Dispatch, SetStateAction } from 'react';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Input } from '@/components/ui/primitives/Input';
import { Button } from '@/components/ui/primitives/Button';
import { Textarea } from '@/components/ui/primitives/Textarea';
import type { PermissionItem } from '@/store/api/roleApiSlice';
import type { RoleFormData } from '../types';
import { PermissionPicker } from './PermissionPicker';

interface CreateRoleDialogProps {
  visible: boolean;
  formData: RoleFormData;
  setFormData: Dispatch<SetStateAction<RoleFormData>>;
  modules: Record<string, PermissionItem[]>;
  permissions: PermissionItem[];
  isCreating: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

export function CreateRoleDialog({
  visible,
  formData,
  setFormData,
  modules,
  permissions,
  isCreating,
  onSubmit,
  onClose,
}: CreateRoleDialogProps) {
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
      header="Create New Custom Role"
      className="max-w-2xl">
      <div className="space-y-4 pt-4">
        <div>
          <label className="text-xs font-bold text-foreground block mb-1">Role Name *</label>
          <Input
            placeholder="e.g. Marketing Lead, Inventory Auditor"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-foreground block mb-1">Description</label>
          <Textarea
            placeholder="Explain the scope and responsibilities of this role..."
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <PermissionPicker
          label={`Assign Permissions (${formData.permissionIds.length} selected)`}
          modules={modules}
          selectedIds={formData.permissionIds}
          onToggle={togglePermission}
          onSelectAll={() =>
            setFormData((prev) => ({ ...prev, permissionIds: permissions.map((p) => p.id) }))
          }
          onClearAll={() => setFormData((prev) => ({ ...prev, permissionIds: [] }))}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSubmit} disabled={isCreating}>
            {isCreating ? 'Creating Role...' : 'Create Role'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

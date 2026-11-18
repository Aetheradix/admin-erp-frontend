import type { Dispatch, SetStateAction } from 'react';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Button } from '@/components/ui/primitives/Button';
import { Select as AntSelect } from 'antd';
import type { RoleItem } from '@/store/api/roleApiSlice';
import { EDIT_STATUS_OPTIONS } from '../constants';
import type { EditUserModalState, OptionItem, UserRecord } from '../types';
import { FormField } from './FormField';

interface EditUserDialogProps {
  visible: boolean;
  state: EditUserModalState;
  setState: Dispatch<SetStateAction<EditUserModalState>>;
  roles: RoleItem[];
  mergedUsers: UserRecord[];
  availableRoles: OptionItem[];
  availableDepartments: OptionItem[];
  onSave: () => void;
  onClose: () => void;
}

export function EditUserDialog({
  visible,
  state,
  setState,
  roles,
  mergedUsers,
  availableRoles,
  availableDepartments,
  onSave,
  onClose,
}: EditUserDialogProps) {
  const { form } = state;
  const updateForm = (patch: Partial<EditUserModalState['form']>) =>
    setState((prev) => ({ ...prev, form: { ...prev.form, ...patch } }));

  return (
    <Dialog
      visible={visible}
      onHide={onClose}
      header="Edit User Profile (Admin)"
      modal
      className="w-full max-w-lg mx-4"
      contentClassName="p-8"
      headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
      pt={{
        root: { className: 'rounded-2xl overflow-hidden border-none shadow-2xl bg-white' },
        mask: { className: 'backdrop-blur-md bg-black/40' },
      }}>
      <div className="flex flex-col gap-5">
        <p className="text-xs text-muted -mt-2">
          Update employee profile information. Changes are validated and logged into the platform
          audit trail.
        </p>

        <FormField label="Full Name">
          <Input value={form.name} onChange={(e) => updateForm({ name: e.target.value })} />
        </FormField>

        <FormField label="Email Address">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => updateForm({ email: e.target.value })}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Primary Role">
            <Select
              options={availableRoles}
              value={form.role}
              onChange={(e) => updateForm({ role: e.value })}
            />
          </FormField>
          <FormField label="Department">
            <Select
              options={availableDepartments}
              value={form.department}
              onChange={(e) => updateForm({ department: e.value })}
            />
          </FormField>
        </div>

        <FormField label="Assigned Roles (RBAC Permissions)">
          <AntSelect
            mode="multiple"
            placeholder="Select assigned roles"
            value={form.roleIds}
            onChange={(vals: number[]) => {
              const selectedRoles = roles.filter((r) => vals.includes(r.id));
              const primaryRole = selectedRoles[0]?.name || form.role;
              updateForm({ roleIds: vals, role: primaryRole });
            }}
            options={roles.map((r) => ({ label: r.name, value: r.id }))}
            className="w-full"
          />
        </FormField>

        <FormField label="Reporting Manager (Organization Hierarchy)">
          <AntSelect
            allowClear
            showSearch
            placeholder="Select reporting manager (optional)"
            filterOption={(input, option) =>
              String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            value={form.reportingManagerId ?? undefined}
            onChange={(val: number | undefined) => updateForm({ reportingManagerId: val ?? null })}
            options={mergedUsers
              .filter((u) => String(u.id) !== String(state.user?.id))
              .map((u) => ({ label: `${u.name} (${u.role} - ${u.email})`, value: Number(u.id) }))}
            className="w-full"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Contact Number">
            <Input
              placeholder="+1 555-0199"
              value={form.contactNo}
              onChange={(e) => updateForm({ contactNo: e.target.value })}
            />
          </FormField>
          <FormField label="Status">
            <Select
              options={EDIT_STATUS_OPTIONS}
              value={form.status}
              onChange={(e) => updateForm({ status: e.value })}
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button variant="ghost" label="Cancel" onClick={onClose} className="rounded-md!" />
          <Button label="Save Changes" icon="pi pi-check" onClick={onSave} className="rounded-md! px-6!" />
        </div>
      </div>
    </Dialog>
  );
}

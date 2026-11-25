import { Check, ShieldCheck, Sparkles } from 'lucide-react';
import { Tag, Select as AntSelect } from 'antd';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Button } from '@/components/ui/primitives/Button';
import type { RoleItem } from '@/store/api/roleApiSlice';
import type { RoleAssignmentUser, RoleOption } from '../types';
import { resolveRolePermissionCount } from '../utils';

interface ManageUserRolesDialogProps {
  visible: boolean;
  targetUser: RoleAssignmentUser | null;
  selectedRoleNames: string[];
  onSelectionChange: (roleNames: string[]) => void;
  availableRoleOptions: RoleOption[];
  roles: RoleItem[];
  previewPermissions: string[];
  isSaving: boolean;
  onSave: () => void;
  onClose: () => void;
}

export function ManageUserRolesDialog({
  visible,
  targetUser,
  selectedRoleNames,
  onSelectionChange,
  availableRoleOptions,
  roles,
  previewPermissions,
  isSaving,
  onSave,
  onClose,
}: ManageUserRolesDialogProps) {
  return (
    <Dialog
      visible={visible}
      onHide={onClose}
      header={`Manage User Roles & RBAC - ${targetUser?.name || targetUser?.username || 'User'}`}
      className="max-w-2xl">
      <div className="space-y-5 pt-4">
        {/* User Info Header Card */}
        <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-sm border-2 border-primary/20">
              {targetUser?.avatar ||
                (targetUser?.name || targetUser?.username || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground">
                {targetUser?.name || targetUser?.username}
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                {targetUser?.email} • {targetUser?.department || 'General'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
              Assigned Roles
            </span>
            <span className="text-sm font-black text-primary">
              {selectedRoleNames.length} Roles Active
            </span>
          </div>
        </div>

        {/* Multiple Roles Selector */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-foreground">
              Assign Roles (Multiple Roles Supported) *
            </label>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Select one or more roles
            </span>
          </div>
          <AntSelect
            mode="multiple"
            value={selectedRoleNames}
            onChange={(vals) => onSelectionChange(vals)}
            options={availableRoleOptions}
            placeholder="Select roles to assign to user..."
            className="w-full text-xs"
            style={{ minHeight: 38 }}
          />
        </div>

        {/* RBAC Permission Aggregation Across Roles Card */}
        <div className="p-4 rounded-2xl bg-card border border-primary/20 bg-primary/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Aggregated Permissions (Role Inheritance Union)</span>
            </div>
            <Tag color="blue" className="font-bold text-xs rounded-full border-0">
              {previewPermissions.length} Combined Permissions
            </Tag>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Effective permissions are derived from all roles assigned to this user. The user
            inherits the combined union of permissions from each role (e.g. Role A granting{' '}
            <span className="font-semibold text-foreground">View Users, Edit Users</span> combined
            with Role B granting{' '}
            <span className="font-semibold text-foreground">Manage Reports, Delete Reports</span>{' '}
            gives all four permissions).
          </p>

          {/* Selected Roles Contribution List */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Assigned Role Breakdown:
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedRoleNames.map((rName) => (
                <div
                  key={rName}
                  className="px-2.5 py-1 rounded-xl bg-surface-elevated border border-border-subtle flex items-center gap-1.5 text-xs shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-bold text-foreground">{rName}</span>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    ({resolveRolePermissionCount(rName, roles)} perms)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Effective Permissions Preview Chips */}
          <div className="pt-2 border-t border-border/50">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">
              Effective Combined Permissions ({previewPermissions.length}):
            </div>
            <div className="max-h-36 overflow-y-auto flex flex-wrap gap-1 p-2 rounded-xl bg-surface-subtle/80 border border-border-subtle">
              {previewPermissions.map((perm, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-elevated text-[10px] font-bold text-foreground border border-border-subtle">
                  <Check className="w-3 h-3 text-success shrink-0" />
                  {perm}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-border/60">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            disabled={isSaving || selectedRoleNames.length === 0}
            className="gap-2 font-bold">
            <ShieldCheck className="w-4 h-4" />
            {isSaving ? 'Saving Changes...' : 'Save Role Assignments'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

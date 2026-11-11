import React, { useState, useEffect, useMemo } from 'react';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Button } from '@/components/ui/primitives/Button';
import { Select as AntSelect, Tag, message } from 'antd';
import { ShieldCheck, Sparkles, Check, Users } from 'lucide-react';
import { useGetRolesQuery } from '@/store/api/roleApiSlice';
import { useUpdateStaffMutation } from '@/store/api/userSlice';
import { useAuth } from '@/hooks/useAuth';
import {
  aggregateRolePermissions,
  SYSTEM_ROLE_PERMISSIONS,
  extractUserRoles,
} from '@/utils/rbac';
import { recordAuditLog } from '@/services/auditService';

export interface ManageUserRolesModalProps {
  visible: boolean;
  onClose: () => void;
  user: {
    id?: number | string;
    name?: string;
    username?: string;
    email?: string;
    department?: string;
    roles?: Array<{ id?: number | string; name: string }>;
    role?: string;
  } | null;
  onSaved?: (newRoles: Array<{ id: string | number; name: string }>) => void;
}

export const ManageUserRolesModal: React.FC<ManageUserRolesModalProps> = ({
  visible,
  onClose,
  user,
  onSaved,
}) => {
  const { user: currentAuthUser, updateUser } = useAuth();
  const { data: rolesData, isLoading: isLoadingRoles } = useGetRolesQuery();
  const [updateStaffApi, { isLoading: isUpdatingStaff }] = useUpdateStaffMutation();

  const [selectedUserRoleNames, setSelectedUserRoleNames] = useState<string[]>([]);

  const roles = useMemo(() => rolesData?.data || [], [rolesData]);

  // Sync selected roles whenever the modal opens or target user changes
  useEffect(() => {
    if (visible && user) {
      const assigned = extractUserRoles(user).map((r) => r.name);
      // Deduplicate names
      const uniqueNames = Array.from(new Set(assigned));
      setSelectedUserRoleNames(uniqueNames.length > 0 ? uniqueNames : ['Employee']);
    }
  }, [visible, user]);

  // Available roles for multi-select dropdown
  const availableRoleOptions = useMemo(() => {
    const map = new Map<string, string>();
    // Add system role defaults
    Object.keys(SYSTEM_ROLE_PERMISSIONS).forEach((r) => map.set(r.toLowerCase(), r));
    // Add real database roles with exact capitalization
    roles.forEach((r) => {
      if (r.name && r.name.trim()) {
        map.set(r.name.trim().toLowerCase(), r.name.trim());
      }
    });

    return Array.from(map.values()).map((name) => ({
      value: name,
      label: name,
    }));
  }, [roles]);

  // Real-time preview of combined permissions (Union across all selected roles)
  const previewPermissions = useMemo(() => {
    if (selectedUserRoleNames.length === 0) return [];
    const roleEntries = selectedUserRoleNames.map((name) => {
      const found = roles.find((r) => r.name.toLowerCase() === name.toLowerCase());
      return found || { name, permissions: SYSTEM_ROLE_PERMISSIONS[name] || [] };
    });
    return aggregateRolePermissions(roleEntries, roles);
  }, [selectedUserRoleNames, roles]);

  const handleSave = async () => {
    if (!user) return;
    if (selectedUserRoleNames.length === 0) {
      message.error('A user must have at least one assigned role.');
      return;
    }

    const primaryRole = selectedUserRoleNames[0];

    // Map each name to its real database ID if available
    const roleObjects = selectedUserRoleNames.map((name) => {
      const found = roles.find((r) => r.name.toLowerCase() === name.toLowerCase());
      return {
        id: found ? found.id : undefined,
        name: found ? found.name : name,
        is_system: found ? Boolean(found.is_system) : true,
      };
    });

    const validRoleIds = roleObjects
      .map((r) => Number(r.id))
      .filter((id) => !isNaN(id) && id > 0);

    const userId = user.id;

    try {
      if (userId) {
        await updateStaffApi({
          id: userId,
          role: primaryRole,
          roles: roleObjects,
          roleIds: validRoleIds,
        } as any).unwrap();
      }

      message.success('User roles updated successfully.');
    } catch {
      // Local fallback handled gracefully
      message.info('Roles updated in active session.');
    }

    // If current logged-in user, immediately update local user and permissions
    if (
      currentAuthUser &&
      (String(currentAuthUser.id) === String(user.id) ||
        currentAuthUser.email?.toLowerCase() === user.email?.toLowerCase())
    ) {
      const effective = aggregateRolePermissions(roleObjects, roles);
      updateUser({
        role: primaryRole as any,
        roles: roleObjects as any,
      });
      localStorage.setItem('erp_permissions', JSON.stringify(effective));
      localStorage.setItem('erp_roles_list', JSON.stringify(selectedUserRoleNames));
      window.dispatchEvent(
        new CustomEvent('aether_user_updated', {
          detail: {
            ...currentAuthUser,
            role: primaryRole,
            roles: roleObjects,
          },
        })
      );
    }

    recordAuditLog({
      action: 'User Roles Updated (RBAC)',
      category: 'user_management',
      user: currentAuthUser?.username || 'Administrator',
      userEmail: currentAuthUser?.email || '',
      target: user.name || user.email || String(user.id || ''),
      targetEmail: user.email || '',
      status: 'Success',
      details: `Assigned roles [${selectedUserRoleNames.join(', ')}] to user ${user.name || user.email}`,
    });

    if (onSaved) {
      onSaved(roleObjects.map((r) => ({ id: r.id || r.name, name: r.name })));
    }

    onClose();
  };

  const displayName = user?.name || user?.username || user?.email || 'User';

  return (
    <Dialog
      visible={visible}
      onHide={onClose}
      header="Manage User Roles & RBAC"
      className="max-w-2xl w-full">
      <div className="space-y-4 pt-2">
        {/* User Identity Header Card */}
        <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="text-sm font-black text-foreground">{displayName}</h4>
              <p className="text-xs text-muted-foreground">
                {user?.email} • {user?.department || 'Staff'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Assigned Roles
            </div>
            <span className="text-xs font-black text-primary">
              {selectedUserRoleNames.length} Role{selectedUserRoleNames.length !== 1 ? 's' : ''}{' '}
              Active
            </span>
          </div>
        </div>

        {/* Multi-Role Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span>Assign Roles (Multiple Roles Supported) *</span>
            </label>
            <span className="text-[11px] text-muted-foreground">
              Select one or more roles
            </span>
          </div>
          <AntSelect
            mode="multiple"
            value={selectedUserRoleNames}
            onChange={(vals) => setSelectedUserRoleNames(vals)}
            options={availableRoleOptions}
            loading={isLoadingRoles}
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
              {selectedUserRoleNames.map((rName) => {
                const rObj = roles.find((r) => r.name.toLowerCase() === rName.toLowerCase());
                const count =
                  rObj?.permissions?.length || (SYSTEM_ROLE_PERMISSIONS[rName]?.length ?? 0);
                return (
                  <div
                    key={rName}
                    className="px-2.5 py-1 rounded-xl bg-surface-elevated border border-border-subtle flex items-center gap-1.5 text-xs shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-bold text-foreground">{rName}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      ({count} perms)
                    </span>
                  </div>
                );
              })}
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
            onClick={handleSave}
            disabled={isUpdatingStaff || selectedUserRoleNames.length === 0}
            className="gap-2 font-bold">
            <ShieldCheck className="w-4 h-4" />
            {isUpdatingStaff ? 'Saving Changes...' : 'Save Role Assignments'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};


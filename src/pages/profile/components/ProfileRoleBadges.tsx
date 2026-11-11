import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, X } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';
import { useAuth } from '@/hooks/useAuth';

export interface RoleItem {
  id: string;
  name: string;
  color?: string;
}

export interface ProfileRoleBadgesProps {
  roles: RoleItem[];
  onAddRole?: (roleName: string) => void;
  onRemoveRole?: (roleId: string) => void;
  userId?: string | number;
  userEmail?: string;
  canManage?: boolean;
  onManageRoles?: () => void;
}

export const ProfileRoleBadges = ({
  roles,
  onRemoveRole,
  userId,
  userEmail,
  canManage,
  onManageRoles,
}: ProfileRoleBadgesProps) => {
  const navigate = useNavigate();
  const { can, isSuperadmin } = usePermission();
  const { user: currentAuthUser } = useAuth();

  const isAuthorized =
    canManage ??
    (isSuperadmin ||
      can('role:view') ||
      can('role:assign') ||
      can('role:edit') ||
      ['admin', 'superadmin'].includes((currentAuthUser?.role || '').toLowerCase()));

  // Deduplicate roles by normalized name so the same role never appears twice
  const uniqueRoles = useMemo(() => {
    const seen = new Set<string>();
    const res: RoleItem[] = [];
    for (const role of roles || []) {
      const key = (role.name || '').trim().toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        res.push(role);
      }
    }
    return res;
  }, [roles]);

  // Filter out redundant 'Employee' badge if user already has an admin/superadmin role
  const visibleRoles = useMemo(() => {
    return uniqueRoles.filter(
      (role) =>
        !(
          role.name.toLowerCase() === 'employee' &&
          uniqueRoles.some((r) => ['superadmin', 'admin', 'hradmin'].includes(r.name.toLowerCase()))
        )
    );
  }, [uniqueRoles]);

  const handleManageRolesClick = () => {
    if (onManageRoles) {
      onManageRoles();
      return;
    }
    const targetIdentifier = userId || userEmail || '';
    const query = targetIdentifier
      ? `?tab=assignments&user=${encodeURIComponent(targetIdentifier)}`
      : `?tab=assignments`;
    navigate(`/settings/roles${query}`);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap mt-1">
      {visibleRoles.map((role) => (
        <span
          key={role.id}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-subtle border border-border-subtle text-xs font-bold text-foreground shadow-2xs hover:border-primary/40 transition-all">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span>{role.name}</span>
          {isAuthorized && onRemoveRole && (
            <button
              onClick={() => onRemoveRole(role.id)}
              className="text-muted hover:text-danger cursor-pointer rounded-full p-0.5 hover:bg-danger-soft/30 transition-colors"
              title={`Remove ${role.name} role`}>
              <X size={12} />
            </button>
          )}
        </span>
      ))}

      {/* "Manage Roles" Button replacing the old "+" button */}
      {isAuthorized && (
        <button
          onClick={handleManageRolesClick}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 hover:border-primary text-xs font-bold text-primary hover:bg-primary/20 transition-all cursor-pointer shadow-2xs group"
          title="Manage Roles & Permissions">
          <ShieldCheck size={13} className="text-primary group-hover:scale-110 transition-transform" />
          <span>Manage Roles</span>
        </button>
      )}
    </div>
  );
};

import { Lock, ShieldCheck } from 'lucide-react';
import { Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Button } from '@/components/ui/primitives/Button';
import type { RoleItem } from '@/store/api/roleApiSlice';
import type { User } from '@/types/auth';
import { aggregateRolePermissions, extractUserRoles, isUserSuperadmin } from '@/utils/rbac';
import type { RoleAssignmentUser } from '../types';

interface AssignmentColumnHandlers {
  currentAuthUser: User | null;
  roles: RoleItem[];
  onManageRoles: (user: RoleAssignmentUser) => void;
}

export function buildAssignmentColumns({
  currentAuthUser,
  roles,
  onManageRoles,
}: AssignmentColumnHandlers): ColumnsType<RoleAssignmentUser> {
  return [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs border border-primary/20 shrink-0">
            {record.avatar || (record.name || record.username || 'U').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-foreground text-sm flex items-center gap-2">
              <span>{record.name || record.username}</span>
              {currentAuthUser &&
                (String(currentAuthUser.id) === String(record.id) ||
                  currentAuthUser.email === record.email) && (
                  <Tag color="cyan" className="text-[10px] rounded-md font-bold uppercase border-0">
                    You
                  </Tag>
                )}
            </div>
            <div className="text-xs text-muted-foreground">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (dept: string) => (
        <span className="text-xs font-semibold text-foreground">{dept || 'General'}</span>
      ),
    },
    {
      title: 'Assigned Roles',
      key: 'roles',
      render: (_, record) => {
        const userRoles = extractUserRoles(record);
        return (
          <div className="flex flex-wrap gap-1.5 max-w-[280px]">
            {userRoles.map((r) => (
              <span
                key={r.id || r.name}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border border-primary/20 bg-primary/10 text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {r.name}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Effective Permissions',
      key: 'permissions',
      render: (_, record) => {
        const userRoles = extractUserRoles(record);
        const perms = aggregateRolePermissions(userRoles, roles);
        const isSuper = isUserSuperadmin(record);
        if (isSuper) {
          return (
            <Tag
              color="gold"
              className="font-bold text-xs rounded-md border-0 flex items-center gap-1 w-fit">
              <Lock className="w-3 h-3" /> All Permissions (SuperAdmin)
            </Tag>
          );
        }
        return (
          <Tooltip
            title={
              <div className="max-h-48 overflow-y-auto space-y-1 p-1">
                <div className="font-bold text-xs mb-1">Combined Effective Permissions:</div>
                <div className="flex flex-wrap gap-1">
                  {perms.slice(0, 25).map((p, i) => (
                    <span key={i} className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">
                      {p}
                    </span>
                  ))}
                  {perms.length > 25 && (
                    <span className="text-[10px]">+{perms.length - 25} more</span>
                  )}
                </div>
              </div>
            }>
            <span className="cursor-help">
              <Tag color="blue" className="font-bold text-xs rounded-md border-0">
                {perms.length} Permissions Inherited
              </Tag>
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          variant="outline"
          size="small"
          onClick={() => onManageRoles(record)}
          className="flex items-center gap-1.5 font-bold hover:border-primary">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Manage Roles
        </Button>
      ),
    },
  ];
}

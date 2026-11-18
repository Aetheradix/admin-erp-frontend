import { Edit2, KeyRound, Lock, Shield, Trash2, Users } from 'lucide-react';
import { Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Button } from '@/components/ui/primitives/Button';
import type { RoleItem } from '@/store/api/roleApiSlice';

interface RoleColumnHandlers {
  canEdit: boolean;
  canDelete: boolean;
  totalPermissions: number;
  onOpenMatrix: (role: RoleItem) => void;
  onEdit: (role: RoleItem) => void;
  onDelete: (role: RoleItem) => void;
}

export function buildRoleColumns({
  canEdit,
  canDelete,
  totalPermissions,
  onOpenMatrix,
  onEdit,
  onDelete,
}: RoleColumnHandlers): ColumnsType<RoleItem> {
  return [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
              record.is_system
                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                : 'bg-primary/10 text-primary border border-primary/20'
            }`}>
            {record.is_system ? <Lock className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground text-sm">{name}</span>
              {record.is_system ? (
                <Tag color="gold" className="text-[10px] font-bold uppercase rounded-md border-0">
                  System Role
                </Tag>
              ) : (
                <Tag color="blue" className="text-[10px] font-bold uppercase rounded-md border-0">
                  Custom Role
                </Tag>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {record.description || 'No description provided'}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Active Members',
      dataIndex: 'user_count',
      key: 'user_count',
      align: 'center',
      render: (count: number) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-foreground">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          {count} {count === 1 ? 'user' : 'users'}
        </span>
      ),
    },
    {
      title: 'Permissions Granted',
      key: 'permissions_count',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">
            {record.permissions.length} / {totalPermissions}
          </span>
          <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{
                width: `${Math.min(100, Math.round((record.permissions.length / (totalPermissions || 1)) * 100))}%`,
              }}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="small"
            onClick={() => onOpenMatrix(record)}
            className="text-xs gap-1.5">
            <KeyRound className="w-3.5 h-3.5" /> Matrix
          </Button>

          {canEdit && (
            <Button
              variant="outline"
              size="small"
              onClick={() => onEdit(record)}
              className="text-xs gap-1.5">
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </Button>
          )}

          {canDelete && (
            <Tooltip
              title={
                record.is_system
                  ? 'System roles cannot be deleted'
                  : record.user_count > 0
                    ? `Assigned to ${record.user_count} user(s). Reassign before deleting.`
                    : 'Delete custom role'
              }>
              <span>
                <Button
                  variant="outline"
                  size="small"
                  disabled={record.is_system || record.user_count > 0}
                  onClick={() => onDelete(record)}
                  className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 disabled:opacity-40">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </span>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];
}

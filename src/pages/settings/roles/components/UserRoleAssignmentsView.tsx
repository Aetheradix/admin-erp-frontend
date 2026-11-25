import { motion } from 'framer-motion';
import { RefreshCw, Search } from 'lucide-react';
import { Table } from 'antd';
import { Button } from '@/components/ui/primitives/Button';
import type { RoleItem } from '@/store/api/roleApiSlice';
import type { User } from '@/types/auth';
import type { RoleAssignmentUser } from '../types';
import { buildAssignmentColumns } from './assignmentColumns';

interface UserRoleAssignmentsViewProps {
  users: RoleAssignmentUser[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  currentAuthUser: User | null;
  roles: RoleItem[];
  onManageRoles: (user: RoleAssignmentUser) => void;
}

export function UserRoleAssignmentsView({
  users,
  isLoading,
  search,
  onSearchChange,
  onRefresh,
  currentAuthUser,
  roles,
  onManageRoles,
}: UserRoleAssignmentsViewProps) {
  const columns = buildAssignmentColumns({ currentAuthUser, roles, onManageRoles });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border/60 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by name, email, department, or assigned role..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-surface-subtle border border-border-subtle focus:border-primary focus:outline-none text-foreground"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="small"
            onClick={onRefresh}
            className="text-xs gap-1.5 font-bold">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        <Table
          scroll={{ x: 'max-content' }}
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 12 }}
          className="w-full"
        />
      </div>
    </motion.div>
  );
}

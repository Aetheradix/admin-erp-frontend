import { motion } from 'framer-motion';
import { Table } from 'antd';
import type { RoleItem } from '@/store/api/roleApiSlice';
import { buildRoleColumns } from './roleColumns';

interface RoleDirectoryTableProps {
  roles: RoleItem[];
  isLoading: boolean;
  totalPermissions: number;
  canEdit: boolean;
  canDelete: boolean;
  onOpenMatrix: (role: RoleItem) => void;
  onEdit: (role: RoleItem) => void;
  onDelete: (role: RoleItem) => void;
}

export function RoleDirectoryTable({
  roles,
  isLoading,
  totalPermissions,
  canEdit,
  canDelete,
  onOpenMatrix,
  onEdit,
  onDelete,
}: RoleDirectoryTableProps) {
  const columns = buildRoleColumns({
    canEdit,
    canDelete,
    totalPermissions,
    onOpenMatrix,
    onEdit,
    onDelete,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
      <Table
        scroll={{ x: 'max-content' }}
        columns={columns}
        dataSource={roles}
        rowKey="id"
        loading={isLoading}
        pagination={false}
        className="w-full"
      />
    </motion.div>
  );
}

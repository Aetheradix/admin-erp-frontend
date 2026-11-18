import { useMemo } from 'react';
import { Table } from 'antd';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/primitives/Button';
import type { CompanyDocument } from '../types';
import { getDocumentColumns } from './documentColumns';

interface DocumentVaultTabProps {
  visibleDocuments: CompanyDocument[];
  canManageOrg: boolean;
  onUpload: () => void;
  onToggleVisibility: (id: number | string) => void;
  onDeleteRequest: (id: number | string) => void;
}

export function DocumentVaultTab({
  visibleDocuments,
  canManageOrg,
  onUpload,
  onToggleVisibility,
  onDeleteRequest,
}: DocumentVaultTabProps) {
  const columns = useMemo(
    () => getDocumentColumns({ canManageOrg, onToggleVisibility, onDeleteRequest }),
    [canManageOrg, onToggleVisibility, onDeleteRequest]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-2xl border border-border-subtle shadow-soft p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-foreground">Compliance Document Vault</h3>
          <p className="text-xs text-muted">
            Statutory legal contracts, ISO certificates, and internal handbooks with granular access
            visibility controls.
          </p>
        </div>
        {canManageOrg && (
          <Button
            label="Upload Document"
            icon="pi pi-upload"
            onClick={onUpload}
            className="rounded-md! px-6! cursor-pointer"
          />
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-border-subtle shadow-soft overflow-hidden">
        <Table
          scroll={{ x: 'max-content' }}
          columns={columns}
          dataSource={visibleDocuments}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          className="premium-table"
        />
      </motion.div>
    </div>
  );
}

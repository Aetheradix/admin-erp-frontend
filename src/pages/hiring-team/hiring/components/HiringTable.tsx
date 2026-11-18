import { Table } from 'antd';
import type { FormSectionConfig, ProfileCompletionData } from '@/services/employeeProfileService';
import { buildHiringColumns } from './hiringColumns';

interface HiringTableProps {
  profiles: ProfileCompletionData[];
  formConfig: FormSectionConfig[];
  canAssignId: boolean;
  isLoading: boolean;
  onReview: (profile: ProfileCompletionData) => void;
  onApprove: (profile: ProfileCompletionData) => void;
  onOpenAssignId: (profile: ProfileCompletionData) => void;
}

export function HiringTable({
  profiles,
  formConfig,
  canAssignId,
  isLoading,
  onReview,
  onApprove,
  onOpenAssignId,
}: HiringTableProps) {
  const columns = buildHiringColumns({
    formConfig,
    canAssignId,
    onReview,
    onApprove,
    onOpenAssignId,
  });

  return (
    <div className="bg-white rounded-3xl border border-border-subtle overflow-hidden shadow-xs">
      <Table
        scroll={{ x: 'max-content' }}
        columns={columns}
        dataSource={profiles}
        rowKey="userId"
        loading={isLoading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        locale={{ emptyText: 'No employee profile submissions found' }}
      />
    </div>
  );
}

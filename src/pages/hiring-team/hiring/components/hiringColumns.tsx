import { CheckCircle2, Eye, KeyRound } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import type { FormSectionConfig, ProfileCompletionData } from '@/services/employeeProfileService';
import { STATUS_MAP } from '../constants';
import { ApprovedBadge, CompletionCell, EmployeeCell, EmployeeIdCell } from './tableCells';

interface BuildHiringColumnsParams {
  formConfig: FormSectionConfig[];
  canAssignId: boolean;
  onReview: (profile: ProfileCompletionData) => void;
  onApprove: (profile: ProfileCompletionData) => void;
  onOpenAssignId: (profile: ProfileCompletionData) => void;
}

export function buildHiringColumns({
  formConfig,
  canAssignId,
  onReview,
  onApprove,
  onOpenAssignId,
}: BuildHiringColumnsParams): ColumnsType<ProfileCompletionData> {
  return [
    {
      title: 'Employee',
      key: 'employee',
      render: (_, record) => <EmployeeCell record={record} />,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const conf = STATUS_MAP[record.status] || STATUS_MAP.incomplete;
        const Icon = conf.icon;
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${conf.bg}`}
            style={{ lineHeight: '1' }}>
            <Icon size={12} style={{ display: 'block', flexShrink: 0 }} />
            <span>{conf.label}</span>
          </span>
        );
      },
    },
    {
      title: 'Completion',
      key: 'completion',
      render: (_, record) => <CompletionCell record={record} formConfig={formConfig} />,
    },
    {
      title: 'Employee ID',
      key: 'employeeId',
      render: (_, record) => <EmployeeIdCell employeeId={record.employeeId} />,
    },
    {
      title: 'Last Updated',
      key: 'lastSavedAt',
      render: (_, record) => (
        <span className="text-xs text-muted">
          {record.lastSavedAt ? new Date(record.lastSavedAt).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onReview(record)}
            className="px-3 py-1.5 rounded-xl border border-border-subtle bg-white hover:bg-surface-subtle text-foreground text-xs font-bold transition-all flex items-center gap-1">
            <Eye size={13} />
            Review
          </button>

          {(record.status === 'submitted' ||
            record.status === 'changes_required' ||
            record.status === 'in_progress') && (
            <button
              type="button"
              onClick={() => onApprove(record)}
              className="px-3 py-1.5 rounded-xl bg-success text-white hover:bg-success/90 text-xs font-bold transition-all flex items-center gap-1 shadow-xs">
              <CheckCircle2 size={13} />
              Approve
            </button>
          )}

          {record.status === 'approved' && <ApprovedBadge />}

          {canAssignId && (
            <button
              type="button"
              onClick={() => onOpenAssignId(record)}
              className="px-3 py-1.5 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold transition-all flex items-center gap-1 shadow-xs">
              <KeyRound size={13} />
              {record.employeeId ? 'Edit ID & Role' : 'Assign ID & Role'}
            </button>
          )}
        </div>
      ),
    },
  ];
}

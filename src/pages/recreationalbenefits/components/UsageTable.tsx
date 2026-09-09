import { Check, X } from 'lucide-react';
import { Table, Tag, Button, Tooltip, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import type { RecreationalBenefitUsage } from '../types/index';

interface UsageTableProps {
  usage: RecreationalBenefitUsage[];
  currency?: string;
  onApprove: (usage: RecreationalBenefitUsage) => void;
  onReject: (usage: RecreationalBenefitUsage) => void;
}

export default function UsageTable({
  usage,
  currency = 'INR',
  onApprove,
  onReject,
}: UsageTableProps) {
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Tag color="success">Approved</Tag>;
      case 'Rejected':
        return <Tag color="error">Rejected</Tag>;
      default:
        return <Tag color="warning">{status}</Tag>;
    }
  };

  const columns: ColumnsType<RecreationalBenefitUsage> = [
    {
      title: 'Amount',
      dataIndex: 'usage_amount',
      key: 'usage_amount',
      render: (amount) =>
        amount != null ? `${currency} ${Number(amount).toLocaleString('en-IN')}` : '-',
    },
    {
      title: 'Description',
      dataIndex: 'usage_description',
      key: 'usage_description',
      render: (desc) => desc ?? '-',
    },
    {
      title: 'Date',
      dataIndex: 'usage_date',
      key: 'usage_date',
      render: (date) => date ?? '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, item) =>
        item.status === 'Pending' ? (
          <Space size="small">
            <Tooltip title="Approve">
              <Button
                type="text"
                shape="circle"
                icon={<Check className="h-4 w-4 text-green-600" />}
                onClick={() => onApprove(item)}
              />
            </Tooltip>

            <Tooltip title="Reject">
              <Button
                type="text"
                shape="circle"
                icon={<X className="h-4 w-4 text-red-500" />}
                onClick={() => onReject(item)}
              />
            </Tooltip>
          </Space>
        ) : null,
    },
  ];

  return (
    <Table<RecreationalBenefitUsage>
      rowKey="usage_id"
      columns={columns}
      dataSource={usage}
      pagination={false}
      locale={{ emptyText: 'No usage records found.' }}
    />
  );
}

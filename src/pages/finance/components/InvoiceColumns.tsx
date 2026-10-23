import React from 'react';
import { Dropdown } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { CheckCircle, Clock, AlertCircle, MoreVertical, Download, Eye, Trash2 } from 'lucide-react';
import type { Invoice } from '../types/invoice.types';

const statusIcons: Record<string, { icon: React.ElementType; color: string }> = {
  Paid: {
    icon: CheckCircle,
    color: 'text-success',
  },
  Pending: {
    icon: Clock,
    color: 'text-warning',
  },
  Overdue: {
    icon: AlertCircle,
    color: 'text-error',
  },
};

interface GetInvoiceColumnsProps {
  onDownloadPdf: (invoice: Invoice) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (invoice: Invoice) => void;
}

export function getInvoiceColumns({
  onDownloadPdf,
  onViewInvoice,
  onDeleteInvoice,
}: GetInvoiceColumnsProps): ColumnsType<Invoice> {
  return [
    {
      title: 'Invoice ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => (
        <span className="font-mono text-xs font-bold text-foreground bg-surface-subtle border border-border-subtle px-2.5 py-1 rounded-lg">
          {text}
        </span>
      ),
    },
    {
      title: 'Client',
      dataIndex: 'client',
      key: 'client',
      render: (text) => <span className="text-foreground font-semibold text-xs">{text}</span>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <span className="font-black font-mono text-sm text-foreground">
          ₹{Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const State = statusIcons[status] || statusIcons.Pending;

        return (
          <div className={`flex items-center gap-1.5 text-xs font-bold ${State.color}`}>
            <State.icon size={14} />
            <span>{status}</span>
          </div>
        );
      },
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => <span className="text-muted-foreground text-xs font-medium">{text}</span>,
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'view',
            label: (
              <div className="flex items-center gap-2">
                <Eye size={15} className="text-primary" />
                <span className="font-medium text-xs">View Invoice</span>
              </div>
            ),
          },
          {
            key: 'download',
            label: (
              <div className="flex items-center gap-2">
                <Download size={15} />
                <span className="font-medium text-xs">Download PDF</span>
              </div>
            ),
          },
          { type: 'divider' },
          {
            key: 'delete',
            danger: true,
            label: (
              <div className="flex items-center gap-2 text-rose-600">
                <Trash2 size={15} />
                <span className="font-semibold text-xs">Delete Invoice</span>
              </div>
            ),
          },
        ];

        return (
          <Dropdown
            menu={{
              items: menuItems,
              onClick: ({ key }) => {
                if (key === 'view') {
                  onViewInvoice(record);
                } else if (key === 'download') {
                  onDownloadPdf(record);
                } else if (key === 'delete') {
                  onDeleteInvoice(record);
                }
              },
            }}
            trigger={['click']}
            placement="bottomRight">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-subtle text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
              <MoreVertical size={16} />
            </button>
          </Dropdown>
        );
      },
    },
  ];
}

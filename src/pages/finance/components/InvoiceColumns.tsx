import React from 'react';
import type { ColumnsType } from 'antd/es/table';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { CheckCircle, Clock, AlertCircle, MoreVertical, Download } from 'lucide-react';
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
  onDownloadPdf: (invoiceData: NonNullable<Invoice['data']>) => void;
}

export function getInvoiceColumns({ onDownloadPdf }: GetInvoiceColumnsProps): ColumnsType<Invoice> {
  return [
    {
      title: 'Invoice ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <span className="font-semibold text-foreground">{text}</span>,
    },
    {
      title: 'Client',
      dataIndex: 'client',
      key: 'client',
      render: (text) => <span className="text-muted-foreground font-medium">{text}</span>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <span className="font-bold text-foreground">₹{amount.toLocaleString('en-IN')}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const State = statusIcons[status] || statusIcons.Pending;
        return (
          <div className={`flex items-center gap-2 text-xs font-bold ${State.color}`}>
            <State.icon size={14} />
            {status}
          </div>
        );
      },
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => <span className="text-muted-foreground">{text}</span>,
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'download',
            label: (
              <div className="flex items-center gap-2">
                <Download size={15} />
                <span>Download Invoice</span>
              </div>
            ),
          },
        ];

        return (
          <Dropdown
            menu={{
              items: menuItems,
              onClick: ({ key }) => {
                if (key === 'download') {
                  if (!record.data) {
                    console.error('Invoice data not available');
                    return;
                  }
                  onDownloadPdf(record.data);
                }
              },
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-surface-subtle text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <MoreVertical size={18} />
            </button>
          </Dropdown>
        );
      },
    },
  ];
}

import React from 'react';
import { Dropdown } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  MoreVertical,
  Download,
  Eye,
  Trash2,
  Edit3,
  Tag,
} from 'lucide-react';
import type { Invoice } from '../types/invoice.types';

const statusIcons: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  Paid: {
    icon: CheckCircle,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
  },
  Pending: {
    icon: Clock,
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
  },
  Overdue: {
    icon: AlertCircle,
    color: 'text-rose-700',
    bg: 'bg-rose-50 border-rose-200 hover:bg-rose-100',
  },
};

interface GetInvoiceColumnsProps {
  onDownloadPdf: (invoice: Invoice) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onEditInvoice?: (invoice: Invoice) => void;
  onStatusChange?: (invoice: Invoice, newStatus: 'Paid' | 'Pending' | 'Overdue') => void;
  onDeleteInvoice: (invoice: Invoice) => void;
}

export function getInvoiceColumns({
  onDownloadPdf,
  onViewInvoice,
  onEditInvoice,
  onStatusChange,
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
      render: (status: 'Paid' | 'Pending' | 'Overdue', record) => {
        const State = statusIcons[status] || statusIcons.Pending;

        const statusMenu: MenuProps = {
          items: [
            {
              key: 'Paid',
              label: (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <CheckCircle size={13} /> Paid
                </span>
              ),
            },
            {
              key: 'Pending',
              label: (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                  <Clock size={13} /> Pending
                </span>
              ),
            },
            {
              key: 'Overdue',
              label: (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                  <AlertCircle size={13} /> Overdue
                </span>
              ),
            },
          ],
          onClick: ({ key }) => {
            if (key !== status && onStatusChange) {
              onStatusChange(record, key as 'Paid' | 'Pending' | 'Overdue');
            }
          },
        };

        return (
          <Dropdown menu={statusMenu} trigger={['click']} placement="bottomLeft">
            <button
              type="button"
              title="Click to update payment status"
              className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${State.color} ${State.bg}`}>
              <State.icon size={13} />
              <span>{status}</span>
            </button>
          </Dropdown>
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
          ...(onEditInvoice
            ? [
                {
                  key: 'edit',
                  label: (
                    <div className="flex items-center gap-2">
                      <Edit3 size={15} className="text-indigo-600" />
                      <span className="font-medium text-xs">Edit Invoice</span>
                    </div>
                  ),
                },
              ]
            : []),
          {
            key: 'download',
            label: (
              <div className="flex items-center gap-2">
                <Download size={15} />
                <span className="font-medium text-xs">Download PDF</span>
              </div>
            ),
          },
          ...(onStatusChange
            ? [
                {
                  key: 'status',
                  label: (
                    <div className="flex items-center gap-2">
                      <Tag size={15} className="text-amber-600" />
                      <span className="font-medium text-xs">Update Status</span>
                    </div>
                  ),
                  children: [
                    {
                      key: 'status-paid',
                      label: (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                          <CheckCircle size={13} /> Mark as Paid
                        </span>
                      ),
                    },
                    {
                      key: 'status-pending',
                      label: (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                          <Clock size={13} /> Mark as Pending
                        </span>
                      ),
                    },
                    {
                      key: 'status-overdue',
                      label: (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                          <AlertCircle size={13} /> Mark as Overdue
                        </span>
                      ),
                    },
                  ],
                },
              ]
            : []),
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
                } else if (key === 'edit' && onEditInvoice) {
                  onEditInvoice(record);
                } else if (key === 'download') {
                  onDownloadPdf(record);
                } else if (key === 'status-paid' && onStatusChange) {
                  onStatusChange(record, 'Paid');
                } else if (key === 'status-pending' && onStatusChange) {
                  onStatusChange(record, 'Pending');
                } else if (key === 'status-overdue' && onStatusChange) {
                  onStatusChange(record, 'Overdue');
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

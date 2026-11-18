import type { ColumnsType } from 'antd/es/table';
import { Dropdown } from 'antd';
import { AlertCircle, CheckCircle, Clock, MoreVertical } from 'lucide-react';
import type React from 'react';
import type { Invoice, InvoiceStatus } from '../types';
import { buildActionMenu, buildStatusMenu } from './invoiceColumnMenus';

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
  onStatusChange?: (invoice: Invoice, newStatus: InvoiceStatus) => void;
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
      render: (status: InvoiceStatus, record) => {
        const State = statusIcons[status] || statusIcons.Pending;

        return (
          <Dropdown
            menu={buildStatusMenu(record, { currentStatus: status, onStatusChange })}
            trigger={['click']}
            placement="bottomLeft">
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
      render: (_, record) => (
        <Dropdown
          menu={buildActionMenu(record, {
            onDownloadPdf,
            onViewInvoice,
            onDeleteInvoice,
            onEditInvoice,
            onStatusChange,
          })}
          trigger={['click']}
          placement="bottomRight">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-subtle text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            <MoreVertical size={16} />
          </button>
        </Dropdown>
      ),
    },
  ];
}

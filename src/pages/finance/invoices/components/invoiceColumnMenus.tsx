import type { MenuProps } from 'antd';
import { AlertCircle, CheckCircle, Clock, Download, Edit3, Eye, Tag, Trash2 } from 'lucide-react';
import type { Invoice, InvoiceStatus } from '../types';

export interface InvoiceStatusMenuHandlers {
  currentStatus: InvoiceStatus;
  onStatusChange?: (invoice: Invoice, newStatus: InvoiceStatus) => void;
}

export function buildStatusMenu(
  record: Invoice,
  { currentStatus, onStatusChange }: InvoiceStatusMenuHandlers
): MenuProps {
  return {
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
      if (key !== currentStatus && onStatusChange) {
        onStatusChange(record, key as InvoiceStatus);
      }
    },
  };
}

export interface InvoiceActionMenuHandlers {
  onDownloadPdf: (invoice: Invoice) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (invoice: Invoice) => void;
  onEditInvoice?: (invoice: Invoice) => void;
  onStatusChange?: (invoice: Invoice, newStatus: InvoiceStatus) => void;
}

export function buildActionMenu(
  record: Invoice,
  {
    onDownloadPdf,
    onViewInvoice,
    onDeleteInvoice,
    onEditInvoice,
    onStatusChange,
  }: InvoiceActionMenuHandlers
): MenuProps {
  const items: MenuProps['items'] = [
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

  return {
    items,
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
  };
}

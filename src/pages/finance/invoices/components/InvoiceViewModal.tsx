import { Download, Edit3 } from 'lucide-react';
import { Modal } from 'antd';
import { getInvoiceFormData } from '../form';
import type { Invoice } from '../types';
import InvoiceTemplate from './InvoiceTemplate';

interface InvoiceViewModalProps {
  open: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onEdit: (invoice: Invoice) => void;
  onDownload: (invoice: Invoice) => void;
}

function getStatusBadgeClass(status?: Invoice['status']): string {
  if (status === 'Paid') {
    return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
  }
  if (status === 'Overdue') {
    return 'bg-rose-100 text-rose-800 border border-rose-200';
  }
  return 'bg-amber-100 text-amber-800 border border-amber-200';
}

export function InvoiceViewModal({ open, invoice, onClose, onEdit, onDownload }: InvoiceViewModalProps) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={850}
      centered
      destroyOnClose
      title={
        <div className="flex items-center justify-between pr-8 py-1">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200">
              {invoice?.id}
            </span>
            <span className="text-sm font-bold text-slate-800">{invoice?.client}</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadgeClass(
                invoice?.status
              )}`}>
              {invoice?.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (invoice) {
                  onClose();
                  onEdit(invoice);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl transition shadow-xs cursor-pointer">
              <Edit3 size={14} className="text-indigo-600" />
              <span>Edit Invoice</span>
            </button>
            <button
              type="button"
              onClick={() => invoice && onDownload(invoice)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition shadow-xs cursor-pointer">
              <Download size={14} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      }>
      <div className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto p-4">
        {invoice && (
          <div className="flex justify-center bg-slate-100 p-4 rounded-xl border border-slate-200 shadow-inner">
            <InvoiceTemplate invoice={getInvoiceFormData(invoice)} />
          </div>
        )}
      </div>
    </Modal>
  );
}

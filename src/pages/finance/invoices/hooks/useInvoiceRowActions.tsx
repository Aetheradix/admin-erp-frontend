import { useCallback } from 'react';
import { Modal, message } from 'antd';
import { useDeleteInvoiceMutation, useUpdateInvoiceMutation } from '@/store/api/financeApiSlice';
import { getInvoiceApiId } from '../payloads';
import type { AuditLogExtra, Invoice, InvoiceStatus } from '../types';

interface UseInvoiceRowActionsOptions {
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  viewingInvoice: Invoice | null;
  setViewingInvoice: (invoice: Invoice | null) => void;
  setShowViewModal: (visible: boolean) => void;
  recordAuditLog: (action: string, description: string, extra?: AuditLogExtra) => void;
  refetchLogs: () => unknown;
  refetchBackendInvoices: () => unknown;
}

export function useInvoiceRowActions({
  setInvoices,
  viewingInvoice,
  setViewingInvoice,
  setShowViewModal,
  recordAuditLog,
  refetchLogs,
  refetchBackendInvoices,
}: UseInvoiceRowActionsOptions) {
  const [updateInvoiceApi] = useUpdateInvoiceMutation();
  const [deleteInvoiceApi] = useDeleteInvoiceMutation();

  const handleStatusChange = useCallback(
    async (invoice: Invoice, newStatus: InvoiceStatus) => {
      if (invoice.status === newStatus) return;

      const previousStatus = invoice.status;
      const updatedInvoice: Invoice = {
        ...invoice,
        status: newStatus,
        data: invoice.data ? { ...invoice.data, status: newStatus } : undefined,
      };

      setInvoices((previous) =>
        previous.map((inv) => (inv.id === invoice.id ? updatedInvoice : inv))
      );

      if (viewingInvoice?.id === invoice.id) {
        setViewingInvoice(updatedInvoice);
      }

      try {
        await updateInvoiceApi({ id: getInvoiceApiId(invoice), status: newStatus }).unwrap();
      } catch (error) {
        console.warn('Backend status update note:', error);
      }

      recordAuditLog(
        'STATUS_UPDATE',
        `Updated status of invoice ${invoice.id} from ${previousStatus} to ${newStatus} for ${invoice.client}`,
        { invoiceId: invoice.id, client: invoice.client, amount: invoice.amount }
      );

      refetchLogs();
      refetchBackendInvoices();
      message.success(`Invoice ${invoice.id} marked as ${newStatus}.`);
    },
    [
      setInvoices,
      viewingInvoice,
      setViewingInvoice,
      updateInvoiceApi,
      recordAuditLog,
      refetchLogs,
      refetchBackendInvoices,
    ]
  );

  const handleDeleteInvoice = useCallback(
    (invoice: Invoice) => {
      Modal.confirm({
        title: 'Delete Invoice',
        content: (
          <div className="space-y-2 text-xs text-slate-600">
            <p>
              Are you sure you want to delete invoice{' '}
              <strong className="font-mono text-slate-900">{invoice.id}</strong> for{' '}
              <strong className="text-slate-900">{invoice.client}</strong>?
            </p>
            <p className="font-semibold text-rose-600">
              Amount: ₹
              {Number(invoice.amount || 0).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="text-[11px] text-slate-400">
              This action cannot be undone and will be permanently recorded in the audit logs.
            </p>
          </div>
        ),
        okText: 'Yes, Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        maskClosable: true,
        onOk: async () => {
          const key = 'invoice-delete';
          message.loading({ content: `Deleting invoice ${invoice.id}...`, key });

          setInvoices((previous) => previous.filter((item) => item.id !== invoice.id));
          if (viewingInvoice?.id === invoice.id) {
            setShowViewModal(false);
            setViewingInvoice(null);
          }

          try {
            await deleteInvoiceApi(getInvoiceApiId(invoice)).unwrap();
          } catch (error) {
            console.warn('Backend delete note:', error);
          }

          recordAuditLog(
            'DELETE_INVOICE',
            `Deleted invoice ${invoice.id} for ${invoice.client} (₹${Number(invoice.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })})`,
            { invoiceId: invoice.id, client: invoice.client, amount: invoice.amount }
          );

          refetchLogs();
          refetchBackendInvoices();
          message.success({ content: `Invoice ${invoice.id} deleted successfully.`, key });
        },
      });
    },
    [
      setInvoices,
      viewingInvoice,
      setShowViewModal,
      setViewingInvoice,
      deleteInvoiceApi,
      recordAuditLog,
      refetchLogs,
      refetchBackendInvoices,
    ]
  );

  return { handleStatusChange, handleDeleteInvoice };
}

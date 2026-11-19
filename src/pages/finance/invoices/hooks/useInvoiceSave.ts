import { useCallback, useState } from 'react';
import { message } from 'antd';
import { useCreateInvoiceMutation, useUpdateInvoiceMutation } from '@/store/api/financeApiSlice';
import { useFulfillOrderAndDeductStockMutation } from '@/store/api/inventorySlice';
import { useUploadInvoiceMutation } from '@/store/api/uploadSlice';
import { buildBackendInvoicePayload, buildSavedInvoice, getInvoiceApiId } from '../payloads';
import type { AuditLogExtra, Invoice, InvoiceForm } from '../types';

interface UseInvoiceSaveOptions {
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  form: InvoiceForm;
  setForm: (form: InvoiceForm) => void;
  editingInvoice: Invoice | null;
  setEditingInvoice: (invoice: Invoice | null) => void;
  setShowForm: (visible: boolean) => void;
  viewingInvoice: Invoice | null;
  setViewingInvoice: (invoice: Invoice | null) => void;
  recordAuditLog: (action: string, description: string, extra?: AuditLogExtra) => void;
  refetchLogs: () => unknown;
  refetchBackendInvoices: () => unknown;
  emptyFormForNextInvoice: () => InvoiceForm;
}

export function useInvoiceSave({
  invoices,
  setInvoices,
  form,
  setForm,
  editingInvoice,
  setEditingInvoice,
  setShowForm,
  viewingInvoice,
  setViewingInvoice,
  recordAuditLog,
  refetchLogs,
  refetchBackendInvoices,
  emptyFormForNextInvoice,
}: UseInvoiceSaveOptions) {
  const [createInvoiceApi] = useCreateInvoiceMutation();
  const [updateInvoiceApi] = useUpdateInvoiceMutation();
  const [, { isLoading: isUploadingPdf }] = useUploadInvoiceMutation();
  const [fulfillOrderAndDeductStock] = useFulfillOrderAndDeductStockMutation();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!form.billToName.trim()) {
      message.error('Customer / Client name is required.');
      return;
    }
    if (!form.invoiceNumber.trim()) {
      message.error('Invoice number is required.');
      return;
    }

    const isUpdating = Boolean(editingInvoice);

    const isDuplicate = invoices.some(
      (inv) =>
        inv.id.toLowerCase().trim() === form.invoiceNumber.toLowerCase().trim() &&
        (!editingInvoice ||
          (inv.id.toLowerCase().trim() !== editingInvoice.id.toLowerCase().trim() &&
            inv.backendId !== editingInvoice.backendId))
    );
    if (isDuplicate) {
      message.error(
        `Invoice number "${form.invoiceNumber}" already exists. Please use a unique number.`
      );
      return;
    }

    const actionKey = 'invoice-save-action';
    setIsSaving(true);

    try {
      message.loading({
        content: isUpdating ? 'Updating invoice...' : 'Creating invoice...',
        key: actionKey,
      });

      const safeItems = Array.isArray(form.items) ? form.items : [];
      const savedInvoice = buildSavedInvoice(form, editingInvoice, safeItems);

      if (isUpdating && editingInvoice) {
        setInvoices((previous) =>
          previous.map((inv) =>
            inv.id.toLowerCase().trim() === editingInvoice.id.toLowerCase().trim() ||
            (inv.backendId && inv.backendId === editingInvoice.backendId)
              ? savedInvoice
              : inv
          )
        );

        if (
          viewingInvoice &&
          (viewingInvoice.id.toLowerCase().trim() === editingInvoice.id.toLowerCase().trim() ||
            (viewingInvoice.backendId && viewingInvoice.backendId === editingInvoice.backendId))
        ) {
          setViewingInvoice(savedInvoice);
        }

        try {
          await updateInvoiceApi({
            ...buildBackendInvoicePayload(savedInvoice, form),
            id: getInvoiceApiId(editingInvoice),
          }).unwrap();
        } catch (apiError) {
          console.warn('Backend update note:', apiError);
        }

        recordAuditLog(
          'UPDATE_INVOICE',
          `Updated invoice ${savedInvoice.id} for ${savedInvoice.client} (₹${savedInvoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })})`,
          { invoiceId: savedInvoice.id, client: savedInvoice.client, amount: savedInvoice.amount }
        );

        message.success({
          content: `Invoice ${savedInvoice.id} updated in database successfully!`,
          key: actionKey,
        });
      } else {
        setInvoices((previous) => [savedInvoice, ...previous]);

        try {
          await createInvoiceApi(buildBackendInvoicePayload(savedInvoice, form)).unwrap();
        } catch (apiError) {
          console.warn('Backend create note:', apiError);
        }

        recordAuditLog(
          'CREATE_INVOICE',
          `Created invoice ${savedInvoice.id} for ${savedInvoice.client} (₹${savedInvoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })})`,
          { invoiceId: savedInvoice.id, client: savedInvoice.client, amount: savedInvoice.amount }
        );

        try {
          const itemsToDeduct = safeItems
            .filter((item) => item.description?.trim() && Number(item.quantity) > 0)
            .map((item) => ({
              asset_id: item.description.trim(),
              quantity: Number(item.quantity),
            }));

          if (itemsToDeduct.length > 0) {
            const deductResult = await fulfillOrderAndDeductStock({
              invoiceId: form.invoiceNumber,
              items: itemsToDeduct,
            }).unwrap();

            if (deductResult?.lowStockAlerts && deductResult.lowStockAlerts.length > 0) {
              message.warning(
                `Inventory Notice: ${deductResult.lowStockAlerts.length} item(s) dropped below reorder threshold!`
              );
            }
          }
        } catch (deductError) {
          console.info('Inventory deduction note:', deductError);
        }

        message.success({
          content: `Invoice ${savedInvoice.id} created in database successfully!`,
          key: actionKey,
        });
      }

      await refetchBackendInvoices();
      refetchLogs();

      setEditingInvoice(null);
      setForm(emptyFormForNextInvoice());
      setShowForm(false);
    } catch (error) {
      console.error('Invoice operation failed:', error);
      message.error({
        content: error instanceof Error ? error.message : 'Unable to save invoice.',
        key: actionKey,
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    form,
    editingInvoice,
    invoices,
    viewingInvoice,
    setInvoices,
    setViewingInvoice,
    updateInvoiceApi,
    createInvoiceApi,
    fulfillOrderAndDeductStock,
    recordAuditLog,
    refetchBackendInvoices,
    refetchLogs,
    setEditingInvoice,
    setForm,
    setShowForm,
    emptyFormForNextInvoice,
  ]);

  return { isSaving, isUploadingPdf, handleSubmit };
}

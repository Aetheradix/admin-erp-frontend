import { useCallback, useState } from 'react';
import { createEmptyForm, getInvoiceFormData } from '../form';
import type { Invoice, InvoiceForm, InvoiceItem } from '../types';

export function useInvoiceFormState(invoices: Invoice[]) {
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState<InvoiceForm>(() => createEmptyForm(invoices));

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  const updateField = useCallback(
    <K extends keyof InvoiceForm>(field: K, value: InvoiceForm[K]) => {
      setForm((previous) => ({ ...previous, [field]: value }));
    },
    []
  );

  const updateItem = useCallback(
    (index: number, field: keyof InvoiceItem, value: string | number) => {
      setForm((previous) => ({
        ...previous,
        items: previous.items.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [field]: value } : item
        ),
      }));
    },
    []
  );

  const addItem = useCallback(() => {
    setForm((previous) => ({
      ...previous,
      items: [...previous.items, { description: '', quantity: 1, rate: 0 }],
    }));
  }, []);

  const removeItem = useCallback((index: number) => {
    setForm((previous) => ({
      ...previous,
      items: previous.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }, []);

  const handleCreateNew = useCallback(() => {
    setEditingInvoice(null);
    setForm(createEmptyForm(invoices));
    setShowForm(true);
  }, [invoices]);

  const handleEditInvoice = useCallback((invoice: Invoice) => {
    setForm(getInvoiceFormData(invoice));
    setEditingInvoice(invoice);
    setShowForm(true);
  }, []);

  const handleViewInvoice = useCallback((invoice: Invoice) => {
    setViewingInvoice(invoice);
    setShowViewModal(true);
  }, []);

  return {
    form,
    setForm,
    showForm,
    setShowForm,
    editingInvoice,
    setEditingInvoice,
    showViewModal,
    setShowViewModal,
    viewingInvoice,
    setViewingInvoice,
    updateField,
    updateItem,
    addItem,
    removeItem,
    handleCreateNew,
    handleEditInvoice,
    handleViewInvoice,
  };
}

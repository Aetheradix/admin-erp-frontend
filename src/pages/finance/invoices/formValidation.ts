import type { InvoiceForm } from './types';

export type InvoiceFormErrors = Record<string, string>;

export function validateInvoiceForm(form: InvoiceForm): InvoiceFormErrors {
  const errors: InvoiceFormErrors = {};
  const items = Array.isArray(form.items) ? form.items : [];

  if (!form.invoiceNumber?.trim()) {
    errors.invoiceNumber = 'Invoice number is required.';
  }
  if (!form.billToName?.trim()) {
    errors.billToName = 'Vendor or customer name is required.';
  }
  if (!form.billToPhone?.trim()) {
    errors.billToPhone = 'Vendor phone number is required.';
  }

  if (items.length === 0) {
    errors.items = 'Please add at least one line item.';
  } else {
    const hasInvalidItem = items.some(
      (item) => !item.description?.trim() || Number(item.quantity || 0) <= 0
    );
    if (hasInvalidItem) {
      errors.items = 'Please ensure all items have a description and quantity greater than zero.';
    }
  }

  return errors;
}

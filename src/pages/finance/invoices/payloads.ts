import type {
  BackendInvoiceRecord,
  Invoice,
  InvoiceForm,
  InvoiceItem,
  InvoiceStatus,
  InvoiceTotals,
} from './types';

export function computeInvoiceTotals(items: InvoiceItem[], gstRate: number): InvoiceTotals {
  const subTotal = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.rate || 0),
    0
  );
  const gstAmount = (subTotal * Number(gstRate || 0)) / 100;
  return { subTotal, gstAmount, total: subTotal + gstAmount };
}

export function buildSavedInvoice(
  form: InvoiceForm,
  editingInvoice: Invoice | null,
  safeItems: InvoiceItem[]
): Invoice {
  const { total } = computeInvoiceTotals(safeItems, form.gstRate);
  const status: InvoiceStatus = form.status || (editingInvoice ? editingInvoice.status : 'Pending');

  const invoice: Invoice = {
    id: form.invoiceNumber.trim(),
    client: form.billToName.trim(),
    amount: total,
    status,
    date: form.invoiceDate || new Date().toISOString().slice(0, 10),
    data: {
      ...form,
      status,
      items: safeItems.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity || 1),
        rate: Number(item.rate || 0),
      })),
      invoiceUrl: editingInvoice?.data?.invoiceUrl,
    },
  };

  if (editingInvoice?.backendId) invoice.backendId = editingInvoice.backendId;
  return invoice;
}

/**
 * Backend payload mirrors both snake_case and camelCase keys
 * because different invoice endpoints consume different shapes.
 */
export function buildBackendInvoicePayload(invoice: Invoice, form: InvoiceForm) {
  const safeItems = Array.isArray(invoice.data?.items)
    ? invoice.data.items
    : Array.isArray(form.items)
      ? form.items
      : [];
  const subtotal = safeItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 1) * (Number(item.rate) || 0),
    0
  );

  return {
    id: invoice.id,
    invoice_number: invoice.id,
    invoiceNumber: invoice.id,
    client: invoice.client,
    bill_to_name: invoice.client,
    billToName: invoice.client,
    bill_to_phone: form.billToPhone,
    billToPhone: form.billToPhone,
    amount: invoice.amount,
    total: invoice.amount,
    subtotal,
    gst_rate: form.gstRate,
    status: invoice.status,
    date: invoice.date,
    invoice_date: invoice.date,
    invoiceDate: invoice.date,
    due_date: form.dueDate,
    dueDate: form.dueDate,
    place_of_supply: form.placeOfSupply,
    placeOfSupply: form.placeOfSupply,
    company_name: form.companyName,
    companyContact: form.companyContact,
    companyAddress: form.companyAddress,
    companyCity: form.companyCity,
    companyState: form.companyState,
    companyCountry: form.companyCountry,
    companyPincode: form.companyPincode,
    companyGSTIN: form.companyGSTIN,
    bill_to_address: form.billToAddress,
    bill_to_city: form.billToCity,
    bill_to_state: form.billToState,
    bill_to_country: form.billToCountry,
    bill_to_pincode: form.billToPincode,
    bill_to_gstin: form.billToGSTIN,
    items: safeItems,
    notes: form.notes,
    data: invoice.data,
  };
}

export function getInvoiceApiId(invoice: Invoice): string | number {
  return invoice.backendId || invoice.id;
}

export function getInvoiceDisplayNumber(invoice: Invoice | BackendInvoiceRecord): string {
  const record = invoice as BackendInvoiceRecord;
  return String(record.invoice_number || record.invoiceNumber || record.id || '');
}

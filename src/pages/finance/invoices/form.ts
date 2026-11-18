import {
  DEFAULT_BILL_TO_PROFILE,
  DEFAULT_COMPANY_PROFILE,
  DEFAULT_GST_RATE,
  DEFAULT_ITEM_DESCRIPTION,
  DEFAULT_PAYMENT_TERMS,
  DEFAULT_PLACE_OF_SUPPLY,
} from './constants';
import type {
  BackendInvoiceRecord,
  Invoice,
  InvoiceData,
  InvoiceForm,
  InvoiceItem,
  InvoiceStatus,
} from './types';

type AnyRecord = Record<string, unknown>;

const asRecord = (value: unknown): AnyRecord =>
  value !== null && typeof value === 'object' ? (value as AnyRecord) : {};

const firstTruthy = (...values: unknown[]): unknown => values.find((value) => Boolean(value));

const toText = (fallback: string, ...values: unknown[]): string =>
  String(firstTruthy(...values) ?? fallback);

const todayIso = (): string => new Date().toISOString().slice(0, 10);

/**
 * Intelligent invoice number generator:
 * Scans all existing invoices, parses the current year and highest sequential suffix,
 * and increments by 1 with 3-digit zero-padding (e.g. INV-2026-005).
 */
export function generateNextInvoiceNumber(existingInvoices: Invoice[]): string {
  const currentYear = new Date().getFullYear();
  let maxSeq = 0;

  existingInvoices.forEach((inv) => {
    const match = (inv.id || '').match(/(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    }
  });

  const nextSeq = Math.max(maxSeq + 1, 1);
  return `INV-${currentYear}-${String(nextSeq).padStart(3, '0')}`;
}

export function createEmptyForm(existingInvoices: Invoice[]): InvoiceForm {
  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + 15);

  return {
    invoiceNumber: generateNextInvoiceNumber(existingInvoices),
    invoiceDate: today.toISOString().slice(0, 10),
    dueDate: due.toISOString().slice(0, 10),
    placeOfSupply: DEFAULT_PLACE_OF_SUPPLY,

    ...DEFAULT_COMPANY_PROFILE,

    billToName: '',
    billToPhone: '',
    billToAddress: '',
    billToCity: '',
    billToState: '',
    billToCountry: 'India',
    billToPincode: '',
    billToGSTIN: '',

    items: [{ description: '', quantity: 1, rate: 0 }],

    gstRate: DEFAULT_GST_RATE,
    notes: DEFAULT_PAYMENT_TERMS,
  };
}

function resolveItems(parsedData: AnyRecord, raw: AnyRecord, totalAmount: number, taxRate: number) {
  let rawItems = parsedData.items ?? raw.items;
  if (typeof rawItems === 'string') {
    try {
      rawItems = JSON.parse(rawItems);
    } catch {
      rawItems = [];
    }
  }

  if (Array.isArray(rawItems) && rawItems.length > 0) {
    return rawItems.map((entry): InvoiceItem => {
      const item = asRecord(entry);
      return {
        description: String(item.description || item.name || DEFAULT_ITEM_DESCRIPTION),
        quantity: Math.max(1, Number(item.quantity || item.qty || 1)),
        rate: Number(item.rate ?? item.price ?? item.amount ?? 0),
      };
    });
  }

  const taxableSubtotal = Math.round(totalAmount / (1 + taxRate / 100));
  return [
    {
      description: toText(
        DEFAULT_ITEM_DESCRIPTION,
        parsedData.description,
        raw.description
      ),
      quantity: 1,
      rate: taxableSubtotal > 0 ? taxableSubtotal : totalAmount,
    },
  ];
}

/**
 * Ensures any invoice has a complete, valid InvoiceForm structure
 * so it can be previewed on-screen, edited, and printed without missing-file errors.
 */
export function getInvoiceFormData(inv: Invoice | BackendInvoiceRecord): InvoiceForm {
  let parsedData: AnyRecord = {};
  const rawData = (inv as { data?: unknown }).data;

  if (typeof rawData === 'string') {
    try {
      parsedData = asRecord(JSON.parse(rawData));
    } catch (error) {
      console.warn('Failed to parse invoice.data string:', error);
    }
  } else if (rawData && typeof rawData === 'object') {
    parsedData = rawData as AnyRecord;
  }

  const raw = inv as unknown as AnyRecord;
  const invoiceDate = toText(
    todayIso(),
    parsedData.invoiceDate,
    parsedData.invoice_date,
    parsedData.date,
    raw.date,
    raw.invoice_date
  );
  const calculatedTaxRate = Number(parsedData.gstRate ?? raw.gst_rate ?? raw.gstRate ?? 18);
  const totalAmount = Number(
    (inv as Invoice).amount || parsedData.amount || parsedData.total || raw.total || 0
  );

  return {
    invoiceNumber: toText(
      '',
      parsedData.invoiceNumber,
      parsedData.invoice_number,
      raw.invoice_number,
      raw.invoiceNumber,
      inv.id
    ).trim(),
    invoiceDate,
    dueDate: toText(invoiceDate, parsedData.dueDate, parsedData.due_date),
    placeOfSupply: toText(
      DEFAULT_PLACE_OF_SUPPLY,
      parsedData.placeOfSupply,
      parsedData.place_of_supply
    ),
    status: ((parsedData.status || (inv as Invoice).status || 'Pending') as InvoiceStatus),

    companyName: toText(
      DEFAULT_COMPANY_PROFILE.companyName,
      parsedData.companyName,
      parsedData.company_name
    ),
    companyContact: toText(
      DEFAULT_COMPANY_PROFILE.companyContact,
      parsedData.companyContact,
      parsedData.company_contact
    ),
    companyAddress: toText(
      DEFAULT_COMPANY_PROFILE.companyAddress,
      parsedData.companyAddress,
      parsedData.company_address
    ),
    companyCity: toText(
      DEFAULT_COMPANY_PROFILE.companyCity,
      parsedData.companyCity,
      parsedData.company_city
    ),
    companyState: toText(
      DEFAULT_COMPANY_PROFILE.companyState,
      parsedData.companyState,
      parsedData.company_state
    ),
    companyCountry: toText(
      DEFAULT_COMPANY_PROFILE.companyCountry,
      parsedData.companyCountry,
      parsedData.company_country
    ),
    companyPincode: toText(
      DEFAULT_COMPANY_PROFILE.companyPincode,
      parsedData.companyPincode,
      parsedData.company_pincode
    ),
    companyGSTIN: toText(
      DEFAULT_COMPANY_PROFILE.companyGSTIN,
      parsedData.companyGSTIN,
      parsedData.company_gstin
    ),

    billToName: toText(
      '',
      parsedData.billToName,
      parsedData.bill_to_name,
      parsedData.client,
      (inv as Invoice).client,
      raw.bill_to_name,
      raw.billToName
    ).trim(),
    billToPhone: toText(
      '',
      parsedData.billToPhone,
      parsedData.bill_to_phone,
      raw.bill_to_phone,
      raw.billToPhone,
      raw.vendor_phone,
      raw.vendorPhone,
      raw.phone
    ).trim(),
    billToAddress: toText(
      DEFAULT_BILL_TO_PROFILE.billToAddress,
      parsedData.billToAddress,
      parsedData.bill_to_address
    ),
    billToCity: toText(
      DEFAULT_BILL_TO_PROFILE.billToCity,
      parsedData.billToCity,
      parsedData.bill_to_city
    ),
    billToState: toText(
      DEFAULT_BILL_TO_PROFILE.billToState,
      parsedData.billToState,
      parsedData.bill_to_state
    ),
    billToCountry: toText(
      DEFAULT_BILL_TO_PROFILE.billToCountry,
      parsedData.billToCountry,
      parsedData.bill_to_country
    ),
    billToPincode: toText(
      DEFAULT_BILL_TO_PROFILE.billToPincode,
      parsedData.billToPincode,
      parsedData.bill_to_pincode
    ),
    billToGSTIN: toText('', parsedData.billToGSTIN, parsedData.bill_to_gstin),

    items: resolveItems(parsedData, raw, totalAmount, calculatedTaxRate),
    gstRate: calculatedTaxRate,
    notes: toText(DEFAULT_PAYMENT_TERMS, parsedData.notes),
  };
}

export function normalizeBackendInvoice(item: BackendInvoiceRecord): Invoice {
  const invoiceNumber = String(item.invoice_number || item.invoiceNumber || item.id || 'INV-000');
  const client = String(item.client || item.bill_to_name || item.billToName || 'Client');
  const amount = Number(item.amount || item.total || 0);
  const status: InvoiceStatus =
    item.status === 'Paid' || item.status === 'Overdue' ? item.status : 'Pending';
  const date = String(item.date || item.invoice_date || item.invoiceDate || todayIso());
  const storedData =
    item.data && typeof item.data === 'object' ? (item.data as InvoiceData) : undefined;

  const partial: Invoice = {
    id: invoiceNumber,
    client,
    amount,
    status,
    date,
    data: storedData,
  };

  const fullFormData = getInvoiceFormData(partial);
  const invoice: Invoice = {
    id: invoiceNumber,
    client,
    amount,
    status,
    date,
    data: {
      ...fullFormData,
      invoiceUrl: item.invoice_url || item.invoiceUrl || storedData?.invoiceUrl,
    },
  };

  if (item.id !== undefined && String(item.id) !== invoiceNumber) {
    invoice.backendId = item.id;
  }
  return invoice;
}

export function mergeBackendInvoices(
  previous: Invoice[],
  backendRecords: BackendInvoiceRecord[]
): Invoice[] {
  const formatted = backendRecords.map(normalizeBackendInvoice);
  const previousById = new Map(previous.map((inv) => [inv.id.toLowerCase().trim(), inv]));
  const backendIds = new Set(formatted.map((inv) => inv.id.toLowerCase().trim()));

  const mergedBackend = formatted.map((backendInvoice) => {
    const localMatch = previousById.get(backendInvoice.id.toLowerCase().trim());
    if (!localMatch) return backendInvoice;
    return {
      ...backendInvoice,
      data: localMatch.data || backendInvoice.data,
      client: localMatch.client || backendInvoice.client,
      amount: localMatch.amount || backendInvoice.amount,
      status: localMatch.status || backendInvoice.status,
      date: localMatch.date || backendInvoice.date,
    };
  });

  const localOnly = previous.filter((inv) => !backendIds.has(inv.id.toLowerCase().trim()));
  return [...mergedBackend, ...localOnly];
}

export function filterInvoices(
  invoices: Invoice[],
  searchText: string,
  statusFilter: string
): Invoice[] {
  let result = [...invoices];

  if (searchText.trim()) {
    const query = searchText.toLowerCase().trim();
    result = result.filter(
      (inv) =>
        inv.id.toLowerCase().includes(query) ||
        inv.client.toLowerCase().includes(query) ||
        String(inv.amount).includes(query) ||
        inv.date.toLowerCase().includes(query)
    );
  }

  if (statusFilter !== 'ALL') {
    const normalized = statusFilter.toLowerCase();
    result = result.filter((inv) => inv.status.toLowerCase() === normalized);
  }

  return result;
}

export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue';

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

export interface InvoiceForm {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  placeOfSupply: string;
  status?: InvoiceStatus;

  companyName: string;
  companyContact: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyCountry: string;
  companyPincode: string;
  companyGSTIN: string;

  billToName: string;
  billToPhone?: string;
  billToAddress: string;
  billToCity: string;
  billToState: string;
  billToCountry: string;
  billToPincode: string;
  billToGSTIN: string;

  items: InvoiceItem[];
  gstRate: number;
  notes: string;
}

export type InvoiceData = InvoiceForm & { invoiceUrl?: string };

export interface Invoice {
  id: string;
  client: string;
  amount: number;
  status: InvoiceStatus;
  date: string;
  data?: InvoiceData;
  backendId?: string | number;
}

export interface InvoiceAuditLog {
  id: string;
  action: string;
  description: string;
  username: string;
  createdAt: string;
}

export interface AuditLogExtra {
  invoiceId?: string;
  client?: string;
  amount?: number;
}

export interface BackendInvoiceRecord {
  id?: string | number;
  _id?: string;
  invoice_number?: string;
  invoiceNumber?: string;
  client?: string;
  bill_to_name?: string;
  billToName?: string;
  amount?: number | string;
  total?: number | string;
  status?: string;
  date?: string;
  invoice_date?: string;
  invoiceDate?: string;
  created_at?: string;
  data?: InvoiceData | string;
  invoice_url?: string;
  invoiceUrl?: string;
  description?: string;
  items?: InvoiceItem[] | string;
  gst_rate?: number | string;
  gstRate?: number | string;
  [key: string]: unknown;
}

export interface BackendInvoiceAuditLogRecord {
  id?: string | number;
  _id?: string;
  action?: string;
  description?: string;
  details?: string;
  username?: string;
  user?: string;
  category?: string;
  created_at?: string;
  createdAt?: string;
}

export interface InvoiceTotals {
  subTotal: number;
  gstAmount: number;
  total: number;
}

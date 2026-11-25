import type { InvoiceForm, InvoiceStatus } from './types';

export const INVOICE_STORAGE_KEY = 'aether_erp_invoices_data';
export const INVOICE_LOGS_KEY = 'aether_erp_invoice_audit_logs';

export const INVOICE_STATUSES: InvoiceStatus[] = ['Paid', 'Pending', 'Overdue'];

export const DEFAULT_PLACE_OF_SUPPLY = 'Madhya Pradesh';
export const DEFAULT_GST_RATE = 18;
export const DEFAULT_PAYMENT_TERMS = 'Thank you for your business. Payment is due within 15 days.';
export const DEFAULT_ITEM_DESCRIPTION = 'Software Engineering & Enterprise Services';

export const DEFAULT_COMPANY_PROFILE: Pick<
  InvoiceForm,
  | 'companyName'
  | 'companyContact'
  | 'companyAddress'
  | 'companyCity'
  | 'companyState'
  | 'companyCountry'
  | 'companyPincode'
  | 'companyGSTIN'
> = {
  companyName: 'Aetheradix Private Limited',
  companyContact: 'Pratyush Shrivastava',
  companyAddress: 'F-N 507, Crystal Tower, IBD Kings Park',
  companyCity: 'Bawadia Kalan, Bhopal',
  companyState: 'Madhya Pradesh',
  companyCountry: 'India',
  companyPincode: '462039',
  companyGSTIN: '23ABDCA8625L1ZJ',
};

export const DEFAULT_BILL_TO_PROFILE: Pick<
  InvoiceForm,
  'billToAddress' | 'billToCity' | 'billToState' | 'billToCountry' | 'billToPincode'
> = {
  billToAddress: 'Corporate Office, Sector A',
  billToCity: 'Bhopal',
  billToState: 'Madhya Pradesh',
  billToCountry: 'India',
  billToPincode: '462001',
};

export const GST_RATE_OPTIONS = [
  { value: 0, label: '0% (Nil / Exempt)' },
  { value: 5, label: '5% (Concessional)' },
  { value: 12, label: '12% (Standard Lower)' },
  { value: 18, label: '18% (Standard Services Default)' },
  { value: 28, label: '28% (Luxury / Higher)' },
];

export const VENDOR_CATEGORY_OPTIONS = [
  { value: 'Stationary', label: 'Stationary' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Foods&Beverages', label: 'Foods & Beverages' },
  { value: 'Networking', label: 'Networking' },
  { value: 'Others', label: 'Others / General' },
];

export const VENDOR_TYPE_OPTIONS = [
  { value: 'Company', label: 'Company' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Freelance', label: 'Freelance' },
];

export const AUDIT_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const AUDIT_YEAR_OPTIONS = [2024, 2025, 2026, 2027];

export const INVOICE_STATUS_OPTIONS: { value: InvoiceStatus; label: string }[] = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Overdue', label: 'Overdue' },
];

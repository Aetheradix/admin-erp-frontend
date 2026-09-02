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

  companyName: string;
  companyContact: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyCountry: string;
  companyPincode: string;
  companyGSTIN: string;

  billToName: string;
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

export interface Invoice {
  id: string;
  client: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  date: string;
  data?: InvoiceForm & {
    invoiceUrl?: string;
  };
}

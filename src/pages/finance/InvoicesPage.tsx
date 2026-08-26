import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { motion } from 'framer-motion';
import { Table } from 'antd';
import InvoiceTemplate from './components/InvoiceTemplate';
import { useInvoicePdf } from './hooks/useInvoicePdf';
import { InvoiceFormModal } from './components/InvoiceFormModal';
import { getInvoiceColumns } from './components/InvoiceColumns';
import type { Invoice, InvoiceForm, InvoiceItem } from './types/invoice.types';

const initialInvoices: Invoice[] = [
  {
    id: 'INV-2026-001',
    client: 'Acme Corp',
    amount: 4500,
    status: 'Paid',
    date: '2026-06-01',
  },
  {
    id: 'INV-2026-002',
    client: 'Globex Inc',
    amount: 1200,
    status: 'Pending',
    date: '2026-06-05',
  },
  {
    id: 'INV-2026-003',
    client: 'Soylent Corp',
    amount: 8900,
    status: 'Overdue',
    date: '2026-05-15',
  },
  {
    id: 'INV-2026-004',
    client: 'Initech',
    amount: 3200,
    status: 'Paid',
    date: '2026-05-28',
  },
];

const emptyInvoiceForm: InvoiceForm = {
  invoiceNumber: 'INV-2026-005',
  invoiceDate: new Date().toISOString().slice(0, 10),
  dueDate: '',
  placeOfSupply: 'Madhya Pradesh',

  companyName: 'Aetheradix Private Limited',
  companyContact: 'Pratyush Shrivastava',
  companyAddress: 'F-N 507, Crystal Tower, IBD Kings Park',
  companyCity: 'Bawadia Kalan, Bhopal',
  companyState: 'Madhya Pradesh',
  companyCountry: 'India',
  companyPincode: '462039',
  companyGSTIN: '23ABDCA8625L1ZJ',

  billToName: '',
  billToAddress: '',
  billToCity: '',
  billToState: '',
  billToCountry: 'India',
  billToPincode: '',
  billToGSTIN: '',

  items: [
    {
      description: '',
      quantity: 1,
      rate: 0,
    },
  ],

  gstRate: 18,
  notes: 'Thank you for your business',
};

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<InvoiceForm>(emptyInvoiceForm);

  const { invoicePdfRef, pdfInvoice, generateInvoicePDF } = useInvoicePdf();

  const updateField = <K extends keyof InvoiceForm>(field: K, value: InvoiceForm[K]) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
          ? {
            ...item,
            [field]: value,
          }
          : item
      ),
    }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: '',
          quantity: 1,
          rate: 0,
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    if (!form.billToName) return;

    const subTotal = form.items.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.rate || 0),
      0
    );
    const gstAmount = (subTotal * Number(form.gstRate || 0)) / 100;
    const total = subTotal + gstAmount;

    const newInvoice: Invoice = {
      id: form.invoiceNumber,
      client: form.billToName,
      amount: total,
      status: 'Pending',
      date: form.invoiceDate || new Date().toISOString().slice(0, 10),
      data: {
        ...form,
        items: form.items.map((item) => ({ ...item })),
      },
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    setForm(emptyInvoiceForm);
    setShowForm(false);
  };

  const columns = getInvoiceColumns({
    onDownloadPdf: generateInvoicePDF,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Manage and track client billing."
        breadcrumbs={[
          { label: 'Home', url: '/' },
          { label: 'Finance', url: '/finance' },
          { label: 'Invoices' },
        ]}
        primaryAction={{
          label: 'Create Invoice',
          onClick: () => {
            setForm({
              ...emptyInvoiceForm,
              invoiceNumber: `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`,
            });
            setShowForm(true);
          },
          icon: 'pi pi-plus',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-surface-elevated rounded-[32px] border border-border-subtle shadow-soft overflow-hidden"
      >
        <Table
          columns={columns}
          dataSource={invoices}
          rowKey="id"
          pagination={false}
          className="premium-table"
        />
      </motion.div>

      <InvoiceFormModal
        visible={showForm}
        onHide={() => setShowForm(false)}
        form={form}
        updateField={updateField}
        updateItem={updateItem}
        addItem={addItem}
        removeItem={removeItem}
        onSubmit={handleSubmit}
        emptyForm={emptyInvoiceForm}
        setForm={setForm}
      />

      {/* Off-screen PDF Template Renderer */}
      {pdfInvoice && (
        <div
          style={{
            position: 'fixed',
            left: '-10000px',
            top: 0,
            width: '794px',
            background: '#ffffff',
          }}
        >
          <InvoiceTemplate ref={invoicePdfRef} invoice={pdfInvoice} />
        </div>
      )}
    </div>
  );
}

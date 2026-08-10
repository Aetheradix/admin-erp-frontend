// import { useState } from 'react';
// import { PageHeader } from '@/components/ui/composed/PageHeader';
// import { MoreHorizontal, CheckCircle, Clock, AlertCircle } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { Dialog } from '@/components/ui/composed/Dialog';
// import { Input } from '@/components/ui/primitives/Input';
// import { Select } from '@/components/ui/primitives/Select';
// import { Button } from '@/components/ui/primitives/Button';
// import { Table } from 'antd';
// import type { ColumnsType } from 'antd/es/table';

// import React from 'react';

// interface Invoice {
//   id: string;
//   client: string;
//   amount: number;
//   status: string;
//   date: string;
// }

// const statusIcons: Record<string, { icon: React.ElementType; color: string }> = {
//   Paid: { icon: CheckCircle, color: 'text-success' },
//   Pending: { icon: Clock, color: 'text-warning' },
//   Overdue: { icon: AlertCircle, color: 'text-error' },
// };

// const STATUS_OPTIONS = [
//   { label: 'Pending', value: 'Pending' },
//   { label: 'Paid', value: 'Paid' },
//   { label: 'Overdue', value: 'Overdue' },
// ];

// const initialInvoices: Invoice[] = [
//   { id: 'INV-2026-001', client: 'Acme Corp', amount: 4500, status: 'Paid', date: '2026-06-01' },
//   { id: 'INV-2026-002', client: 'Globex Inc', amount: 1200, status: 'Pending', date: '2026-06-05' },
//   {
//     id: 'INV-2026-003',
//     client: 'Soylent Corp',
//     amount: 8900,
//     status: 'Overdue',
//     date: '2026-05-15',
//   },
//   { id: 'INV-2026-004', client: 'Initech', amount: 3200, status: 'Paid', date: '2026-05-28' },
// ];

// const emptyForm = { client: '', amount: 0, status: 'Pending', date: '' };

// export function InvoicesPage() {
//   const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
//   const [showForm, setShowForm] = useState(false);
//   const [showInvoiceForm, setShowInvoiceForm] = useState(false);
//   const [form, setForm] = useState(emptyForm);

//   const handleSubmit = () => {
//     if (!form.client || !form.amount) return;
//     const count = invoices.length + 1;
//     const newInvoice: Invoice = {
//       id: `INV-2026-${String(count).padStart(3, '0')}`,
//       client: form.client,
//       amount: form.amount,
//       status: form.status,
//       date: form.date || new Date().toISOString().slice(0, 10),
//     };
//     setInvoices([newInvoice, ...invoices]);
//     setForm(emptyForm);
//     setShowForm(false);
//   };

//   const columns: ColumnsType<Invoice> = [
//     {
//       title: 'Invoice ID',
//       dataIndex: 'id',
//       key: 'id',
//       render: (text) => <span className="text-sm font-bold text-foreground">{text}</span>,
//     },
//     {
//       title: 'Client',
//       dataIndex: 'client',
//       key: 'client',
//       render: (text) => <span className="text-sm font-medium text-muted">{text}</span>,
//     },
//     {
//       title: 'Amount',
//       dataIndex: 'amount',
//       key: 'amount',
//       render: (amount) => (
//         <span className="text-sm font-black text-foreground">₹{amount.toLocaleString()}</span>
//       ),
//     },
//     {
//       title: 'Status',
//       dataIndex: 'status',
//       key: 'status',
//       render: (status) => {
//         const State = statusIcons[status] || statusIcons.Pending;
//         return (
//           <div className={`flex items-center gap-2 text-xs font-bold ${State.color}`}>
//             <State.icon size={14} />
//             {status}
//           </div>
//         );
//       },
//     },
//     {
//       title: 'Date',
//       dataIndex: 'date',
//       key: 'date',
//       render: (text) => <span className="text-sm font-medium text-muted">{text}</span>,
//     },
//     {
//       title: '',
//       key: 'action',
//       width: 80,
//       render: () => (
//         <button className="p-2 rounded-lg hover:bg-surface-subtle text-muted hover:text-foreground transition-colors">
//           <MoreHorizontal size={16} />
//         </button>
//       ),
//     },
//   ];

//   return (
//     <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
//       <PageHeader
//         title="Invoices"
//         description="Manage and track client billing."
//         breadcrumbs={[
//           { label: 'Home', url: '/' },
//           { label: 'Finance', url: '/finance' },
//           { label: 'Invoices' },
//         ]}
//         primaryAction={{
//           label: 'Create Invoice',
//           onClick: () => setShowForm(true),
//           icon: 'pi pi-plus',
//         }}
//       />

//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="bg-white rounded-[32px] border border-border-subtle shadow-soft overflow-hidden"
//       >
//         <Table
//           columns={columns}
//           dataSource={invoices}
//           rowKey="id"
//           pagination={false}
//           className="premium-table"
//         />
//       </motion.div>

//       {/* Create Invoice Dialog */}
//       <Dialog
//         visible={showForm}
//         onHide={() => setShowForm(false)}
//         header="Create Invoice"
//         modal
//         className="w-full max-w-xl mx-4"
//         contentClassName="p-8"
//         headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
//         pt={{
//           root: { className: 'rounded-[32px] overflow-hidden border-none shadow-2xl bg-white' },
//           mask: { className: 'backdrop-blur-md bg-black/40' },
//         }}
//       >
//         <div className="flex flex-col gap-5">
//           <div className="flex flex-col gap-2">
//             <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
//               Client Name
//             </label>
//             <Input
//               placeholder="e.g. Acme Corp"
//               value={form.client}
//               onChange={(e) => setForm({ ...form, client: e.target.value })}
//             />
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div className="flex flex-col gap-2">
//               <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
//                 Amount (₹)
//               </label>
//               <Input
//                 type="number"
//                 placeholder="0"
//                 value={String(form.amount || '')}
//                 onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 0 })}
//               />
//             </div>
//             <div className="flex flex-col gap-2">
//               <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
//                 Due Date
//               </label>
//               <Input
//                 type="date"
//                 value={form.date}
//                 onChange={(e) => setForm({ ...form, date: e.target.value })}
//               />
//             </div>
//           </div>
//           <div className="flex flex-col gap-2">
//             <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
//               Status
//             </label>
//             <Select
//               options={STATUS_OPTIONS}
//               value={form.status}
//               onChange={(e) => setForm({ ...form, status: e.value })}
//               placeholder="Select status"
//             />
//           </div>
//           <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
//             <Button
//               variant="ghost"
//               label="Cancel"
//               onClick={() => {
//                 setShowForm(false);
//                 setForm(emptyForm);
//               }}
//               className="rounded-xl!"
//             />
//             <Button
//               label="Create Invoice"
//               onClick={handleSubmit}
//               icon="pi pi-check"
//               className="rounded-xl! px-8!"
//             />
//           </div>
//         </div>
//       </Dialog>
//     </div>
//   );
// }

import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  FileText,
  Building2,
  User,
  IndianRupee,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Input } from '@/components/ui/primitives/Input';
import { Button } from '@/components/ui/primitives/Button';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';

interface Invoice {
  id: string;
  client: string;
  amount: number;
  status: string;
  date: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

interface InvoiceForm {
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

const statusIcons: Record<string, { icon: React.ElementType; color: string }> = {
  Paid: {
    icon: CheckCircle,
    color: 'text-success',
  },
  Pending: {
    icon: Clock,
    color: 'text-warning',
  },
  Overdue: {
    icon: AlertCircle,
    color: 'text-error',
  },
};

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

  /* =====================================================
     UPDATE FIELD
  ===================================================== */

  const updateField = <K extends keyof InvoiceForm>(field: K, value: InvoiceForm[K]) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* =====================================================
     UPDATE ITEM
  ===================================================== */

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

  /* =====================================================
     ADD ITEM
  ===================================================== */

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

  /* =====================================================
     REMOVE ITEM
  ===================================================== */

  const removeItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  /* =====================================================
     CALCULATIONS
  ===================================================== */

  const subTotal = form.items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.rate || 0),
    0
  );

  const gstAmount = (subTotal * Number(form.gstRate || 0)) / 100;

  const total = subTotal + gstAmount;

  const formatCurrency = (value: number) =>
    `₹${value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  /* =====================================================
     CREATE INVOICE
  ===================================================== */

  const handleSubmit = () => {
    if (!form.billToName) {
      return;
    }

    const newInvoice: Invoice = {
      id: form.invoiceNumber,
      client: form.billToName,
      amount: total,
      status: 'Pending',
      date: form.invoiceDate || new Date().toISOString().slice(0, 10),
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    console.log('Complete Invoice:', form);

    setForm(emptyInvoiceForm);
    setShowForm(false);
  };

  /* =====================================================
     TABLE
  ===================================================== */

  const columns: ColumnsType<Invoice> = [
    {
      title: 'Invoice ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <span className="font-semibold text-gray-900">{text}</span>,
    },

    {
      title: 'Client',
      dataIndex: 'client',
      key: 'client',
      render: (text) => text,
    },

    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <span className="font-semibold">₹{amount.toLocaleString('en-IN')}</span>,
    },

    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const State = statusIcons[status] || statusIcons.Pending;

        return (
          <div className={`flex items-center gap-2 text-xs font-bold ${State.color}`}>
            <State.icon size={14} />
            {status}
          </div>
        );
      },
    },

    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => text,
    },
  ];

  return (
    <div className="space-y-6">
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <PageHeader
        title="Invoices"
        description="Manage and track client billing."
        breadcrumbs={[
          {
            label: 'Home',
            url: '/',
          },
          {
            label: 'Finance',
            url: '/finance',
          },
          {
            label: 'Invoices',
          },
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

      {/* =================================================
          INVOICE TABLE
      ================================================= */}

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="bg-white rounded-[32px] border border-border-subtle shadow-soft overflow-hidden"
      >
        <Table
          columns={columns}
          dataSource={invoices}
          rowKey="id"
          pagination={false}
          className="premium-table"
        />
      </motion.div>

      {/* =================================================
          CREATE INVOICE DIALOG
      ================================================= */}

      <Dialog
        visible={showForm}
        onHide={() => {
          setShowForm(false);
          setForm(emptyInvoiceForm);
        }}
        header="Create Invoice"
        modal
        className="w-full max-w-6xl mx-4"
        contentClassName="p-0"
        headerClassName="px-8 pt-7 pb-5 text-2xl font-black tracking-tight border-none"
        pt={{
          root: {
            className: 'rounded-[32px] overflow-hidden border-none shadow-2xl bg-white',
          },

          mask: {
            className: 'backdrop-blur-md bg-black/40',
          },
        }}
      >
        <div className="max-h-[78vh] overflow-y-auto">
          <div className="px-8 pb-8 space-y-8">
            {/* =================================================
                INVOICE DETAILS
            ================================================= */}

            <section>
              <SectionTitle
                icon={<FileText size={18} />}
                title="Invoice Details"
                description="Basic information about this invoice."
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                <Field
                  label="Invoice Number"
                  value={form.invoiceNumber}
                  onChange={(e) => updateField('invoiceNumber', e.target.value)}
                />

                <Field
                  label="Invoice Date"
                  type="date"
                  value={form.invoiceDate}
                  onChange={(e) => updateField('invoiceDate', e.target.value)}
                />

                <Field
                  label="Due Date"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => updateField('dueDate', e.target.value)}
                />

                <Field
                  label="Place of Supply"
                  value={form.placeOfSupply}
                  onChange={(e) => updateField('placeOfSupply', e.target.value)}
                />

                <Field
                  label="GST Rate (%)"
                  type="number"
                  value={String(form.gstRate)}
                  onChange={(e) => updateField('gstRate', Number(e.target.value))}
                />
              </div>
            </section>

            {/* =================================================
                BUSINESS DETAILS
            ================================================= */}

            <section>
              <SectionTitle
                icon={<Building2 size={18} />}
                title="Business Details"
                description="Information about the company issuing this invoice."
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                <Field
                  label="Company Name"
                  value={form.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                />

                <Field
                  label="Contact Person"
                  value={form.companyContact}
                  onChange={(e) => updateField('companyContact', e.target.value)}
                />

                <Field
                  label="GSTIN"
                  value={form.companyGSTIN}
                  onChange={(e) => updateField('companyGSTIN', e.target.value)}
                />

                <Field
                  label="Address"
                  value={form.companyAddress}
                  onChange={(e) => updateField('companyAddress', e.target.value)}
                  className="md:col-span-2"
                />

                <Field
                  label="City"
                  value={form.companyCity}
                  onChange={(e) => updateField('companyCity', e.target.value)}
                />

                <Field
                  label="State"
                  value={form.companyState}
                  onChange={(e) => updateField('companyState', e.target.value)}
                />

                <Field
                  label="Country"
                  value={form.companyCountry}
                  onChange={(e) => updateField('companyCountry', e.target.value)}
                />

                <Field
                  label="Pincode"
                  value={form.companyPincode}
                  onChange={(e) => updateField('companyPincode', e.target.value)}
                />
              </div>
            </section>

            {/* =================================================
                BILL TO
            ================================================= */}

            <section>
              <SectionTitle
                icon={<User size={18} />}
                title="Bill To"
                description="Customer or recipient information."
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                <Field
                  label="Customer / Company Name"
                  value={form.billToName}
                  onChange={(e) => updateField('billToName', e.target.value)}
                  required
                />

                <Field
                  label="GSTIN"
                  value={form.billToGSTIN}
                  onChange={(e) => updateField('billToGSTIN', e.target.value)}
                />

                <Field
                  label="Address"
                  value={form.billToAddress}
                  onChange={(e) => updateField('billToAddress', e.target.value)}
                />

                <Field
                  label="City"
                  value={form.billToCity}
                  onChange={(e) => updateField('billToCity', e.target.value)}
                />

                <Field
                  label="State"
                  value={form.billToState}
                  onChange={(e) => updateField('billToState', e.target.value)}
                />

                <Field
                  label="Country"
                  value={form.billToCountry}
                  onChange={(e) => updateField('billToCountry', e.target.value)}
                />

                <Field
                  label="Pincode"
                  value={form.billToPincode}
                  onChange={(e) => updateField('billToPincode', e.target.value)}
                />
              </div>
            </section>

            {/* =================================================
                ITEMS
            ================================================= */}

            <section>
              <SectionTitle
                icon={<IndianRupee size={18} />}
                title="Invoice Items"
                description="Add products or services being billed."
              />

              <div className="mt-5 border border-gray-200 rounded-2xl overflow-hidden">
                <div className="bg-gray-900 text-white px-4 py-3 hidden md:grid grid-cols-[1fr_120px_160px_160px_50px] gap-3 text-sm font-semibold">
                  <span>Description</span>
                  <span>Qty</span>
                  <span>Rate</span>
                  <span>Amount</span>
                  <span />
                </div>

                <div className="p-4 space-y-3">
                  {form.items.map((item, index) => {
                    const amount = Number(item.quantity || 0) * Number(item.rate || 0);

                    return (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-[1fr_120px_160px_160px_50px] gap-3 items-center"
                      >
                        <div>
                          <label className="text-xs text-gray-500 md:hidden">Description</label>

                          <Input
                            placeholder="Software Development Service"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                          />
                        </div>

                        <Input
                          type="number"
                          min="1"
                          value={String(item.quantity)}
                          onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                        />

                        <Input
                          type="number"
                          min="0"
                          value={String(item.rate)}
                          onChange={(e) => updateItem(index, 'rate', Number(e.target.value))}
                        />

                        <div className="font-bold text-gray-900 px-2">{formatCurrency(amount)}</div>

                        <button
                          type="button"
                          disabled={form.items.length === 1}
                          onClick={() => removeItem(index)}
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-300 text-sm font-semibold text-gray-600 hover:border-black hover:text-black"
                  >
                    <Plus size={16} />
                    Add Item
                  </button>
                </div>
              </div>
            </section>

            {/* =================================================
                TOTAL
            ================================================= */}

            <div className="flex justify-end">
              <div className="w-full md:w-[380px] bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sub Total</span>

                  <span className="font-semibold">{formatCurrency(subTotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">GST ({form.gstRate}%)</span>

                  <span className="font-semibold">{formatCurrency(gstAmount)}</span>
                </div>

                <div className="border-t border-gray-300 pt-3 flex justify-between">
                  <span className="text-lg font-bold">Total</span>

                  <span className="text-2xl font-black">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* =================================================
                NOTES
            ================================================= */}

            <section>
              <SectionTitle
                icon={<FileText size={18} />}
                title="Notes"
                description="Optional message displayed on the invoice."
              />

              <textarea
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={3}
                className="mt-5 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black resize-none"
                placeholder="Thank you for your business"
              />
            </section>
          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-4 flex justify-between items-center">
            <div>
              <span className="text-xs text-gray-500 block">Invoice Total</span>

              <span className="text-xl font-black">{formatCurrency(total)}</span>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                label="Cancel"
                onClick={() => {
                  setShowForm(false);
                  setForm(emptyInvoiceForm);
                }}
                className="rounded-xl!"
              />

              <Button
                label="Create Invoice"
                icon="pi pi-check"
                onClick={handleSubmit}
                className="rounded-xl! px-8!"
              />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  return (
    <div className={className}>
      <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em] block mb-2">
        {label}
      </label>

      <Input {...props} />
    </div>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
        {icon}
      </div>

      <div>
        <h3 className="font-bold text-gray-900">{title}</h3>

        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

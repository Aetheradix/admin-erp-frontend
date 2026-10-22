import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { motion } from 'framer-motion';
import { Table, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Download,
  Plus,
  Filter,
} from 'lucide-react';

import { useUploadInvoiceMutation } from '@/store/api/uploadSlice';
import { useFulfillOrderAndDeductStockMutation } from '@/store/api/inventorySlice';
import { useGetAuditLogsQuery } from '@/store/api/financeApiSlice';
import { useAuth } from '@/hooks/useAuth';

import InvoiceTemplate from './components/InvoiceTemplate';
import { useInvoicePdf } from './hooks/useInvoicePdf';
import { InvoiceFormModal } from './components/InvoiceFormModal';
import { getInvoiceColumns } from './components/InvoiceColumns';

import type { Invoice, InvoiceForm, InvoiceItem } from './types/invoice.types';

export interface InvoiceAuditLog {
  id: string;
  action: string;
  description: string;
  username: string;
  createdAt: string;
}

const INVOICE_STORAGE_KEY = 'aether_erp_invoices_data';
const INVOICE_LOGS_KEY = 'aether_erp_invoice_audit_logs';

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

const initialAuditLogs: InvoiceAuditLog[] = [
  {
    id: 'log-1',
    action: 'CREATE_INVOICE',
    description: 'Generated invoice INV-2026-004 for Initech (₹3,200.00)',
    username: 'Pratyush Shrivastava',
    createdAt: '2026-05-28T14:32:00Z',
  },
  {
    id: 'log-2',
    action: 'STATUS_UPDATE',
    description: 'Marked invoice INV-2026-001 as Paid for Acme Corp',
    username: 'Accounts Dept',
    createdAt: '2026-06-01T11:15:00Z',
  },
  {
    id: 'log-3',
    action: 'CREATE_INVOICE',
    description: 'Generated invoice INV-2026-002 for Globex Inc (₹1,200.00)',
    username: 'Pratyush Shrivastava',
    createdAt: '2026-06-05T09:45:00Z',
  },
];

/**
 * Intelligent invoice number generator:
 * Scans all existing invoices, parses the current year and highest sequential suffix,
 * and increments by 1 with 3-digit zero-padding (e.g. INV-2026-005).
 */
export function generateNextInvoiceNumber(existingInvoices: Invoice[]): string {
  const currentYear = new Date().getFullYear();
  let maxSeq = 0;

  existingInvoices.forEach((inv) => {
    const id = inv.id || '';
    const match = id.match(/(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  });

  const nextSeq = Math.max(maxSeq + 1, 1);
  return `INV-${currentYear}-${String(nextSeq).padStart(3, '0')}`;
}

/**
 * Ensures any invoice has complete, valid InvoiceForm structure
 * so it can be previewed on-screen and printed without missing-file errors.
 */
export const getInvoiceFormData = (inv: Invoice): InvoiceForm => {
  if (inv.data) {
    return {
      ...inv.data,
      invoiceNumber: inv.data.invoiceNumber || inv.id,
      billToName: inv.data.billToName || inv.client,
    };
  }

  const calculatedTaxRate = 18;
  const taxableSubtotal = Math.round(Number(inv.amount || 0) / (1 + calculatedTaxRate / 100));

  return {
    invoiceNumber: inv.id,
    invoiceDate: inv.date || new Date().toISOString().slice(0, 10),
    dueDate: inv.date || new Date().toISOString().slice(0, 10),
    placeOfSupply: 'Madhya Pradesh',
    companyName: 'Aetheradix Private Limited',
    companyContact: 'Pratyush Shrivastava',
    companyAddress: 'F-N 507, Crystal Tower, IBD Kings Park',
    companyCity: 'Bawadia Kalan, Bhopal',
    companyState: 'Madhya Pradesh',
    companyCountry: 'India',
    companyPincode: '462039',
    companyGSTIN: '23ABDCA8625L1ZJ',
    billToName: inv.client,
    billToAddress: 'Corporate Office, Sector A',
    billToCity: 'Bhopal',
    billToState: 'Madhya Pradesh',
    billToCountry: 'India',
    billToPincode: '462001',
    billToGSTIN: '',
    items: [
      {
        description: 'Software Engineering & Enterprise Services',
        quantity: 1,
        rate: taxableSubtotal,
      },
    ],
    gstRate: calculatedTaxRate,
    notes: 'Thank you for your business. Payment is due within 15 days.',
  };
};

const createEmptyForm = (existingInvoices: Invoice[]): InvoiceForm => {
  const nextNum = generateNextInvoiceNumber(existingInvoices);
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const due = new Date(today);
  due.setDate(due.getDate() + 15);
  const dueStr = due.toISOString().slice(0, 10);

  return {
    invoiceNumber: nextNum,
    invoiceDate: todayStr,
    dueDate: dueStr,
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
    notes: 'Thank you for your business. Payment is due within 15 days.',
  };
};

export function InvoicesPage() {
  const { user } = useAuth();
  const currentUserName = user?.username || 'Admin';

  const {
    data: backendAuditLogsData,
    isLoading: isLogsLoading,
    refetch: refetchLogs,
  } = useGetAuditLogsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const stored = localStorage.getItem(INVOICE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored invoices:', e);
    }
    return initialInvoices;
  });

  const [localAuditLogs, setLocalAuditLogs] = useState<InvoiceAuditLog[]>(() => {
    try {
      const stored = localStorage.getItem(INVOICE_LOGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored invoice logs:', e);
    }
    return initialAuditLogs;
  });

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<InvoiceForm>(() => createEmptyForm(invoices));

  // View Modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  const [uploadInvoice, { isLoading: isUploadingPdf }] = useUploadInvoiceMutation();
  const [fulfillOrderAndDeductStock] = useFulfillOrderAndDeductStockMutation();

  const { invoicePdfRef, pdfInvoice, generateInvoicePDF } = useInvoicePdf();

  // Persist invoices whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(invoices));
    } catch (e) {
      console.warn('Error saving invoices:', e);
    }
  }, [invoices]);

  // Persist audit logs whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(INVOICE_LOGS_KEY, JSON.stringify(localAuditLogs));
    } catch (e) {
      console.warn('Error saving invoice logs:', e);
    }
  }, [localAuditLogs]);

  // Combined Audit Logs (local invoice events + backend finance audit logs)
  const combinedAuditLogs = useMemo(() => {
    const rawBackendLogs = Array.isArray(backendAuditLogsData?.data)
      ? backendAuditLogsData.data
      : Array.isArray(backendAuditLogsData)
      ? backendAuditLogsData
      : [];

    const formattedBackendLogs = rawBackendLogs.map((item: any) => ({
      id: String(item.id || item._id || Math.random()),
      action: String(item.action || 'FINANCE_ACTION'),
      description: String(item.description || item.details || 'Finance transaction recorded.'),
      username: String(item.username || item.user || 'System'),
      createdAt: String(item.created_at || item.createdAt || new Date().toISOString()),
    }));

    const merged = [...localAuditLogs, ...formattedBackendLogs];
    // Sort descending by date
    merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return merged;
  }, [localAuditLogs, backendAuditLogsData]);

  const recordAuditLog = (action: string, description: string) => {
    const newLog: InvoiceAuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      description,
      username: currentUserName,
      createdAt: new Date().toISOString(),
    };
    setLocalAuditLogs((prev) => [newLog, ...prev]);
  };

  // Filtered invoices by search text & status
  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    if (searchText.trim()) {
      const q = searchText.toLowerCase().trim();
      result = result.filter(
        (inv) =>
          inv.id.toLowerCase().includes(q) ||
          inv.client.toLowerCase().includes(q) ||
          String(inv.amount).includes(q) ||
          inv.date.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((inv) => inv.status.toLowerCase() === statusFilter.toLowerCase());
    }

    return result;
  }, [invoices, searchText, statusFilter]);

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

  const handleCreateNew = () => {
    setForm(createEmptyForm(invoices));
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.billToName.trim()) {
      message.error('Customer / Client name is required.');
      return;
    }

    if (!form.invoiceNumber.trim()) {
      message.error('Invoice number is required.');
      return;
    }

    const isDuplicate = invoices.some(
      (inv) => inv.id.toLowerCase().trim() === form.invoiceNumber.toLowerCase().trim()
    );
    if (isDuplicate) {
      message.error(`Invoice number "${form.invoiceNumber}" already exists. Please use a unique number.`);
      return;
    }

    try {
      message.loading({
        content: 'Generating invoice PDF...',
        key: 'invoice-pdf',
      });

      const subTotal = form.items.reduce(
        (sum, item) => sum + Number(item.quantity || 0) * Number(item.rate || 0),
        0
      );

      const gstAmount = (subTotal * Number(form.gstRate || 0)) / 100;
      const total = subTotal + gstAmount;

      const newInvoice: Invoice = {
        id: form.invoiceNumber.trim(),
        client: form.billToName.trim(),
        amount: total,
        status: 'Pending',
        date: form.invoiceDate || new Date().toISOString().slice(0, 10),
        data: {
          ...form,
          items: form.items.map((item) => ({ ...item })),
        },
      };

      let invoiceUrl: string | undefined = undefined;

      try {
        const pdfBlob = await generateInvoicePDF(newInvoice.data!);
        message.loading({
          content: 'Uploading invoice to storage...',
          key: 'invoice-pdf',
        });

        const uploadResponse = await uploadInvoice({
          file: pdfBlob,
        }).unwrap();

        invoiceUrl = uploadResponse?.data?.invoiceUrl;
      } catch (uploadErr) {
        console.warn('PDF upload note:', uploadErr);
      }

      const savedInvoice: Invoice = {
        ...newInvoice,
        data: {
          ...newInvoice.data!,
          invoiceUrl,
        },
      };

      setInvoices((prev) => [savedInvoice, ...prev]);

      // Record Audit Log
      recordAuditLog(
        'CREATE_INVOICE',
        `Created invoice ${savedInvoice.id} for ${savedInvoice.client} (₹${savedInvoice.amount.toLocaleString('en-IN')})`
      );

      refetchLogs();

      // Deduct inventory items referenced in this invoice if applicable
      try {
        const itemsToDeduct = form.items
          .filter((item) => item.description?.trim() && Number(item.quantity) > 0)
          .map((item) => ({
            asset_id: item.description.trim(),
            quantity: Number(item.quantity),
          }));

        if (itemsToDeduct.length > 0) {
          const deductRes = await fulfillOrderAndDeductStock({
            invoiceId: form.invoiceNumber,
            items: itemsToDeduct,
          }).unwrap();

          if (deductRes?.lowStockAlerts && deductRes.lowStockAlerts.length > 0) {
            message.warning(
              `Inventory Notice: ${deductRes.lowStockAlerts.length} item(s) dropped below reorder threshold!`
            );
          }
        }
      } catch (deductErr) {
        console.info('Inventory deduction note:', deductErr);
      }

      setForm(createEmptyForm([savedInvoice, ...invoices]));
      setShowForm(false);

      message.success({
        content: `Invoice ${savedInvoice.id} created successfully!`,
        key: 'invoice-pdf',
      });
    } catch (error) {
      console.error('Invoice creation failed:', error);
      message.error({
        content: error instanceof Error ? error.message : 'Unable to create invoice.',
        key: 'invoice-pdf',
      });
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setViewingInvoice(invoice);
    setShowViewModal(true);
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    Modal.confirm({
      title: 'Delete Invoice',
      content: `Are you sure you want to delete invoice ${invoice.id} for ${invoice.client}? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        setInvoices((prev) => prev.filter((item) => item.id !== invoice.id));
        recordAuditLog(
          'DELETE_INVOICE',
          `Deleted invoice ${invoice.id} for ${invoice.client} (₹${Number(invoice.amount || 0).toLocaleString('en-IN')})`
        );
        refetchLogs();
        message.success(`Invoice ${invoice.id} deleted successfully.`);
      },
    });
  };

  const downloadInvoice = async (invoice: Invoice) => {
    try {
      message.loading({
        content: 'Preparing invoice PDF...',
        key: 'invoice-download',
      });

      const invoiceUrl = invoice.data?.invoiceUrl;

      if (invoiceUrl) {
        const response = await fetch(invoiceUrl);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `${invoice.id}.pdf`;
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();
          window.URL.revokeObjectURL(url);

          recordAuditLog('DOWNLOAD_INVOICE', `Downloaded invoice PDF for ${invoice.id}`);
          message.success({
            content: 'Invoice downloaded successfully.',
            key: 'invoice-download',
          });
          return;
        }
      }

      // Fallback: Generate PDF dynamically on-the-fly using the invoice form data
      const formData = getInvoiceFormData(invoice);
      const blob = await generateInvoicePDF(formData);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${invoice.id}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);

      recordAuditLog('DOWNLOAD_INVOICE', `Generated & downloaded invoice PDF for ${invoice.id}`);
      message.success({
        content: 'Invoice downloaded successfully.',
        key: 'invoice-download',
      });
    } catch (error) {
      console.error('Invoice download failed:', error);
      message.error({
        content: error instanceof Error ? error.message : 'Unable to download invoice.',
        key: 'invoice-download',
      });
    }
  };

  const columns = getInvoiceColumns({
    onDownloadPdf: downloadInvoice,
    onViewInvoice: handleViewInvoice,
    onDeleteInvoice: handleDeleteInvoice,
  });

  const auditColumns: ColumnsType<any> = [
    {
      title: 'Timestamp',
      key: 'createdAt',
      width: 190,
      render: (_, record) => (
        <span className="text-xs font-mono text-slate-600">
          {new Date(record.createdAt || record.created_at).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 160,
      render: (_, record) => {
        const actionType = record.action || '';
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
            {actionType}
          </span>
        );
      },
    },
    {
      title: 'Description',
      key: 'description',
      render: (_, record) => (
        <span className="text-xs text-slate-800 font-medium">
          {record.description || 'Invoice transaction recorded.'}
        </span>
      ),
    },
    {
      title: 'Admin / User',
      key: 'username',
      width: 170,
      render: (_, record) => (
        <span className="text-xs text-slate-600 font-semibold">
          {record.username || 'System'}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-20 max-w-7xl mx-auto p-4 sm:p-6">
      <PageHeader
        title="Invoices"
        description="Manage and track client billing, view generated statements, and review audit logs."
        breadcrumbs={[
          { label: 'Home', url: '/' },
          { label: 'Finance', url: '/finance' },
          { label: 'Invoices' },
        ]}
      />

      {/* Top Filter and Actions Toolbar - Matching Payroll Page pattern */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search invoice id, client, amount..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 w-64 shadow-xs"
          />

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs shadow-xs">
            <Filter size={14} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-700 outline-none cursor-pointer">
              <option value="ALL">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={isUploadingPdf}
            onClick={handleCreateNew}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 transition disabled:opacity-50 shadow-xs active:scale-95 cursor-pointer">
            <Plus size={16} />
            {isUploadingPdf ? 'Generating...' : 'Create Invoice'}
          </button>
        </div>
      </div>

      {/* Main Invoices Table */}
      <motion.div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredInvoices}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: 'No invoices found.' }}
        />
      </motion.div>

      {/* 💡 Audit Logs Table at the Bottom - Matching Payroll Page exactly */}
      <div className="flex flex-col gap-3 mt-6">
        <div>
          <h3 className="font-bold text-base text-slate-900">Audit Logs</h3>
          <p className="text-xs text-slate-500">History of invoice updates, creations, and deletions</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <Table
            columns={auditColumns}
            dataSource={combinedAuditLogs}
            loading={isLogsLoading}
            rowKey={(record) => String(record.id || record._id || Math.random())}
            pagination={{ pageSize: 5 }}
            locale={{ emptyText: 'No audit logs found.' }}
          />
        </div>
      </div>

      {/* Invoice Creation Form Modal */}
      <InvoiceFormModal
        visible={showForm}
        onHide={() => {
          if (isUploadingPdf) return;
          setShowForm(false);
        }}
        form={form}
        updateField={updateField}
        updateItem={updateItem}
        addItem={addItem}
        removeItem={removeItem}
        onSubmit={handleSubmit}
        emptyForm={createEmptyForm(invoices)}
        setForm={setForm}
        isSubmitting={isUploadingPdf}
      />

      {/* High-Fidelity Invoice Viewer Modal */}
      <Modal
        open={showViewModal}
        onCancel={() => setShowViewModal(false)}
        footer={null}
        width={850}
        centered
        destroyOnClose
        title={
          <div className="flex items-center justify-between pr-8 py-1">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200">
                {viewingInvoice?.id}
              </span>
              <span className="text-sm font-bold text-slate-800">
                {viewingInvoice?.client}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  viewingInvoice?.status === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : viewingInvoice?.status === 'Overdue'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                {viewingInvoice?.status}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => viewingInvoice && downloadInvoice(viewingInvoice)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition shadow-xs cursor-pointer">
                <Download size={14} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        }>
        <div className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto p-4">
          {viewingInvoice && (
            <div className="flex justify-center bg-slate-100 p-4 rounded-xl border border-slate-200 shadow-inner">
              <InvoiceTemplate invoice={getInvoiceFormData(viewingInvoice)} />
            </div>
          )}
        </div>
      </Modal>

      {/* Hidden container used by html2canvas for PDF export */}
      {pdfInvoice && (
        <div
          style={{
            position: 'fixed',
            left: '-10000px',
            top: 0,
            width: '794px',
            background: '#ffffff',
          }}>
          <InvoiceTemplate ref={invoicePdfRef} invoice={pdfInvoice} />
        </div>
      )}
    </div>
  );
}

export default InvoicesPage;

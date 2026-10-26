import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { motion } from 'framer-motion';
import { Table, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Download, Plus, Filter, Edit3 } from 'lucide-react';

import { useUploadInvoiceMutation } from '@/store/api/uploadSlice';
import { useFulfillOrderAndDeductStockMutation } from '@/store/api/inventorySlice';
import {
  useGetInvoicesQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useGetInvoiceAuditLogsQuery,
  useCreateInvoiceAuditLogMutation,
  useDeleteInvoiceMutation,
} from '@/store/api/financeApiSlice';
import { recordAuditLog as recordSystemAuditLog } from '@/services/auditService';
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
 * so it can be previewed on-screen, edited, and printed without missing-file errors.
 */
export const getInvoiceFormData = (inv: Invoice): InvoiceForm => {
  let parsedData: any = {};

  if (typeof inv.data === 'string') {
    try {
      parsedData = JSON.parse(inv.data);
    } catch (e) {
      console.warn('Failed to parse invoice.data string:', e);
      parsedData = {};
    }
  } else if (inv.data && typeof inv.data === 'object') {
    parsedData = inv.data;
  }

  const raw = inv as any;

  // Resolve invoiceNumber
  const invoiceNumber = String(
    parsedData.invoiceNumber ||
      parsedData.invoice_number ||
      raw.invoice_number ||
      raw.invoiceNumber ||
      inv.id ||
      ''
  ).trim();

  // Resolve billToName
  const billToName = String(
    parsedData.billToName ||
      parsedData.bill_to_name ||
      parsedData.client ||
      inv.client ||
      raw.bill_to_name ||
      raw.billToName ||
      ''
  ).trim();

  // Resolve dates
  const invoiceDate = String(
    parsedData.invoiceDate ||
      parsedData.invoice_date ||
      parsedData.date ||
      inv.date ||
      raw.invoice_date ||
      raw.date ||
      new Date().toISOString().slice(0, 10)
  );

  const dueDate = String(
    parsedData.dueDate ||
      parsedData.due_date ||
      invoiceDate
  );

  // Resolve Tax Rate and amounts
  const calculatedTaxRate = Number(
    parsedData.gstRate ?? raw.gst_rate ?? raw.gstRate ?? 18
  );
  const totalAmount = Number(
    inv.amount || parsedData.amount || parsedData.total || raw.total || 0
  );
  const taxableSubtotal = Math.round(totalAmount / (1 + calculatedTaxRate / 100));

  // Resolve items
  let rawItems = parsedData.items ?? raw.items;
  if (typeof rawItems === 'string') {
    try {
      rawItems = JSON.parse(rawItems);
    } catch {
      rawItems = [];
    }
  }

  let finalItems: InvoiceItem[] = [];
  if (Array.isArray(rawItems) && rawItems.length > 0) {
    finalItems = rawItems.map((item: any) => ({
      description: String(item.description || item.name || 'Software Engineering & Enterprise Services'),
      quantity: Math.max(1, Number(item.quantity || item.qty || 1)),
      rate: Number(item.rate ?? item.price ?? item.amount ?? 0),
    }));
  } else {
    finalItems = [
      {
        description: String(
          parsedData.description || raw.description || 'Software Engineering & Enterprise Services'
        ),
        quantity: 1,
        rate: taxableSubtotal > 0 ? taxableSubtotal : totalAmount,
      },
    ];
  }

  return {
    invoiceNumber,
    invoiceDate,
    dueDate,
    placeOfSupply: String(parsedData.placeOfSupply || parsedData.place_of_supply || 'Madhya Pradesh'),
    status: (parsedData.status || inv.status || 'Pending') as 'Paid' | 'Pending' | 'Overdue',

    companyName: String(parsedData.companyName || parsedData.company_name || 'Aetheradix Private Limited'),
    companyContact: String(parsedData.companyContact || parsedData.company_contact || 'Pratyush Shrivastava'),
    companyAddress: String(parsedData.companyAddress || parsedData.company_address || 'F-N 507, Crystal Tower, IBD Kings Park'),
    companyCity: String(parsedData.companyCity || parsedData.company_city || 'Bawadia Kalan, Bhopal'),
    companyState: String(parsedData.companyState || parsedData.company_state || 'Madhya Pradesh'),
    companyCountry: String(parsedData.companyCountry || parsedData.company_country || 'India'),
    companyPincode: String(parsedData.companyPincode || parsedData.company_pincode || '462039'),
    companyGSTIN: String(parsedData.companyGSTIN || parsedData.company_gstin || '23ABDCA8625L1ZJ'),

    billToName,
    billToAddress: String(parsedData.billToAddress || parsedData.bill_to_address || 'Corporate Office, Sector A'),
    billToCity: String(parsedData.billToCity || parsedData.bill_to_city || 'Bhopal'),
    billToState: String(parsedData.billToState || parsedData.bill_to_state || 'Madhya Pradesh'),
    billToCountry: String(parsedData.billToCountry || parsedData.bill_to_country || 'India'),
    billToPincode: String(parsedData.billToPincode || parsedData.bill_to_pincode || '462001'),
    billToGSTIN: String(parsedData.billToGSTIN || parsedData.bill_to_gstin || ''),

    items: finalItems,
    gstRate: calculatedTaxRate,
    notes: String(parsedData.notes || 'Thank you for your business. Payment is due within 15 days.'),
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
    data: backendInvoicesData,
    isLoading: isBackendInvoicesLoading,
    refetch: refetchBackendInvoices,
  } = useGetInvoicesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const {
    data: backendInvoiceAuditLogsData,
    isLoading: isLogsLoading,
    refetch: refetchLogs,
  } = useGetInvoiceAuditLogsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [createInvoiceApi] = useCreateInvoiceMutation();
  const [updateInvoiceApi] = useUpdateInvoiceMutation();
  const [deleteInvoiceApi] = useDeleteInvoiceMutation();
  const [createInvoiceAuditLogApi] = useCreateInvoiceAuditLogMutation();

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
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState<InvoiceForm>(() => createEmptyForm(invoices));
  const [isSaving, setIsSaving] = useState(false);

  // Sync backend invoices if available
  useEffect(() => {
    if (
      backendInvoicesData &&
      Array.isArray(backendInvoicesData) &&
      backendInvoicesData.length > 0
    ) {
      const formatted: Invoice[] = backendInvoicesData.map((item: any) => {
        const invNum = String(item.invoice_number || item.invoiceNumber || item.id || 'INV-000');
        const client = String(item.client || item.bill_to_name || item.billToName || 'Client');
        const amount = Number(item.amount || item.total || 0);
        const status = (item.status === 'Paid' || item.status === 'Overdue' ? item.status : 'Pending') as
          'Paid' | 'Pending' | 'Overdue';
        const date = String(
          item.date ||
            item.invoice_date ||
            item.invoiceDate ||
            new Date().toISOString().slice(0, 10)
        );

        const partialInv: Invoice = {
          id: invNum,
          client,
          amount,
          status,
          date,
          data: typeof item.data === 'object' ? item.data : undefined,
        };

        const fullFormData = getInvoiceFormData(partialInv);

        return {
          id: invNum,
          client,
          amount,
          status,
          date,
          data: {
            ...fullFormData,
            invoiceUrl: item.invoice_url || item.invoiceUrl || item.data?.invoiceUrl,
          },
          ...((item.id !== undefined && String(item.id) !== invNum) ? { backendId: item.id } : {}),
        };
      });

      setInvoices((prev) => {
        const prevMap = new Map(prev.map((inv) => [inv.id.toLowerCase().trim(), inv]));
        const backendIds = new Set(formatted.map((inv) => inv.id.toLowerCase().trim()));

        // Merge backend records with local state so local edits/details aren't lost
        const mergedBackend = formatted.map((bInv) => {
          const localMatch = prevMap.get(bInv.id.toLowerCase().trim());
          if (!localMatch) return bInv;
          return {
            ...bInv,
            data: localMatch.data || bInv.data,
            client: localMatch.client || bInv.client,
            amount: localMatch.amount || bInv.amount,
            status: localMatch.status || bInv.status,
            date: localMatch.date || bInv.date,
          };
        });

        const localOnly = prev.filter((inv) => !backendIds.has(inv.id.toLowerCase().trim()));
        return [...mergedBackend, ...localOnly];
      });
    }
  }, [backendInvoicesData]);

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

  // Combined Audit Logs (local invoice events + backend invoice audit logs)
  const combinedAuditLogs = useMemo(() => {
    const rawBackendLogs = Array.isArray(backendInvoiceAuditLogsData?.data)
      ? backendInvoiceAuditLogsData.data
      : Array.isArray(backendInvoiceAuditLogsData)
        ? backendInvoiceAuditLogsData
        : [];

    // Strictly filter out any salary slip / payroll logs if backend returned mixed records
    const isSalarySlipLog = (item: any) => {
      const act = String(item.action || '').toUpperCase();
      const desc = String(item.description || item.details || '').toLowerCase();
      const cat = String(item.category || '').toLowerCase();
      return (
        cat === 'salary_slip' ||
        cat === 'payroll' ||
        act.includes('SALARY_SLIP') ||
        act.includes('PAYSLIP') ||
        act.includes('PAYROLL') ||
        desc.includes('salary slip') ||
        desc.includes('payslip') ||
        desc.includes('payroll')
      );
    };

    const formattedBackendLogs: InvoiceAuditLog[] = rawBackendLogs
      .filter((item: any) => !isSalarySlipLog(item))
      .map((item: any) => ({
        id: String(item.id || item._id || Math.random()),
        action: String(item.action || 'INVOICE_ACTION'),
        description: String(item.description || item.details || 'Invoice transaction recorded.'),
        username: String(item.username || item.user || 'System'),
        createdAt: String(item.created_at || item.createdAt || new Date().toISOString()),
      }));

    // Deduplicate by ID
    const existingIds = new Set(localAuditLogs.map((l) => l.id));
    const uniqueBackend = formattedBackendLogs.filter((l) => !existingIds.has(l.id));

    const merged = [...localAuditLogs, ...uniqueBackend];
    // Sort descending by date
    merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return merged;
  }, [localAuditLogs, backendInvoiceAuditLogsData]);

  const recordAuditLog = (
    action: string,
    description: string,
    extra?: { invoiceId?: string; client?: string; amount?: number }
  ) => {
    const newLog: InvoiceAuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      description,
      username: currentUserName,
      createdAt: new Date().toISOString(),
    };
    setLocalAuditLogs((prev) => [newLog, ...prev]);

    // Send to dedicated backend invoice audit logs endpoint via mutation
    createInvoiceAuditLogApi({
      action,
      description,
      invoiceId: extra?.invoiceId,
      client: extra?.client,
      amount: extra?.amount,
      username: currentUserName,
    }).catch(() => {
      // Backend best-effort
    });

    // Also record in centralized system audit logs with 'invoice' category
    recordSystemAuditLog({
      action,
      category: 'invoice',
      user: currentUserName,
      userEmail: user?.email || '',
      target: description,
      status: 'Success',
      details: description,
    });
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
    setEditingInvoice(null);
    setForm(createEmptyForm(invoices));
    setShowForm(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    const formData = getInvoiceFormData(invoice);
    setForm(formData);
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const handleStatusChange = async (
    invoice: Invoice,
    newStatus: 'Paid' | 'Pending' | 'Overdue'
  ) => {
    if (invoice.status === newStatus) return;

    const prevStatus = invoice.status;
    const updatedInvoice: Invoice = {
      ...invoice,
      status: newStatus,
      data: invoice.data ? { ...invoice.data, status: newStatus } : undefined,
    };

    setInvoices((prev) => prev.map((inv) => (inv.id === invoice.id ? updatedInvoice : inv)));

    if (viewingInvoice?.id === invoice.id) {
      setViewingInvoice(updatedInvoice);
    }

    try {
      const apiId = (invoice as any).backendId || invoice.id;
      await updateInvoiceApi({
        id: apiId,
        status: newStatus,
      }).unwrap();
    } catch (err) {
      console.warn('Backend status update note:', err);
    }

    recordAuditLog(
      'STATUS_UPDATE',
      `Updated status of invoice ${invoice.id} from ${prevStatus} to ${newStatus} for ${invoice.client}`,
      { invoiceId: invoice.id, client: invoice.client, amount: invoice.amount }
    );

    refetchLogs();
    refetchBackendInvoices();
    message.success(`Invoice ${invoice.id} marked as ${newStatus}.`);
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

    const isUpdating = Boolean(editingInvoice);

    // Duplicate check - ignore current invoice if editing
    const isDuplicate = invoices.some(
      (inv) =>
        inv.id.toLowerCase().trim() === form.invoiceNumber.toLowerCase().trim() &&
        (!editingInvoice ||
          (inv.id.toLowerCase().trim() !== editingInvoice.id.toLowerCase().trim() &&
            (inv as any).backendId !== (editingInvoice as any).backendId))
    );
    if (isDuplicate) {
      message.error(
        `Invoice number "${form.invoiceNumber}" already exists. Please use a unique number.`
      );
      return;
    }

    const actionKey = 'invoice-save-action';
    setIsSaving(true);

    try {
      message.loading({
        content: isUpdating ? 'Updating invoice...' : 'Creating invoice...',
        key: actionKey,
      });

      const safeItems = Array.isArray(form.items) ? form.items : [];
      const subTotal = safeItems.reduce(
        (sum, item) => sum + Number(item.quantity || 0) * Number(item.rate || 0),
        0
      );

      const gstAmount = (subTotal * Number(form.gstRate || 0)) / 100;
      const total = subTotal + gstAmount;

      const invoicePayload: Invoice = {
        id: form.invoiceNumber.trim(),
        client: form.billToName.trim(),
        amount: total,
        status: form.status || (editingInvoice ? editingInvoice.status : 'Pending'),
        date: form.invoiceDate || new Date().toISOString().slice(0, 10),
        data: {
          ...form,
          status: form.status || (editingInvoice ? editingInvoice.status : 'Pending'),
          items: safeItems.map((item) => ({
            description: item.description,
            quantity: Number(item.quantity || 1),
            rate: Number(item.rate || 0),
          })),
          invoiceUrl: editingInvoice?.data?.invoiceUrl,
        },
      };

      const savedInvoice: Invoice = {
        ...invoicePayload,
        data: {
          ...invoicePayload.data!,
        },
        ...((editingInvoice as any)?.backendId ? { backendId: (editingInvoice as any).backendId } : {}),
      };

      if (isUpdating && editingInvoice) {
        // 1. Update in local state & localStorage immediately
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id.toLowerCase().trim() === editingInvoice.id.toLowerCase().trim() ||
            ((inv as any).backendId && (inv as any).backendId === (editingInvoice as any).backendId)
              ? savedInvoice
              : inv
          )
        );

        // If currently viewing this invoice in modal, update it
        if (
          viewingInvoice &&
          (viewingInvoice.id.toLowerCase().trim() === editingInvoice.id.toLowerCase().trim() ||
            ((viewingInvoice as any).backendId &&
              (viewingInvoice as any).backendId === (editingInvoice as any).backendId))
        ) {
          setViewingInvoice(savedInvoice);
        }

        // 2. Call backend update API mutation (best-effort)
        try {
          const apiId = (editingInvoice as any).backendId || editingInvoice.id;
          await updateInvoiceApi({
            id: apiId,
            invoice_number: savedInvoice.id,
            invoiceNumber: savedInvoice.id,
            client: savedInvoice.client,
            bill_to_name: savedInvoice.client,
            billToName: savedInvoice.client,
            amount: savedInvoice.amount,
            total: savedInvoice.amount,
            status: savedInvoice.status,
            date: savedInvoice.date,
            invoice_date: savedInvoice.date,
            invoiceDate: savedInvoice.date,
            data: savedInvoice.data,
          }).unwrap();
        } catch (apiErr) {
          console.warn('Backend update note:', apiErr);
        }

        // 3. Record Audit Log
        recordAuditLog(
          'UPDATE_INVOICE',
          `Updated invoice ${savedInvoice.id} for ${savedInvoice.client} (₹${savedInvoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })})`,
          { invoiceId: savedInvoice.id, client: savedInvoice.client, amount: savedInvoice.amount }
        );

        message.success({
          content: `Invoice ${savedInvoice.id} updated successfully!`,
          key: actionKey,
        });
      } else {
        // 1. Create in local state & localStorage
        setInvoices((prev) => [savedInvoice, ...prev]);

        // 2. Call backend create API mutation
        try {
          await createInvoiceApi({
            id: savedInvoice.id,
            invoice_number: savedInvoice.id,
            invoiceNumber: savedInvoice.id,
            client: savedInvoice.client,
            bill_to_name: savedInvoice.client,
            billToName: savedInvoice.client,
            amount: savedInvoice.amount,
            total: savedInvoice.amount,
            status: savedInvoice.status,
            date: savedInvoice.date,
            invoice_date: savedInvoice.date,
            invoiceDate: savedInvoice.date,
            data: savedInvoice.data,
          }).unwrap();
        } catch (apiErr) {
          console.warn('Backend create note:', apiErr);
        }

        // 3. Record Audit Log
        recordAuditLog(
          'CREATE_INVOICE',
          `Created invoice ${savedInvoice.id} for ${savedInvoice.client} (₹${savedInvoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })})`,
          { invoiceId: savedInvoice.id, client: savedInvoice.client, amount: savedInvoice.amount }
        );

        // 4. Deduct inventory items referenced in this invoice if applicable
        try {
          const itemsToDeduct = safeItems
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

        message.success({
          content: `Invoice ${savedInvoice.id} created successfully!`,
          key: actionKey,
        });
      }

      // Generate & upload PDF in the background without blocking the UI
      generateInvoicePDF(savedInvoice.data!)
        .then((pdfBlob) => uploadInvoice({ file: pdfBlob }).unwrap())
        .then((uploadRes) => {
          if (uploadRes?.data?.invoiceUrl) {
            setInvoices((prev) =>
              prev.map((inv) =>
                inv.id === savedInvoice.id
                  ? { ...inv, data: { ...inv.data!, invoiceUrl: uploadRes.data.invoiceUrl } }
                  : inv
              )
            );
          }
        })
        .catch((uploadErr) => {
          console.info('Background PDF generation note:', uploadErr);
        });

      refetchLogs();

      setEditingInvoice(null);
      setForm(createEmptyForm(invoices));
      setShowForm(false);
    } catch (error) {
      console.error('Invoice operation failed:', error);
      message.error({
        content: error instanceof Error ? error.message : 'Unable to save invoice.',
        key: actionKey,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setViewingInvoice(invoice);
    setShowViewModal(true);
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    Modal.confirm({
      title: 'Delete Invoice',
      content: (
        <div className="space-y-2 text-xs text-slate-600">
          <p>
            Are you sure you want to delete invoice{' '}
            <strong className="font-mono text-slate-900">{invoice.id}</strong> for{' '}
            <strong className="text-slate-900">{invoice.client}</strong>?
          </p>
          <p className="font-semibold text-rose-600">
            Amount: ₹
            {Number(invoice.amount || 0).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}
          </p>
          <p className="text-[11px] text-slate-400">
            This action cannot be undone and will be permanently recorded in the audit logs.
          </p>
        </div>
      ),
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: async () => {
        const key = 'invoice-delete';
        message.loading({ content: `Deleting invoice ${invoice.id}...`, key });

        setInvoices((prev) => prev.filter((item) => item.id !== invoice.id));
        if (viewingInvoice?.id === invoice.id) {
          setShowViewModal(false);
          setViewingInvoice(null);
        }

        try {
          const apiId = (invoice as any).backendId || invoice.id;
          await deleteInvoiceApi(apiId).unwrap();
        } catch (err) {
          console.warn('Backend delete note:', err);
        }

        recordAuditLog(
          'DELETE_INVOICE',
          `Deleted invoice ${invoice.id} for ${invoice.client} (₹${Number(invoice.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })})`,
          { invoiceId: invoice.id, client: invoice.client, amount: invoice.amount }
        );

        refetchLogs();
        refetchBackendInvoices();
        message.success({ content: `Invoice ${invoice.id} deleted successfully.`, key });
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

          recordAuditLog('DOWNLOAD_INVOICE', `Downloaded invoice PDF for ${invoice.id}`, {
            invoiceId: invoice.id,
            client: invoice.client,
            amount: invoice.amount,
          });
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

      recordAuditLog('DOWNLOAD_INVOICE', `Generated & downloaded invoice PDF for ${invoice.id}`, {
        invoiceId: invoice.id,
        client: invoice.client,
        amount: invoice.amount,
      });
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
    onEditInvoice: handleEditInvoice,
    onStatusChange: handleStatusChange,
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
        <span className="text-xs text-slate-600 font-semibold">{record.username || 'System'}</span>
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
          loading={isBackendInvoicesLoading}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: 'No invoices found.' }}
        />
      </motion.div>

      {/* 💡 Dedicated Invoice Audit Logs Table */}
      <div className="flex flex-col gap-3 mt-6">
        <div>
          <h3 className="font-bold text-base text-slate-900">Invoice Audit Logs</h3>
          <p className="text-xs text-slate-500">
            History of invoice updates, creations, and deletions
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <Table
            columns={auditColumns}
            dataSource={combinedAuditLogs}
            loading={isLogsLoading}
            rowKey={(record) => String(record.id || record._id || Math.random())}
            pagination={{ pageSize: 5 }}
            locale={{ emptyText: 'No invoice audit logs found.' }}
          />
        </div>
      </div>

      {/* Invoice Form Modal (Create & Edit) */}
      <InvoiceFormModal
        visible={showForm}
        isEditing={Boolean(editingInvoice)}
        onHide={() => {
          if (isSaving || isUploadingPdf) return;
          setShowForm(false);
          setEditingInvoice(null);
        }}
        form={form}
        updateField={updateField}
        updateItem={updateItem}
        addItem={addItem}
        removeItem={removeItem}
        onSubmit={handleSubmit}
        emptyForm={createEmptyForm(invoices)}
        setForm={setForm}
        isSubmitting={isSaving || isUploadingPdf}
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
              <span className="text-sm font-bold text-slate-800">{viewingInvoice?.client}</span>
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
                onClick={() => {
                  if (viewingInvoice) {
                    setShowViewModal(false);
                    handleEditInvoice(viewingInvoice);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl transition shadow-xs cursor-pointer">
                <Edit3 size={14} className="text-indigo-600" />
                <span>Edit Invoice</span>
              </button>
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

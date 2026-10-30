import { Table, Dropdown, App, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  User,
  Briefcase,
  Calendar,
  UserCheck,
  Clock,
  MoreHorizontal,
  Plus,
  Eye,
  Edit3,
  Download,
  Trash2,
  FileSpreadsheet,
  Filter,
  Sparkles,
  Ban,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useRef, useState, useEffect, useMemo } from 'react';
import {
  useGetAllSalarySlipsQuery,
  useCreateSalarySlipMutation,
  useDeleteSalarySlipMutation,
  useUpdateSalarySlipMutation,
  useGetSalarySlipAuditLogsQuery,
  useCreatePayrollAdjustmentMutation,
  useGetPayrollAdjustmentsQuery,
} from '@/store/api/financeApiSlice';
import { useAuth } from '@/hooks/useAuth';
import { recordAuditLog as recordSystemAuditLog } from '@/services/auditService';
import {
  exportPayrollAuditLogs,
  filterLogsByRetention,
  getThreeMonthsCutoff,
  pruneLocalStorageLogs,
} from '@/utils/auditExport';
import SalarySlipTemplate from './components/SalarySlipTemplate';
import SalarySlipForm, { generateSlipNumber } from './components/SalarySlipForm';
import { TaxProjectionModal } from './components/TaxProjectionModal';
import VoidPayrollModal from './components/VoidPayrollModal';
import { getStoredPayrollSettings } from '@/types/payrollSettings';
import type { SalarySlipData } from './components/SalarySlipForm';
import { PageHeader } from '@/components/ui/composed/PageHeader';

export interface PayrollRecord {
  id: number;
  userId: number;
  employeeCode: string;
  department: string;
  paymentStatus: string;
  base: number;
  bonus: number;
  total: number;
  date: string;
  monthYear: string;
  paySlipNo: string;
  payPeriod: string;
  payrollType?: 'Regular' | 'Adjustment';
  adjustmentType?: string;
  payCycle?: string;
  taxRegime?: string;
  totalCompensation?: number;
  referencedPeriod?: string;
  companyName: string;
  companyAddress: string;
  employeeId: string;
  employeeName: string;
  position: string;
  accountNumber: string;
  paidDays: number;
  lopDays: number;
  generatedOn: string;
  createdBy: string;
  created_by_username?: string;
  earnings: Array<{ name: string; amount: number }>;
  deductions: Array<{ name: string; amount: number }>;
  authorizedSignatory: string;
  signatoryRole: string;
  hrNote: string;
  payPeriodMonth?: number;
  payPeriodYear?: number;
  rawRecord?: Record<string, any>;
  isVoid?: boolean;
  voidReason?: string;
  voidNotes?: string;
  voidedAt?: string;
  voidedBy?: string;
}

export const PAYROLL_STATUS_STORAGE_KEY = 'aetheradix_payroll_status_overrides';

export const getPayrollStatusOverrides = (): Record<string, 'pending' | 'paid'> => {
  try {
    const raw = localStorage.getItem(PAYROLL_STATUS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const savePayrollStatusOverride = (id: string | number, status: 'pending' | 'paid') => {
  try {
    const current = getPayrollStatusOverrides();
    current[String(id)] = status;
    localStorage.setItem(PAYROLL_STATUS_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Failed to save payroll status override:', e);
  }
};

const formatApiRecord = (item: Record<string, any>): PayrollRecord => {
  const monthNames = [
    'JANUARY',
    'FEBRUARY',
    'MARCH',
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER',
  ];

  const monthIdx = (Number(item.pay_period_month) || 1) - 1;
  const monthStr = monthNames[monthIdx] || 'OCTOBER';
  const yearStr = String(item.pay_period_year || 2026);

  const actualSlipNo = item.paySlipNo || item.pay_slip_no;

  const basicSalary = Number(item.basic_salary || 0);
  const bonusVal = Number(item.bonus || 0);
  const netVal = Number(item.net_salary || 0);
  const monthYearStr = `${monthStr} ${yearStr}`;
  const empCode = String(
    item.employee_code || item.employeeCode || item.employee_id || item.user_id || '001'
  );
  const fallbackSlipNo = generateSlipNumber(empCode, monthYearStr);

  // Extract Payroll Type & Adjustments (from native field or serialized in remarks)
  const isAdjustmentRemark =
    typeof item.remarks === 'string' && item.remarks.includes('[ADJUSTMENT');
  const detectedPayrollType: 'Regular' | 'Adjustment' =
    item.payroll_type || item.payrollType || (isAdjustmentRemark ? 'Adjustment' : 'Regular');

  let detectedAdjType = item.adjustment_type || item.adjustmentType || '';
  if (!detectedAdjType && isAdjustmentRemark) {
    const afterPrefix = item.remarks.split('[ADJUSTMENT - ')[1];
    if (afterPrefix) {
      detectedAdjType = afterPrefix.split(']')[0].split('|')[0].trim();
    }
  }

  // Detect Void Status (from field or serialized in remarks)
  const isVoid =
    item.is_void === true ||
    item.isVoid === true ||
    item.payment_status === 'void' ||
    item.paymentStatus === 'void' ||
    (typeof item.remarks === 'string' && item.remarks.includes('[VOID'));

  let detectedVoidReason = item.void_reason || item.voidReason || '';
  let detectedVoidNotes = item.void_notes || item.voidNotes || '';
  if (!detectedVoidReason && typeof item.remarks === 'string' && item.remarks.includes('[VOID: ')) {
    const afterPrefix = item.remarks.split('[VOID: ')[1];
    if (afterPrefix) {
      const rawVoid = afterPrefix.split(']')[0];
      if (rawVoid.includes('|')) {
        const [r, ...n] = rawVoid.split('|');
        detectedVoidReason = r.trim();
        detectedVoidNotes = n.join('|').trim();
      } else {
        detectedVoidReason = rawVoid.trim();
      }
    }
  }

  const statusOverrides = getPayrollStatusOverrides();
  const overrideStatus = statusOverrides[String(item.id)];
  const rawStatus = (overrideStatus || item.payment_status || item.paymentStatus || '').toLowerCase();
  // Salary slips default to 'pending' rather than 'paid'
  const effectiveStatus = isVoid
    ? 'void'
    : overrideStatus
      ? overrideStatus
      : rawStatus === 'paid' && overrideStatus === 'paid'
        ? 'paid'
        : 'pending';

  const detectedCycle =
    item.pay_cycle ||
    item.payCycle ||
    (item.pay_frequency
      ? item.pay_frequency.charAt(0).toUpperCase() + item.pay_frequency.slice(1)
      : 'Monthly');

  return {
    ...item,
    id: item.id,
    userId: item.user_id,
    base: basicSalary,
    bonus: bonusVal,
    total: netVal,
    date: monthYearStr,
    monthYear: monthYearStr,
    payPeriod: item.payPeriod || monthYearStr,
    payrollType: detectedPayrollType,
    adjustmentType: detectedAdjType,
    payCycle: detectedCycle,
    taxRegime: item.tax_regime || item.taxRegime || 'New Regime',
    totalCompensation: Number(item.total_compensation || item.totalCompensation || 0),
    referencedPeriod: item.referenced_period || item.referencedPeriod || '',
    companyName: 'AETHERADIX',
    companyAddress: 'F-N 507, Crystal Tower, IBD Kings Park, Bhopal, MP',
    employeeId: String(item.employee_code || item.user_id),
    employeeName: item.username || 'Unknown Employee',
    employeeCode: item.employee_code || String(item.user_id),
    position: item.designation || 'N/A',
    department: item.department || 'N/A',
    accountNumber: item.bank_account_number || 'N/A',
    authorizedSignatory:
      item.authorized_signatory || item.authorizedSignatory || 'Seema Srivastava',
    signatoryRole: item.signatory_role || item.signatoryRole || '(Director)',
    payPeriodMonth: item.pay_period_month,
    payPeriodYear: item.pay_period_year,
    paySlipNo: actualSlipNo && actualSlipNo !== 'null' ? actualSlipNo : fallbackSlipNo,
    paidDays: Number(item.days_worked || item.total_working_days || 0),
    lopDays: Number(item.leave_days || 0),
    paymentStatus: effectiveStatus,
    isVoid,
    voidReason: detectedVoidReason,
    voidNotes: detectedVoidNotes,
    voidedAt: item.voided_at || item.voidedAt || '',
    voidedBy: item.voided_by || item.voidedBy || '',
    generatedOn: item.payment_date || item.created_at?.split('T')[0] || '',
    createdBy: item.created_by_username || 'System',
    created_by_username: item.created_by_username || 'System',
    earnings: [
      { name: 'Basic Salary', amount: Number(item.basic_salary || 0) },
      { name: 'House Rent Allowance (HRA)', amount: Number(item.house_rent_allowance || 0) },
      { name: 'Special Allowance', amount: Number(item.special_allowance || 0) },
      { name: 'Conveyance Allowance', amount: Number(item.conveyance_allowance || 0) },
      { name: 'Bonus', amount: Number(item.bonus || 0) },
      { name: 'Other Earnings', amount: Number(item.other_earnings || 0) },
    ],
    deductions: [
      { name: 'Provident Fund (PF)', amount: Number(item.provident_fund || 0) },
      { name: 'Professional Tax', amount: Number(item.professional_tax || 0) },
      { name: 'Income Tax (TDS)', amount: Number(item.income_tax_tds || 0) },
      { name: 'Other Deductions', amount: Number(item.other_deductions || 0) },
    ],
    hrNote:
      item.hr_note ||
      item.hrNote ||
      item.remarks ||
      'For any discrepancies, please contact the HR department within 3 working days.',
  };
};

export default function PayrollPage() {
  const { message } = App.useApp();

  const {
    data: rawData,
    isLoading: isFetching,
    isError,
    refetch: refetchSlips, // 👈 Destructure refetch
  } = useGetAllSalarySlipsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const {
    data: auditLogsData,
    isLoading: isLogsLoading,
    refetch: refetchLogs, // 👈 Destructure refetch
  } = useGetSalarySlipAuditLogsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [createSalarySlip, { isLoading: isCreating }] = useCreateSalarySlipMutation();
  const [updateSalarySlip, { isLoading: isUpdating }] = useUpdateSalarySlipMutation();
  const [deleteSalarySlip, { isLoading: isDeleting }] = useDeleteSalarySlipMutation();
  const [createAdjustment, { isLoading: isCreatingAdjustment }] =
    useCreatePayrollAdjustmentMutation();
  const { refetch: refetchAdjustments } = useGetPayrollAdjustmentsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const { user: authUser } = useAuth();

  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [filteredPayroll, setFilteredPayroll] = useState<PayrollRecord[]>([]);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'Regular' | 'Adjustment'>('ALL');
  const [cycleFilter, setCycleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending' | 'Paid' | 'Void'>('ALL');

  const [showSalarySlipForm, setShowSalarySlipForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);
  const [selectedSlip, setSelectedSlip] = useState<PayrollRecord | null>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [showTaxProjectionModal, setShowTaxProjectionModal] = useState(false);
  const [projectionEmployee, setProjectionEmployee] = useState<any | null>(null);

  // Void Modal State
  const [voidingRecord, setVoidingRecord] = useState<PayrollRecord | null>(null);
  const [showVoidModal, setShowVoidModal] = useState<boolean>(false);
  const [isVoiding, setIsVoiding] = useState<boolean>(false);

  // 💡 Local Payroll Audit Logs (with 3-Month Retention)
  const PAYROLL_LOGS_KEY = 'aether_erp_payroll_audit_logs';
  const [localPayrollLogs, setLocalPayrollLogs] = useState<any[]>(() => {
    try {
      pruneLocalStorageLogs(PAYROLL_LOGS_KEY, 'createdAt');
      const raw = localStorage.getItem(PAYROLL_LOGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return filterLogsByRetention(parsed);
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Persist local payroll audit logs with 3-month retention
  useEffect(() => {
    try {
      localStorage.setItem(
        PAYROLL_LOGS_KEY,
        JSON.stringify(filterLogsByRetention(localPayrollLogs))
      );
    } catch (e) {
      console.warn('Failed to save local payroll logs:', e);
    }
  }, [localPayrollLogs]);

  // Combined Payroll Audit Logs (Backend query + Local events, strictly 3 months)
  const combinedPayrollLogs = useMemo(() => {
    const rawBackendLogs = Array.isArray(auditLogsData?.data)
      ? auditLogsData.data
      : Array.isArray(auditLogsData)
        ? auditLogsData
        : [];

    const formattedBackend = rawBackendLogs.map((item: any) => ({
      id: String(item.id || item._id || Math.random()),
      action: String(item.action || 'PAYROLL_ACTION'),
      description: String(item.description || item.details || 'Payroll modification recorded'),
      username: String(item.username || item.user || 'System'),
      createdAt: String(item.created_at || item.createdAt || new Date().toISOString()),
      status: String(item.status || 'Success'),
    }));

    const existingIds = new Set(localPayrollLogs.map((l) => String(l.id)));
    const uniqueBackend = formattedBackend.filter((b: any) => !existingIds.has(String(b.id)));
    const merged = [...localPayrollLogs, ...uniqueBackend];

    merged.sort(
      (a, b) =>
        new Date(b.createdAt || b.created_at || 0).getTime() -
        new Date(a.createdAt || a.created_at || 0).getTime()
    );

    // Enforce 3-month retention window
    return filterLogsByRetention(merged);
  }, [localPayrollLogs, auditLogsData]);

  const { formattedLabel: retentionCutoffLabel } = useMemo(() => getThreeMonthsCutoff(), []);

  const companyPayrollSettings = useMemo(() => getStoredPayrollSettings(), []);
  const hiddenPdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rawData) {
      const itemsList = Array.isArray(rawData?.data)
        ? rawData.data
        : Array.isArray(rawData)
          ? rawData
          : [];

      const formattedRecords: PayrollRecord[] = itemsList.map((item: Record<string, any>) =>
        formatApiRecord(item)
      );

      formattedRecords.sort((a: PayrollRecord, b: PayrollRecord) => {
        const yearDiff = Number(b.payPeriodYear || 0) - Number(a.payPeriodYear || 0);
        if (yearDiff !== 0) return yearDiff;
        return Number(b.payPeriodMonth || 0) - Number(a.payPeriodMonth || 0);
      });

      setPayroll(formattedRecords);
      setFilteredPayroll(formattedRecords);
    }
  }, [rawData]);

  useEffect(() => {
    let result = [...payroll];

    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      result = result.filter(
        (item) =>
          item.employeeName?.toLowerCase().includes(query) ||
          item.employeeCode?.toLowerCase().includes(query) ||
          item.department?.toLowerCase().includes(query) ||
          item.paySlipNo?.toLowerCase().includes(query)
      );
    }

    if (typeFilter !== 'ALL') {
      result = result.filter((item) => (item.payrollType || 'Regular') === typeFilter);
    }

    if (cycleFilter !== 'ALL') {
      result = result.filter((item) => {
        const cycle = (item.payCycle || 'Monthly').toLowerCase();
        return cycle === cycleFilter.toLowerCase();
      });
    }

    if (statusFilter === 'Pending') {
      result = result.filter(
        (item) => !item.isVoid && (item.paymentStatus || '').toLowerCase() === 'pending'
      );
    } else if (statusFilter === 'Paid') {
      result = result.filter(
        (item) => !item.isVoid && (item.paymentStatus || '').toLowerCase() === 'paid'
      );
    } else if (statusFilter === 'Void') {
      result = result.filter((item) => item.isVoid || item.paymentStatus === 'void');
    }

    setFilteredPayroll(result);
  }, [searchText, payroll, typeFilter, cycleFilter, statusFilter]);

  const downloadSalarySlip = async (record: PayrollRecord) => {
    try {
      message.loading({ content: 'Preparing document...', key: 'dl' });
      setSelectedSlip(record);

      // 1. Force browser to finish layout & font glyph calculations
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      if (document.fonts) {
        await document.fonts.ready;
      }
      await new Promise((resolve) => setTimeout(resolve, 400));

      if (!hiddenPdfRef.current) throw new Error('Template container not ready');

      const targetEl =
        (hiddenPdfRef.current.querySelector('.salary-statement-paper') as HTMLElement) ||
        hiddenPdfRef.current;

      // 2. Snapshot with letter rendering & clone bounds enforced
      const canvas = await html2canvas(targetEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1000,
        onclone: (clonedDoc) => {
          const clonedEl = clonedDoc.querySelector('.salary-statement-paper') as HTMLElement;
          if (clonedEl) {
            clonedEl.style.display = 'block';
            clonedEl.style.position = 'static';
            clonedEl.style.margin = '0 auto';
            clonedEl.style.overflow = 'visible';
            clonedEl.style.boxSizing = 'border-box';
          }
        },
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      if (imgHeight > pdfHeight) {
        const ratio = pdfHeight / imgHeight;
        const adjustedWidth = imgWidth * ratio;
        const adjustedHeight = pdfHeight;
        const xOffset = (pdfWidth - adjustedWidth) / 2;

        pdf.addImage(imgData, 'PNG', xOffset, 0, adjustedWidth, adjustedHeight);
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }

      pdf.save(`Salary-Slip-${record.employeeName.replace(/\s+/g, '_')}-${record.monthYear}.pdf`);
      message.success({ content: 'Salary slip downloaded!', key: 'dl' });
    } catch (err) {
      console.error('PDF error:', err);
      message.error({ content: 'Failed to download PDF.', key: 'dl' });
    }
  };

  const handleFormSubmit = async (data: SalarySlipData) => {
    const key = 'salary-slip-action';
    try {
      if (editingRecord) {
        message.loading({ content: 'Updating salary slip...', key });
        await updateSalarySlip({ id: editingRecord.id, ...data }).unwrap();
        message.success({ content: 'Salary slip updated successfully!', key });
      } else if (data.payrollType === 'Adjustment') {
        message.loading({ content: 'Recording payroll adjustment...', key });
        await createAdjustment({
          userId: Number(data.userId || (data as any).user_id),
          payrollType: 'adjustment',
          adjustmentType: data.adjustmentType || 'wrong_rate',
          adjustmentAmount: Number(data.adjustmentAmount || 0),
          adjustmentReason: data.adjustmentReason || data.adjustmentNotes || 'Adjustment processed',
          referencePeriod: data.referencePeriod || data.referencedPeriod || '',
          referenceSalarySlipId: data.referenceSalarySlipId
            ? Number(data.referenceSalarySlipId)
            : undefined,
          payFrequency: (data.payCycle || 'monthly').toLowerCase(),
          month: (data as any).payPeriodMonth || (data as any).month || new Date().getMonth() + 1,
          year: (data as any).payPeriodYear || (data as any).year || new Date().getFullYear(),
          cycleNumber: data.cyclePart || 1,
        }).unwrap();
        message.success({ content: 'Adjustment recorded and processed successfully!', key });
      } else {
        message.loading({ content: 'Saving salary slip...', key });
        await createSalarySlip(data as any).unwrap();
        message.success({ content: 'Salary slip recorded successfully!', key });
      }
      await Promise.all([refetchSlips(), refetchLogs(), refetchAdjustments()]);

      setShowSalarySlipForm(false);
      setEditingRecord(null);
    } catch (error: any) {
      message.error({
        content: error?.data?.message || 'Failed to process payroll transaction.',
        key,
      });
    }
  };

  const handleEdit = (record: PayrollRecord) => {
    setEditingRecord(record);
    setShowSalarySlipForm(true);
  };

  const handleDelete = (record: PayrollRecord) => {
    Modal.confirm({
      title: 'Delete Salary Slip',
      content: `Are you sure you want to delete the salary slip for ${record.employeeName} (${record.monthYear})? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: async () => {
        const key = 'delete-salary-slip';
        try {
          message.loading({ content: 'Deleting salary slip...', key });
          await deleteSalarySlip(record.id).unwrap();
          message.success({ content: 'Salary slip deleted successfully!', key });
        } catch (error: any) {
          message.error({
            content: error?.data?.message || error?.message || 'Failed to delete salary slip.',
            key,
          });
        }
      },
    });
  };

  // Open Void Modal for a Payroll Slip
  const handleOpenVoidModal = (record: PayrollRecord) => {
    setVoidingRecord(record);
    setShowVoidModal(true);
  };

  // Confirm Marking as Void
  const handleConfirmVoid = async (reason: string, notes: string) => {
    if (!voidingRecord) return;
    setIsVoiding(true);
    const key = 'void-payroll-action';
    try {
      message.loading({ content: 'Marking salary slip as void...', key });
      const voidRemark = `[VOID: ${reason}${notes ? ` | ${notes}` : ''}] ${voidingRecord.hrNote || ''}`;

      await updateSalarySlip({
        id: voidingRecord.id,
        payment_status: 'void',
        paymentStatus: 'void',
        is_void: true,
        isVoid: true,
        void_reason: reason,
        void_notes: notes,
        voided_at: new Date().toISOString(),
        voided_by: authUser?.username || 'Admin',
        remarks: voidRemark,
      }).unwrap();

      // 1. Central system audit log (saved with 3-month retention)
      recordSystemAuditLog({
        action: 'PAYROLL_VOIDED',
        category: 'payroll',
        user: authUser?.username || 'Admin',
        userEmail: authUser?.email || 'admin@aetheradix.com',
        target: `Salary Slip ${voidingRecord.paySlipNo} (${voidingRecord.employeeName})`,
        status: 'Warning',
        details: `Marked salary slip ${voidingRecord.paySlipNo} for ${voidingRecord.employeeName} (${voidingRecord.monthYear}) as VOID. Reason: ${reason}.${notes ? ` Notes: ${notes}` : ''}`,
        changes: [
          { field: 'paymentStatus', from: voidingRecord.paymentStatus || 'pending', to: 'void' },
          { field: 'isVoid', from: false, to: true },
          { field: 'voidReason', from: null, to: reason },
        ],
      });

      // 2. Local payroll audit log for instant display & offline persistence
      const newLog = {
        id: `pay-void-${Date.now()}`,
        action: 'VOID_SALARY_SLIP',
        description: `Marked salary slip ${voidingRecord.paySlipNo} (${voidingRecord.employeeName}) as VOID. Reason: ${reason}`,
        username: authUser?.username || 'Admin',
        createdAt: new Date().toISOString(),
        status: 'Warning',
      };
      setLocalPayrollLogs((prev) => filterLogsByRetention([newLog, ...prev]));

      message.success({
        content: `Salary slip ${voidingRecord.paySlipNo} marked as VOID successfully.`,
        key,
      });

      setShowVoidModal(false);
      setVoidingRecord(null);
      await Promise.all([refetchSlips(), refetchLogs()]);
    } catch (err: any) {
      message.error({
        content: err?.data?.message || 'Failed to mark salary slip as void.',
        key,
      });
    } finally {
      setIsVoiding(false);
    }
  };

  // Reactivate a Voided Salary Slip
  const handleUnvoid = (record: PayrollRecord) => {
    Modal.confirm({
      title: 'Reactivate Salary Slip',
      icon: <CheckCircle2 size={20} className="text-emerald-600" />,
      content: `Are you sure you want to reactivate the salary slip for ${record.employeeName} (${record.paySlipNo})? This will restore it to valid status.`,
      okText: 'Yes, Reactivate',
      okButtonProps: { className: '!bg-emerald-600' },
      cancelText: 'Cancel',
      onOk: async () => {
        const key = 'unvoid-action';
        try {
          message.loading({ content: 'Reactivating salary slip...', key });
          const cleanRemarks = (record.hrNote || '').replace(/\[VOID:[^\]]+\]\s*/g, '');
          savePayrollStatusOverride(record.id, 'pending');
          await updateSalarySlip({
            id: record.id,
            payment_status: 'pending',
            paymentStatus: 'pending',
            is_void: false,
            isVoid: false,
            void_reason: null,
            void_notes: null,
            remarks: cleanRemarks,
          }).unwrap();

          recordSystemAuditLog({
            action: 'PAYROLL_REACTIVATED',
            category: 'payroll',
            user: authUser?.username || 'Admin',
            userEmail: authUser?.email || 'admin@aetheradix.com',
            target: `Salary Slip ${record.paySlipNo} (${record.employeeName})`,
            status: 'Success',
            details: `Reactivated previously voided salary slip ${record.paySlipNo} for ${record.employeeName}.`,
          });

          const newLog = {
            id: `pay-unvoid-${Date.now()}`,
            action: 'REACTIVATE_SALARY_SLIP',
            description: `Reactivated salary slip ${record.paySlipNo} for ${record.employeeName}`,
            username: authUser?.username || 'Admin',
            createdAt: new Date().toISOString(),
            status: 'Success',
          };
          setLocalPayrollLogs((prev) => filterLogsByRetention([newLog, ...prev]));

          message.success({ content: 'Salary slip reactivated successfully.', key });
          await Promise.all([refetchSlips(), refetchLogs()]);
        } catch (err: any) {
          message.error({ content: err?.data?.message || 'Failed to reactivate salary slip.', key });
        }
      },
    });
  };

  // Change Payment Status (Pending <-> Paid)
  const handleStatusChange = async (record: PayrollRecord, newStatus: 'pending' | 'paid') => {
    const key = 'status-action';
    try {
      message.loading({ content: `Updating status to ${newStatus.toUpperCase()}...`, key });
      savePayrollStatusOverride(record.id, newStatus);
      await updateSalarySlip({
        id: record.id,
        payment_status: newStatus,
        paymentStatus: newStatus,
      }).unwrap();

      recordSystemAuditLog({
        action: 'PAYROLL_STATUS_UPDATED',
        category: 'payroll',
        user: authUser?.username || 'Admin',
        userEmail: authUser?.email || 'admin@aetheradix.com',
        target: `Salary Slip ${record.paySlipNo} (${record.employeeName})`,
        status: 'Success',
        details: `Updated payment status for ${record.employeeName} (${record.paySlipNo}) from ${record.paymentStatus || 'pending'} to ${newStatus.toUpperCase()}.`,
        changes: [
          {
            field: 'paymentStatus',
            from: record.paymentStatus || 'pending',
            to: newStatus,
          },
        ],
      });

      const newLog = {
        id: `pay-status-${Date.now()}`,
        action: 'UPDATE_STATUS_SALARY_SLIP',
        description: `Marked salary slip ${record.paySlipNo} (${record.employeeName}) as ${newStatus.toUpperCase()}`,
        username: authUser?.username || 'Admin',
        createdAt: new Date().toISOString(),
        status: 'Info',
      };
      setLocalPayrollLogs((prev) => filterLogsByRetention([newLog, ...prev]));

      message.success({ content: `Salary slip marked as ${newStatus.toUpperCase()}!`, key });
      await Promise.all([refetchSlips(), refetchLogs()]);
    } catch (err: any) {
      // Local state is preserved and refetched
      message.success({ content: `Salary slip marked as ${newStatus.toUpperCase()}.`, key });
      await Promise.all([refetchSlips(), refetchLogs()]);
    }
  };

  const handleCreateNew = () => {
    setEditingRecord(null);
    setShowSalarySlipForm(true);
  };

  const columns: ColumnsType<PayrollRecord> = [
    {
      title: 'Slip No',
      key: 'paySlipNo',
      render: (_, record) => (
        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
          {record.paySlipNo}
        </span>
      ),
    },
    {
      title: 'Employee Details',
      key: 'employee',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <User size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900">{record.employeeName}</span>
            <span className="text-[11px] text-slate-500 font-medium">{record.position}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Department',
      key: 'department',
      render: (_, record) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
          <Briefcase size={14} className="text-slate-400" />
          <span>{record.department}</span>
        </div>
      ),
    },
    {
      title: 'Pay Period',
      key: 'monthYear',
      render: (_, record) => (
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
          <Calendar size={14} className="text-indigo-500" />
          <span>{record.monthYear}</span>
        </div>
      ),
    },
    {
      title: 'Type & Cycle',
      key: 'payrollType',
      render: (_, record) => (
        <div className="flex flex-col gap-1 items-start">
          {record.payrollType === 'Adjustment' ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-md shadow-2xs">
              Adjustment
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md">
              Regular
            </span>
          )}
          <span className="text-[11px] text-slate-500 font-medium">
            {record.payrollType === 'Adjustment' && record.adjustmentType
              ? record.adjustmentType
              : record.payCycle || 'Monthly'}
          </span>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'paymentStatus',
      width: 120,
      render: (_, record) => {
        const isVoid = record.isVoid || record.paymentStatus === 'void';
        if (isVoid) {
          return (
            <span
              title={record.voidReason ? `Reason: ${record.voidReason}` : 'Marked as Void'}
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-md shadow-2xs">
              <Ban size={11} className="text-rose-600" /> Void
            </span>
          );
        }

        const isPaid = (record.paymentStatus || '').toLowerCase() === 'paid';

        return (
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                {
                  key: 'pending',
                  label: (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                      <Clock size={13} /> Pending
                    </span>
                  ),
                },
                {
                  key: 'paid',
                  label: (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                      <CheckCircle2 size={13} /> Paid
                    </span>
                  ),
                },
              ],
              onClick: ({ key }) => handleStatusChange(record, key as 'pending' | 'paid'),
            }}>
            <button
              type="button"
              title="Click to toggle status (Pending / Paid)"
              className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition hover:brightness-95 cursor-pointer shadow-2xs ${
                isPaid
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
              {isPaid ? (
                <>
                  <CheckCircle2 size={11} className="text-emerald-600" /> Paid
                </>
              ) : (
                <>
                  <Clock size={11} className="text-amber-600" /> Pending
                </>
              )}
            </button>
          </Dropdown>
        );
      },
    },
    {
      title: 'Days Worked',
      key: 'paidDays',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-800">{record.paidDays} Days</span>
          {record.lopDays > 0 && (
            <span className="text-[10px] font-semibold text-rose-500">{record.lopDays} LOP</span>
          )}
        </div>
      ),
    },
    {
      title: 'Net Salary',
      key: 'total',
      render: (_, record) => {
        const isVoid = record.isVoid || record.paymentStatus === 'void';
        return (
          <div className="flex flex-col">
            <span
              className={`text-sm font-black ${
                isVoid ? 'text-slate-400 line-through' : 'text-slate-900'
              }`}>
              ₹{Number(record.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            {isVoid && (
              <span className="text-[10px] font-bold text-rose-600 tracking-tight">
                (Voided Slip)
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Created By',
      key: 'createdBy',
      render: (_, record) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <UserCheck size={14} className="text-slate-400" />
          <span className="font-medium text-slate-800">{record.created_by_username}</span>
        </div>
      ),
    },
    {
      title: 'Generated On',
      key: 'generatedOn',
      render: (_, record) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock size={13} className="text-slate-400" />
          <span>{record.generatedOn}</span>
        </div>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 70,
      render: (_, record) => {
        const isVoid = record.isVoid || record.paymentStatus === 'void';

        return (
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                { key: 'view', label: 'View Salary Slip', icon: <Eye size={15} /> },
                {
                  key: 'taxProjection',
                  label: 'Tax Projection Sheet',
                  icon: <FileSpreadsheet size={15} className="text-emerald-600" />,
                },
                {
                  key: 'adjustment',
                  label: 'Create Adjustment',
                  icon: <Sparkles size={15} className="text-amber-600" />,
                },
                { key: 'edit', label: 'Edit Salary Slip', icon: <Edit3 size={15} /> },
                { key: 'download', label: 'Download PDF', icon: <Download size={15} /> },
                { type: 'divider' },
                ...(isVoid
                  ? [
                      {
                        key: 'unvoid',
                        label: 'Reactivate (Unmark Void)',
                        icon: <CheckCircle2 size={15} className="text-emerald-600" />,
                      },
                    ]
                  : [
                      (record.paymentStatus || '').toLowerCase() === 'paid'
                        ? {
                            key: 'markPending',
                            label: 'Mark as Pending',
                            icon: <Clock size={15} className="text-amber-600" />,
                          }
                        : {
                            key: 'markPaid',
                            label: 'Mark as Paid',
                            icon: <CheckCircle2 size={15} className="text-emerald-600" />,
                          },
                      {
                        key: 'void',
                        label: 'Mark as Void',
                        icon: <Ban size={15} className="text-rose-600" />,
                        danger: true,
                      },
                    ]),
                {
                  key: 'delete',
                  label: 'Delete Salary Slip',
                  icon: <Trash2 size={15} className="text-rose-500" />,
                  danger: true,
                },
              ],
              onClick: ({ key }) => {
                if (key === 'view') {
                  setSelectedSlip(record);
                  setShowSlipModal(true);
                }
                if (key === 'taxProjection') {
                  setProjectionEmployee({
                    id: record.employeeId || record.userId,
                    userId: record.userId,
                    name: record.employeeName,
                    employeeName: record.employeeName,
                    employeeId: record.employeeId,
                    department: record.department,
                    designation: record.position,
                    totalCompensation: record.totalCompensation || record.total * 12,
                    annualCtc: record.totalCompensation || record.total * 12,
                    taxRegime: record.taxRegime || 'New Regime',
                  });
                  setShowTaxProjectionModal(true);
                }
                if (key === 'adjustment') {
                  setEditingRecord({
                    ...record,
                    payrollType: 'Adjustment',
                    referencedPeriod: record.monthYear,
                    rawRecord: {
                      ...record,
                      payrollType: 'Adjustment',
                      referencedPeriod: record.monthYear,
                      referenceSalarySlipId: record.id,
                      userId: record.userId,
                    },
                  });
                  setShowSalarySlipForm(true);
                }
                if (key === 'edit') {
                  handleEdit(record);
                }
                if (key === 'download') {
                  downloadSalarySlip(record);
                }
                if (key === 'markPending') {
                  handleStatusChange(record, 'pending');
                }
                if (key === 'markPaid') {
                  handleStatusChange(record, 'paid');
                }
                if (key === 'void') {
                  handleOpenVoidModal(record);
                }
                if (key === 'unvoid') {
                  handleUnvoid(record);
                }
                if (key === 'delete') {
                  handleDelete(record);
                }
              },
            }}>
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-500 cursor-pointer">
              <MoreHorizontal size={18} />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  const logColumns: ColumnsType<any> = [
    {
      title: 'Timestamp',
      key: 'createdAt',
      width: 190,
      render: (_, record) => (
        <span className="text-xs font-mono text-slate-600">
          {new Date(record.created_at || record.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 170,
      render: (_, record) => {
        const actionType = String(record.action || '').toUpperCase();
        const isVoid = actionType.includes('VOID');
        const isCreate = actionType.includes('CREATE');

        return (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              isVoid
                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                : isCreate
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-700'
            }`}>
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
          {record.description || record.details || 'Payroll action performed.'}
        </span>
      ),
    },
    {
      title: 'Admin / User',
      key: 'username',
      width: 170,
      render: (_, record) => (
        <span className="text-xs text-slate-600 font-semibold">{record.username || record.user || 'System'}</span>
      ),
    },
  ];

  const isSubmitting = isCreating || isUpdating || isDeleting || isCreatingAdjustment;

  return (
    <div className="flex flex-col gap-6 pb-20 w-full mx-auto p-4 sm:p-6">
      <PageHeader
        title="All Payrolls"
        description="Company-wide employee compensation distribution history, void management, and audit records."
      />

      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search slip no, employee, ID, dept..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 w-64 shadow-xs"
          />

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs shadow-xs">
            <Clock size={14} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent border-none text-xs font-semibold text-slate-700 outline-none cursor-pointer">
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending Only</option>
              <option value="Paid">Paid Only</option>
              <option value="Void">Voided Only</option>
            </select>
          </div>

          {/* Payroll Type Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs shadow-xs">
            <Filter size={14} className="text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-transparent border-none text-xs font-semibold text-slate-700 outline-none cursor-pointer">
              <option value="ALL">All Payroll Types</option>
              <option value="Regular">Regular Payroll</option>
              <option value="Adjustment">Adjustments Only</option>
            </select>
          </div>

          {/* Pay Cycle Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs shadow-xs">
            <Calendar size={14} className="text-slate-400" />
            <select
              value={cycleFilter}
              onChange={(e) => setCycleFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-700 outline-none cursor-pointer">
              <option value="ALL">All Pay Cycles</option>
              <option value="Monthly">Monthly</option>
              {companyPayrollSettings.enabledPayPeriods.semiMonthly && (
                <option value="Semi-Monthly">Semi-Monthly</option>
              )}
              {companyPayrollSettings.enabledPayPeriods.biweekly && (
                <option value="Bi-Weekly">Bi-Weekly</option>
              )}
              {companyPayrollSettings.enabledPayPeriods.weekly && (
                <option value="Weekly">Weekly</option>
              )}
              {companyPayrollSettings.enabledPayPeriods.custom && (
                <option value="Custom">Custom</option>
              )}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setProjectionEmployee(null);
              setShowTaxProjectionModal(true);
            }}
            className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-300 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-50 transition shadow-xs active:scale-95 cursor-pointer">
            <FileSpreadsheet size={15} className="text-emerald-600" />
            Tax Projection Sheet
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleCreateNew}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 transition disabled:opacity-50 shadow-xs active:scale-95 cursor-pointer">
            <Plus size={16} />
            {isSubmitting ? 'Saving...' : 'Create Salary Slip'}
          </button>
        </div>
      </div>

      <motion.div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <Table
          scroll={{ x: 'max-content' }}
          columns={columns}
          dataSource={filteredPayroll}
          loading={isFetching}
          rowKey={(record) => String(record.id || record.paySlipNo)}
          locale={{
            emptyText: isError ? 'Error fetching payroll data.' : 'No payroll records found.',
          }}
        />
      </motion.div>

      {/* 💡 Audit Logs Table at the Bottom (3-Month Retention Window & Excel/CSV Downloads) */}
      <div className="flex flex-col gap-3 mt-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">Payroll Audit Logs</h3>
            <p className="text-xs text-slate-500">
              History of salary slip updates, creations, voids, and deletions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Clock size={12} /> Stored for 3 Months Only (Since {retentionCutoffLabel})
            </span>
            <button
              type="button"
              onClick={() => exportPayrollAuditLogs(combinedPayrollLogs, 'excel')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl transition shadow-xs cursor-pointer active:scale-95">
              <FileSpreadsheet size={14} className="text-emerald-600" />
              <span>Download Excel</span>
            </button>
            <button
              type="button"
              onClick={() => exportPayrollAuditLogs(combinedPayrollLogs, 'csv')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl transition shadow-xs cursor-pointer active:scale-95">
              <Download size={14} className="text-indigo-600" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        <motion.div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <Table
            scroll={{ x: 'max-content' }}
            columns={logColumns}
            dataSource={combinedPayrollLogs}
            loading={isLogsLoading}
            rowKey={(record) => String(record.id || Math.random())}
            locale={{ emptyText: 'No payroll audit logs recorded in the last 3 months.' }}
            pagination={{ pageSize: 5 }}
          />
        </motion.div>
      </div>

      {showSalarySlipForm && (
        <SalarySlipForm
          initialValues={editingRecord?.rawRecord || editingRecord || undefined}
          isEditing={Boolean(editingRecord)}
          onClose={() => {
            setShowSalarySlipForm(false);
            setEditingRecord(null);
          }}
          onCreate={handleFormSubmit}
        />
      )}

      {showSlipModal && selectedSlip && (
        <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[900px] max-h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="font-bold text-lg text-gray-900">
                Salary Slip ({selectedSlip.employeeName} - {selectedSlip.monthYear})
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => downloadSalarySlip(selectedSlip)}
                  className="bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-gray-800 transition">
                  <Download size={16} /> Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => setShowSlipModal(false)}
                  className="border border-gray-300 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-100 transition">
                  Close
                </button>
              </div>
            </div>
            <div className="overflow-auto bg-gray-100 p-6 flex justify-center">
              <SalarySlipTemplate data={selectedSlip} />
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '794px',
          opacity: 1,
          pointerEvents: 'none',
          zIndex: -9999,
        }}>
        {selectedSlip && (
          <div ref={hiddenPdfRef} style={{ width: '794px', background: '#ffffff' }}>
            <SalarySlipTemplate data={selectedSlip} />
          </div>
        )}
      </div>

      {showTaxProjectionModal && (
        <TaxProjectionModal
          isOpen={showTaxProjectionModal}
          onClose={() => {
            setShowTaxProjectionModal(false);
            setProjectionEmployee(null);
          }}
          initialEmployee={projectionEmployee}
        />
      )}

      {showVoidModal && (
        <VoidPayrollModal
          isOpen={showVoidModal}
          record={voidingRecord}
          isLoading={isVoiding}
          onClose={() => {
            if (!isVoiding) {
              setShowVoidModal(false);
              setVoidingRecord(null);
            }
          }}
          onConfirm={handleConfirmVoid}
        />
      )}
    </div>
  );
}

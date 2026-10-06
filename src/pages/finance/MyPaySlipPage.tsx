import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  FileText,
  Eye,
  Search,
  X,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Building2,
  Briefcase,
  Calendar,
  Sparkles,
  UserCheck,
  Printer,
  Download,
} from 'lucide-react';
import { message } from 'antd';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  useGetSalarySlipByIdQuery,
  useGetAllSalarySlipsQuery,
  useLazyGetSalarySlipByIdQuery,
} from '@/store/api/financeApiSlice';
import type { SalaryBreakdownItem } from '@/store/api/financeApiSlice';
import { useGetMyPermissionsQuery } from '@/store/api/permissionSlice';
import ReactDOMServer from 'react-dom/server';

import SalarySlipTemplate from './components/SalarySlipTemplate'; 
import  type { SalarySlipData } from './components/SalarySlipTemplate'; 
// Interface for helper function payload mapping
export interface PayrollRecord {
  id: number;
  userId: number;
  base: number;
  bonus: number;
  total: number;
  date: string;
  monthYear: string;
  paySlipNo: string;
  payPeriod: string;
  companyName: string;
  companyAddress: string;
  employeeId: string;
  employeeName: string;
  position: string;
  accountNumber: string;
  paidDays: number;
  lopDays: number;
  generatedOn: string;
  earnings: Array<{ name: string; amount: number }>;
  deductions: Array<{ name: string; amount: number }>;
  authorizedSignatory: string;
  signatoryRole: string;
  hrNote: string;
}

interface RawSalarySlip {
  id?: number | string;
  employee_id?: number | string;
  employeeId?: number | string;
  user_id?: number | string;
  userId?: number | string;
  employee_name?: string;
  employeeName?: string;
  position?: string;
  base_amount?: number;
  basePay?: number;
  bonus_amount?: number;
  bonusPay?: number;
  total_amount?: number;
  net_salary?: number;
  netSalary?: number;
  total?: number;
  month_year?: string;
  monthYear?: string;
  pay_period?: string;
  payPeriod?: string;
  pay_slip_no?: string;
  paySlipNo?: string;
  account_number?: string;
  accountNumber?: string;
  paid_days?: number;
  paidDays?: number;
  lop_days?: number;
  lopDays?: number;
  earnings?: SalaryBreakdownItem[];
  deductions?: SalaryBreakdownItem[];
  authorized_signatory?: string;
  authorizedSignatory?: string;
  signatory_role?: string;
  signatoryRole?: string;
  hr_note?: string;
  hrNote?: string;
  created_at?: string;
  createdAt?: string;
  created_by_username?: string;
  createdBy?: string;
}

export interface ParsedSalarySlip {
  id: number | string;
  employeeId: number | string;
  employeeName: string;
  position: string;
  basePay: number;
  bonusPay: number;
  netSalary: number;
  monthYear: string;
  payPeriod: string;
  paySlipNo: string;
  accountNumber: string;
  paidDays: number;
  lopDays: number;
  earnings: SalaryBreakdownItem[];
  deductions: SalaryBreakdownItem[];
  authorizedSignatory?: string;
  signatoryRole?: string;
  hrNote?: string;
  createdAt: string;
  createdBy: string;
}
 

export const generateSalarySlipPdf = async (record: Partial<SalarySlipData>): Promise<Blob> => {
  // 1. Render React component template directly to static HTML string
  const htmlString = ReactDOMServer.renderToString(
    <SalarySlipTemplate data={record} />
  );

  // 2. Create off-screen container with explicit A4 width dimensions
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '794px'; // Matches style width in template
  container.style.backgroundColor = '#ffffff';

  container.innerHTML = htmlString;
  document.body.appendChild(container);

  try {
    // 3. Ensure images/SVGs inside the container are loaded before capturing
    const images = Array.from(container.querySelectorAll('img'));
    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) resolve();
            else {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }
          })
      )
    );

    // 4. Capture container with html2canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 210;
    const pdfHeight = 297;
    const imageHeight = (canvas.height * pdfWidth) / canvas.width;

    // 5. Build single page or multi-page PDF
    if (imageHeight <= pdfHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imageHeight);
    } else {
      let remainingHeight = imageHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imageHeight);
      remainingHeight -= pdfHeight;

      while (remainingHeight > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imageHeight);
        remainingHeight -= pdfHeight;
      }
    }

    return pdf.output('blob');
  } finally {
    // Clean up temporary DOM element
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

export const formatApiRecord = (item: Record<string, unknown>): PayrollRecord => {
  const rawEarnings = Array.isArray(item.earnings)
    ? (item.earnings as Array<{ name: string; amount: number }>)
    : [];
  const rawDeductions = Array.isArray(item.deductions)
    ? (item.deductions as Array<{ name: string; amount: number }>)
    : [];

  const basePay = Number(
    item.base_amount ||
      item.basePay ||
      item.base_pay ||
      rawEarnings.find((e) => e.name?.toLowerCase().includes('basic'))?.amount ||
      0
  );

  const bonusPay = Number(
    item.bonus_amount ||
      item.bonusPay ||
      item.bonus ||
      rawEarnings.find((e) => e.name?.toLowerCase().includes('bonus'))?.amount ||
      0
  );

  const netSalary = Number(item.total_amount || item.net_salary || item.netSalary || item.total || 0);
  const monthYear = String(item.month_year || item.monthYear || item.created_at || 'OCTOBER 2026');
  const position = String(item.position || item.employee_position || item.designation || 'Employee');
  const userId = Number(item.user_id || item.userId || 0);

  return {
    id: Number(item.id || Date.now()),
    userId: userId,
    base: basePay,
    bonus: bonusPay,
    total: netSalary,
    date: monthYear,

    monthYear: monthYear,
    paySlipNo: String(item.pay_slip_no || item.paySlipNo || `SLIP-${item.id || Date.now()}`),
    payPeriod: String(item.pay_period || item.payPeriod || monthYear),

    companyName: String(item.company_name || item.companyName || 'AETHERADIX'),
    companyAddress: String(
      item.company_address ||
        item.companyAddress ||
        'F-N 507, Crystal Tower, IBD Kings Park, Bhopal, MP'
    ),

    employeeId: String(item.employee_id || item.employeeId || item.user_id || '0'),
    employeeName: String(item.employee_name || item.employeeName || 'Unnamed Employee'),
    position: position,
    accountNumber: String(item.account_number || item.accountNumber || 'N/A'),

    paidDays: Number(item.paid_days || item.paidDays || 22),
    lopDays: Number(item.lop_days || item.lopDays || 0),

    generatedOn: String(
      item.generated_on || item.generatedOn || new Date().toISOString().split('T')[0]
    ),

    earnings:
      rawEarnings.length > 0
        ? rawEarnings
        : [
            { name: 'Basic Pay', amount: basePay },
            ...(bonusPay > 0 ? [{ name: 'Bonus', amount: bonusPay }] : []),
          ],
    deductions: rawDeductions,

    authorizedSignatory: String(
      item.authorized_signatory || item.authorizedSignatory || 'Seema Srivastava'
    ),
    signatoryRole: String(item.signatory_role || item.signatoryRole || '(Director)'),
    hrNote: String(
      item.hr_note ||
        item.hrNote ||
        'For any discrepancies, please contact the HR department within 3 working days.'
    ),
  };
};

export default function MyPaySlipPage() {
  const [search, setSearch] = useState('');
  const [selectedSlip, setSelectedSlip] = useState<ParsedSalarySlip | null>(null);

  // Lazy trigger query for downloading latest slip
  const [triggerGetSalarySlip] = useLazyGetSalarySlipByIdQuery();

  // 1. Fetch authenticated user details
  const { data: permissionResponse, isLoading: isPermissionsLoading } = useGetMyPermissionsQuery();
  const userDetails = permissionResponse?.data;
  const userId = userDetails?.userId;

  // 2. Primary query: Fetch salary slips specifically for this employee ID
  const {
    data: empSlipsData,
    isLoading: isEmpSlipsLoading,
    isError: isEmpError,
    refetch: refetchEmpSlips,
  } = useGetSalarySlipByIdQuery(userId!, {
    skip: !userId,
  });

  // Fallback query: Executed if employee-specific query yields no records or fails
  const shouldFetchAll = Boolean(!isEmpSlipsLoading && (isEmpError || !empSlipsData?.data?.length));

  const {
    data: allSlipsData,
    isLoading: isAllSlipsLoading,
    isError: isAllError,
    refetch: refetchAllSlips,
  } = useGetAllSalarySlipsQuery(undefined, {
    skip: !shouldFetchAll,
  });

  const isLoading = isPermissionsLoading || isEmpSlipsLoading || (shouldFetchAll && isAllSlipsLoading);
  const isError = isEmpError && isAllError;

  // 3. Download helper handler
  const handleDownload = async (slip: ParsedSalarySlip) => {
    const formattedRecord: PayrollRecord = {
      id: Number(slip.id),
      userId: Number(slip.employeeId),
      base: slip.basePay,
      bonus: slip.bonusPay,
      total: slip.netSalary,
      date: slip.monthYear,
      monthYear: slip.monthYear,
      paySlipNo: slip.paySlipNo,
      payPeriod: slip.payPeriod,
      companyName: 'AETHERADIX',
      companyAddress: 'F-N 507, Crystal Tower, IBD Kings Park, Bhopal, MP',
      employeeId: String(slip.employeeId),
      employeeName: slip.employeeName,
      position: slip.position,
      accountNumber: slip.accountNumber,
      paidDays: slip.paidDays,
      lopDays: slip.lopDays,
      generatedOn: slip.createdAt.split('T')[0],
      earnings: slip.earnings,
      deductions: slip.deductions,
      authorizedSignatory: slip.authorizedSignatory || 'Seema Srivastava',
      signatoryRole: slip.signatoryRole || '(Director)',
      hrNote: slip.hrNote || 'For any discrepancies, please contact the HR department within 3 working days.',
    };

    try {
      message.loading({ content: 'Fetching latest record from database...', key: 'dl' });

      let dbRecord = formattedRecord;

      try {
        const result = await triggerGetSalarySlip(slip.id).unwrap();
        const rawData = (result as { data?: unknown })?.data ?? result;

        if (rawData && typeof rawData === 'object') {
          dbRecord = formatApiRecord(rawData as Record<string, unknown>);
        }
      } catch (fetchErr) {
        console.warn('Single slip endpoint unavailable. Falling back to table record state:', fetchErr);
      }

      message.loading({ content: 'Generating PDF...', key: 'dl' });
      const pdfBlob = await generateSalarySlipPdf(dbRecord);

      const url = window.URL.createObjectURL(pdfBlob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `Salary-Slip-${dbRecord.employeeName.replace(/\s+/g, '_')}-${dbRecord.monthYear}.pdf`;

      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      window.URL.revokeObjectURL(url);
      message.success({ content: 'Salary slip downloaded!', key: 'dl' });
    } catch (err: unknown) {
      console.error('Download error:', err);
      message.error({ content: 'Failed to generate and download salary slip PDF.', key: 'dl' });
    }
  };

  // 4. Process and normalize raw data
  const userPayslips: ParsedSalarySlip[] = useMemo(() => {
    const rawResponse = empSlipsData ?? allSlipsData;
    const rawList: RawSalarySlip[] = rawResponse?.data || (Array.isArray(rawResponse) ? rawResponse : []);

    if (!Array.isArray(rawList)) return [];

    // Filter strictly by user ID if fallback query was used
    const userRecords = rawList.filter((item) => {
      if (!userId) return true;
      const empId = item.employee_id ?? item.employeeId ?? item.user_id ?? item.userId;
      return String(empId) === String(userId);
    });

    return userRecords.map((item): ParsedSalarySlip => {
      const earnings = Array.isArray(item.earnings) ? item.earnings : [];
      const deductions = Array.isArray(item.deductions) ? item.deductions : [];

      const basePay = Number(
        item.base_amount ??
          item.basePay ??
          earnings.find((e) => e.name?.toLowerCase().includes('basic'))?.amount ??
          0
      );

      const bonusPay = Number(
        item.bonus_amount ??
          item.bonusPay ??
          earnings.find((e) => e.name?.toLowerCase().includes('bonus'))?.amount ??
          0
      );

      const netSalary = Number(
        item.total_amount ?? item.net_salary ?? item.netSalary ?? item.total ?? 0
      );

      return {
        id: item.id || Date.now(),
        employeeId: item.employee_id ?? item.employeeId ?? item.user_id ?? userId ?? 0,
        employeeName: item.employee_name ?? item.employeeName ?? userDetails?.username ?? 'Employee',
        position: item.position || 'Staff',
        basePay,
        bonusPay,
        netSalary,
        monthYear: String(item.month_year || item.monthYear || 'N/A'),
        payPeriod: String(item.pay_period || item.payPeriod || item.month_year || 'N/A'),
        paySlipNo: String(item.pay_slip_no || item.paySlipNo || `SLIP-${item.id}`),
        accountNumber: String(item.account_number || item.accountNumber || 'N/A'),
        paidDays: Number(item.paid_days || item.paidDays || 30),
        lopDays: Number(item.lop_days || item.lopDays || 0),
        earnings,
        deductions,
        authorizedSignatory: item.authorized_signatory || item.authorizedSignatory,
        signatoryRole: item.signatory_role || item.signatoryRole,
        hrNote: item.hr_note || item.hrNote,
        createdAt: item.created_at || item.createdAt || new Date().toISOString(),
        createdBy: item.created_by_username || item.createdBy || 'HR Dept',
      };
    });
  }, [empSlipsData, allSlipsData, userId, userDetails]);

  const currentUsername = userDetails?.username || 'User';

  const formatMonthYear = useCallback((dateStr: string) => {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return dateStr;
    return parsed.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, []);

  const formatDate = useCallback((dateStr: string) => {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return dateStr;
    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  // Filtered salary slips based on query
  const filteredSlips = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return userPayslips;

    return userPayslips.filter((slip) => {
      return (
        slip.paySlipNo.toLowerCase().includes(query) ||
        slip.monthYear.toLowerCase().includes(query) ||
        slip.employeeName.toLowerCase().includes(query) ||
        String(slip.netSalary).includes(query) ||
        String(slip.id).includes(query)
      );
    });
  }, [userPayslips, search]);

  const handleRefetch = () => {
    refetchEmpSlips();
    if (shouldFetchAll) refetchAllSlips();
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-slate-500 gap-3">
        <Loader2 size={36} className="animate-spin text-slate-900" />
        <p className="text-sm font-medium text-slate-600">
          Fetching salary records from finance...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-sm">
          <AlertCircle size={28} />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900 text-lg">Failed to load salary slips</h2>
          <p className="text-xs text-slate-500 mt-1">
            Could not retrieve finance records for{' '}
            <strong className="text-slate-800">@{currentUsername}</strong>.
          </p>
        </div>
        <button
          onClick={handleRefetch}
          className="px-5 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-slate-800 transition-all shadow-sm active:scale-95">
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header Profile Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-900 text-white flex items-center justify-center font-bold text-2xl shadow-md ring-4 ring-slate-100 shrink-0">
            {currentUsername.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">@{currentUsername}</h1>
              {userDetails?.isSuperadmin && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck size={12} /> Superadmin
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <Building2 size={13} className="text-slate-400" />
                {userDetails?.department || 'Finance'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Briefcase size={13} className="text-slate-400" />
                {userDetails?.roles?.join(', ') || 'Employee'}
              </span>
              {userId && (
                <>
                  <span>•</span>
                  <span className="font-mono text-slate-700">ID: #{userId}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search slip no, month, amount..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-slate-800 focus:bg-white transition-all shadow-inner"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Salary Slips Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              My Pay Slips
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                {filteredSlips.length} Record(s)
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Statements generated via finance department
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Slip No</th>
                <th className="py-3.5 px-6">Pay Period</th>
                <th className="py-3.5 px-6">Net Salary</th>
                <th className="py-3.5 px-6">Issued By</th>
                <th className="py-3.5 px-6">Created Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSlips.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileText size={32} className="text-slate-300" />
                      <p className="text-sm font-medium text-slate-600">
                        No salary slips found.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSlips.map((slip) => (
                  <tr key={slip.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-slate-900">
                      <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                        <Sparkles size={11} className="text-slate-400" /> {slip.paySlipNo}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={15} className="text-slate-400" />
                        <span className="font-bold text-slate-900">
                          {formatMonthYear(slip.monthYear)}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-900">
                      ₹{slip.netSalary.toLocaleString('en-IN')}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                          <UserCheck size={13} />
                        </div>
                        <span className="font-medium text-slate-700">@{slip.createdBy}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500">
                      {formatDate(slip.createdAt)}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleDownload(slip)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition active:scale-95"
                          title="Download Salary Slip PDF">
                          <Download size={13} />
                          <span>PDF</span>
                        </button>
                        <button
                          onClick={() => setSelectedSlip(slip)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition active:scale-95 shadow-sm">
                          <Eye size={13} />
                          <span>View Statement</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Salary Slip Detail Modal */}
      {selectedSlip && (
        <SalarySlipDetailModal
          slip={selectedSlip}
          onClose={() => setSelectedSlip(null)}
          onDownload={() => handleDownload(selectedSlip)}
        />
      )}
    </div>
  );
}

// Detailed Pay Slip Modal Component
function SalarySlipDetailModal({
  slip,
  onClose,
  onDownload,
}: {
  slip: ParsedSalarySlip;
  onClose: () => void;
  onDownload: () => void;
}) {
  // Key listener to handle 'Escape' key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-200 p-6 space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Salary Statement: {slip.paySlipNo}</h3>
            <p className="text-xs text-slate-500">
              Period: {slip.monthYear} | Employee: {slip.employeeName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition active:scale-95 shadow-sm"
              title="Download PDF">
              <Download size={14} />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Print Payslip">
              <Printer size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
              aria-label="Close modal">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl text-xs">
            <div>
              <span className="text-slate-400 block">Base Pay</span>
              <span className="font-bold text-slate-800 text-sm">
                ₹{slip.basePay.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Bonus</span>
              <span className="font-bold text-slate-800 text-sm">
                ₹{slip.bonusPay.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Net Salary</span>
              <span className="font-bold text-emerald-600 text-sm">
                ₹{slip.netSalary.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Account No</span>
              <span className="font-mono text-slate-800">{slip.accountNumber}</span>
            </div>
          </div>

          {/* Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                Earnings
              </h4>
              <div className="bg-emerald-50/40 rounded-2xl p-3 space-y-2 border border-emerald-100/60">
                {slip.earnings.length > 0 ? (
                  slip.earnings.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-xs py-1 border-b border-emerald-100/40 last:border-0">
                      <span className="text-slate-700">{item.name}</span>
                      <span className="font-bold text-slate-900">
                        ₹{Number(item.amount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No additional earnings</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">
                Deductions
              </h4>
              <div className="bg-red-50/40 rounded-2xl p-3 space-y-2 border border-red-100/60">
                {slip.deductions.length > 0 ? (
                  slip.deductions.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-xs py-1 border-b border-red-100/40 last:border-0">
                      <span className="text-slate-700">{item.name}</span>
                      <span className="font-bold text-slate-900">
                        ₹{Number(item.amount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No deductions applied</p>
                )}
              </div>
            </div>
          </div>

          {/* Signatory & Notes */}
          {(slip.authorizedSignatory || slip.hrNote) && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
              {slip.authorizedSignatory && (
                <p className="text-slate-600">
                  <strong className="text-slate-800">Authorized Signatory:</strong>{' '}
                  {slip.authorizedSignatory} ({slip.signatoryRole || 'HR'})
                </p>
              )}
              {slip.hrNote && (
                <p className="text-slate-600">
                  <strong className="text-slate-800">HR Note:</strong> {slip.hrNote}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
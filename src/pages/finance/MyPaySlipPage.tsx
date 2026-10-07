import { useState, useMemo, useCallback } from 'react';
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
  Download,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { message } from 'antd';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  useGetSalarySlipByIdQuery,
  useGetAllSalarySlipsQuery,
  useLazyGetSalarySlipByIdQuery,
} from '@/store/api/financeApiSlice';
import type { SalaryBreakdownItem } from '@/store/api/financeApiSlice';
import ReactDOMServer from 'react-dom/server';

import SalarySlipTemplate from './components/SalarySlipTemplate';
import type { SalarySlipData } from './components/SalarySlipTemplate';

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

// Deep utility helper to find key values in deeply nested objects or wrappers
const findDeepValue = (obj: any, keys: string[]): any => {
  if (!obj || typeof obj !== 'object') return undefined;
  for (const key of keys) {
    if (
      obj[key] !== undefined &&
      obj[key] !== null &&
      obj[key] !== '' &&
      obj[key] !== 'null'
    ) {
      return obj[key];
    }
  }
  for (const prop in obj) {
    if (obj[prop] && typeof obj[prop] === 'object' && !Array.isArray(obj[prop])) {
      const found = findDeepValue(obj[prop], keys);
      if (found !== undefined && found !== null && found !== '' && found !== 'null') return found;
    }
  }
  return undefined;
};

// Safe number parser handling string floats ("0.00", "22.0", null)
const parseNum = (val: any): number => {
  if (val === undefined || val === null) return 0;
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

// Helper function to render React component template directly to PDF
export const generateSalarySlipPdf = async (record: Partial<SalarySlipData>): Promise<Blob> => {
  const htmlString = ReactDOMServer.renderToString(<SalarySlipTemplate data={record} />);

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '794px';
  container.style.backgroundColor = '#ffffff';

  container.innerHTML = htmlString;
  document.body.appendChild(container);

  try {
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
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

// Converts raw API payload into a clean, normalized PayrollRecord object
export const formatApiRecord = (item: Record<string, unknown>): PayrollRecord => {
  const employeeName = String(
    findDeepValue(item, ['username', 'employeeName', 'employee_name', 'name', 'full_name']) ||
      'Unnamed Employee'
  ).trim();

  const position = String(
    findDeepValue(item, ['designation', 'position', 'employee_position', 'role']) || 'Employee'
  );

  const userId = Number(findDeepValue(item, ['user_id', 'userId', 'employeeId', 'employee_code']) || 0);

  const paidDays = parseNum(
    findDeepValue(item, ['days_worked', 'paidDays', 'paid_days', 'total_working_days']) || 22
  );
  const lopDays = parseNum(findDeepValue(item, ['leave_days', 'lopDays', 'lop_days']) || 0);

  // Parse pay period month and year into "OCTOBER 2026" format
  const rawMonth = findDeepValue(item, ['pay_period_month', 'month']);
  const rawYear = findDeepValue(item, ['pay_period_year', 'year']);
  let monthYear = 'OCTOBER 2026';

  if (rawMonth && rawYear) {
    const monthNames = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    const mIdx = parseNum(rawMonth) - 1;
    if (mIdx >= 0 && mIdx < 12) {
      monthYear = `${monthNames[mIdx]} ${rawYear}`;
    }
  } else {
    monthYear = String(
      findDeepValue(item, ['monthYear', 'month_year', 'payPeriod', 'pay_period', 'created_at']) ||
        'OCTOBER 2026'
    );
  }

  // Parse monetary fields
  const basicSalary = parseNum(findDeepValue(item, ['basic_salary', 'basePay', 'base_amount', 'base_pay', 'base']));
  const hra = parseNum(findDeepValue(item, ['house_rent_allowance', 'hra']));
  const specialAllowance = parseNum(findDeepValue(item, ['special_allowance']));
  const conveyance = parseNum(findDeepValue(item, ['conveyance_allowance']));
  const bonus = parseNum(findDeepValue(item, ['bonus', 'bonusPay', 'bonus_amount']));
  const otherEarnings = parseNum(findDeepValue(item, ['other_earnings']));
  const grossSalary = parseNum(findDeepValue(item, ['gross_salary', 'total_amount', 'totalSalary']));

  const pf = parseNum(findDeepValue(item, ['provident_fund']));
  const profTax = parseNum(findDeepValue(item, ['professional_tax']));
  const tds = parseNum(findDeepValue(item, ['income_tax_tds']));
  const otherDeductions = parseNum(findDeepValue(item, ['other_deductions']));
  const netSalary = parseNum(findDeepValue(item, ['net_salary', 'netSalary', 'total']));

  // Build itemized earnings list
  const rawEarnings = (findDeepValue(item, ['earnings']) as Array<{ name: string; amount: number }>) || [];
  let constructedEarnings = rawEarnings;

  if (constructedEarnings.length === 0) {
    constructedEarnings = [
      { name: 'Basic Salary', amount: basicSalary },
      ...(hra > 0 ? [{ name: 'House Rent Allowance (HRA)', amount: hra }] : []),
      ...(specialAllowance > 0 ? [{ name: 'Special Allowance', amount: specialAllowance }] : []),
      ...(conveyance > 0 ? [{ name: 'Conveyance Allowance', amount: conveyance }] : []),
      ...(bonus > 0 ? [{ name: 'Bonus', amount: bonus }] : []),
      ...(otherEarnings > 0 ? [{ name: 'Other Earnings', amount: otherEarnings }] : []),
    ];
  }

  // Build itemized deductions list
  const rawDeductions = (findDeepValue(item, ['deductions']) as Array<{ name: string; amount: number }>) || [];
  let constructedDeductions = rawDeductions;

  if (constructedDeductions.length === 0) {
    constructedDeductions = [
      ...(pf > 0 ? [{ name: 'Provident Fund (PF)', amount: pf }] : []),
      ...(profTax > 0 ? [{ name: 'Professional Tax (PT)', amount: profTax }] : []),
      ...(tds > 0 ? [{ name: 'Income Tax (TDS)', amount: tds }] : []),
      ...(otherDeductions > 0 ? [{ name: 'Other Deductions', amount: otherDeductions }] : []),
    ];
  }

  return {
    id: Number(findDeepValue(item, ['id']) || Date.now()),
    userId: userId,
    base: basicSalary,
    bonus: bonus,
    total: netSalary || grossSalary || basicSalary + bonus,
    date: monthYear,
    monthYear: monthYear,
    paySlipNo: String(
      findDeepValue(item, ['pay_slip_no', 'paySlipNo', 'employee_code']) || `SLIP-${findDeepValue(item, ['id']) || Date.now()}`
    ),
    payPeriod: monthYear,
    companyName: String(findDeepValue(item, ['company_name', 'companyAddress']) || 'AETHERADIX'),
    companyAddress: String(
      findDeepValue(item, ['company_address', 'companyAddress']) ||
        'F-N 507, Crystal Tower, IBD Kings Park, Bhopal, MP'
    ),
    employeeId: String(findDeepValue(item, ['employee_code', 'employee_id', 'employeeId', 'user_id']) || userId),
    employeeName: employeeName,
    position: position,
    accountNumber: String(findDeepValue(item, ['bank_account_number', 'account_number', 'accountNumber']) || 'N/A'),
    paidDays: paidDays,
    lopDays: lopDays,
    generatedOn: String(
      findDeepValue(item, ['payment_date', 'created_at', 'generated_on', 'generatedOn']) ||
        new Date().toISOString().split('T')[0]
    ),
    earnings: constructedEarnings,
    deductions: constructedDeductions,
    authorizedSignatory: String(findDeepValue(item, ['authorized_signatory', 'authorizedSignatory']) || 'Seema Srivastava'),
    signatoryRole: String(findDeepValue(item, ['signatory_role', 'signatoryRole']) || '(Director)'),
    hrNote: String(
      findDeepValue(item, ['hr_note', 'hrNote', 'remarks']) ||
        'For any discrepancies, please contact the HR department within 3 working days.'
    ),
  };
};

export default function MyPaySlipPage() {
  const [search, setSearch] = useState('');
  const [selectedSlip, setSelectedSlip] = useState<ParsedSalarySlip | null>(null);
  
  // Extract user details directly from useAuth hook
  const { user } = useAuth();
  const userId = user?.id;

  const [triggerGetSalarySlip] = useLazyGetSalarySlipByIdQuery();

  const {
    data: empSlipsData,
    isLoading: isEmpSlipsLoading,
    isError: isEmpError,
    refetch: refetchEmpSlips,
  } = useGetSalarySlipByIdQuery(userId!, {
    skip: !userId,
  });

  const shouldFetchAll = Boolean(!isEmpSlipsLoading && (isEmpError || !empSlipsData?.data?.length));

  const {
    data: allSlipsData,
    isLoading: isAllSlipsLoading,
    isError: isAllError,
    refetch: refetchAllSlips,
  } = useGetAllSalarySlipsQuery(undefined, {
    skip: !shouldFetchAll,
  });

  const isLoading = isEmpSlipsLoading || (shouldFetchAll && isAllSlipsLoading);
  const isError = isEmpError && isAllError;

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
      hrNote:
        slip.hrNote ||
        'For any discrepancies, please contact the HR department within 3 working days.',
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

  const userPayslips: ParsedSalarySlip[] = useMemo(() => {
    const rawResponse = empSlipsData ?? allSlipsData;
    const rawList: Record<string, unknown>[] =
      rawResponse?.data
        ? Array.isArray(rawResponse.data)
          ? rawResponse.data
          : [rawResponse.data]
        : Array.isArray(rawResponse)
        ? rawResponse
        : [];

    if (!Array.isArray(rawList)) return [];

    const userRecords = rawList.filter((item) => {
      if (!userId) return true;
      const empId = findDeepValue(item, ['user_id', 'userId', 'employee_id', 'employeeId', 'employee_code']);
      return !empId || String(empId) === String(userId);
    });

    return userRecords.map((item): ParsedSalarySlip => {
      const formatted = formatApiRecord(item);

      return {
        id: formatted.id,
        employeeId: formatted.employeeId,
        employeeName: formatted.employeeName,
        position: formatted.position,
        basePay: formatted.base,
        bonusPay: formatted.bonus,
        netSalary: formatted.total,
        monthYear: formatted.monthYear,
        payPeriod: formatted.payPeriod,
        paySlipNo: formatted.paySlipNo,
        accountNumber: formatted.accountNumber,
        paidDays: formatted.paidDays,
        lopDays: formatted.lopDays,
        earnings: formatted.earnings,
        deductions: formatted.deductions,
        authorizedSignatory: formatted.authorizedSignatory,
        signatoryRole: formatted.signatoryRole,
        hrNote: formatted.hrNote,
        createdAt: formatted.generatedOn,
        createdBy: String(findDeepValue(item, ['created_by_username', 'createdBy']) || 'HR Dept'),
      };
    });
  }, [empSlipsData, allSlipsData, userId]);

  const currentUsername = user?.username || 'User';

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
          className="px-5 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-slate-800 transition-all shadow-sm active:scale-95"
        >
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
              {user?.role === 'SuperAdmin' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck size={12} /> Superadmin
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <Building2 size={13} className="text-slate-400" />
                {user?.department || 'Finance'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Briefcase size={13} className="text-slate-400" />
                {user?.role || 'Employee'}
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
              aria-label="Clear search"
            >
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
                <th className="py-3.5 px-6">Base Salary</th>
                <th className="py-3.5 px-6">Net Salary</th>
                <th className="py-3.5 px-6">Days Worked</th>
                <th className="py-3.5 px-6">Created Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSlips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileText size={32} className="text-slate-300" />
                      <p className="text-sm font-medium text-slate-600">No salary slips found.</p>
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

                    <td className="py-4 px-6 font-semibold text-slate-700">
                      ₹{slip.basePay.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-4 px-6 font-bold text-emerald-600">
                      ₹{slip.netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600">
                      <span className="font-medium text-slate-800">{slip.paidDays}</span> Days
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500">
                      {formatDate(slip.createdAt)}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setSelectedSlip(slip)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition active:scale-95"
                          title="View Details"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleDownload(slip)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition active:scale-95 shadow-sm"
                          title="Download Salary Slip PDF"
                        >
                          <Download size={13} />
                          <span>PDF</span>
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

      {/* Detail Modal Preview */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="font-bold text-lg text-slate-900">
                Salary Slip ({selectedSlip.monthYear})
              </h3>
              <button
                onClick={() => setSelectedSlip(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block">Employee Name</span>
                <span className="font-bold text-slate-800">{selectedSlip.employeeName}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block">Designation</span>
                <span className="font-bold text-slate-800">{selectedSlip.position}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block">Base Pay</span>
                <span className="font-bold text-slate-800">₹{selectedSlip.basePay.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block">Net Salary</span>
                <span className="font-bold text-emerald-600">₹{selectedSlip.netSalary.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setSelectedSlip(null)}
                className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
              <button
                onClick={() => handleDownload(selectedSlip)}
                className="px-4 py-2 bg-slate-900 rounded-xl text-xs font-semibold text-white hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
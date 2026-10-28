import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
  Building2,
  User,
  Calendar,
  IndianRupee,
  UserCheck,
  Loader2,
  ChevronDown,
  ChevronUp,
  Search,
  Calculator,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';
import { useGetUsersQuery } from '@/store/api/userSlice';
import {
  useGetAllSalarySlipsQuery,
  useLazyGetSalarySlipByIdQuery,
  useLazyGetEmployeeCompensationQuery,
  usePreviewEmployeeCompensationMutation,
} from '@/store/api/financeApiSlice';
import { useSelector } from 'react-redux'; // Added to access current logged-in user if available
import { useAuth } from '@/hooks/useAuth';
import type { PayrollRecord } from '../PayrollPage';
import { getStoredPayrollSettings } from '@/types/payrollSettings';
import { calculateTaxForEmployee, type TaxCalculationResult } from '@/utils/taxCalculation';
import { TaxProjectionModal } from './TaxProjectionModal';

import { Input } from '@/components/ui/composed/Input';
import { generateSlipNumber, formatEmployeeCode, parseSlipNumber } from '@/utils/payroll';
export { generateSlipNumber, formatEmployeeCode, parseSlipNumber } from '@/utils/payroll';
export interface EarningsItem {
  name: string;
  amount: number;
}

export interface DeductionItem {
  name: string;
  amount: number;
}

export type PayCycleOption = 'Monthly' | 'Semi-Monthly' | 'Bi-Weekly' | 'Weekly' | 'Custom';
export type PayrollTypeOption = 'Regular' | 'Adjustment';

export interface SalarySlipData {
  monthYear: string;
  paySlipNo: string;
  payPeriod: string;
  payCycle?: PayCycleOption;
  payrollType?: PayrollTypeOption;
  adjustmentType?: string;
  adjustmentAmount?: number;
  adjustmentReason?: string;
  referencedPeriod?: string;
  referencePeriod?: string;
  referenceSalarySlipId?: number | string;
  adjustmentNotes?: string;
  cyclePart?: number;
  customStartDate?: string;
  customEndDate?: string;

  companyName: string;
  companyAddress: string;
  department?: string | null;

  userId: number | string; // ID of logged-in user creating the slip
  employeeId: number | string; // ID of selected employee
  employeeName: string;
  position: string;
  accountNumber: string;
  baseSalary?: number | string;
  totalCompensation?: number | string;
  taxRegime?: 'New Regime' | 'Old Regime';
  panNumber?: string;
  total?: number;
  netSalary?: number;

  paidDays: number;
  lopDays: number;

  generatedOn: string;

  earnings: EarningsItem[];
  deductions: DeductionItem[];

  authorizedSignatory: string;
  signatoryRole: string;

  hrNote: string;
  paymentStatus?: string;
}

interface SalarySlipFormProps {
  initialValues?: Record<string, any> | PayrollRecord;
  isEditing?: boolean;
  onClose: () => void;
  onCreate: (data: any) => Promise<void>;
  fetchUsers?: (query?: string) => Promise<any[]>;
}

interface SectionTitleProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ icon, title, description }) => (
  <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
    <div className="p-2 bg-gray-100 text-gray-800 rounded-xl">{icon}</div>
    <div>
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  </div>
);

const getEmployeeName = (user: any): string => {
  if (!user) return '';
  if (typeof user === 'string') return user;

  if (user.employeeName) return String(user.employeeName);
  if (user.name) return String(user.name);
  if (user.fullName) return String(user.fullName);
  if (user.displayName) return String(user.displayName);

  if (user.firstName || user.lastName) {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }

  if (user.user && typeof user.user === 'object') {
    const nestedName = getEmployeeName(user.user);
    if (nestedName) return nestedName;
  }

  if (user.username) return String(user.username);
  if (user.email) return String(user.email).split('@')[0];

  const fallbackId = user.employeeId ?? user.id ?? user._id;
  return fallbackId !== undefined && fallbackId !== null ? String(fallbackId) : 'Employee';
};

const extractUserArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.users)) return data.users;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.results)) return data.results;
  if (data && Array.isArray(data.employees)) return data.employees;
  return [];
};

const getLocalSystemDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get total days in a given month and year
const getDaysInMonth = (year: number, monthIndex: number): number => {
  return new Date(year, monthIndex + 1, 0).getDate();
};

// Helper to format date as DD Month YYYY (e.g., "01 October 2026")
const formatDateFormatted = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const monthName = date.toLocaleString('en-US', { month: 'long' });
  return `${day} ${monthName}`;
};

// Helper to calculate pay period dates based on cycle
const calculatePayPeriod = (
  monthName: string,
  yearStr: string,
  cycle: PayCycleOption = 'Monthly',
  periodPart: number = 1,
  customStart?: string,
  customEnd?: string
): string => {
  if (cycle === 'Custom') {
    if (customStart && customEnd) {
      const s = new Date(customStart);
      const e = new Date(customEnd);
      return `${formatDateFormatted(s)} - ${formatDateFormatted(e)}`;
    }
    return 'Custom Pay Period';
  }

  const months = [
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
  const monthIndex = months.indexOf(monthName.toUpperCase());
  if (monthIndex === -1) return '';

  const year = parseInt(yearStr, 10);
  const totalDays = getDaysInMonth(year, monthIndex);

  if (cycle === 'Weekly') {
    const part = Math.max(1, Math.min(5, periodPart));
    const startDay = (part - 1) * 7 + 1;
    const endDay = part === 5 ? totalDays : Math.min(totalDays, part * 7);
    const startDate = new Date(year, monthIndex, startDay);
    const endDate = new Date(year, monthIndex, endDay);
    return `Week ${part}: ${formatDateFormatted(startDate)} - ${formatDateFormatted(endDate)}`;
  }

  if (cycle === 'Bi-Weekly') {
    if (periodPart === 1) {
      const startDate = new Date(year, monthIndex, 1);
      const endDate = new Date(year, monthIndex, 14);
      return `${formatDateFormatted(startDate)} - ${formatDateFormatted(endDate)}`;
    } else {
      const startDate = new Date(year, monthIndex, 15);
      const endDate = new Date(year, monthIndex, totalDays);
      return `${formatDateFormatted(startDate)} - ${formatDateFormatted(endDate)}`;
    }
  }

  if (cycle === 'Semi-Monthly') {
    if (periodPart === 1) {
      const startDate = new Date(year, monthIndex, 1);
      const endDate = new Date(year, monthIndex, 15);
      return `1st Half: ${formatDateFormatted(startDate)} - ${formatDateFormatted(endDate)}`;
    } else {
      const startDate = new Date(year, monthIndex, 16);
      const endDate = new Date(year, monthIndex, totalDays);
      return `2nd Half: ${formatDateFormatted(startDate)} - ${formatDateFormatted(endDate)}`;
    }
  }

  // Monthly
  const startDate = new Date(year, monthIndex, 1);
  const endDate = new Date(year, monthIndex, totalDays);
  return `${formatDateFormatted(startDate)} - ${formatDateFormatted(endDate)}`;
};

const getInitialForm = (): SalarySlipData => {
  const storedSettings = getStoredPayrollSettings();
  const today = new Date();
  const year = today.getFullYear();
  const monthIndex = today.getMonth(); // 0 - 11
  const monthNameUpper = today.toLocaleString('en-US', { month: 'long' }).toUpperCase();
  const totalDays = getDaysInMonth(year, monthIndex);

  // Default Pay Cycle from Master Settings
  const defaultCycle: PayCycleOption =
    storedSettings.defaultPayPeriod === 'semi-monthly'
      ? 'Semi-Monthly'
      : storedSettings.defaultPayPeriod === 'biweekly'
        ? 'Bi-Weekly'
        : storedSettings.defaultPayPeriod === 'weekly'
          ? 'Weekly'
          : storedSettings.defaultPayPeriod === 'custom'
            ? 'Custom'
            : 'Monthly';

  const monthYear = `${monthNameUpper} ${year}`;
  const payPeriod = calculatePayPeriod(monthNameUpper, String(year), defaultCycle, 1);
  const paySlipNo = ''; // Will only be generated after employee selection and proper form filling

  const defaultPaidDays =
    defaultCycle === 'Weekly'
      ? 7
      : defaultCycle === 'Semi-Monthly' || defaultCycle === 'Bi-Weekly'
        ? 15
        : totalDays;

  return {
    monthYear,
    paySlipNo,
    payPeriod,
    payCycle: defaultCycle,
    payrollType: 'Regular',
    adjustmentType: 'wrong_rate',
    adjustmentAmount: 0,
    adjustmentReason: '',
    referencedPeriod: '',
    referencePeriod: '',
    referenceSalarySlipId: '',
    adjustmentNotes: '',
    cyclePart: 1,

    companyName: 'AETHERADIX',
    companyAddress: 'F-N 507, Crystal Tower, IBD Kings Park, Bawadia Kalan, Bhopal, MP | 462039',

    userId: '',
    employeeId: '',
    employeeName: '',
    position: '',
    accountNumber: '',
    baseSalary: 0,
    totalCompensation: '',
    taxRegime: storedSettings.defaultTaxRegime,

    paidDays: defaultPaidDays,
    lopDays: 0,

    paymentStatus: 'pending',

    generatedOn: getLocalSystemDate(),

    earnings: [
      { name: 'Basic Pay', amount: 0 },
      { name: 'House Rent Allowance (HRA)', amount: 0 },
      { name: 'Special Allowance', amount: 0 },
      { name: 'Bonus', amount: 0 },
    ],

    deductions: [
      { name: 'Provident Fund (PF)', amount: 0 },
      { name: 'Professional Tax', amount: 200 },
      { name: 'Income Tax (TDS)', amount: 0 },
      { name: 'Other Deductions', amount: 0 },
    ],

    authorizedSignatory: 'Seema Srivastava',
    signatoryRole: '(Director)',

    hrNote: 'For any discrepancies, please contact the HR department within 3 working days.',
  };
};

const SalarySlipForm = ({
  onClose,
  onCreate,
  fetchUsers,
  initialValues,
  isEditing = false,
}: SalarySlipFormProps) => {
  const loggedInUser = useSelector((state: any) => state.auth?.user || state.user?.currentUser);
  const { user } = useAuth();
  const [formData, setFormData] = useState<SalarySlipData>(() => {
    const initial = getInitialForm();
    if (loggedInUser) {
      initial.userId = loggedInUser.id || loggedInUser._id || loggedInUser.userId || '';
    }
    return initial;
  });

  const [slipSequence, setSlipSequence] = useState<number>(1);
  const [biWeeklyPeriod, setBiWeeklyPeriod] = useState<1 | 2>(1);
  const [cyclePeriodPart, setCyclePeriodPart] = useState<number>(1);
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [selectedEmployeeObj, setSelectedEmployeeObj] = useState<any>(null);
  const [showTaxProjectionModal, setShowTaxProjectionModal] = useState<boolean>(false);
  const [showTaxCalculator, setShowTaxCalculator] = useState<boolean>(true);
  const [deductIncomeTax, setDeductIncomeTax] = useState<boolean>(() => {
    if (initialValues) {
      const raw = initialValues as Record<string, any>;
      const existingTds = Number(raw.income_tax_tds || raw.incomeTaxTds || 0);
      if (existingTds > 0) return true;
      if (Array.isArray(initialValues.deductions)) {
        const found = initialValues.deductions.find((d: any) =>
          /tax|tds/i.test(d.name || '')
        );
        return Number(found?.amount || 0) > 0;
      }
    }
    return false;
  });
  const companyPayrollSettings = useMemo(() => getStoredPayrollSettings(), []);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: rtkUsersData, isLoading: isRtkLoading } = useGetUsersQuery(undefined, {
    skip: !!fetchUsers,
  });
  const { data: allSalarySlipsData } = useGetAllSalarySlipsQuery();
  const [getSlipsByEmpId] = useLazyGetSalarySlipByIdQuery();
  const [fetchCompensation, { isLoading: isFetchingCompensation }] =
    useLazyGetEmployeeCompensationQuery();
  const [previewCompensation, { isLoading: isPreviewingCompensation }] =
    usePreviewEmployeeCompensationMutation();

  const [customUsersList, setCustomUsersList] = useState<any[]>([]);
  const [isCustomLoading, setIsCustomLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!fetchUsers) return;
    let isMounted = true;
    setIsCustomLoading(true);

    const timer = setTimeout(async () => {
      try {
        const data = await fetchUsers(searchTerm);
        if (isMounted) {
          setCustomUsersList(extractUserArray(data));
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        if (isMounted) setIsCustomLoading(false);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchTerm, fetchUsers]);

  // Use a ref to ensure initialValues only populates the form once on mount
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!initialValues || hasInitializedRef.current) return;
    hasInitializedRef.current = true; // Lock it

    // Local type-safe alias to access raw database snake_case properties
    const raw = initialValues as Record<string, any>;

    // 1. Safe Recipient ID Parsing
    const recipientId =
      raw.user_id ?? initialValues.userId ?? raw.employee_code ?? initialValues.employeeId ?? 0;

    // 2. Local Fallbacks
    const monthsList = [
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
    const now = new Date();
    const fallbackYear = String(now.getFullYear());
    const fallbackMonth = monthsList[now.getMonth()];

    let monthVal = fallbackMonth;
    let yearVal = fallbackYear;

    // 3. Month & Year Extraction
    if (raw.pay_period_month && raw.pay_period_year) {
      const mIdx = Number(raw.pay_period_month) - 1;
      if (mIdx >= 0 && mIdx < 12) monthVal = monthsList[mIdx];
      yearVal = String(raw.pay_period_year);
    } else if (initialValues.monthYear || initialValues.payPeriod) {
      const parts = String(initialValues.monthYear || initialValues.payPeriod)
        .trim()
        .split(' ');
      if (parts.length >= 2) {
        monthVal = parts[0].toUpperCase();
        yearVal = parts[1];
      }
    }

    // 4. Pay Cycle & Cycle Number
    const rawCycle = raw.pay_frequency || initialValues.payPeriod;
    const cycle = rawCycle
      ? String(rawCycle).toLowerCase().includes('bi')
        ? 'Bi-Weekly'
        : 'Monthly'
      : 'Bi-Weekly';

    const cycleNum = (Number(raw.cycle_number) || 1) as 1 | 2;
    setBiWeeklyPeriod(cycleNum);

    // 5. Employee Details & Search Term (Only set initial search term if editing an existing slip)
    const empName = initialValues.employeeName || raw.username || raw.employee_name || '';
    if (empName) {
      setSearchTerm(empName);
    }

    // 6. Safe Date Formatting for HTML <input type="date" />
    const rawDate = raw.payment_date || raw.paymentDate || initialValues.generatedOn;
    const formattedDate = rawDate
      ? new Date(rawDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    // 7. Dynamic Pay Period Fallback
    const computedPayPeriod =
      initialValues.payPeriod ||
      (typeof calculatePayPeriod === 'function'
        ? calculatePayPeriod(monthVal, yearVal, cycle, cycleNum)
        : `${monthVal} ${yearVal}`);

    // 8. Financial Breakdown
    const basePay = Number(raw.basic_salary || initialValues.base || 0);
    const hraPay = Number(raw.house_rent_allowance || raw.hra || 0);
    const specialPay = Number(raw.special_allowance || 0);
    const conveyancePay = Number(raw.conveyance_allowance || 0);
    const bonusPay = Number(raw.bonus || initialValues.bonus || 0);
    const otherEarnPay = Number(raw.other_earnings || 0);

    const parsedEarnings =
      Array.isArray(initialValues.earnings) && initialValues.earnings.length > 0
        ? initialValues.earnings
        : [
            { name: 'Basic Pay', amount: basePay },
            ...(hraPay > 0 ? [{ name: 'HRA', amount: hraPay }] : []),
            ...(specialPay > 0 ? [{ name: 'Special Allowance', amount: specialPay }] : []),
            ...(conveyancePay > 0 ? [{ name: 'Conveyance', amount: conveyancePay }] : []),
            ...(bonusPay > 0 ? [{ name: 'Bonus', amount: bonusPay }] : []),
            ...(otherEarnPay > 0 ? [{ name: 'Other Earnings', amount: otherEarnPay }] : []),
          ];

    const pfDeduct = Number(raw.provident_fund || 0);
    const ptDeduct = Number(raw.professional_tax || 0);
    const tdsDeduct = Number(raw.income_tax_tds || 0);
    const otherDeduct = Number(raw.other_deductions || 0);

    const parsedDeductions =
      Array.isArray(initialValues.deductions) && initialValues.deductions.length > 0
        ? initialValues.deductions
        : [
            ...(pfDeduct > 0 ? [{ name: 'Provident Fund (PF)', amount: pfDeduct }] : []),
            ...(ptDeduct > 0 ? [{ name: 'Professional Tax (PT)', amount: ptDeduct }] : []),
            ...(tdsDeduct > 0 ? [{ name: 'TDS', amount: tdsDeduct }] : []),
            ...(otherDeduct > 0 ? [{ name: 'Other Deductions', amount: otherDeduct }] : []),
          ];

    // Generate proper professional slip number
    const empCode = String(raw.employee_code || initialValues.employeeId || '');
    const defaultMonthYear = `${monthVal} ${yearVal}`;
    const initialSlipNo = String(raw.pay_slip_no || initialValues.paySlipNo || '');
    const parsedSlip = parseSlipNumber(initialSlipNo);
    const initialSlipSeq = parsedSlip?.sequence || 1;
    setSlipSequence(initialSlipSeq);

    const generatedSlipNo = empCode ? generateSlipNumber(empCode, defaultMonthYear, initialSlipSeq) : '';

    // 9. Update Form State
    setFormData({
      userId: Number(recipientId) || 0,
      employeeId: empCode,
      employeeName: String(empName || ''),
      position: String(raw.designation || initialValues.position || ''),
      department: String(initialValues.department || ''),
      accountNumber: String(
        raw.bank_account_number ||
          raw.bankAccountNumber ||
          raw.account_number ||
          raw.accountNumber ||
          initialValues.accountNumber ||
          ''
      ),
      baseSalary: basePay,
      payCycle: cycle as 'Bi-Weekly' | 'Monthly',
      monthYear: defaultMonthYear,
      payPeriod: String(computedPayPeriod || ''),
      paySlipNo: initialSlipNo || (isEditing && generatedSlipNo ? generatedSlipNo : ''),
      companyName: String(initialValues.companyName || 'AETHERADIX'),
      companyAddress: String(
        initialValues.companyAddress || 'F-N 507, Crystal Tower, IBD Kings Park, Bhopal, MP'
      ),
      paidDays: Number(raw.days_worked ?? raw.paid_days ?? initialValues.paidDays ?? 30),
      lopDays: Number(raw.leave_days ?? raw.lop_days ?? initialValues.lopDays ?? 0),
      earnings: parsedEarnings,
      deductions: parsedDeductions,
      generatedOn: String(formattedDate),
      hrNote: String(
        raw.hr_note ||
          raw.hrNote ||
          raw.remarks ||
          initialValues.hrNote ||
          'For any discrepancies, please contact the HR department within 3 working days.'
      ),
      authorizedSignatory: String(
        raw.authorized_signatory ||
          raw.authorizedSignatory ||
          initialValues.authorizedSignatory ||
          'Seema Srivastava'
      ),
      signatoryRole: String(
        raw.signatory_role ||
          raw.signatoryRole ||
          initialValues.signatoryRole ||
          '(Director)'
      ),
      paymentStatus: String(raw.payment_status || raw.paymentStatus || initialValues.paymentStatus || 'pending').toLowerCase(),
    });

    const hasTds =
      tdsDeduct > 0 ||
      parsedDeductions.some(
        (d: any) => /tax|tds/i.test(d.name || '') && Number(d.amount || 0) > 0
      );
    setDeductIncomeTax(hasTds);
  }, [initialValues]);

  const months: string[] = [
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

  // Generate years (e.g., current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const updateField = (field: keyof SalarySlipData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  const getNextSequenceForEmployee = (
    empCode: string,
    targetMonthYear: string,
    existingSlips: any[]
  ): number => {
    if (!empCode || !Array.isArray(existingSlips)) return 1;
    const cleanCode = formatEmployeeCode(empCode);

    const parts = targetMonthYear.trim().split(/[\s\/\-]+/).filter(Boolean);
    let targetMonth = 0;
    let targetYear = 0;
    for (const p of parts) {
      const num = Number(p);
      if (!isNaN(num)) {
        if (num >= 1900 && num <= 2100) targetYear = num;
        else if (num >= 1 && num <= 12) targetMonth = num;
      } else {
        const idx = months.findIndex(
          (m) => m === p.toUpperCase() || m.startsWith(p.toUpperCase().slice(0, 3))
        );
        if (idx !== -1) targetMonth = idx + 1;
      }
    }

    const mm = String(targetMonth).padStart(2, '0');
    const yy = String(targetYear).slice(-2);

    let maxSeq = 0;
    for (const s of existingSlips) {
      const sCode = formatEmployeeCode(
        s.employee_code || s.employeeCode || s.employee_id || s.employeeId || s.user_id
      );
      if (sCode !== cleanCode) continue;

      const sNo = String(s.pay_slip_no || s.paySlipNo || '');
      const parsed = parseSlipNumber(sNo);
      if (parsed) {
        if (parsed.month === mm && parsed.year === yy && parsed.sequence > maxSeq) {
          maxSeq = parsed.sequence;
        }
      }
    }

    return maxSeq > 0 ? maxSeq + 1 : 1;
  };

  const handleSlipSequenceChange = (newSeq: number | string) => {
    const num = Math.max(1, Math.min(999, Number(newSeq) || 1));
    setSlipSequence(num);
    const empCode =
      formData.employeeId ||
      (selectedEmployeeObj
        ? String(
            selectedEmployeeObj.employee_code ||
              selectedEmployeeObj.employee_id ||
              selectedEmployeeObj.employeeId ||
              selectedEmployeeObj.id ||
              ''
          )
        : '');
    if (empCode && formData.monthYear) {
      const updatedSlipNo = generateSlipNumber(empCode, formData.monthYear, num);
      setFormData((prev) => ({ ...prev, paySlipNo: updatedSlipNo }));
      if (errors.paySlipNo) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.paySlipNo;
          return next;
        });
      }
    }
  };

  const handlePaySlipNoDirectChange = (value: string) => {
    updateField('paySlipNo', value);
    const parsed = parseSlipNumber(value);
    if (parsed) {
      setSlipSequence(parsed.sequence);
    }
  };

  const handleRegenerateSlipNumber = () => {
    const empCode =
      formData.employeeId ||
      (selectedEmployeeObj
        ? String(
            selectedEmployeeObj.employee_code ||
              selectedEmployeeObj.employee_id ||
              selectedEmployeeObj.employeeId ||
              selectedEmployeeObj.id ||
              ''
          )
        : '');
    if (!empCode) {
      setErrors((prev) => ({
        ...prev,
        employeeId: 'Please select an employee first to generate payslip number.',
        paySlipNo: 'Select employee to generate payslip number.',
      }));
      return;
    }
    const newSlipNo = generateSlipNumber(empCode, formData.monthYear, slipSequence);
    setFormData((prev) => ({ ...prev, paySlipNo: newSlipNo }));
    if (errors.paySlipNo) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.paySlipNo;
        return next;
      });
    }
  };

  // Helper to update month or year and reflect back into formData.monthYear & payPeriod
  const handleMonthChange = (selectedMonth: string) => {
    const currentYearVal = formData.monthYear?.split(' ')[1] || String(currentYear);
    const updatedMonthYear = `${selectedMonth} ${currentYearVal}`;
    const newPayPeriod = calculatePayPeriod(
      selectedMonth,
      currentYearVal,
      formData.payCycle,
      biWeeklyPeriod
    );
    setFormData((prev) => {
      const empCode =
        prev.employeeId ||
        (selectedEmployeeObj
          ? String(
              selectedEmployeeObj.employee_code ||
                selectedEmployeeObj.employee_id ||
                selectedEmployeeObj.employeeId ||
                selectedEmployeeObj.id ||
                ''
            )
          : '');
      const updatedSlipNo =
        !isEditing && empCode ? generateSlipNumber(empCode, updatedMonthYear, slipSequence) : prev.paySlipNo;
      return {
        ...prev,
        monthYear: updatedMonthYear,
        payPeriod: newPayPeriod,
        paySlipNo: updatedSlipNo,
      };
    });
  };

  const handleYearChange = (selectedYear: string) => {
    const currentMonthVal = formData.monthYear?.split(' ')[0] || months[new Date().getMonth()];
    const updatedMonthYear = `${currentMonthVal} ${selectedYear}`;
    const newPayPeriod = calculatePayPeriod(
      currentMonthVal,
      selectedYear,
      formData.payCycle,
      cyclePeriodPart,
      customStart,
      customEnd
    );
    setFormData((prev) => {
      const empCode =
        prev.employeeId ||
        (selectedEmployeeObj
          ? String(
              selectedEmployeeObj.employee_code ||
                selectedEmployeeObj.employee_id ||
                selectedEmployeeObj.employeeId ||
                selectedEmployeeObj.id ||
                ''
            )
          : '');
      const updatedSlipNo =
        !isEditing && empCode ? generateSlipNumber(empCode, updatedMonthYear, slipSequence) : prev.paySlipNo;
      return {
        ...prev,
        monthYear: updatedMonthYear,
        payPeriod: newPayPeriod,
        paySlipNo: updatedSlipNo,
      };
    });
  };

  const handleCycleChange = (cycle: PayCycleOption) => {
    const currentMonthVal = formData.monthYear?.split(' ')[0] || months[new Date().getMonth()];
    const currentYearVal = formData.monthYear?.split(' ')[1] || String(currentYear);
    const monthIndex = months.indexOf(currentMonthVal.toUpperCase());
    const totalDays = getDaysInMonth(parseInt(currentYearVal, 10), monthIndex);

    const newPayPeriod = calculatePayPeriod(
      currentMonthVal,
      currentYearVal,
      cycle,
      cyclePeriodPart,
      customStart,
      customEnd
    );
    let defaultPaidDays = totalDays;
    if (cycle === 'Weekly') {
      defaultPaidDays = cyclePeriodPart === 5 ? Math.max(1, totalDays - 28) : 7;
    } else if (cycle === 'Bi-Weekly') {
      defaultPaidDays = cyclePeriodPart === 1 ? 14 : Math.max(1, totalDays - 14);
    } else if (cycle === 'Semi-Monthly') {
      defaultPaidDays = cyclePeriodPart === 1 ? 15 : Math.max(1, totalDays - 15);
    }

    setFormData((prev) => ({
      ...prev,
      payCycle: cycle,
      payPeriod: newPayPeriod,
      paidDays: defaultPaidDays,
    }));
  };

  const handlePeriodPartChange = (part: number) => {
    setCyclePeriodPart(part);
    if (part === 1 || part === 2) {
      setBiWeeklyPeriod(part as 1 | 2);
    }
    const currentMonthVal = formData.monthYear?.split(' ')[0] || months[new Date().getMonth()];
    const currentYearVal = formData.monthYear?.split(' ')[1] || String(currentYear);
    const monthIndex = months.indexOf(currentMonthVal.toUpperCase());
    const totalDays = getDaysInMonth(parseInt(currentYearVal, 10), monthIndex);

    const newPayPeriod = calculatePayPeriod(
      currentMonthVal,
      currentYearVal,
      formData.payCycle || 'Monthly',
      part,
      customStart,
      customEnd
    );
    let defaultPaidDays = totalDays;
    if (formData.payCycle === 'Weekly') {
      defaultPaidDays = part === 5 ? Math.max(1, totalDays - 28) : 7;
    } else if (formData.payCycle === 'Bi-Weekly') {
      defaultPaidDays = part === 1 ? 14 : Math.max(1, totalDays - 14);
    } else if (formData.payCycle === 'Semi-Monthly') {
      defaultPaidDays = part === 1 ? 15 : Math.max(1, totalDays - 15);
    }

    setFormData((prev) => ({
      ...prev,
      cyclePart: part,
      payPeriod: newPayPeriod,
      paidDays: defaultPaidDays,
    }));
  };

  const handleCustomDatesChange = (start: string, end: string) => {
    setCustomStart(start);
    setCustomEnd(end);
    const currentMonthVal = formData.monthYear?.split(' ')[0] || months[new Date().getMonth()];
    const currentYearVal = formData.monthYear?.split(' ')[1] || String(currentYear);

    const newPayPeriod = calculatePayPeriod(
      currentMonthVal,
      currentYearVal,
      'Custom',
      1,
      start,
      end
    );
    let calculatedDays = 15;
    if (start && end) {
      const s = new Date(start);
      const e = new Date(end);
      const diffTime = Math.abs(e.getTime() - s.getTime());
      calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    setFormData((prev) => ({
      ...prev,
      customStartDate: start,
      customEndDate: end,
      payPeriod: newPayPeriod,
      paidDays: calculatedDays,
    }));
  };

  // Live annual gross estimate for statutory tax calculation
  const totalEarningsVal = formData.earnings.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const estimatedAnnualGross = useMemo(() => {
    if (formData.totalCompensation && Number(formData.totalCompensation) > 0) {
      return Number(formData.totalCompensation);
    }
    if (totalEarningsVal > 0) {
      if (formData.payCycle === 'Weekly') return totalEarningsVal * 52;
      if (formData.payCycle === 'Bi-Weekly') return totalEarningsVal * 26;
      if (formData.payCycle === 'Semi-Monthly') return totalEarningsVal * 24;
      return totalEarningsVal * 12;
    }
    return 0;
  }, [formData.totalCompensation, totalEarningsVal, formData.payCycle]);

  const liveTaxResult: TaxCalculationResult | null = useMemo(() => {
    if (estimatedAnnualGross <= 0) return null;
    return calculateTaxForEmployee({
      annualGrossSalary: estimatedAnnualGross,
      regime: formData.taxRegime || 'New Regime',
      basicSalary: Number(formData.baseSalary) || Math.round(estimatedAnnualGross * 0.5),
      isMidYearJoiner: Boolean(
        selectedEmployeeObj?.isMidYearJoiner ?? selectedEmployeeObj?.is_mid_year_joiner
      ),
      previousEmployerYtd:
        selectedEmployeeObj?.previousEmployerYtd || selectedEmployeeObj?.previous_employer_ytd,
    });
  }, [estimatedAnnualGross, formData.taxRegime, formData.baseSalary, selectedEmployeeObj]);

  const handleToggleDeductIncomeTax = (checked: boolean) => {
    setDeductIncomeTax(checked);
    const targetTdsAmount = checked
      ? Math.round(Number(liveTaxResult?.projectedMonthlyTds || 0))
      : 0;
    setFormData((prev) => {
      const updated = [...prev.deductions];
      const idx = updated.findIndex(
        (d) =>
          d.name.toLowerCase().includes('tds') ||
          d.name.toLowerCase().includes('income tax') ||
          d.name.toLowerCase().includes('tax')
      );
      if (idx !== -1) {
        updated[idx] = { ...updated[idx], amount: targetTdsAmount };
      } else {
        updated.push({ name: 'Income Tax (TDS)', amount: targetTdsAmount });
      }
      return { ...prev, deductions: updated };
    });
  };

  const handleApplyTds = () => {
    if (!liveTaxResult) return;
    const tdsMonthly = liveTaxResult.projectedMonthlyTds;
    setDeductIncomeTax(tdsMonthly > 0);
    setFormData((prev) => {
      const updated = [...prev.deductions];
      const idx = updated.findIndex(
        (d) =>
          d.name.toLowerCase().includes('tds') ||
          d.name.toLowerCase().includes('income tax') ||
          d.name.toLowerCase().includes('tax')
      );
      if (idx !== -1) {
        updated[idx] = { ...updated[idx], amount: tdsMonthly };
      } else {
        updated.push({ name: 'Income Tax (TDS)', amount: tdsMonthly });
      }
      return { ...prev, deductions: updated };
    });
  };

  // Extracted current month/year for select values
  const selectedMonth = formData.monthYear?.split(' ')[0] || months[new Date().getMonth()];
  let currentYearVal = formData.monthYear?.split(' ')[1] || String(currentYear);
  const selectedYear = currentYearVal;

  const rawUsersList = useMemo(() => {
    return fetchUsers ? customUsersList : extractUserArray(rtkUsersData);
  }, [fetchUsers, customUsersList, rtkUsersData]);

  const isLoadingUsers = fetchUsers ? isCustomLoading : isRtkLoading;

  const displayedUsers = useMemo(() => {
    if (!Array.isArray(rawUsersList)) return [];
    if (!searchTerm.trim()) return rawUsersList;

    const term = searchTerm.toLowerCase();
    return rawUsersList.filter((user) => {
      const name = getEmployeeName(user).toLowerCase();
      const empId = String(user.employeeId ?? user.id ?? user._id ?? '').toLowerCase();
      const position = String(user.position ?? user.designation ?? user.role ?? '').toLowerCase();
      return name.includes(term) || empId.includes(term) || position.includes(term);
    });
  }, [rawUsersList, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectEmployee = async (user: any) => {
    console.log('1. Clicked user object:', user);

    const rawId = user.id || user.employee_code || user.employee_id || user.employeeId;
    const numericId = Number(rawId);
    const resolvedName = getEmployeeName(user);

    setSearchTerm(resolvedName);
    setIsDropdownOpen(false);

    // 1. Detect bank account from user object
    let detectedAccount = String(
      user.bank_account_number ||
        user.account_number ||
        user.accountNumber ||
        user.bank_account ||
        user.bankAccount ||
        user.bank_acc_no ||
        user.bankAccNo ||
        ''
    ).trim();

    // 2. Detect base salary from user object
    let detectedBaseSalary = Number(
      user.base_salary ??
        user.basic_salary ??
        user.baseSalary ??
        user.basicSalary ??
        user.salary ??
        user.base_pay ??
        user.basePay ??
        user.base_amount ??
        user.baseAmount ??
        0
    );

    // 3. Fallback: Search existing salary slips in cache
    const allSlips = Array.isArray(allSalarySlipsData)
      ? allSalarySlipsData
      : Array.isArray(allSalarySlipsData?.data)
        ? allSalarySlipsData.data
        : [];

    const findInSlips = (slipsList: any[]) => {
      return slipsList.filter((slip: any) => {
        const sUserId = slip.user_id ?? slip.userId;
        const sEmpCode = String(slip.employee_code ?? slip.employeeCode ?? slip.employeeId ?? '')
          .trim()
          .toLowerCase();
        const uId = String(rawId).trim().toLowerCase();
        const uEmpCode = String(user.employee_code ?? user.employee_id ?? user.employeeId ?? '')
          .trim()
          .toLowerCase();
        const sName = String(slip.username ?? slip.employee_name ?? slip.employeeName ?? '')
          .trim()
          .toLowerCase();
        const uName = resolvedName.trim().toLowerCase();

        return (
          (sUserId && String(sUserId) === String(rawId)) ||
          (sEmpCode && (sEmpCode === uId || (uEmpCode && sEmpCode === uEmpCode))) ||
          (sName && uName && sName === uName)
        );
      });
    };

    const applyFromSlip = (slip: any) => {
      if (!detectedAccount) {
        detectedAccount = String(
          slip.bank_account_number ||
            slip.bankAccountNumber ||
            slip.account_number ||
            slip.accountNumber ||
            ''
        ).trim();
      }
      if (!detectedBaseSalary) {
        const slipBasic =
          slip.basic_salary ??
          slip.basicSalary ??
          slip.base ??
          slip.base_amount ??
          (Array.isArray(slip.earnings)
            ? slip.earnings.find((e: any) => e.name?.toLowerCase().includes('basic'))?.amount
            : undefined);
        detectedBaseSalary = Number(slipBasic || 0);
      }
    };

    const matchedSlips = findInSlips(allSlips);
    if (matchedSlips.length > 0) {
      const sorted = [...matchedSlips].sort(
        (a: any, b: any) => Number(b.id || 0) - Number(a.id || 0)
      );
      applyFromSlip(sorted[0]);
    }

    const empCode = String(
      user.employee_code || user.employee_id || user.employeeId || user.id || ''
    );
    const currentMonthYear =
      formData.monthYear || `${months[new Date().getMonth()]} ${currentYear}`;
    const detectedSeq = getNextSequenceForEmployee(empCode, currentMonthYear, allSlips);
    setSlipSequence(detectedSeq);
    const generatedSlipNo = generateSlipNumber(empCode, currentMonthYear, detectedSeq);

    const detectedTotalComp = Number(
      user.totalCompensation ?? user.total_compensation ?? user.annualCtc ?? user.annual_ctc ?? 0
    );
    const detectedRegime = (user.taxRegime || user.tax_regime || 'New Regime') as
      'New Regime' | 'Old Regime';
    const detectedPan = String(user.panNumber || user.pan_number || '');

    if (!detectedBaseSalary && detectedTotalComp > 0) {
      detectedBaseSalary = Math.round((detectedTotalComp / 12) * 0.5);
    }

    setSelectedEmployeeObj(user);

    setFormData((prev) => {
      const updatedEarnings = [...prev.earnings];
      const basicIndex = updatedEarnings.findIndex(
        (e) => e.name.toLowerCase().includes('basic') || e.name.toLowerCase().includes('base')
      );

      if (detectedBaseSalary > 0) {
        if (basicIndex !== -1) {
          updatedEarnings[basicIndex] = {
            ...updatedEarnings[basicIndex],
            amount: detectedBaseSalary,
          };
        } else if (updatedEarnings.length > 0) {
          updatedEarnings[0] = { ...updatedEarnings[0], amount: detectedBaseSalary };
        } else {
          updatedEarnings.push({ name: 'Basic Pay', amount: detectedBaseSalary });
        }
      }

      const updated = {
        ...prev,
        userId: isNaN(numericId) ? rawId : numericId,
        employeeId: empCode,
        employeeName: resolvedName,
        position: user.designation || user.role || user.position || '',
        department: user.department || '',
        accountNumber: detectedAccount || '',
        baseSalary: detectedBaseSalary > 0 ? detectedBaseSalary : prev.baseSalary || '',
        totalCompensation: detectedTotalComp > 0 ? detectedTotalComp : prev.totalCompensation || '',
        taxRegime: detectedRegime,
        panNumber: detectedPan || prev.panNumber,
        paySlipNo: isEditing && prev.paySlipNo ? prev.paySlipNo : generatedSlipNo,
        earnings: updatedEarnings,
      };

      console.log('2. New calculated formData state:', updated);
      return updated;
    });

    setErrors((prev) => {
      const next = { ...prev };
      delete next.userId;
      delete next.employeeId;
      delete next.paySlipNo;
      return next;
    });

    // 4. Asynchronous check by employee ID if still missing either account or base salary
    if ((!detectedAccount || !detectedBaseSalary) && rawId) {
      try {
        const res = await getSlipsByEmpId(rawId).unwrap();
        const empSlips = Array.isArray(res)
          ? res
          : res?.data
            ? Array.isArray(res.data)
              ? res.data
              : [res.data]
            : [];
        if (empSlips.length > 0) {
          const newest = [...empSlips].sort(
            (a: any, b: any) => Number(b.id || 0) - Number(a.id || 0)
          )[0];
          applyFromSlip(newest);

          setFormData((prev) => {
            const updatedEarnings = [...prev.earnings];
            const bIdx = updatedEarnings.findIndex(
              (e) => e.name.toLowerCase().includes('basic') || e.name.toLowerCase().includes('base')
            );
            if (detectedBaseSalary > 0 && bIdx !== -1 && updatedEarnings[bIdx].amount === 0) {
              updatedEarnings[bIdx] = { ...updatedEarnings[bIdx], amount: detectedBaseSalary };
            }

            return {
              ...prev,
              accountNumber: prev.accountNumber || detectedAccount || '',
              baseSalary: prev.baseSalary || (detectedBaseSalary > 0 ? detectedBaseSalary : ''),
              earnings: updatedEarnings,
            };
          });
        }
      } catch {
        // Fallback fetch error ignored
      }
    }
  };

  const handleAutoPopulateCompensation = async () => {
    const rawId = formData.userId || formData.employeeId;
    const numericId = Number(rawId);
    const validId = !isNaN(numericId) && numericId > 0 ? numericId : rawId;

    if (!validId && !formData.totalCompensation) {
      alert('Please select an employee or enter Total Compensation (CTC) first.');
      return;
    }

    try {
      let compData: any = null;
      if (validId) {
        try {
          const res = await fetchCompensation(validId).unwrap();
          compData = res?.data || res;
        } catch (fetchErr) {
          console.warn('Compensation fetch error:', fetchErr);
        }
      }

      if ((!compData || !compData.components) && formData.totalCompensation) {
        const ctcNum = Number(formData.totalCompensation);
        if (ctcNum > 0) {
          try {
            const previewRes = await previewCompensation({ ctcAnnual: ctcNum }).unwrap();
            compData = previewRes?.data || previewRes;
          } catch (previewErr) {
            console.warn('Compensation preview error:', previewErr);
          }
        }
      }

      if (compData) {
        const basicMonthly = Math.round(
          Number(
            compData.components?.basicSalary?.monthly ??
              compData.basicSalaryMonthly ??
              compData.basicSalary ??
              (compData.ctcAnnual ? (compData.ctcAnnual * 0.4) / 12 : 0)
          )
        );

        const hraMonthly = Math.round(
          Number(
            compData.components?.houseRentAllowance?.monthly ??
              compData.hraMonthly ??
              compData.hra ??
              (basicMonthly ? basicMonthly * 0.5 : 0)
          )
        );

        const specialMonthly = Math.round(
          Number(
            compData.components?.specialAllowance?.monthly ??
              compData.specialAllowanceMonthly ??
              compData.specialAllowance ??
              0
          )
        );

        const pfMonthly = Math.round(
          Number(
            compData.expectedMonthlyPay?.deductions?.employeePf ??
              compData.employeeContributions?.employeePf?.monthly ??
              compData.employeePf ??
              (basicMonthly ? basicMonthly * 0.12 : 0)
          )
        );

        const ptMonthly = Math.round(
          Number(compData.expectedMonthlyPay?.deductions?.professionalTax ?? 200)
        );

        const tdsMonthly = Math.round(
          Number(
            compData.expectedMonthlyPay?.deductions?.incomeTaxTds ??
              compData.taxCalculation?.projectedPeriodicTds ??
              0
          )
        );

        const newEarnings: EarningsItem[] = [
          { name: 'Basic Pay', amount: basicMonthly || 0 },
          { name: 'House Rent Allowance (HRA)', amount: hraMonthly || 0 },
          ...(specialMonthly > 0 ? [{ name: 'Special Allowance', amount: specialMonthly }] : []),
        ];

        const newDeductions: DeductionItem[] = [
          { name: 'Provident Fund (PF)', amount: pfMonthly || 0 },
          { name: 'Professional Tax', amount: ptMonthly || 200 },
          ...(deductIncomeTax && tdsMonthly > 0
            ? [{ name: 'Income Tax (TDS)', amount: tdsMonthly }]
            : [{ name: 'Income Tax (TDS)', amount: 0 }]),
        ];

        setFormData((prev) => ({
          ...prev,
          baseSalary: basicMonthly || prev.baseSalary,
          taxRegime:
            compData.taxRegime === 'old' || compData.taxRegime === 'Old Regime'
              ? 'Old Regime'
              : 'New Regime',
          earnings: newEarnings,
          deductions: newDeductions,
        }));
      }
    } catch (err) {
      console.error('Failed to auto-populate compensation:', err);
    }
  };

  const clearEmployeeSearch = () => {
    setSearchTerm('');
    setIsDropdownOpen(true);

    setFormData((prev: SalarySlipData) => ({
      ...prev,
      userId: 0,
      employeeId: '',
      employeeName: '',
      position: '',
      department: '',
      accountNumber: '',
      baseSalary: '',
      paySlipNo: '',
    }));
    setSelectedEmployeeObj(null);
    setSlipSequence(1);
  };

  const updateEarning = (index: number, field: keyof EarningsItem, value: string | number) => {
    const updatedValue = field === 'amount' ? (value === '' ? 0 : Number(value)) : value;
    setFormData((prev) => {
      const updatedEarnings = prev.earnings.map((item, i) =>
        i === index ? { ...item, [field]: updatedValue } : item
      );
      let updatedBaseSalary = prev.baseSalary;
      const isBasicItem =
        prev.earnings[index]?.name.toLowerCase().includes('basic') ||
        prev.earnings[index]?.name.toLowerCase().includes('base') ||
        index === 0;

      if (isBasicItem && field === 'amount') {
        updatedBaseSalary = updatedValue === 0 ? '' : Number(updatedValue);
      }

      return {
        ...prev,
        baseSalary: updatedBaseSalary,
        earnings: updatedEarnings,
      };
    });
  };

  const updateDeduction = (index: number, field: keyof DeductionItem, value: string | number) => {
    const updatedValue = field === 'amount' ? (value === '' ? 0 : Number(value)) : value;
    const targetItem = formData.deductions[index];
    if (targetItem && /tax|tds/i.test(targetItem.name)) {
      if (field === 'amount') {
        setDeductIncomeTax(Number(updatedValue) > 0);
      }
    }
    setFormData((prev) => ({
      ...prev,
      deductions: prev.deductions.map((item, i) =>
        i === index ? { ...item, [field]: updatedValue } : item
      ),
    }));
  };

  const addEarning = () => {
    setFormData((prev) => ({ ...prev, earnings: [...prev.earnings, { name: '', amount: 0 }] }));
  };

  const removeEarning = (index: number) => {
    setFormData((prev) => ({ ...prev, earnings: prev.earnings.filter((_, i) => i !== index) }));
  };

  const addDeduction = () => {
    setFormData((prev) => ({ ...prev, deductions: [...prev.deductions, { name: '', amount: 0 }] }));
  };

  const removeDeduction = (index: number) => {
    setFormData((prev) => ({ ...prev, deductions: prev.deductions.filter((_, i) => i !== index) }));
  };

  // Calculate totals dynamically
  const totalEarnings = formData.earnings.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalDeductions = formData.deductions.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const netSalary = totalEarnings - totalDeductions;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    // 1. Target Employee ID (Selected from dropdown - recipient of slip)
    const recipientUserId = formData.userId || formData.employeeId;
    const numericRecipientId = Number(recipientUserId);

    if (
      !recipientUserId ||
      (isNaN(numericRecipientId) && !formData.employeeName) ||
      (!formData.employeeId && !formData.employeeName)
    ) {
      newErrors.userId = 'Please select a valid employee from the list.';
      newErrors.employeeId = 'Employee selection is required.';
    }

    // 2. Month and Year
    if (!formData.monthYear || !formData.monthYear.trim()) {
      newErrors.monthYear = 'Month and Year selection is required.';
    }

    // 3. Attendance - Paid Working Days
    const paidDaysNum = Number(formData.paidDays);
    if (isNaN(paidDaysNum) || paidDaysNum <= 0) {
      newErrors.paidDays = 'Paid working days must be greater than 0.';
    }

    // 4. Earnings / Basic Pay
    const totalEarningsVal = formData.earnings.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );
    const basicAmt = Number(formData.baseSalary) || 0;
    if (totalEarningsVal <= 0 && basicAmt <= 0) {
      newErrors.earnings =
        'At least one earning component (e.g. Basic Pay) must be greater than 0.';
    }

    // 5. Pay Slip Number
    let finalSlipNo = formData.paySlipNo?.trim();
    if (!finalSlipNo) {
      const empCode =
        formData.employeeId ||
        (selectedEmployeeObj
          ? String(
              selectedEmployeeObj.employee_code ||
                selectedEmployeeObj.employee_id ||
                selectedEmployeeObj.employeeId ||
                selectedEmployeeObj.id ||
                ''
            )
          : '');
      if (empCode && formData.monthYear) {
        finalSlipNo = generateSlipNumber(empCode, formData.monthYear, slipSequence);
        setFormData((prev) => ({ ...prev, paySlipNo: finalSlipNo }));
      } else {
        newErrors.paySlipNo =
          'Payslip number is required. Please select an employee to generate it.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 2. Creator ID (Logged-in HR/Admin creating the slip)
    const loggedInUserId = user?.id || loggedInUser?.id;
    const creatorId = loggedInUserId ? Number(loggedInUserId) : null;

    try {
      setIsSubmitting(true);

      // 3. Keyword matching helpers for Earnings & Deductions
      const findAmount = (items: typeof formData.earnings, keywords: string[]) => {
        const match = items.find((i) =>
          keywords.some((kw) => i.name.toLowerCase().trim().includes(kw.toLowerCase()))
        );
        return match ? Number(match.amount) || 0 : 0;
      };

      const getUnmatchedSum = (items: typeof formData.earnings, matchedKeywords: string[]) => {
        return items
          .filter(
            (i) =>
              !matchedKeywords.some((kw) => i.name.toLowerCase().trim().includes(kw.toLowerCase()))
          )
          .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
      };

      // Earnings Breakdown
      const earningMatches = [
        'basic',
        'hra',
        'house rent',
        'bonus',
        'incentive',
        'special',
        'conveyance',
        'transport',
      ];
      const basicSalary =
        findAmount(formData.earnings, ['basic']) || Number(formData.baseSalary || 0);
      const houseRentAllowance = findAmount(formData.earnings, ['hra', 'house rent']);
      const bonus = findAmount(formData.earnings, ['bonus', 'incentive']);
      const specialAllowance = findAmount(formData.earnings, ['special']);
      const conveyanceAllowance = findAmount(formData.earnings, ['conveyance', 'transport']);
      const otherEarnings = getUnmatchedSum(formData.earnings, earningMatches);

      // Deductions Breakdown
      const deductionMatches = [
        'pf',
        'provident',
        'pt',
        'professional tax',
        'tds',
        'income tax',
        'tax',
      ];
      const providentFund = findAmount(formData.deductions, ['pf', 'provident']);
      const professionalTax = findAmount(formData.deductions, ['pt', 'professional tax']);
      const incomeTaxTds = findAmount(formData.deductions, ['tds', 'income tax', 'tax']);
      const otherDeductions = getUnmatchedSum(formData.deductions, deductionMatches);

      // Attendance
      const paidDays = Number(formData.paidDays) || 15;
      const lopDays = Number(formData.lopDays) || 0;

      // Extract pay period month (1-12) & year for SQL database queries
      const monthStr = formData.monthYear?.split(' ')[0] || months[new Date().getMonth()];
      const yearStr = formData.monthYear?.split(' ')[1] || String(currentYear);
      const payPeriodMonth = months.indexOf(monthStr.toUpperCase()) + 1;
      const payPeriodYear = Number(yearStr);

      const payload = {
        // 1. Recipient & Creator IDs
        user_id: numericRecipientId,
        userId: numericRecipientId,
        created_by: creatorId,

        // 2. Slip Identifiers & Pay Period Metadata
        pay_slip_no: formData.paySlipNo || null,
        month_year: formData.monthYear,
        pay_period_month: payPeriodMonth,
        payPeriodMonth: payPeriodMonth,
        pay_period_year: payPeriodYear,
        payPeriodYear: payPeriodYear,
        pay_frequency: (formData.payCycle || 'monthly').toLowerCase(),
        payFrequency: (formData.payCycle || 'monthly').toLowerCase(),
        cycle_number: formData.cyclePart || biWeeklyPeriod || 1,
        cycleNumber: formData.cyclePart || biWeeklyPeriod || 1,

        // Payroll Type & Adjustments (Mistake / Rate / Tax correction)
        payroll_type: formData.payrollType || 'Regular',
        payrollType: formData.payrollType || 'Regular',
        adjustment_type: formData.adjustmentType || null,
        adjustmentType: formData.adjustmentType || null,
        adjustment_amount: Number(formData.adjustmentAmount || 0),
        adjustmentAmount: Number(formData.adjustmentAmount || 0),
        adjustment_reason: formData.adjustmentReason || formData.adjustmentNotes || null,
        adjustmentReason: formData.adjustmentReason || formData.adjustmentNotes || null,
        reference_period: formData.referencePeriod || formData.referencedPeriod || null,
        referencePeriod: formData.referencePeriod || formData.referencedPeriod || null,
        referenced_period: formData.referencePeriod || formData.referencedPeriod || null,
        referencedPeriod: formData.referencePeriod || formData.referencedPeriod || null,
        reference_salary_slip_id: formData.referenceSalarySlipId
          ? Number(formData.referenceSalarySlipId)
          : null,
        referenceSalarySlipId: formData.referenceSalarySlipId
          ? Number(formData.referenceSalarySlipId)
          : null,
        adjustment_notes: formData.adjustmentReason || formData.adjustmentNotes || null,
        adjustmentNotes: formData.adjustmentReason || formData.adjustmentNotes || null,
        tax_regime: formData.taxRegime || 'New Regime',
        taxRegime: formData.taxRegime || 'New Regime',
        total_compensation: formData.totalCompensation || null,
        totalCompensation: formData.totalCompensation || null,

        // 3. Attendance Details
        days_worked: paidDays,
        daysWorked: paidDays,
        paid_days: paidDays,
        leave_days: lopDays,
        leaveDays: lopDays,
        lop_days: lopDays,
        total_working_days: paidDays + lopDays,
        totalWorkingDays: paidDays + lopDays,

        // 4. Employee Profile Details
        employee_code: formData.employeeId ? String(formData.employeeId) : null,
        employeeCode: formData.employeeId ? String(formData.employeeId) : null,
        designation: formData.position || null,
        position: formData.position || null,
        department: formData.department || null,
        bank_account_number: formData.accountNumber || null,
        bankAccountNumber: formData.accountNumber || null,

        // 5. Breakdown Arrays
        earnings: formData.earnings.filter((e) => e.name.trim() !== ''),
        deductions: formData.deductions.filter((d) => d.name.trim() !== ''),

        // 6. Financial Figures (snake_case + camelCase for total service compatibility)
        basic_salary: basicSalary,
        basicSalary: basicSalary,
        house_rent_allowance: houseRentAllowance,
        houseRentAllowance: houseRentAllowance,
        special_allowance: specialAllowance,
        specialAllowance: specialAllowance,
        conveyance_allowance: conveyanceAllowance,
        conveyanceAllowance: conveyanceAllowance,
        bonus: bonus,
        other_earnings: otherEarnings,
        otherEarnings: otherEarnings,
        provident_fund: providentFund,
        providentFund: providentFund,
        professional_tax: professionalTax,
        professionalTax: professionalTax,
        income_tax_tds: incomeTaxTds,
        incomeTaxTds: incomeTaxTds,
        other_deductions: otherDeductions,
        otherDeductions: otherDeductions,

        // 7. Status & Dates
        payment_status: formData.paymentStatus || 'pending',
        paymentStatus: formData.paymentStatus || 'pending',
        payment_date: formData.generatedOn || new Date().toISOString().split('T')[0],
        paymentDate: formData.generatedOn || new Date().toISOString().split('T')[0],
        authorized_signatory: formData.authorizedSignatory || 'Seema Srivastava',
        authorizedSignatory: formData.authorizedSignatory || 'Seema Srivastava',
        signatory_role: formData.signatoryRole || '(Director)',
        signatoryRole: formData.signatoryRole || '(Director)',
        remarks:
          formData.payrollType === 'Adjustment'
            ? `[ADJUSTMENT - ${formData.adjustmentType || 'Correction'}${formData.referencedPeriod ? ` | Ref: ${formData.referencedPeriod}` : ''}] ${formData.adjustmentNotes || ''} ${formData.hrNote || ''}`.trim()
            : formData.hrNote || null,
        hr_note:
          formData.payrollType === 'Adjustment'
            ? `[ADJUSTMENT - ${formData.adjustmentType || 'Correction'}${formData.referencedPeriod ? ` | Ref: ${formData.referencedPeriod}` : ''}] ${formData.adjustmentNotes || ''} ${formData.hrNote || ''}`.trim()
            : formData.hrNote || null,
        hrNote:
          formData.payrollType === 'Adjustment'
            ? `[ADJUSTMENT - ${formData.adjustmentType || 'Correction'}${formData.referencedPeriod ? ` | Ref: ${formData.referencedPeriod}` : ''}] ${formData.adjustmentNotes || ''} ${formData.hrNote || ''}`.trim()
            : formData.hrNote || null,
      };

      await onCreate(payload);
    } catch (error) {
      console.error('Failed to save salary slip:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-black text-white flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Create Salary Slip</h1>
              <p className="text-sm text-gray-500">Enter compensation and payroll details.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate className="overflow-y-auto flex-1">
          <div className="p-6 space-y-8">
            {Object.keys(errors).length > 0 && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm font-medium">
                <AlertCircle size={20} className="shrink-0 text-red-500 mt-0.5" />
                <div>
                  <p className="font-bold">Proper form filling required to generate salary slip:</p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs text-red-600 font-medium">
                    {errors.employeeId && <li>{errors.employeeId}</li>}
                    {errors.monthYear && <li>{errors.monthYear}</li>}
                    {errors.paidDays && <li>{errors.paidDays}</li>}
                    {errors.earnings && <li>{errors.earnings}</li>}
                    {errors.paySlipNo && <li>{errors.paySlipNo}</li>}
                  </ul>
                </div>
              </div>
            )}

            {/* Payroll Type Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Payroll Type
                  </span>
                  <p className="text-xs text-slate-500">
                    Choose standard recurring cycle payroll or an adjustment to rectify past
                    mistakes.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => updateField('payrollType', 'Regular')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      (formData.payrollType || 'Regular') === 'Regular'
                        ? 'bg-black text-white shadow-xs'
                        : 'text-slate-600 hover:text-black'
                    }`}>
                    Regular Payroll
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateField('payrollType', 'Adjustment');
                      if (!formData.adjustmentType)
                        updateField('adjustmentType', 'Salary Rate Discrepancy');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      formData.payrollType === 'Adjustment'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-black'
                    }`}>
                    Payroll with Adjustments
                  </button>
                </div>
              </div>

              {formData.payrollType === 'Adjustment' && (
                <div className="mt-4 pt-4 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Adjustment Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.adjustmentType || 'wrong_rate'}
                      onChange={(e) => updateField('adjustmentType', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-black">
                      <option value="wrong_rate">Wrong Rate / Arrears (wrong_rate)</option>
                      <option value="tax_correction">
                        Tax Deducted Discrepancy / Refund (tax_correction)
                      </option>
                      <option value="overpayment">
                        Clawback / Overpayment Recovery (overpayment)
                      </option>
                      <option value="underpayment">Underpayment (underpayment)</option>
                      <option value="arrears">Arrears Payment (arrears)</option>
                      <option value="other">Other Past Correction (other)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Adjustment Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={formData.adjustmentAmount ?? ''}
                        onChange={(e) => {
                          const val = Number(e.target.value || 0);
                          updateField('adjustmentAmount', val);
                        }}
                        placeholder="e.g. 10000 or -5000"
                        className="w-full rounded-xl border border-slate-300 pl-7 pr-3 py-2 text-xs bg-white font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Positive adds to gross, negative recovers overpayment.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Reference Period
                    </label>
                    <input
                      type="text"
                      value={formData.referencePeriod || formData.referencedPeriod || ''}
                      onChange={(e) => {
                        updateField('referencePeriod', e.target.value);
                        updateField('referencedPeriod', e.target.value);
                      }}
                      placeholder="e.g. April 2026 or Cycle #1"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Adjustment Reason (Audit Log) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.adjustmentReason || formData.adjustmentNotes || ''}
                      onChange={(e) => {
                        updateField('adjustmentReason', e.target.value);
                        updateField('adjustmentNotes', e.target.value);
                      }}
                      placeholder="e.g. Corrected past basic salary underpayment from April cycle"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Reference Slip ID (Optional)
                    </label>
                    <input
                      type="number"
                      value={formData.referenceSalarySlipId || ''}
                      onChange={(e) => updateField('referenceSalarySlipId', e.target.value)}
                      placeholder="e.g. 32"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div className="md:col-span-3 flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="text-slate-500 font-semibold text-[11px]">
                      Quick Apply to Slip Breakdown:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const amt = Math.abs(formData.adjustmentAmount || 10000);
                        updateField('adjustmentAmount', amt);
                        updateField('adjustmentType', 'wrong_rate');
                        setFormData((prev) => ({
                          ...prev,
                          earnings: [
                            ...prev.earnings,
                            {
                              name: `Arrears Adjustment (${prev.referencePeriod || prev.referencedPeriod || 'Past Cycle'})`,
                              amount: amt,
                            },
                          ],
                        }));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold transition">
                      + Add Arrears Earning (+₹
                      {Math.abs(formData.adjustmentAmount || 10000).toLocaleString('en-IN')})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const amt = Math.abs(formData.adjustmentAmount || 1500);
                        updateField('adjustmentType', 'tax_correction');
                        setFormData((prev) => ({
                          ...prev,
                          deductions: [
                            ...prev.deductions,
                            {
                              name: `TDS Correction (${prev.referencePeriod || prev.referencedPeriod || 'Past Cycle'})`,
                              amount: amt,
                            },
                          ],
                        }));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold transition">
                      + Add Tax Correction
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const amt = Math.abs(formData.adjustmentAmount || 5000);
                        updateField('adjustmentAmount', -amt);
                        updateField('adjustmentType', 'overpayment');
                        setFormData((prev) => ({
                          ...prev,
                          deductions: [
                            ...prev.deductions,
                            {
                              name: `Overpayment Clawback (${prev.referencePeriod || prev.referencedPeriod || 'Past Cycle'})`,
                              amount: amt,
                            },
                          ],
                        }));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold transition">
                      + Add Clawback Recovery (-₹
                      {Math.abs(formData.adjustmentAmount || 5000).toLocaleString('en-IN')})
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Slip Details */}
            <section>
              <SectionTitle
                icon={<FileText size={18} />}
                title="Salary Slip Details"
                description="General period details."
              />
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                {/* Pay Cycle Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pay Cycle <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.payCycle || 'Monthly'}
                    onChange={(e) => handleCycleChange(e.target.value as PayCycleOption)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black">
                    {companyPayrollSettings.enabledPayPeriods.monthly && (
                      <option value="Monthly">Monthly</option>
                    )}
                    {companyPayrollSettings.enabledPayPeriods.semiMonthly && (
                      <option value="Semi-Monthly">Semi-Monthly (Twice/Mo)</option>
                    )}
                    {companyPayrollSettings.enabledPayPeriods.biweekly && (
                      <option value="Bi-Weekly">Bi-Weekly (14-Day Cycle)</option>
                    )}
                    {companyPayrollSettings.enabledPayPeriods.weekly && (
                      <option value="Weekly">Weekly (7-Day Cycle)</option>
                    )}
                    {companyPayrollSettings.enabledPayPeriods.custom && (
                      <option value="Custom">Custom Date Range</option>
                    )}
                  </select>
                </div>

                {/* Sub-selector for cycles */}
                {formData.payCycle === 'Weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Week Period <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={cyclePeriodPart}
                      onChange={(e) => handlePeriodPartChange(Number(e.target.value))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black">
                      <option value={1}>Week 1 (01 - 07)</option>
                      <option value={2}>Week 2 (08 - 14)</option>
                      <option value={3}>Week 3 (15 - 21)</option>
                      <option value={4}>Week 4 (22 - 28)</option>
                      <option value={5}>Week 5 (29 - End)</option>
                    </select>
                  </div>
                )}

                {formData.payCycle === 'Bi-Weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pay Period Half <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={cyclePeriodPart}
                      onChange={(e) => handlePeriodPartChange(Number(e.target.value))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black">
                      <option value={1}>1st Half (01 - 14)</option>
                      <option value={2}>2nd Half (15 - End)</option>
                    </select>
                  </div>
                )}

                {formData.payCycle === 'Semi-Monthly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semi-Monthly Half <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={cyclePeriodPart}
                      onChange={(e) => handlePeriodPartChange(Number(e.target.value))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black">
                      <option value={1}>1st Half (01 - 15)</option>
                      <option value={2}>2nd Half (16 - End)</option>
                    </select>
                  </div>
                )}

                {formData.payCycle === 'Custom' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={customStart}
                        onChange={(e) => handleCustomDatesChange(e.target.value, customEnd)}
                        className="w-full rounded-xl border border-gray-300 px-2 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => handleCustomDatesChange(customStart, e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-2 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>
                )}

                {/* Month Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => handleMonthChange(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black ${
                      errors.monthYear ? 'border-red-500' : 'border-gray-300'
                    }`}>
                    {months.map((month: string) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black ${
                      errors.monthYear ? 'border-red-500' : 'border-gray-300'
                    }`}>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Slip Number / Sequence Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slip No. <span className="text-xs text-gray-400 font-normal">(001, 002...)</span>
                  </label>
                  <select
                    value={String(slipSequence).padStart(3, '0')}
                    onChange={(e) => handleSlipSequenceChange(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black font-mono font-bold text-slate-800">
                    <option value="001">001 (Slip #1)</option>
                    <option value="002">002 (Slip #2)</option>
                    <option value="003">003 (Slip #3)</option>
                    <option value="004">004 (Slip #4)</option>
                    <option value="005">005 (Slip #5)</option>
                    {slipSequence > 5 && (
                      <option value={String(slipSequence).padStart(3, '0')}>
                        {String(slipSequence).padStart(3, '0')} (Slip #{slipSequence})
                      </option>
                    )}
                  </select>
                </div>

                {/* Payment Status Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={formData.paymentStatus || 'pending'}
                    onChange={(e) => updateField('paymentStatus', e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black font-semibold text-slate-800">
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Pay Slip Number Input with Format Preview and Regenerate Action */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Pay Slip Number <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md font-medium">
                      Format: E[Emp]-[MM][YY][SlipNo]
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.paySlipNo}
                      placeholder={
                        formData.employeeId
                          ? 'e.g. E002-0926001'
                          : 'Select employee to generate (e.g. E002-0926001)'
                      }
                      onChange={(e) => handlePaySlipNoDirectChange(e.target.value)}
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm bg-white font-mono font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-black ${
                        errors.paySlipNo ? 'border-red-500 bg-red-50/20' : 'border-gray-300'
                      }`}
                    />
                    {Boolean(formData.employeeId) && (
                      <button
                        type="button"
                        onClick={handleRegenerateSlipNumber}
                        title="Regenerate Slip Number"
                        className="absolute right-2 top-2 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition">
                        <Sparkles size={13} className="text-black" />
                        Regenerate
                      </button>
                    )}
                  </div>
                  {errors.paySlipNo ? (
                    <p className="mt-1 text-xs text-red-500 font-medium">{errors.paySlipNo}</p>
                  ) : !formData.employeeId ? (
                    <p className="mt-1 text-[11px] text-amber-600 font-medium flex items-center gap-1">
                      <AlertCircle size={12} /> Slip number is generated automatically once employee is selected.
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      ✓ Generated in format E{formatEmployeeCode(formData.employeeId)}-{selectedMonth ? String(months.indexOf(selectedMonth.toUpperCase()) + 1).padStart(2, '0') : '09'}{String(selectedYear).slice(-2)}{String(slipSequence).padStart(3, '0')}
                    </p>
                  )}
                </div>

                {/* Auto-Calculated Pay Period */}
                <Input
                  label="Pay Period Range"
                  value={
                    formData.payPeriod ||
                    calculatePayPeriod(
                      selectedMonth,
                      selectedYear,
                      formData.payCycle,
                      biWeeklyPeriod
                    )
                  }
                  onChange={(e) => updateField('payPeriod', e.target.value)}
                  error={errors.payPeriod}
                  required
                />
              </div>
            </section>
          </div>
          {errors.monthYear && <p className="mt-1 text-xs text-red-500 px-6">{errors.monthYear}</p>}

          {/* Company Details */}
          <section className="px-6 pb-6">
            <SectionTitle
              icon={<Building2 size={18} />}
              title="Company Details"
              description="Organization information."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input
                label="Company Name"
                value={formData.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                error={errors.companyName}
                required
              />
              <Input
                label="Company Address"
                value={formData.companyAddress}
                onChange={(e) => updateField('companyAddress', e.target.value)}
                error={errors.companyAddress}
                required
              />
            </div>
          </section>

          {/* Employee Details with Auto-Filling Dropdown */}
          <section className="px-6 pb-6">
            <SectionTitle
              icon={<User size={18} />}
              title="Employee Details"
              description="Select employee to auto-fill details."
            />

            <div className="mt-4 relative" ref={dropdownRef}>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5 flex items-center gap-2">
                <UserCheck size={18} className="text-black" />
                Search & Select Employee
              </label>

              <div className="relative">
                <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  placeholder="Type name or ID to search employee..."
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-16 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition"
                />

                <div className="absolute right-3 top-2.5 flex items-center gap-1 text-gray-400">
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={clearEmployeeSearch}
                      className="p-0.5 hover:text-black hover:bg-gray-100 rounded-md transition"
                      title="Clear search">
                      <X size={15} />
                    </button>
                  )}
                  {isLoadingUsers ? (
                    <Loader2 size={16} className="animate-spin text-black" />
                  ) : (
                    <ChevronDown
                      size={18}
                      className={`cursor-pointer transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                      onClick={() => setIsDropdownOpen((prev) => !prev)}
                    />
                  )}
                </div>
              </div>

              {isDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {isLoadingUsers ? (
                    <div className="p-3 text-center text-xs text-gray-500">
                      Loading employees...
                    </div>
                  ) : displayedUsers.length === 0 ? (
                    <div className="p-3 text-center text-xs text-gray-500">
                      No matching employees found
                    </div>
                  ) : (
                    displayedUsers.map((user, idx) => {
                      const id = user.id || user._id || user.employeeId || `emp-${idx}`;
                      const name = getEmployeeName(user);
                      const empId = user.employeeId ?? user.id ?? user._id ?? 'N/A';
                      const role = user.position || user.designation || user.role || '';
                      const account =
                        user.bank_account_number ||
                        user.account_number ||
                        user.accountNumber ||
                        user.bank_account ||
                        user.bankAccount ||
                        '';
                      const salary =
                        user.base_salary ||
                        user.basic_salary ||
                        user.baseSalary ||
                        user.salary ||
                        '';

                      return (
                        <div
                          key={id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectEmployee(user);
                          }}
                          className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-none transition">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{name}</p>
                            <p className="text-xs text-gray-500">
                              {role || 'Employee'}
                              {account ? ` • Acc: ${account}` : ''}
                              {salary ? ` • ₹${Number(salary).toLocaleString('en-IN')}` : ''}
                            </p>
                          </div>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono font-medium">
                            {String(empId)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {formData.employeeId && (
                <div className="mt-2.5 flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-semibold text-gray-900">{formData.employeeName}</span>
                    <span className="text-gray-500 font-mono">Code: {formatEmployeeCode(formData.employeeId)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Generated Slip No:</span>
                    <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">
                      {formData.paySlipNo || 'Pending generation'}
                    </span>
                  </div>
                </div>
              )}
              {errors.employeeId && (
                <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.employeeId}</p>
              )}
            </div>

            {/* Mapped Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
              <Input
                label="Employee Name"
                value={formData.employeeName}
                onChange={(e) => updateField('employeeName', e.target.value)}
                error={errors.employeeName}
                required
              />
              <Input
                label="Employee ID / Code"
                value={formData.employeeId}
                onChange={(e) => {
                  const val = e.target.value;
                  updateField('employeeId', val);
                  if (val.trim() && formData.monthYear) {
                    const regenerated = generateSlipNumber(val, formData.monthYear, slipSequence);
                    updateField('paySlipNo', regenerated);
                  }
                }}
                error={errors.employeeId}
                required
              />
              <Input
                label="Designation / Role"
                value={formData.position}
                onChange={(e) => updateField('position', e.target.value)}
              />
              <Input
                label="Bank Account Number"
                value={formData.accountNumber}
                onChange={(e) => updateField('accountNumber', e.target.value)}
                placeholder="e.g. 123456789012"
              />
              <Input
                label="Base Salary (₹)"
                type="number"
                value={formData.baseSalary ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Number(e.target.value);
                  updateField('baseSalary', val);
                  setFormData((prev) => {
                    const updated = [...prev.earnings];
                    const bIdx = updated.findIndex(
                      (item) =>
                        item.name.toLowerCase().includes('basic') ||
                        item.name.toLowerCase().includes('base')
                    );
                    const numVal = Number(val || 0);
                    if (bIdx !== -1) {
                      updated[bIdx] = { ...updated[bIdx], amount: numVal };
                    } else if (updated.length > 0) {
                      updated[0] = { ...updated[0], amount: numVal };
                    }
                    return { ...prev, baseSalary: val, earnings: updated };
                  });
                }}
                placeholder="e.g. 50000"
              />
            </div>

            {/* Statutory Tax & Total Compensation Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-3.5 bg-gray-50/80 rounded-xl border border-gray-200">
              <Input
                label="Annual Total Comp / CTC (₹)"
                type="number"
                value={formData.totalCompensation ?? ''}
                onChange={(e) => updateField('totalCompensation', e.target.value)}
                placeholder="e.g. 1200000"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Regime</label>
                <select
                  value={formData.taxRegime || 'New Regime'}
                  onChange={(e) =>
                    updateField('taxRegime', e.target.value as 'New Regime' | 'Old Regime')
                  }
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black">
                  <option value="New Regime">New Regime (Standard ₹75k, Nil up to ₹12L)</option>
                  <option value="Old Regime">
                    Old Regime (Exemptions 80C/80D/HRA, Nil up to ₹5L)
                  </option>
                </select>
              </div>
              <Input
                label="PAN Number"
                value={formData.panNumber || ''}
                onChange={(e) => updateField('panNumber', e.target.value.toUpperCase())}
                placeholder="e.g. ABCDE1234F"
              />
            </div>

            {Boolean(
              selectedEmployeeObj?.isMidYearJoiner ?? selectedEmployeeObj?.is_mid_year_joiner
            ) && (
              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <AlertCircle size={15} className="text-amber-600 flex-shrink-0" />
                  <span>
                    <strong>Mid-Year Joiner Detected:</strong> Previous Employer YTD Gross: ₹
                    {Number(
                      selectedEmployeeObj?.previousEmployerYtd?.grossSalary ||
                        selectedEmployeeObj?.previous_employer_ytd?.grossSalary ||
                        0
                    ).toLocaleString('en-IN')}
                    , TDS Credited: ₹
                    {Number(
                      selectedEmployeeObj?.previousEmployerYtd?.tdsDeducted ||
                        selectedEmployeeObj?.previous_employer_ytd?.tdsDeducted ||
                        0
                    ).toLocaleString('en-IN')}
                    . Cumulative tax slabs and credits are active.
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* Days & Attendance Section */}
          <section className="px-6 pb-6">
            <SectionTitle
              icon={<Calendar size={18} />}
              title="Attendance & Working Days"
              description="Paid vs unpaid days for the cycle."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input
                label="Paid Days"
                type="number"
                value={formData.paidDays}
                onChange={(e) => updateField('paidDays', Number(e.target.value))}
                error={errors.paidDays}
                required
              />
              <Input
                label="LOP (Loss of Pay) Days"
                type="number"
                value={formData.lopDays}
                onChange={(e) => updateField('lopDays', Number(e.target.value))}
              />
            </div>
          </section>

          {/* Earnings & Deductions Breakdown */}
          <section className="px-6 pb-6">
            {errors.earnings && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{errors.earnings}</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Earnings */}
              <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                      <IndianRupee size={16} className="text-emerald-600" /> Earnings
                    </span>
                    <button
                      type="button"
                      onClick={handleAutoPopulateCompensation}
                      disabled={isFetchingCompensation || isPreviewingCompensation}
                      title="Auto-fetch and populate salary structure from employee's stored compensation or CTC"
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition disabled:opacity-50">
                      {isFetchingCompensation || isPreviewingCompensation ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Sparkles size={12} className="text-emerald-600" />
                      )}
                      Auto-Populate
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={addEarning}
                    className="text-xs text-black font-semibold flex items-center gap-1 hover:underline">
                    <Plus size={14} /> Add Line
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.earnings.map((earning, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Earning Name"
                        value={earning.name}
                        onChange={(e) => updateEarning(idx, 'name', e.target.value)}
                        className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-black outline-none bg-white"
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={earning.amount || ''}
                        onChange={(e) => updateEarning(idx, 'amount', e.target.value)}
                        className="w-28 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-black outline-none bg-white text-right font-mono"
                      />
                      {formData.earnings.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEarning(idx)}
                          className="text-gray-400 hover:text-red-500 transition p-1">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between font-bold text-xs text-gray-900">
                  <span>Total Earnings</span>
                  <span className="font-mono">₹{totalEarnings.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Deductions */}
              <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200">
                <div className="flex flex-wrap items-center justify-between pb-3 border-b border-gray-200 mb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                      <IndianRupee size={16} className="text-red-600" /> Deductions
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <label
                      title="When unchecked, Income Tax (TDS) is set to ₹0 unless explicitly checked."
                      className={`flex items-center gap-1.5 text-xs font-medium cursor-pointer select-none px-2.5 py-1 rounded-lg border transition ${
                        deductIncomeTax
                          ? 'bg-amber-100/90 border-amber-300 text-amber-900 font-semibold'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}>
                      <input
                        type="checkbox"
                        checked={deductIncomeTax}
                        onChange={(e) => handleToggleDeductIncomeTax(e.target.checked)}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5 cursor-pointer"
                      />
                      <span>Deduct Income Tax (TDS)</span>
                    </label>
                    <button
                      type="button"
                      onClick={addDeduction}
                      className="text-xs text-black font-semibold flex items-center gap-1 hover:underline">
                      <Plus size={14} /> Add Line
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {formData.deductions.map((deduction, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Deduction Name"
                        value={deduction.name}
                        onChange={(e) => updateDeduction(idx, 'name', e.target.value)}
                        className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-black outline-none bg-white"
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={deduction.amount || ''}
                        onChange={(e) => updateDeduction(idx, 'amount', e.target.value)}
                        className="w-28 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-black outline-none bg-white text-right font-mono"
                      />
                      {formData.deductions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDeduction(idx)}
                          className="text-gray-400 hover:text-red-500 transition p-1">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between font-bold text-xs text-gray-900">
                  <span>Total Deductions</span>
                  <span className="font-mono">₹{totalDeductions.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Statutory Tax & Projected TDS Widget */}
            <div className="mt-4 rounded-2xl bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-yellow-50/30 border border-amber-200 overflow-hidden shadow-xs">
              <div className="p-4 flex flex-wrap items-center justify-between gap-3 bg-amber-500/10 border-b border-amber-200">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                    <Calculator size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      Statutory Tax & TDS Computation ({formData.taxRegime || 'New Regime'})
                      {Boolean(
                        selectedEmployeeObj?.isMidYearJoiner ??
                        selectedEmployeeObj?.is_mid_year_joiner
                      ) && (
                        <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                          Mid-Year Joiner
                        </span>
                      )}
                      {!deductIncomeTax ? (
                        <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                          TDS Not Deducted
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          TDS Deducted
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-gray-600">
                      Est. Annual CTC: ₹{Number(estimatedAnnualGross).toLocaleString('en-IN')} •
                      Taxable: ₹
                      {Number(liveTaxResult?.netTaxableIncome || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTaxProjectionModal(true)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition flex items-center gap-1.5 shadow-xs">
                    <FileSpreadsheet size={14} className="text-emerald-600" />
                    Tax Projection Sheet
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyTds}
                    disabled={!liveTaxResult || liveTaxResult.projectedMonthlyTds === 0}
                    className="px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition flex items-center gap-1.5 shadow-xs disabled:opacity-40">
                    <Sparkles size={14} />
                    Apply TDS (₹
                    {Number(liveTaxResult?.projectedMonthlyTds || 0).toLocaleString('en-IN')})
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTaxCalculator(!showTaxCalculator)}
                    className="p-1.5 text-gray-500 hover:text-black rounded-lg transition"
                    title={showTaxCalculator ? 'Collapse Tax Details' : 'Expand Tax Details'}>
                    {showTaxCalculator ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {showTaxCalculator && liveTaxResult && (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-amber-100 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                        Standard Deduction
                      </span>
                      <p className="text-sm font-bold text-gray-800 mt-0.5">
                        ₹{liveTaxResult.standardDeduction.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-amber-100 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                        Total Annual Tax
                      </span>
                      <p className="text-sm font-bold text-gray-800 mt-0.5">
                        ₹{liveTaxResult.totalAnnualTax.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-amber-100 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                        Cess (4%)
                      </span>
                      <p className="text-sm font-bold text-gray-800 mt-0.5">
                        ₹{liveTaxResult.healthAndEducationCess.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="p-3 bg-amber-100/60 rounded-xl border border-amber-200 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-900">
                        Projected Monthly TDS
                      </span>
                      <p className="text-sm font-extrabold text-amber-700 font-mono mt-0.5">
                        ₹{liveTaxResult.projectedMonthlyTds.toLocaleString('en-IN')}/mo
                      </p>
                    </div>
                  </div>

                  {liveTaxResult.rebate87A > 0 && (
                    <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                      <Sparkles size={14} className="text-emerald-600 flex-shrink-0" />
                      <span>
                        <strong>Section 87A Zero-Tax Rebate Applied:</strong> Taxable income is
                        within the ₹{formData.taxRegime === 'Old Regime' ? '5,00,000' : '12,00,000'}{' '}
                        statutory threshold. Net tax payable is ₹0.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Signatory & HR Notes Section */}
            <div className="mt-5 p-4 rounded-2xl bg-gray-50/70 border border-gray-200">
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-gray-200 mb-4 gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gray-200 text-gray-800 rounded-lg">
                    <UserCheck size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Signatory & HR Discrepancy Note</h4>
                    <p className="text-xs text-gray-500">
                      Customize the authorized signatory name, title, and instructions shown on this salary slip.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-gray-400 font-medium mr-1">Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      updateField('authorizedSignatory', 'Seema Srivastava');
                      updateField('signatoryRole', '(Director)');
                    }}
                    className="text-[11px] bg-white border border-gray-200 hover:border-gray-400 text-gray-700 font-medium px-2 py-0.5 rounded-md transition shadow-2xs">
                    Director (Seema Srivastava)
                  </button>
                  {Boolean(loggedInUser?.name || (user as any)?.name || user?.username) && (
                    <button
                      type="button"
                      onClick={() => {
                        const userName = String(
                          loggedInUser?.name || (user as any)?.name || user?.username || ''
                        );
                        updateField('authorizedSignatory', userName);
                        updateField('signatoryRole', '(Authorized Signatory)');
                      }}
                      className="text-[11px] bg-white border border-gray-200 hover:border-gray-400 text-gray-700 font-medium px-2 py-0.5 rounded-md transition shadow-2xs">
                      Current User ({String(loggedInUser?.name || (user as any)?.name || user?.username)})
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Authorized Signatory Name
                  </label>
                  <input
                    type="text"
                    value={formData.authorizedSignatory}
                    onChange={(e) => updateField('authorizedSignatory', e.target.value)}
                    placeholder="e.g. Seema Srivastava"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-black outline-none bg-white font-medium"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Appears above the designation in the bottom signature block.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Signatory Role / Designation
                  </label>
                  <input
                    type="text"
                    value={formData.signatoryRole}
                    onChange={(e) => updateField('signatoryRole', e.target.value)}
                    placeholder="e.g. (Director) or HR Manager"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-black outline-none bg-white font-medium"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Signatory designation or department title.
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  HR Note & Discrepancy Instructions
                </label>
                <textarea
                  rows={2}
                  value={formData.hrNote}
                  onChange={(e) => updateField('hrNote', e.target.value)}
                  placeholder="e.g. For any discrepancies, please contact the HR department within 3 working days."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-black outline-none bg-white resize-y leading-relaxed"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Printed in the "HR Note" box at the bottom right of the employee's salary slip.
                </p>
              </div>
            </div>

            {/* Net Salary Banner */}
            <div className="mt-4 p-4 rounded-2xl bg-black text-white flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-400 font-medium">Net Payable Salary</p>
                <p className="text-xl font-bold font-mono mt-0.5">
                  ₹{netSalary.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </section>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 transition flex items-center gap-2 disabled:opacity-50">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting
                ? isEditing
                  ? 'Updating Slip...'
                  : 'Generating Slip...'
                : isEditing
                  ? 'Update Salary Slip'
                  : 'Generate Salary Slip'}
            </button>
          </div>
        </form>
      </div>

      {showTaxProjectionModal && (
        <TaxProjectionModal
          isOpen={showTaxProjectionModal}
          onClose={() => setShowTaxProjectionModal(false)}
          initialEmployee={
            selectedEmployeeObj || {
              id: formData.employeeId,
              name: formData.employeeName,
              employeeName: formData.employeeName,
              employeeId: formData.employeeId,
              department: formData.department,
              designation: formData.position,
              totalCompensation: Number(formData.totalCompensation) || estimatedAnnualGross,
              annualCtc: Number(formData.totalCompensation) || estimatedAnnualGross,
              taxRegime: formData.taxRegime,
              panNumber: formData.panNumber,
            }
          }
        />
      )}
    </div>
  );
};

export default SalarySlipForm;

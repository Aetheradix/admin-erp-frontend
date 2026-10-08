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
  Search,
} from 'lucide-react';
import { useGetUsersQuery } from '@/store/api/userSlice';
import { useSelector } from 'react-redux'; // Added to access current logged-in user if available
import { useAuth } from '@/hooks/useAuth';
import type { PayrollRecord  } from '../PayrollPage';
export interface EarningsItem {
  name: string;
  amount: number;
}

export interface DeductionItem {
  name: string;
  amount: number;
}

export interface SalarySlipData {
  monthYear: string;
  paySlipNo: string;
  payPeriod: string;
  payCycle?: 'Monthly' | 'Bi-Weekly'; // ADDED: Pay cycle selection

  companyName: string;
  companyAddress: string;
  department?: string | null;

  userId: number | string; // ADDED: ID of logged-in user creating the slip
  employeeId: number | string; // ID of selected employee
  employeeName: string;
  position: string;
  accountNumber: string;
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

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, required, className = '', ...props }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      {...props}
      className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition ${
        error ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-black'
      } ${className}`}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
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
  cycle: 'Monthly' | 'Bi-Weekly' = 'Bi-Weekly',
  periodPart: 1 | 2 = 1
): string => {
  const months = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];
  const monthIndex = months.indexOf(monthName.toUpperCase());
  if (monthIndex === -1) return '';

  const year = parseInt(yearStr, 10);
  const totalDays = getDaysInMonth(year, monthIndex);

  if (cycle === 'Bi-Weekly') {
    if (periodPart === 1) {
      const startDate = new Date(year, monthIndex, 1);
      const endDate = new Date(year, monthIndex, 15);
      return `${formatDateFormatted(startDate)} - ${formatDateFormatted(endDate)}`;
    } else {
      const startDate = new Date(year, monthIndex, 16);
      const endDate = new Date(year, monthIndex, totalDays);
      return `${formatDateFormatted(startDate)} - ${formatDateFormatted(endDate)}`;
    }
  }

  // Monthly
  const startDate = new Date(year, monthIndex, 1);
  const endDate = new Date(year, monthIndex, totalDays);
  return `${formatDateFormatted(startDate)} - ${formatDateFormatted(endDate)}`;
};

const getInitialForm = (): SalarySlipData => {
  const today = new Date();
  const year = today.getFullYear();
  const monthIndex = today.getMonth(); // 0 - 11
  const monthNameUpper = today.toLocaleString('en-US', { month: 'long' }).toUpperCase();

  // 1. Dynamic Month & Year (e.g., "OCTOBER 2026")
  const monthYear = `${monthNameUpper} ${year}`;

  // 2. Dynamic Pay Period (Bi-weekly Period 1 default: 01 - 15)
  const payPeriod = calculatePayPeriod(monthNameUpper, String(year), 'Bi-Weekly', 1);

  // 3. Dynamic Pay Slip Number (e.g., "1026-001" or timestamp-based sequence)
  const monthFormatted = String(monthIndex + 1).padStart(2, '0');
  const paySlipNo = `SLIP-${year}${monthFormatted}-${Math.floor(100 + Math.random() * 900)}`;

  return {
    monthYear,
    paySlipNo,
    payPeriod,
    payCycle: 'Bi-Weekly',

    companyName: 'AETHERADIX',
    companyAddress: 'F-N 507, Crystal Tower, IBD Kings Park, Bawadia Kalan, Bhopal, MP | 462039',

    userId: '',
    employeeId: '',
    employeeName: '',
    position: '',
    accountNumber: '',

    paidDays: 15, // Default for 1st Bi-Weekly half
    lopDays: 0,

    generatedOn: getLocalSystemDate(),

    earnings: [
      { name: 'Basic Pay', amount: 0 },
      { name: 'Allowance', amount: 0 },
      { name: 'Overtime Pay', amount: 0 },
      { name: 'Bonus', amount: 0 },
    ],

    deductions: [
      { name: 'Professional Tax', amount: 0 },
      { name: 'Contribution', amount: 0 },
      { name: 'Other Deductions', amount: 0 },
    ],

    authorizedSignatory: 'Seema Srivastava',
    signatoryRole: '(Director)',

    hrNote: 'For any discrepancies, please contact the HR department within 3 working days.',
  };
};

const SalarySlipForm = ({ onClose, onCreate, fetchUsers }: SalarySlipFormProps) => {
  const loggedInUser = useSelector((state: any) => state.auth?.user || state.user?.currentUser);
  const { user } = useAuth();
  const [formData, setFormData] = useState<SalarySlipData>(() => {
    const initial = getInitialForm();
    if (loggedInUser) {
      initial.userId = loggedInUser.id || loggedInUser._id || loggedInUser.userId || '';
    }
    return initial;
  });

  const [biWeeklyPeriod, setBiWeeklyPeriod] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: rtkUsersData, isLoading: isRtkLoading } = useGetUsersQuery(undefined, {
    skip: !!fetchUsers,
  });

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

  const months: string[] = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
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

  // Helper to update month or year and reflect back into formData.monthYear & payPeriod
  const handleMonthChange = (selectedMonth: string) => {
    const currentYearVal = formData.monthYear?.split(' ')[1] || String(currentYear);
    const updatedMonthYear = `${selectedMonth} ${currentYearVal}`;
    const newPayPeriod = calculatePayPeriod(selectedMonth, currentYearVal, formData.payCycle, biWeeklyPeriod);
    setFormData((prev) => ({ ...prev, monthYear: updatedMonthYear, payPeriod: newPayPeriod }));
  };

  const handleYearChange = (selectedYear: string) => {
    const currentMonthVal = formData.monthYear?.split(' ')[0] || months[new Date().getMonth()];
    const updatedMonthYear = `${currentMonthVal} ${selectedYear}`;
    const newPayPeriod = calculatePayPeriod(currentMonthVal, selectedYear, formData.payCycle, biWeeklyPeriod);
    setFormData((prev) => ({ ...prev, monthYear: updatedMonthYear, payPeriod: newPayPeriod }));
  };

  const handleCycleChange = (cycle: 'Monthly' | 'Bi-Weekly') => {
    const currentMonthVal = formData.monthYear?.split(' ')[0] || months[new Date().getMonth()];
    const currentYearVal = formData.monthYear?.split(' ')[1] || String(currentYear);
    const monthIndex = months.indexOf(currentMonthVal.toUpperCase());
    const totalDays = getDaysInMonth(parseInt(currentYearVal, 10), monthIndex);

    const newPayPeriod = calculatePayPeriod(currentMonthVal, currentYearVal, cycle, biWeeklyPeriod);
    const defaultPaidDays = cycle === 'Bi-Weekly' ? (biWeeklyPeriod === 1 ? 15 : totalDays - 15) : totalDays;

    setFormData((prev) => ({
      ...prev,
      payCycle: cycle,
      payPeriod: newPayPeriod,
      paidDays: defaultPaidDays,
    }));
  };

  const handleBiWeeklyPartChange = (part: 1 | 2) => {
  setBiWeeklyPeriod(part);
  const currentMonthVal = formData.monthYear?.split(' ')[0] || months[new Date().getMonth()];
  // Added 'const' declaration here to prevent ReferenceError
  const currentYearVal = formData.monthYear?.split(' ')[1] || String(currentYear);
  const monthIndex = months.indexOf(currentMonthVal.toUpperCase());
  const totalDays = getDaysInMonth(parseInt(currentYearVal, 10), monthIndex);

  const newPayPeriod = calculatePayPeriod(currentMonthVal, currentYearVal, 'Bi-Weekly', part);
  const defaultPaidDays = part === 1 ? 15 : totalDays - 15;

  setFormData((prev) => ({
    ...prev,
    payPeriod: newPayPeriod,
    paidDays: defaultPaidDays,
  }));
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

  const handleSelectEmployee = (user: any) => {
    // Extract a numeric user ID or fallback to user.id / user._id
    const rawId = user.userId || user.id || user._id || user.employeeId;
    const numericId = Number(rawId);

    setFormData((prev) => ({
      ...prev,
      userId: isNaN(numericId) ? rawId : numericId, // Ensure userId is populated
      employeeId: user.employeeId || user.id || `EMP-${rawId}`,
      employeeName: getEmployeeName(user),
      position: user.position || user.designation || user.role || '',
      accountNumber: user.accountNumber || user.bankAccount || '',
    }));

    // Clear previous validation errors
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.userId;
      delete newErrors.employeeId;
      return newErrors;
    });

    setIsDropdownOpen(false);
  };

  const clearEmployeeSearch = () => {
    setSearchTerm('');
    setIsDropdownOpen(true);

    setFormData((prev: SalarySlipData) => ({
      ...prev, // Keep existing earnings, deductions, dates, notes, etc.
      userId: 0, // Or undefined / null depending on your SalarySlipData interface
      employeeId: '',
      employeeName: '',
      position: '',
      department: '',
      accountNumber: '',
    }));
  };

  const updateEarning = (index: number, field: keyof EarningsItem, value: string | number) => {
    const updatedValue = field === 'amount' ? (value === '' ? 0 : Number(value)) : value;
    setFormData((prev) => ({
      ...prev,
      earnings: prev.earnings.map((item, i) =>
        i === index ? { ...item, [field]: updatedValue } : item
      ),
    }));
  };

  const updateDeduction = (index: number, field: keyof DeductionItem, value: string | number) => {
    const updatedValue = field === 'amount' ? (value === '' ? 0 : Number(value)) : value;
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

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   // 1. Recipient Employee ID (selected from the employee dropdown)
  //   const recipientUserId = formData.userId || formData.employeeId;
  //   const numericRecipientId = Number(recipientUserId);

  //   if (!recipientUserId || isNaN(numericRecipientId) || numericRecipientId === 0) {
  //     setErrors((prev) => ({
  //       ...prev,
  //       userId: 'Please select a valid employee from the list.',
  //       employeeId: 'Employee selection is required.',
  //     }));
  //     return;
  //   }

  //   // 2. Creator ID (Logged-in HR/Admin generating the payslip)
  //   const creatorId = user?.id || loggedInUser?.id || null;

  //   try {
  //     setIsSubmitting(true);

  //     // 3. Parse Month & Year safely into Numeric Month (1 - 12)
  //     const monthMap: Record<string, number> = {
  //       JANUARY: 1,
  //       FEBRUARY: 2,
  //       MARCH: 3,
  //       APRIL: 4,
  //       MAY: 5,
  //       JUNE: 6,
  //       JULY: 7,
  //       AUGUST: 8,
  //       SEPTEMBER: 9,
  //       OCTOBER: 10,
  //       NOVEMBER: 11,
  //       DECEMBER: 12,
  //     };

  //     const dateParts = formData.monthYear ? formData.monthYear.trim().split(/\s+/) : [];
  //     let payPeriodMonth: number = new Date().getMonth() + 1;
  //     let payPeriodYear: number = new Date().getFullYear();

  //     if (dateParts.length >= 1) {
  //       const firstPartUpper = dateParts[0].toUpperCase();
  //       if (monthMap[firstPartUpper]) {
  //         payPeriodMonth = monthMap[firstPartUpper];
  //       }
  //     }

  //     if (dateParts.length >= 2) {
  //       payPeriodYear = parseInt(dateParts[1], 10) || payPeriodYear;
  //     }

  //     // 4. Keyword matching utilities
  //     const findAmountByKeywords = (items: typeof formData.earnings, keywords: string[]) => {
  //       const match = items.find((i) =>
  //         keywords.some((kw) => i.name.toLowerCase().trim().includes(kw.toLowerCase()))
  //       );
  //       return match ? Number(match.amount) || 0 : 0;
  //     };

  //     const getUnmatchedSum = (items: typeof formData.earnings, matchedKeywords: string[]) => {
  //       return items
  //         .filter(
  //           (i) =>
  //             !matchedKeywords.some((kw) => i.name.toLowerCase().trim().includes(kw.toLowerCase()))
  //         )
  //         .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  //     };

  //     // 5. Earnings & Deductions field mapping
  //     const basicSalary = findAmountByKeywords(formData.earnings, ['basic']);
  //     const houseRentAllowance = findAmountByKeywords(formData.earnings, ['hra', 'house rent']);
  //     const bonus = findAmountByKeywords(formData.earnings, ['bonus', 'incentive']);
  //     const specialAllowance = findAmountByKeywords(formData.earnings, ['special']);
  //     const conveyanceAllowance = findAmountByKeywords(formData.earnings, [
  //       'conveyance',
  //       'transport',
  //     ]);

  //     const matchedEarningKeywords = [
  //       'basic',
  //       'hra',
  //       'house rent',
  //       'bonus',
  //       'incentive',
  //       'special',
  //       'conveyance',
  //       'transport',
  //     ];
  //     const otherEarnings = getUnmatchedSum(formData.earnings, matchedEarningKeywords);

  //     const providentFund = findAmountByKeywords(formData.deductions, ['pf', 'provident']);
  //     const professionalTax = findAmountByKeywords(formData.deductions, ['pt', 'professional tax']);
  //     const incomeTaxTds = findAmountByKeywords(formData.deductions, ['tds', 'income tax', 'tax']);

  //     const matchedDeductionKeywords = [
  //       'pf',
  //       'provident',
  //       'pt',
  //       'professional tax',
  //       'tds',
  //       'income tax',
  //       'tax',
  //     ];
  //     const otherDeductions = getUnmatchedSum(formData.deductions, matchedDeductionKeywords);

  //     const paidDays = Number(formData.paidDays) || 15;
  //     const lopDays = Number(formData.lopDays) || 0;

  //     // 6. Complete corrected payload
  //     const payload = {
  //       // --- Target Employee (Recipient receiving the slip) ---
  //       user_id: numericRecipientId,
  //       userId: numericRecipientId,
  //       employee_code: String(formData.employeeId || numericRecipientId),
  //       employeeId: String(formData.employeeId || numericRecipientId),
  //       employee_id: String(formData.employeeId || numericRecipientId),
  //       employeeName: formData.employeeName || 'Employee',

  //       // --- Creator (HR/Admin issuing the slip) ---
  //       created_by: creatorId ? Number(creatorId) : null,
  //       createdById: creatorId ? Number(creatorId) : null,

  //       // --- Pay Period & Dates ---
  //       pay_cycle: formData.payCycle || 'Bi-Weekly',
  //       payCycle: formData.payCycle || 'Bi-Weekly',
  //       pay_period_month: payPeriodMonth,
  //       payPeriodMonth: payPeriodMonth,
  //       pay_period_year: payPeriodYear,
  //       payPeriodYear: payPeriodYear,
  //       monthYear: formData.monthYear,
  //       month_year: formData.monthYear,
  //       payPeriod: formData.payPeriod || calculatePayPeriod(selectedMonth, selectedYear, formData.payCycle, biWeeklyPeriod),
  //       pay_period: formData.payPeriod || calculatePayPeriod(selectedMonth, selectedYear, formData.payCycle, biWeeklyPeriod),
  //       paySlipNo: formData.paySlipNo,
  //       pay_slip_no: formData.paySlipNo,

  //       // --- Department & Bank ---
  //       designation: formData.position || null,
  //       position: formData.position || null,
  //       department: formData.department || null,
  //       bank_account_number: formData.accountNumber || null,
  //       bankAccountNumber: formData.accountNumber || null,
  //       accountNumber: formData.accountNumber || '',

  //       // --- Working Days ---
  //       total_working_days: paidDays + lopDays,
  //       totalWorkingDays: paidDays + lopDays,
  //       days_worked: paidDays,
  //       daysWorked: paidDays,
  //       paidDays: paidDays,
  //       paid_days: paidDays,
  //       leave_days: lopDays,
  //       leaveDays: lopDays,
  //       lopDays: lopDays,
  //       lop_days: lopDays,

  //       // --- Earnings & Deductions Arrays ---
  //       earnings: formData.earnings.filter((e) => e.name.trim() !== ''),
  //       deductions: formData.deductions.filter((d) => d.name.trim() !== ''),

  //       // --- Earnings Breakdown ---
  //       basic_salary: basicSalary,
  //       basicSalary,
  //       basePay: basicSalary || totalEarnings,
  //       base_amount: basicSalary || totalEarnings,
  //       house_rent_allowance: houseRentAllowance,
  //       houseRentAllowance,
  //       special_allowance: specialAllowance,
  //       specialAllowance,
  //       conveyance_allowance: conveyanceAllowance,
  //       conveyanceAllowance,
  //       bonus,
  //       bonusPay: bonus,
  //       bonus_amount: bonus,
  //       other_earnings: otherEarnings,
  //       otherEarnings,
  //       gross_salary: totalEarnings,

  //       // --- Deductions Breakdown ---
  //       provident_fund: providentFund,
  //       providentFund,
  //       professional_tax: professionalTax,
  //       professionalTax,
  //       income_tax_tds: incomeTaxTds,
  //       incomeTaxTds,
  //       other_deductions: otherDeductions,
  //       otherDeductions,

  //       // --- Totals ---
  //       totalEarnings,
  //       totalDeductions,
  //       total_deductions: totalDeductions,
  //       net_salary: netSalary,
  //       netSalary,
  //       total_amount: netSalary,

  //       // --- Status & Signatory ---
  //       payment_status: 'paid',
  //       paymentStatus: 'paid',
  //       payment_date: formData.generatedOn || new Date().toISOString().split('T')[0],
  //       paymentDate: formData.generatedOn || null,
  //       remarks: formData.hrNote || null,
  //       hrNote: formData.hrNote || '',
  //       authorizedSignatory: formData.authorizedSignatory || '',
  //       signatoryRole: formData.signatoryRole || '',
  //     };

  //     console.log('Submitting fixed payload:', payload);
  //     await onCreate(payload);
  //   } catch (error) {
  //     console.error('Failed to create salary slip:', error);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };



  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // 1. Target Employee ID (Selected from dropdown - recipient of slip)
  const recipientUserId = formData.userId || formData.employeeId;
  const numericRecipientId = Number(recipientUserId);

  if (!recipientUserId || isNaN(numericRecipientId) || numericRecipientId <= 0) {
    setErrors((prev) => ({
      ...prev,
      userId: 'Please select a valid employee from the list.',
      employeeId: 'Employee selection is required.',
    }));
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
          (i) => !matchedKeywords.some((kw) => i.name.toLowerCase().trim().includes(kw.toLowerCase()))
        )
        .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    };

    // Earnings Breakdown
    const earningMatches = ['basic', 'hra', 'house rent', 'bonus', 'incentive', 'special', 'conveyance', 'transport'];
    const basicSalary = findAmount(formData.earnings, ['basic']);
    const houseRentAllowance = findAmount(formData.earnings, ['hra', 'house rent']);
    const bonus = findAmount(formData.earnings, ['bonus', 'incentive']);
    const specialAllowance = findAmount(formData.earnings, ['special']);
    const conveyanceAllowance = findAmount(formData.earnings, ['conveyance', 'transport']);
    const otherEarnings = getUnmatchedSum(formData.earnings, earningMatches);

    // Deductions Breakdown
    const deductionMatches = ['pf', 'provident', 'pt', 'professional tax', 'tds', 'income tax', 'tax'];
    const providentFund = findAmount(formData.deductions, ['pf', 'provident']);
    const professionalTax = findAmount(formData.deductions, ['pt', 'professional tax']);
    const incomeTaxTds = findAmount(formData.deductions, ['tds', 'income tax', 'tax']);
    const otherDeductions = getUnmatchedSum(formData.deductions, deductionMatches);

    // Attendance
    const paidDays = Number(formData.paidDays) || 15;
    const lopDays = Number(formData.lopDays) || 0;

    const payload = {
  // 1. Recipient ID
  user_id: numericRecipientId,

  // 2. Creator ID (Logged-in HR/Admin)
  created_by: creatorId,
  pay_slip_no: formData.paySlipNo || null, // Added pay_slip_no to payload

  // 3. Dates & Cycle
  month_year: formData.monthYear,
  pay_frequency: (formData.payCycle || 'biweekly').toLowerCase(),
  cycle_number: biWeeklyPeriod || 1,

  // 4. Attendance
  paid_days: paidDays,
  lop_days: lopDays,
  totalWorkingDays: paidDays + lopDays,

  // 5. Employee Details
  employee_code: formData.employeeId ? String(formData.employeeId) : null,
  designation: formData.position || null,
  department: formData.department || null,
  bank_account_number: formData.accountNumber || null,

  // 6. Breakdown Arrays & Calculated Figures
  earnings: formData.earnings.filter((e) => e.name.trim() !== ''),
  deductions: formData.deductions.filter((d) => d.name.trim() !== ''),
  basicSalary,
  houseRentAllowance,
  specialAllowance,
  conveyanceAllowance,
  bonus,
  otherEarnings,
  providentFund,
  professionalTax,
  incomeTaxTds,
  otherDeductions,

  // 7. Status & Remarks
  paymentStatus: 'paid',
  paymentDate: formData.generatedOn || new Date().toISOString().split('T')[0],
  remarks: formData.hrNote || null,
};

  await onCreate(payload);

    
  } catch (error) {
    console.error('Failed to create salary slip:', error);
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
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm font-medium">
                <AlertCircle size={20} className="shrink-0 text-red-500" />
                <span>Please select an employee and fill all required fields.</span>
              </div>
            )}

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
                    value={formData.payCycle || 'Bi-Weekly'}
                    onChange={(e) => handleCycleChange(e.target.value as 'Monthly' | 'Bi-Weekly')}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black">
                    <option value="Bi-Weekly">Bi-Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>

                {/* Bi-Weekly Period Half Selector (Visible only when Bi-Weekly) */}
                {formData.payCycle === 'Bi-Weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pay Period Half <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={biWeeklyPeriod}
                      onChange={(e) => handleBiWeeklyPartChange(Number(e.target.value) as 1 | 2)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black">
                      <option value={1}>1st Half (01 - 15)</option>
                      <option value={2}>2nd Half (16 - End)</option>
                    </select>
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
                    }`}
                  >
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
                    }`}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pay Slip Number */}
                <Input
                  label="Pay Slip Number"
                  value={formData.paySlipNo}
                  onChange={(e) => updateField('paySlipNo', e.target.value)}
                  error={errors.paySlipNo}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                {/* Auto-Calculated Pay Period */}
                <Input
                  label="Pay Period Range"
                  value={formData.payPeriod || calculatePayPeriod(selectedMonth, selectedYear, formData.payCycle, biWeeklyPeriod)}
                  onChange={(e) => updateField('payPeriod', e.target.value)}
                  error={errors.payPeriod}
                  required
                />
              </div>
            </section>
          </div>
          {errors.monthYear && (
            <p className="mt-1 text-xs text-red-500 px-6">{errors.monthYear}</p>
          )}

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
                      const account = user.accountNumber || user.bankAccount || '';

                      return (
                        <div
                          key={id}
                          onClick={() => handleSelectEmployee(user)}
                          className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-none transition">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{name}</p>
                            <p className="text-xs text-gray-500">
                              {role || 'Employee'} {account ? `• Acc: ${account}` : ''}
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
            </div>

            {/* Mapped Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <Input
                label="Employee Name"
                value={formData.employeeName}
                onChange={(e) => updateField('employeeName', e.target.value)}
                error={errors.employeeName}
                required
              />
              <Input
                label="Employee ID"
                value={formData.employeeId}
                onChange={(e) => updateField('employeeId', e.target.value)}
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
              />
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Earnings */}
              <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
                  <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                    <IndianRupee size={16} className="text-emerald-600" /> Earnings
                  </span>
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
                <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
                  <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                    <IndianRupee size={16} className="text-red-600" /> Deductions
                  </span>
                  <button
                    type="button"
                    onClick={addDeduction}
                    className="text-xs text-black font-semibold flex items-center gap-1 hover:underline">
                    <Plus size={14} /> Add Line
                  </button>
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

            {/* Net Salary Banner */}
            <div className="mt-4 p-4 rounded-2xl bg-black text-white flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-400 font-medium">Net Payable Salary</p>
                <p className="text-xl font-bold font-mono mt-0.5">₹{netSalary.toLocaleString('en-IN')}</p>
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
              {isSubmitting ? 'Generating Slip...' : 'Create Salary Slip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalarySlipForm;
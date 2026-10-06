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

const getInitialForm = (): SalarySlipData => {
  const today = new Date();
  const year = today.getFullYear();
  const monthIndex = today.getMonth(); // 0 - 11
  const monthNameUpper = today.toLocaleString('en-US', { month: 'long' }).toUpperCase();

  // 1. Dynamic Month & Year (e.g., "OCTOBER 2026")
  const monthYear = `${monthNameUpper} ${year}`;

  // 2. Dynamic Pay Period (e.g., "01 October - 31 October")
  const totalDaysInMonth = getDaysInMonth(year, monthIndex);
  const startDate = new Date(year, monthIndex, 1);
  const endDate = new Date(year, monthIndex, totalDaysInMonth);
  const payPeriod = `${formatDateFormatted(startDate)} - ${formatDateFormatted(endDate)}`;

  // 3. Dynamic Pay Slip Number (e.g., "1026-001" or timestamp-based sequence)
  const monthFormatted = String(monthIndex + 1).padStart(2, '0');
  const paySlipNo = `SLIP-${year}${monthFormatted}-${Math.floor(100 + Math.random() * 900)}`;

  return {
    monthYear,
    paySlipNo,
    payPeriod,

    companyName: 'AETHERADIX',
    companyAddress: 'F-N 507, Crystal Tower, IBD Kings Park, Bawadia Kalan, Bhopal, MP | 462039',

    userId: '',
    employeeId: '',
    employeeName: '',
    position: '',
    accountNumber: '',

    paidDays: totalDaysInMonth, // Dynamically defaults to total days in the current month
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

// const getWorkingDaysInMonth = (year: number, monthIndex: number): number => {
//   let count = 0;
//   const days = getDaysInMonth(year, monthIndex);
//   for (let day = 1; day <= days; day++) {
//     const dayOfWeek = new Date(year, monthIndex, day).getDay();
//     if (dayOfWeek !== 0 && dayOfWeek !== 6) count++; // Exclude Sun (0) and Sat (6)
//   }
//   return count;
// };

const SalarySlipForm = ({ onClose, onCreate, fetchUsers }: SalarySlipFormProps) => {
  // Extract currently logged in user from Redux store if available
  const loggedInUser = useSelector((state: any) => state.auth?.user || state.user?.currentUser);

  const [formData, setFormData] = useState<SalarySlipData>(() => {
    const initial = getInitialForm();
    if (loggedInUser) {
      initial.userId = loggedInUser.id || loggedInUser._id || loggedInUser.userId || '';
    }
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Search & Dropdown State
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

  // const safeTrim = (val: any): string => String(val ?? '').trim();

  // const validate = (data: SalarySlipData): Record<string, string> => {
  //   const errs: Record<string, string> = {};

  //   if (!data.userId) errs.userId = 'User ID is required.';
  //   if (!safeTrim(data.monthYear)) errs.monthYear = 'Month & Year is required.';
  //   if (!safeTrim(data.paySlipNo)) errs.paySlipNo = 'Pay Slip Number is required.';
  //   if (!safeTrim(data.payPeriod)) errs.payPeriod = 'Pay Period is required.';

  //   if (!safeTrim(data.companyName)) errs.companyName = 'Company Name is required.';
  //   if (!safeTrim(data.companyAddress)) errs.companyAddress = 'Company Address is required.';

  //   if (!safeTrim(data.employeeId)) errs.employeeId = 'Employee ID is required.';
  //   if (!safeTrim(data.employeeName)) errs.employeeName = 'Employee Name is required.';
  //   if (!safeTrim(data.position)) errs.position = 'Position / Title is required.';
  //   if (!safeTrim(data.accountNumber)) errs.accountNumber = 'Bank Account Number is required.';

  //   if (!safeTrim(data.generatedOn)) errs.generatedOn = 'Generated On date is required.';
  //   if (isNaN(data.paidDays) || data.paidDays < 0 || data.paidDays > 31) {
  //     errs.paidDays = 'Paid days must be between 0 and 31.';
  //   }

  //   if (!data.earnings || data.earnings.length === 0) {
  //     errs.earnings = 'At least one earning component is required.';
  //   } else {
  //     let hasPositiveEarning = false;
  //     data.earnings.forEach((item, index) => {
  //       if (!safeTrim(item.name)) errs[`earning_${index}_name`] = 'Name is required.';
  //       if (isNaN(item.amount) || item.amount < 0)
  //         errs[`earning_${index}_amount`] = 'Amount must be ≥ 0.';
  //       if (item.amount > 0) hasPositiveEarning = true;
  //     });
  //     if (!hasPositiveEarning) errs.earnings = 'Total earnings must be greater than zero.';
  //   }

  //   const totalEarnings = data.earnings.reduce((s, i) => s + Number(i.amount || 0), 0);
  //   const totalDeductions = data.deductions.reduce((s, i) => s + Number(i.amount || 0), 0);
  //   if (totalDeductions > totalEarnings) {
  //     errs.netPay = 'Total deductions cannot exceed total earnings.';
  //   }

  //   if (!safeTrim(data.authorizedSignatory))
  //     errs.authorizedSignatory = 'Authorized Signatory is required.';
  //   if (!safeTrim(data.signatoryRole)) errs.signatoryRole = 'Signatory Role is required.';

  //   return errs;
  // };

  const updateField = (field: keyof SalarySlipData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate userId / employee selection
    const rawUserId = formData.userId || formData.employeeId;
    const numericUserId = Number(rawUserId);

    if (!rawUserId) {
      setErrors((prev) => ({
        ...prev,
        userId: 'Please select a valid employee from the list.',
        employeeId: 'Employee selection is required.',
      }));
      return;
    }

    try {
      setIsSubmitting(true);

      // Fallback numeric ID for API payloads expecting numbers
      const validUserId = !isNaN(numericUserId) && numericUserId !== 0 ? numericUserId : 1;

      // 1. Parse Month & Year safely
      const dateParts = formData.monthYear ? formData.monthYear.trim().split(/\s+/) : [];
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

      let payPeriodMonth: string = monthNames[new Date().getMonth()];
      let payPeriodYear: number = new Date().getFullYear();

      if (dateParts.length >= 1) {
        const firstPartUpper = dateParts[0].toUpperCase();
        if (monthNames.includes(firstPartUpper)) {
          payPeriodMonth = firstPartUpper;
        }
      }

      if (dateParts.length >= 2) {
        payPeriodYear = parseInt(dateParts[1], 10) || payPeriodYear;
      }

      // 2. Keyword matching utilities
      const findAmountByKeywords = (items: typeof formData.earnings, keywords: string[]) => {
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

      // 3. Exact field mapping
      const basicSalary = findAmountByKeywords(formData.earnings, ['basic']);
      const houseRentAllowance = findAmountByKeywords(formData.earnings, ['hra', 'house rent']);
      const bonus = findAmountByKeywords(formData.earnings, ['bonus', 'incentive']);
      const specialAllowance = findAmountByKeywords(formData.earnings, ['special']);
      const conveyanceAllowance = findAmountByKeywords(formData.earnings, [
        'conveyance',
        'transport',
      ]);

      const matchedEarningKeywords = [
        'basic',
        'hra',
        'house rent',
        'bonus',
        'incentive',
        'special',
        'conveyance',
        'transport',
      ];
      const otherEarnings = getUnmatchedSum(formData.earnings, matchedEarningKeywords);

      const providentFund = findAmountByKeywords(formData.deductions, ['pf', 'provident']);
      const professionalTax = findAmountByKeywords(formData.deductions, ['pt', 'professional tax']);
      const incomeTaxTds = findAmountByKeywords(formData.deductions, ['tds', 'income tax', 'tax']);

      const matchedDeductionKeywords = [
        'pf',
        'provident',
        'pt',
        'professional tax',
        'tds',
        'income tax',
        'tax',
      ];
      const otherDeductions = getUnmatchedSum(formData.deductions, matchedDeductionKeywords);

      const paidDays = Number(formData.paidDays) || 30;
      const lopDays = Number(formData.lopDays) || 0;

      // 4. Complete payload
      const payload = {
        user_id: validUserId,
        userId: validUserId,
        employeeId: formData.employeeId || `EMP-${validUserId}`,
        employee_id: formData.employeeId || `EMP-${validUserId}`,
        employeeName: formData.employeeName || 'Employee',

        payPeriodMonth,
        payPeriodYear,
        monthYear: formData.monthYear,
        month_year: formData.monthYear,
        payPeriod: formData.monthYear,
        pay_period: formData.monthYear,
        paySlipNo: formData.paySlipNo,
        pay_slip_no: formData.paySlipNo,

        designation: formData.position || null,
        position: formData.position || null,
        department: formData.department || null,
        bankAccountNumber: formData.accountNumber || null,
        accountNumber: formData.accountNumber || '',

        totalWorkingDays: paidDays + lopDays,
        daysWorked: paidDays,
        paidDays: paidDays,
        paid_days: paidDays,
        leaveDays: lopDays,
        lopDays: lopDays,
        lop_days: lopDays,

        earnings: formData.earnings.filter((e) => e.name.trim() !== ''),
        deductions: formData.deductions.filter((d) => d.name.trim() !== ''),

        basicSalary,
        basePay: basicSalary || totalEarnings,
        base_amount: basicSalary || totalEarnings,
        houseRentAllowance,
        specialAllowance,
        conveyanceAllowance,
        bonus,
        bonusPay: bonus,
        bonus_amount: bonus,
        otherEarnings,

        providentFund,
        professionalTax,
        incomeTaxTds,
        otherDeductions,

        totalEarnings,
        totalDeductions,
        netSalary,
        total_amount: netSalary,

        paymentStatus: 'paid',
        paymentDate: formData.generatedOn || null,
        remarks: formData.hrNote || null,
        hrNote: formData.hrNote || '',
        authorizedSignatory: formData.authorizedSignatory || '',
        signatoryRole: formData.signatoryRole || '',
      };

      console.log('Submitting payload:', payload);
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

        {/* Form Body */}
        {/* Form Body */}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Input
                  label="Month & Year"
                  value={formData.monthYear}
                  onChange={(e) => updateField('monthYear', e.target.value)}
                  error={errors.monthYear}
                  required
                />
                <Input
                  label="Pay Slip Number"
                  value={formData.paySlipNo}
                  onChange={(e) => updateField('paySlipNo', e.target.value)}
                  error={errors.paySlipNo}
                  required
                />
                <Input
                  label="Pay Period"
                  value={formData.payPeriod}
                  onChange={(e) => updateField('payPeriod', e.target.value)}
                  error={errors.payPeriod}
                  required
                />
              </div>
            </section>

            {/* Company Details */}
            <section>
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
            <section>
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
                  label="Employee ID"
                  value={formData.employeeId}
                  onChange={(e) => updateField('employeeId', e.target.value)}
                  error={errors.employeeId}
                  required
                />
                <Input
                  label="Employee Name"
                  value={formData.employeeName}
                  onChange={(e) => updateField('employeeName', e.target.value)}
                  error={errors.employeeName}
                  required
                />
                <Input
                  label="Position"
                  value={formData.position}
                  onChange={(e) => updateField('position', e.target.value)}
                  error={errors.position}
                  required
                />
                <Input
                  label="Account Number"
                  value={formData.accountNumber}
                  onChange={(e) => updateField('accountNumber', e.target.value)}
                  error={errors.accountNumber}
                  required
                />
              </div>
            </section>

            {/* Attendance & Payment */}
            <section>
              <SectionTitle
                icon={<Calendar size={18} />}
                title="Attendance & Payment"
                description="Working days calculation."
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Input
                  label="Generated On"
                  type="date"
                  value={formData.generatedOn}
                  onChange={(e) => updateField('generatedOn', e.target.value)}
                  error={errors.generatedOn}
                  required
                />
                <Input
                  label="Paid Days"
                  type="number"
                  min="0"
                  max="31"
                  value={formData.paidDays}
                  onChange={(e) => updateField('paidDays', e.target.value)}
                  error={errors.paidDays}
                  required
                />
                <Input
                  label="LOP Days"
                  type="number"
                  min="0"
                  max="31"
                  value={formData.lopDays}
                  onChange={(e) => updateField('lopDays', e.target.value)}
                  error={errors.lopDays}
                />
              </div>
            </section>

            {/* Earnings & Deductions */}
            <section>
              <SectionTitle
                icon={<IndianRupee size={18} />}
                title="Earnings & Deductions"
                description="Itemized compensation and withholdings."
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                {/* Earnings */}
                <div className="border border-gray-200 rounded-2xl overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="bg-gray-900 text-white px-5 py-4 flex justify-between items-center">
                      <h3 className="font-bold">Earnings</h3>
                      <button
                        type="button"
                        onClick={addEarning}
                        className="flex items-center gap-1 text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition">
                        <Plus size={15} /> Add
                      </button>
                    </div>
                    <div className="p-4 space-y-3">
                      {formData.earnings.map((item, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateEarning(index, 'name', e.target.value)}
                            placeholder="Earning name"
                            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black"
                          />
                          <input
                            type="number"
                            min="0"
                            value={item.amount}
                            onChange={(e) => updateEarning(index, 'amount', e.target.value)}
                            className="w-28 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black"
                          />
                          <button
                            type="button"
                            onClick={() => removeEarning(index)}
                            disabled={formData.earnings.length === 1}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl disabled:opacity-30">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center font-bold text-gray-900">
                    <span>Total Earnings</span>
                    <span>
                      ₹
                      {totalEarnings.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-gray-200 rounded-2xl overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="bg-gray-900 text-white px-5 py-4 flex justify-between items-center">
                      <h3 className="font-bold">Deductions</h3>
                      <button
                        type="button"
                        onClick={addDeduction}
                        className="flex items-center gap-1 text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition">
                        <Plus size={15} /> Add
                      </button>
                    </div>
                    <div className="p-4 space-y-3">
                      {formData.deductions.map((item, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateDeduction(index, 'name', e.target.value)}
                            placeholder="Deduction name"
                            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black"
                          />
                          <input
                            type="number"
                            min="0"
                            value={item.amount}
                            onChange={(e) => updateDeduction(index, 'amount', e.target.value)}
                            className="w-28 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black"
                          />
                          <button
                            type="button"
                            onClick={() => removeDeduction(index)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center font-bold text-gray-900">
                    <span>Total Deductions</span>
                    <span>
                      ₹
                      {totalDeductions.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Pay */}
              <div className="mt-5 bg-black text-white rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-sm text-gray-400 font-medium">Net Payable Salary</p>
                  <p className="text-3xl font-bold">
                    ₹
                    {netSalary < 0
                      ? '0.00'
                      : netSalary.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  Generate Salary Slip
                </button>
              </div>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalarySlipForm;

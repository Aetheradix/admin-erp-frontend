import React, { useState, useEffect, useRef } from 'react';
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
  ShieldCheck,
  UserCheck,
  Loader2,
  ChevronDown,
  Search,
} from 'lucide-react';

// Adjust this import path to point to your actual getUsers query/API module
import { useGetUsersQuery as getUsers } from '@/store/api/userSlice';

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

  employeeId: string;
  employeeName: string;
  position: string;
  accountNumber: string;

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
  onCreate: (data: SalarySlipData) => Promise<void>;
  /** Optional custom getUsers fetcher if passed from parent */
  fetchUsers?: (query?: string) => Promise<any[]>;
}

const initialForm: SalarySlipData = {
  monthYear: 'JUNE 2026',
  paySlipNo: '0626001',
  payPeriod: '01 June - 30 June',

  companyName: 'AETHERADIX',
  companyAddress: 'F-N 507, Crystal Tower, IBD Kings Park, Bawadia Kalan, Bhopal, MP | 462039',

  employeeId: '',
  employeeName: '',
  position: '',
  accountNumber: '',

  paidDays: 22,
  lopDays: 0,

  generatedOn: new Date().toISOString().split('T')[0],

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

const SalarySlipForm = ({ onClose, onCreate, fetchUsers }: SalarySlipFormProps) => {
  const [formData, setFormData] = useState<SalarySlipData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Employee Dropdown States
  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Users using getUsers query
  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const queryFn = (fetchUsers || getUsers) as (query?: string) => Promise<any[]>;
        const data = await queryFn(searchTerm);
        if (isMounted) {
          setUsersList(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to execute getUsers query:', err);
      } finally {
        if (isMounted) setIsLoadingUsers(false);
      }
    };

    const timer = setTimeout(() => {
      loadUsers(); // <-- Ensure loadUsers() is actually invoked here
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchTerm, fetchUsers]);

  // Single function to handle employee selection & auto-fill
  const handleSelectEmployee = (selectedUser: any) => {
    const name = selectedUser.name || selectedUser.employeeName || selectedUser.fullName || '';
    setSearchTerm(name);
    setIsDropdownOpen(false);

    setFormData((prev) => {
      const updatedEarnings = prev.earnings.map((earning) => {
        if (earning.name.toLowerCase().includes('basic') && selectedUser.basicSalary) {
          return { ...earning, amount: Number(selectedUser.basicSalary) || earning.amount };
        }
        return earning;
      });

      return {
        ...prev,
        employeeId: selectedUser.employeeId || selectedUser.id || selectedUser._id || prev.employeeId,
        employeeName: name || prev.employeeName,
        position: selectedUser.position || selectedUser.designation || selectedUser.role || prev.position,
        accountNumber: selectedUser.accountNumber || selectedUser.bankAccount || prev.accountNumber,
        earnings: updatedEarnings,
      };
    });

    setErrors((prev) => {
      const next = { ...prev };
      delete next.employeeId;
      delete next.employeeName;
      delete next.position;
      delete next.accountNumber;
      return next;
    });
  };

  // Form Validation
  const validate = (data: SalarySlipData): Record<string, string> => {
    const errs: Record<string, string> = {};

    if (!data.monthYear.trim()) errs.monthYear = 'Month & Year is required.';
    if (!data.paySlipNo.trim()) errs.paySlipNo = 'Pay Slip Number is required.';
    if (!data.payPeriod.trim()) errs.payPeriod = 'Pay Period is required.';

    if (!data.companyName.trim()) errs.companyName = 'Company Name is required.';
    if (!data.companyAddress.trim()) errs.companyAddress = 'Company Address is required.';

    if (!data.employeeId.trim()) errs.employeeId = 'Employee ID is required.';
    if (!data.employeeName.trim()) errs.employeeName = 'Employee Name is required.';
    if (!data.position.trim()) errs.position = 'Position / Title is required.';
    if (!data.accountNumber.trim()) errs.accountNumber = 'Bank Account Number is required.';

    if (!data.generatedOn) errs.generatedOn = 'Generated On date is required.';
    if (isNaN(data.paidDays) || data.paidDays < 0 || data.paidDays > 31) {
      errs.paidDays = 'Paid days must be between 0 and 31.';
    }

    if (!data.earnings || data.earnings.length === 0) {
      errs.earnings = 'At least one earning component is required.';
    } else {
      let hasPositiveEarning = false;
      data.earnings.forEach((item, index) => {
        if (!item.name.trim()) errs[`earning_${index}_name`] = 'Name is required.';
        if (isNaN(item.amount) || item.amount < 0) errs[`earning_${index}_amount`] = 'Amount must be ≥ 0.';
        if (item.amount > 0) hasPositiveEarning = true;
      });
      if (!hasPositiveEarning) errs.earnings = 'Total earnings must be greater than zero.';
    }

    const totalEarnings = data.earnings.reduce((s, i) => s + Number(i.amount || 0), 0);
    const totalDeductions = data.deductions.reduce((s, i) => s + Number(i.amount || 0), 0);
    if (totalDeductions > totalEarnings) {
      errs.netPay = 'Total deductions cannot exceed total earnings.';
    }

    if (!data.authorizedSignatory.trim()) errs.authorizedSignatory = 'Authorized Signatory is required.';
    if (!data.signatoryRole.trim()) errs.signatoryRole = 'Signatory Role is required.';

    return errs;
  };

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
      earnings: prev.earnings.map((item, i) => (i === index ? { ...item, [field]: updatedValue } : item)),
    }));
  };

  const updateDeduction = (index: number, field: keyof DeductionItem, value: string | number) => {
    const updatedValue = field === 'amount' ? (value === '' ? 0 : Number(value)) : value;
    setFormData((prev) => ({
      ...prev,
      deductions: prev.deductions.map((item, i) => (i === index ? { ...item, [field]: updatedValue } : item)),
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

  const totalEarnings = formData.earnings.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalDeductions = formData.deductions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const netSalary = totalEarnings - totalDeductions;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      (e.currentTarget as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    onCreate(formData);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
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
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} noValidate className="overflow-y-auto flex-1">
          <div className="p-6 space-y-8">
            {Object.keys(errors).length > 0 && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm font-medium">
                <AlertCircle size={20} className="shrink-0 text-red-500" />
                <span>Please correct the highlighted errors before submitting.</span>
              </div>
            )}

            {/* Slip Details */}
            <section>
              <SectionTitle icon={<FileText size={18} />} title="Salary Slip Details" description="General period details." />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Input label="Month & Year" value={formData.monthYear} onChange={(e) => updateField('monthYear', e.target.value)} error={errors.monthYear} required />
                <Input label="Pay Slip Number" value={formData.paySlipNo} onChange={(e) => updateField('paySlipNo', e.target.value)} error={errors.paySlipNo} required />
                <Input label="Pay Period" value={formData.payPeriod} onChange={(e) => updateField('payPeriod', e.target.value)} error={errors.payPeriod} required />
              </div>
            </section>

            {/* Company Details */}
            <section>
              <SectionTitle icon={<Building2 size={18} />} title="Company Details" description="Organization information." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input label="Company Name" value={formData.companyName} onChange={(e) => updateField('companyName', e.target.value)} error={errors.companyName} required />
                <Input label="Company Address" value={formData.companyAddress} onChange={(e) => updateField('companyAddress', e.target.value)} error={errors.companyAddress} required />
              </div>
            </section>

            {/* Employee Details with SINGLE Searchable Select */}
            <section>
              <SectionTitle icon={<User size={18} />} title="Employee Details" description="Select employee to auto-fill details." />

              {/* SINGLE Searchable Dropdown */}
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
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-10 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition"
                  />

                  <div className="absolute right-3 top-2.5 flex items-center gap-1 text-gray-400">
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

                {/* Dropdown Menu Popup */}
                {isDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {isLoadingUsers ? (
                      <div className="p-3 text-center text-xs text-gray-500">Loading employees...</div>
                    ) : usersList.length === 0 ? (
                      <div className="p-3 text-center text-xs text-gray-500">No matching employees found</div>
                    ) : (
                      usersList.map((user) => {
                        const id = user.id || user._id;
                        const name = user.name || user.employeeName || user.fullName;
                        const empId = user.employeeId || id;
                        const role = user.position || user.designation || user.role || '';

                        return (
                          <div
                            key={id}
                            onClick={() => handleSelectEmployee(user)}
                            className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-none transition"
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{name}</p>
                              <p className="text-xs text-gray-500">{role || 'Employee'}</p>
                            </div>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">
                              {empId}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <Input label="Employee ID" value={formData.employeeId} onChange={(e) => updateField('employeeId', e.target.value)} error={errors.employeeId} required />
                <Input label="Employee Name" value={formData.employeeName} onChange={(e) => updateField('employeeName', e.target.value)} error={errors.employeeName} required />
                <Input label="Position" value={formData.position} onChange={(e) => updateField('position', e.target.value)} error={errors.position} required />
                <Input label="Account Number" value={formData.accountNumber} onChange={(e) => updateField('accountNumber', e.target.value)} error={errors.accountNumber} required />
              </div>
            </section>

            {/* Attendance & Payment */}
            <section>
              <SectionTitle icon={<Calendar size={18} />} title="Attendance & Payment" description="Working days calculation." />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Input label="Generated On" type="date" value={formData.generatedOn} onChange={(e) => updateField('generatedOn', e.target.value)} error={errors.generatedOn} required />
                <Input label="Paid Days" type="number" min="0" max="31" value={formData.paidDays} onChange={(e) => updateField('paidDays', Number(e.target.value))} error={errors.paidDays} required />
                <Input label="LOP Days" type="number" min="0" max="31" value={formData.lopDays} onChange={(e) => updateField('lopDays', Number(e.target.value))} error={errors.lopDays} />
              </div>
            </section>

            {/* Earnings & Deductions */}
            <section>
              <SectionTitle icon={<IndianRupee size={18} />} title="Earnings & Deductions" description="Itemized compensation and withholdings." />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                {/* Earnings */}
                <div className="border border-gray-200 rounded-2xl overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="bg-gray-900 text-white px-5 py-4 flex justify-between items-center">
                      <h3 className="font-bold">Earnings</h3>
                      <button type="button" onClick={addEarning} className="flex items-center gap-1 text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition">
                        <Plus size={15} /> Add
                      </button>
                    </div>
                    <div className="p-4 space-y-3">
                      {formData.earnings.map((item, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input type="text" value={item.name} onChange={(e) => updateEarning(index, 'name', e.target.value)} placeholder="Earning name" className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black" />
                          <input type="number" min="0" value={item.amount} onChange={(e) => updateEarning(index, 'amount', e.target.value)} className="w-28 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black" />
                          <button type="button" onClick={() => removeEarning(index)} disabled={formData.earnings.length === 1} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl disabled:opacity-30">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center font-bold text-gray-900">
                    <span>Total Earnings</span>
                    <span>₹{totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-gray-200 rounded-2xl overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="bg-gray-900 text-white px-5 py-4 flex justify-between items-center">
                      <h3 className="font-bold">Deductions</h3>
                      <button type="button" onClick={addDeduction} className="flex items-center gap-1 text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition">
                        <Plus size={15} /> Add
                      </button>
                    </div>
                    <div className="p-4 space-y-3">
                      {formData.deductions.map((item, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input type="text" value={item.name} onChange={(e) => updateDeduction(index, 'name', e.target.value)} placeholder="Deduction name" className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black" />
                          <input type="number" min="0" value={item.amount} onChange={(e) => updateDeduction(index, 'amount', e.target.value)} className="w-28 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black" />
                          <button type="button" onClick={() => removeDeduction(index)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center font-bold text-gray-900">
                    <span>Total Deductions</span>
                    <span>₹{totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Net Pay Card */}
              <div className="mt-5 bg-black text-white rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-sm text-gray-400 font-medium">Net Payable Salary</p>
                  <p className="text-3xl font-bold">
                    ₹{netSalary < 0 ? '0.00' : netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-left md:text-right text-sm text-gray-300">
                  <p>Earnings: ₹{totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  <p>Deductions: ₹{totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </section>

            {/* Authorization & HR */}
            <section>
              <SectionTitle icon={<ShieldCheck size={18} />} title="Authorization & HR" description="Signatory details." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input label="Authorized Signatory" value={formData.authorizedSignatory} onChange={(e) => updateField('authorizedSignatory', e.target.value)} error={errors.authorizedSignatory} required />
                <Input label="Signatory Role" value={formData.signatoryRole} onChange={(e) => updateField('signatoryRole', e.target.value)} error={errors.signatoryRole} required />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">HR Note</label>
                <textarea rows={3} value={formData.hrNote} onChange={(e) => updateField('hrNote', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition resize-none" />
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="hidden sm:block">
              <span className="text-sm text-gray-500">Net Pay</span>
              <span className="ml-3 text-lg font-bold">
                ₹{netSalary < 0 ? '0.00' : netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="submit" className="px-6 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 transition flex items-center gap-2">
                <FileText size={17} /> Create Salary Slip
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reusable Input Field
function Input({ label, error, className = '', required, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        {...props}
        className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none transition ${
          error ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-black'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Section Header Component
function SectionTitle({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">{icon}</div>
      <div>
        <h3 className="font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

export default SalarySlipForm;
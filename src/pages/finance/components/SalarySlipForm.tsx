import { useState } from 'react';
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
} from 'lucide-react';

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

const SalarySlipForm = ({ onClose, onCreate }: SalarySlipFormProps) => {
  const [formData, setFormData] = useState<SalarySlipData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation routine
  const validate = (data: SalarySlipData): Record<string, string> => {
    const errs: Record<string, string> = {};

    // Salary Slip Details
    if (!data.monthYear.trim()) {
      errs.monthYear = 'Month & Year is required (e.g. JUNE 2026).';
    }
    if (!data.paySlipNo.trim()) {
      errs.paySlipNo = 'Pay Slip Number is required.';
    }
    if (!data.payPeriod.trim()) {
      errs.payPeriod = 'Pay Period is required.';
    }

    // Company Details
    if (!data.companyName.trim()) {
      errs.companyName = 'Company Name is required.';
    }
    if (!data.companyAddress.trim()) {
      errs.companyAddress = 'Company Address is required.';
    }

    // Employee Details
    if (!data.employeeId.trim()) {
      errs.employeeId = 'Employee ID is required.';
    }
    if (!data.employeeName.trim()) {
      errs.employeeName = 'Employee Name is required.';
    }
    if (!data.position.trim()) {
      errs.position = 'Position / Title is required.';
    }
    if (!data.accountNumber.trim()) {
      errs.accountNumber = 'Bank Account Number is required.';
    }

    // Attendance & Payment
    if (!data.generatedOn) {
      errs.generatedOn = 'Generated On date is required.';
    }
    if (isNaN(data.paidDays) || data.paidDays < 0 || data.paidDays > 31) {
      errs.paidDays = 'Paid days must be between 0 and 31.';
    }
    if (isNaN(data.lopDays) || data.lopDays < 0 || data.lopDays > 31) {
      errs.lopDays = 'LOP days must be between 0 and 31.';
    }

    // Earnings Validation
    if (!data.earnings || data.earnings.length === 0) {
      errs.earnings = 'At least one earning component is required.';
    } else {
      let hasPositiveEarning = false;
      data.earnings.forEach((item, index) => {
        if (!item.name.trim()) {
          errs[`earning_${index}_name`] = 'Name is required.';
        }
        if (isNaN(item.amount) || item.amount < 0) {
          errs[`earning_${index}_amount`] = 'Amount must be ≥ 0.';
        }
        if (item.amount > 0) {
          hasPositiveEarning = true;
        }
      });
      if (!hasPositiveEarning) {
        errs.earnings = 'Total earnings must be greater than zero.';
      }
    }

    // Deductions Validation
    if (data.deductions && data.deductions.length > 0) {
      data.deductions.forEach((item, index) => {
        if (!item.name.trim()) {
          errs[`deduction_${index}_name`] = 'Name is required.';
        }
        if (isNaN(item.amount) || item.amount < 0) {
          errs[`deduction_${index}_amount`] = 'Amount must be ≥ 0.';
        }
      });
    }

    // Net Salary Check
    const totalEarnings = data.earnings.reduce((s, i) => s + Number(i.amount || 0), 0);
    const totalDeductions = data.deductions.reduce((s, i) => s + Number(i.amount || 0), 0);
    if (totalDeductions > totalEarnings) {
      errs.netPay = 'Total deductions cannot exceed total earnings.';
    }

    // Authorization
    if (!data.authorizedSignatory.trim()) {
      errs.authorizedSignatory = 'Authorized Signatory name is required.';
    }
    if (!data.signatoryRole.trim()) {
      errs.signatoryRole = 'Signatory Role is required.';
    }

    return errs;
  };

  const updateField = (field: keyof SalarySlipData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

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

    const errorKey = `earning_${index}_${field}`;
    if (errors[errorKey] || errors.earnings || errors.netPay) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        delete next.earnings;
        delete next.netPay;
        return next;
      });
    }
  };

  const updateDeduction = (index: number, field: keyof DeductionItem, value: string | number) => {
    const updatedValue = field === 'amount' ? (value === '' ? 0 : Number(value)) : value;

    setFormData((prev) => ({
      ...prev,
      deductions: prev.deductions.map((item, i) =>
        i === index ? { ...item, [field]: updatedValue } : item
      ),
    }));

    const errorKey = `deduction_${index}_${field}`;
    if (errors[errorKey] || errors.netPay) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        delete next.netPay;
        return next;
      });
    }
  };

  const addEarning = () => {
    setFormData((prev) => ({
      ...prev,
      earnings: [...prev.earnings, { name: '', amount: 0 }],
    }));

    if (errors.earnings) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.earnings;
        return next;
      });
    }
  };

  const removeEarning = (index: number) => {
    setFormData((prev) => {
      const filtered = prev.earnings.filter((_, i) => i !== index);
      const currentErrors = validate({ ...prev, earnings: filtered });
      setErrors(currentErrors);
      return { ...prev, earnings: filtered };
    });
  };

  const addDeduction = () => {
    setFormData((prev) => ({
      ...prev,
      deductions: [...prev.deductions, { name: '', amount: 0 }],
    }));
  };

  const removeDeduction = (index: number) => {
    setFormData((prev) => {
      const filtered = prev.deductions.filter((_, i) => i !== index);
      const currentErrors = validate({ ...prev, deductions: filtered });
      setErrors(currentErrors);
      return { ...prev, deductions: filtered };
    });
  };

  const totalEarnings = formData.earnings.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const totalDeductions = formData.deductions.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const netSalary = totalEarnings - totalDeductions;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      // Scroll form to top to make error banner visible
      const containerNode = e.currentTarget as HTMLElement;
      containerNode.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    onCreate(formData);
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white w-full max-w-6xl max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-black text-white flex items-center justify-center">
              <FileText size={20} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900">Create Salary Slip</h1>
              <p className="text-sm text-gray-500">
                Enter employee compensation and payroll details.
              </p>
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

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} noValidate className="overflow-y-auto flex-1">
          <div className="p-6 space-y-8">
            {/* Global Error Alert Banner */}
            {hasErrors && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm font-medium">
                <AlertCircle size={20} className="shrink-0 text-red-500" />
                <span>
                  Please correct the highlighted errors before generating the salary slip.
                </span>
              </div>
            )}

            {/* Salary Details Section */}
            <section>
              <SectionTitle
                icon={<FileText size={18} />}
                title="Salary Slip Details"
                description="General period and identification numbers for this payslip."
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Input
                  label="Month & Year"
                  value={formData.monthYear}
                  onChange={(e) => updateField('monthYear', e.target.value)}
                  placeholder="JUNE 2026"
                  error={errors.monthYear}
                  required
                />

                <Input
                  label="Pay Slip Number"
                  value={formData.paySlipNo}
                  onChange={(e) => updateField('paySlipNo', e.target.value)}
                  placeholder="0626001"
                  error={errors.paySlipNo}
                  required
                />

                <Input
                  label="Pay Period"
                  value={formData.payPeriod}
                  onChange={(e) => updateField('payPeriod', e.target.value)}
                  placeholder="01 June - 30 June"
                  error={errors.payPeriod}
                  required
                />
              </div>
            </section>

            {/* Company Section */}
            <section>
              <SectionTitle
                icon={<Building2 size={18} />}
                title="Company Details"
                description="Information of the organization issuing the payment."
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

            {/* Employee Section */}
            <section>
              <SectionTitle
                icon={<User size={18} />}
                title="Employee Details"
                description="Recipient credentials and bank account information."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <Input
                  label="Employee ID"
                  value={formData.employeeId}
                  onChange={(e) => updateField('employeeId', e.target.value)}
                  placeholder="X001"
                  error={errors.employeeId}
                  required
                />

                <Input
                  label="Employee Name"
                  value={formData.employeeName}
                  onChange={(e) => updateField('employeeName', e.target.value)}
                  placeholder="Employee Name"
                  error={errors.employeeName}
                  required
                />

                <Input
                  label="Position"
                  value={formData.position}
                  onChange={(e) => updateField('position', e.target.value)}
                  placeholder="Director"
                  error={errors.position}
                  required
                />

                <Input
                  label="Account Number"
                  value={formData.accountNumber}
                  onChange={(e) => updateField('accountNumber', e.target.value)}
                  placeholder="Bank Account Number"
                  error={errors.accountNumber}
                  required
                />
              </div>
            </section>

            {/* Attendance & Payment Section */}
            <section>
              <SectionTitle
                icon={<Calendar size={18} />}
                title="Attendance & Payment"
                description="Working days calculation and generation date."
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
                  onChange={(e) => updateField('paidDays', Number(e.target.value))}
                  error={errors.paidDays}
                  required
                />

                <Input
                  label="LOP Days"
                  type="number"
                  min="0"
                  max="31"
                  value={formData.lopDays}
                  onChange={(e) => updateField('lopDays', Number(e.target.value))}
                  error={errors.lopDays}
                />
              </div>
            </section>

            {/* Earnings + Deductions Section */}
            <section>
              <SectionTitle
                icon={<IndianRupee size={18} />}
                title="Earnings & Deductions"
                description="Itemize compensation components and standard withholdings."
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                {/* Earnings Column */}
                <div className="border border-gray-200 rounded-2xl overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="bg-gray-900 text-white px-5 py-4 flex justify-between items-center">
                      <h3 className="font-bold">Earnings</h3>

                      <button
                        type="button"
                        onClick={addEarning}
                        className="flex items-center gap-1 text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition"
                      >
                        <Plus size={15} />
                        Add Earning
                      </button>
                    </div>

                    <div className="p-4 space-y-3">
                      {errors.earnings && (
                        <p className="text-xs font-semibold text-red-500 mb-2">{errors.earnings}</p>
                      )}

                      {formData.earnings.map((item, index) => {
                        const nameErr = errors[`earning_${index}_name`];
                        const amtErr = errors[`earning_${index}_amount`];

                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex gap-2 items-center">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => updateEarning(index, 'name', e.target.value)}
                                  placeholder="Earning name"
                                  className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition ${
                                    nameErr
                                      ? 'border-red-500 focus:border-red-500'
                                      : 'border-gray-200 focus:border-black'
                                  }`}
                                />
                              </div>

                              <div className="w-32">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.amount}
                                  onChange={(e) => updateEarning(index, 'amount', e.target.value)}
                                  className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition ${
                                    amtErr
                                      ? 'border-red-500 focus:border-red-500'
                                      : 'border-gray-200 focus:border-black'
                                  }`}
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => removeEarning(index)}
                                disabled={formData.earnings.length === 1}
                                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl disabled:opacity-30 disabled:hover:bg-transparent transition"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            {(nameErr || amtErr) && (
                              <div className="flex justify-between text-xs text-red-500 px-1">
                                <span>{nameErr}</span>
                                <span>{amtErr}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center font-bold text-gray-900">
                    <span>Total Earnings</span>
                    <span>
                      ₹{totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Deductions Column */}
                <div className="border border-gray-200 rounded-2xl overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="bg-gray-900 text-white px-5 py-4 flex justify-between items-center">
                      <h3 className="font-bold">Deductions</h3>

                      <button
                        type="button"
                        onClick={addDeduction}
                        className="flex items-center gap-1 text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition"
                      >
                        <Plus size={15} />
                        Add Deduction
                      </button>
                    </div>

                    <div className="p-4 space-y-3">
                      {formData.deductions.map((item, index) => {
                        const nameErr = errors[`deduction_${index}_name`];
                        const amtErr = errors[`deduction_${index}_amount`];

                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex gap-2 items-center">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => updateDeduction(index, 'name', e.target.value)}
                                  placeholder="Deduction name"
                                  className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition ${
                                    nameErr
                                      ? 'border-red-500 focus:border-red-500'
                                      : 'border-gray-200 focus:border-black'
                                  }`}
                                />
                              </div>

                              <div className="w-32">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.amount}
                                  onChange={(e) => updateDeduction(index, 'amount', e.target.value)}
                                  className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition ${
                                    amtErr
                                      ? 'border-red-500 focus:border-red-500'
                                      : 'border-gray-200 focus:border-black'
                                  }`}
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => removeDeduction(index)}
                                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            {(nameErr || amtErr) && (
                              <div className="flex justify-between text-xs text-red-500 px-1">
                                <span>{nameErr}</span>
                                <span>{amtErr}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center font-bold text-gray-900">
                    <span>Total Deductions</span>
                    <span>
                      ₹{totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Pay Card */}
              <div className="mt-5 bg-black text-white rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-sm text-gray-400 font-medium">Net Payable Salary</p>
                  <p className="text-3xl font-bold">
                    ₹
                    {netSalary < 0
                      ? '0.00'
                      : netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                  {errors.netPay && (
                    <p className="text-xs text-red-400 font-semibold mt-1">{errors.netPay}</p>
                  )}
                </div>

                <div className="text-left md:text-right text-sm text-gray-300 space-y-0.5">
                  <p>
                    Earnings:{' '}
                    <span className="font-semibold text-white">
                      ₹{totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </p>
                  <p>
                    Deductions:{' '}
                    <span className="font-semibold text-white">
                      ₹{totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </p>
                </div>
              </div>
            </section>

            {/* Authorization & HR Section */}
            <section>
              <SectionTitle
                icon={<ShieldCheck size={18} />}
                title="Authorization & HR"
                description="Signatory information and custom disclaimer notes."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input
                  label="Authorized Signatory"
                  value={formData.authorizedSignatory}
                  onChange={(e) => updateField('authorizedSignatory', e.target.value)}
                  error={errors.authorizedSignatory}
                  required
                />

                <Input
                  label="Signatory Role"
                  value={formData.signatoryRole}
                  onChange={(e) => updateField('signatoryRole', e.target.value)}
                  error={errors.signatoryRole}
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">HR Note</label>
                <textarea
                  rows={3}
                  value={formData.hrNote}
                  onChange={(e) => updateField('hrNote', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition resize-none"
                />
              </div>
            </section>
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="hidden sm:block">
              <span className="text-sm text-gray-500">Net Pay</span>
              <span className="ml-3 text-lg font-bold">
                ₹
                {netSalary < 0
                  ? '0.00'
                  : netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 transition flex items-center gap-2"
              >
                <FileText size={17} />
                Create Salary Slip
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reusable Input Field Component with Error Feedback
function Input({
  label,
  error,
  className = '',
  required,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        {...props}
        className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none transition ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
            : 'border-gray-200 focus:border-black focus:ring-1 focus:ring-black/10'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Section Header Layout Component
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
      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
        {icon}
      </div>

      <div>
        <h3 className="font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

export default SalarySlipForm;

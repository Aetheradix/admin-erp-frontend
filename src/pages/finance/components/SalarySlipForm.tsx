import { useState } from 'react';

interface EarningsItem {
  name: string;
  amount: number;
}

interface DeductionItem {
  name: string;
  amount: number;
}

interface SalarySlipFormData {
  // Salary Slip
  monthYear: string;
  paySlipNo: string;
  payPeriod: string;

  // Company
  companyName: string;
  companyAddress: string;

  // Employee
  employeeId: string;
  employeeName: string;
  position: string;
  accountNumber: string;

  // Attendance
  paidDays: number;
  lopDays: number;

  // Dates
  generatedOn: string;

  // Earnings
  earnings: EarningsItem[];

  // Deductions
  deductions: DeductionItem[];

  // Authorization
  authorizedSignatory: string;
  signatoryRole: string;

  // HR
  hrNote: string;
}

const SalarySlipForm = () => {
  const [formData, setFormData] = useState<SalarySlipFormData>({
    monthYear: '',
    paySlipNo: '',
    payPeriod: '',

    companyName: '',
    companyAddress: '',

    employeeId: '',
    employeeName: '',
    position: '',
    accountNumber: '',

    paidDays: 0,
    lopDays: 0,

    generatedOn: '',

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

    authorizedSignatory: '',
    signatoryRole: '',

    hrNote: 'For any discrepancies, please contact the HR department within 3 working days.',
  });

  const updateField = (field: keyof SalarySlipFormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateEarning = (index: number, field: keyof EarningsItem, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      earnings: prev.earnings.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: field === 'amount' ? Number(value) || 0 : value,
            }
          : item
      ),
    }));
  };

  const updateDeduction = (index: number, field: keyof DeductionItem, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      deductions: prev.deductions.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: field === 'amount' ? Number(value) || 0 : value,
            }
          : item
      ),
    }));
  };

  const addEarning = () => {
    setFormData((prev) => ({
      ...prev,
      earnings: [
        ...prev.earnings,
        {
          name: '',
          amount: 0,
        },
      ],
    }));
  };

  const removeEarning = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      earnings: prev.earnings.filter((_, i) => i !== index),
    }));
  };

  const addDeduction = () => {
    setFormData((prev) => ({
      ...prev,
      deductions: [
        ...prev.deductions,
        {
          name: '',
          amount: 0,
        },
      ],
    }));
  };

  const removeDeduction = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      deductions: prev.deductions.filter((_, i) => i !== index),
    }));
  };

  const totalEarnings = formData.earnings.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const totalDeductions = formData.deductions.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const netSalary = totalEarnings - totalDeductions;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Salary Slip</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter the salary, employee, company and payment details.
          </p>
        </div>

        {/* ================= SALARY SLIP DETAILS ================= */}
        <section className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-bold mb-5">Salary Slip Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2">Month & Year</label>
              <input
                type="text"
                placeholder="JUNE 2026"
                value={formData.monthYear}
                onChange={(e) => updateField('monthYear', e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Pay Slip Number</label>
              <input
                type="text"
                placeholder="0626001"
                value={formData.paySlipNo}
                onChange={(e) => updateField('paySlipNo', e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Pay Period</label>
              <input
                type="text"
                placeholder="01 June - 30 June"
                value={formData.payPeriod}
                onChange={(e) => updateField('payPeriod', e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5"
              />
            </div>
          </div>
        </section>

        {/* ================= COMPANY DETAILS ================= */}
        <section className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-bold mb-5">Company Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2">Company Name</label>
              <input
                type="text"
                placeholder="AETHERADIX"
                value={formData.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Company Address</label>
              <input
                type="text"
                placeholder="Company address"
                value={formData.companyAddress}
                onChange={(e) => updateField('companyAddress', e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5"
              />
            </div>
          </div>
        </section>

        {/* ================= EMPLOYEE DETAILS ================= */}
        <section className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-bold mb-5">Employee Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2">Employee ID</label>
              <input
                type="text"
                placeholder="X001"
                value={formData.employeeId}
                onChange={(e) => updateField('employeeId', e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Employee Name</label>
              <input
                type="text"
                placeholder="Employee name"
                value={formData.employeeName}
                onChange={(e) => updateField('employeeName', e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Position</label>
              <input
                type="text"
                placeholder="Director"
                value={formData.position}
                onChange={(e) => updateField('position', e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Account Number</label>
              <input
                type="text"
                placeholder="Bank account number"
                value={formData.accountNumber}
                onChange={(e) => updateField('accountNumber', e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5"
              />
            </div>
          </div>
        </section>

        {/* ================= ATTENDANCE ================= */}
        <section className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-bold mb-5">Attendance & Payment</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2">Generated On</label>
              <input
                type="date"
                value={formData.generatedOn}
                onChange={(e) => updateField('generatedOn', e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Paid Days</label>
              <input
                type="number"
                min="0"
                value={formData.paidDays}
                onChange={(e) => updateField('paidDays', Number(e.target.value))}
                className="w-full border rounded-lg px-4 py-2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">LOP Days</label>
              <input
                type="number"
                min="0"
                value={formData.lopDays}
                onChange={(e) => updateField('lopDays', Number(e.target.value))}
                className="w-full border rounded-lg px-4 py-2.5"
              />
            </div>
          </div>
        </section>

        {/* ================= EARNINGS ================= */}
        <section className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold">Earnings</h2>
              <p className="text-sm text-gray-500">Add all employee earnings.</p>
            </div>

            <button
              type="button"
              onClick={addEarning}
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              + Add Earning
            </button>
          </div>

          <div className="space-y-3">
            {formData.earnings.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_200px_auto] gap-3">
                <input
                  type="text"
                  placeholder="Earning name"
                  value={item.name}
                  onChange={(e) => updateEarning(index, 'name', e.target.value)}
                  className="border rounded-lg px-4 py-2.5"
                />

                <input
                  type="number"
                  min="0"
                  placeholder="Amount"
                  value={item.amount}
                  onChange={(e) => updateEarning(index, 'amount', e.target.value)}
                  className="border rounded-lg px-4 py-2.5"
                />

                <button
                  type="button"
                  onClick={() => removeEarning(index)}
                  className="px-4 py-2 text-red-600 border border-red-200 rounded-lg"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-end">
            <div className="bg-gray-900 text-white px-5 py-3 rounded-lg font-semibold">
              Total Earnings: ₹
              {totalEarnings.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        </section>

        {/* ================= DEDUCTIONS ================= */}
        <section className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold">Deductions</h2>
              <p className="text-sm text-gray-500">Add all salary deductions.</p>
            </div>

            <button
              type="button"
              onClick={addDeduction}
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              + Add Deduction
            </button>
          </div>

          <div className="space-y-3">
            {formData.deductions.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_200px_auto] gap-3">
                <input
                  type="text"
                  placeholder="Deduction name"
                  value={item.name}
                  onChange={(e) => updateDeduction(index, 'name', e.target.value)}
                  className="border rounded-lg px-4 py-2.5"
                />

                <input
                  type="number"
                  min="0"
                  placeholder="Amount"
                  value={item.amount}
                  onChange={(e) => updateDeduction(index, 'amount', e.target.value)}
                  className="border rounded-lg px-4 py-2.5"
                />

                <button
                  type="button"
                  onClick={() => removeDeduction(index)}
                  className="px-4 py-2 text-red-600 border border-red-200 rounded-lg"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-between items-center">
            <div className="font-semibold text-gray-700">
              Total Deductions: ₹
              {totalDeductions.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </div>

            <div className="bg-black text-white px-5 py-3 rounded-lg font-bold">
              Net Pay: ₹
              {netSalary.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        </section>

        {/* ================= AUTHORIZATION ================= */}
        <section className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-bold mb-5">Authorization</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2">Authorized Signatory</label>
              <input
                type="text"
                placeholder="Seema Srivastava"
                value={formData.authorizedSignatory}
                onChange={(e) => updateField('authorizedSignatory', e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Signatory Role</label>
              <input
                type="text"
                placeholder="Director"
                value={formData.signatoryRole}
                onChange={(e) => updateField('signatoryRole', e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-sm font-medium mb-2">HR Note</label>

            <textarea
              rows={3}
              value={formData.hrNote}
              onChange={(e) => updateField('hrNote', e.target.value)}
              className="w-full border rounded-lg px-4 py-2.5 resize-none"
            />
          </div>
        </section>

        {/* ================= SUMMARY ================= */}
        <section className="bg-gray-900 text-white rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Salary Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-sm text-gray-300">Total Earnings</p>
              <p className="text-2xl font-bold mt-1">₹{totalEarnings.toLocaleString('en-IN')}</p>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-sm text-gray-300">Total Deductions</p>
              <p className="text-2xl font-bold mt-1">₹{totalDeductions.toLocaleString('en-IN')}</p>
            </div>

            <div className="bg-white rounded-lg p-4 text-black">
              <p className="text-sm text-gray-500">Net Salary</p>
              <p className="text-2xl font-bold mt-1">₹{netSalary.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </section>

        {/* ================= ACTIONS ================= */}
        <div className="flex justify-end gap-3 pb-10">
          <button
            type="button"
            onClick={() => console.log(formData)}
            className="px-6 py-3 border rounded-lg bg-white"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => console.log(formData)}
            className="px-6 py-3 bg-black text-white rounded-lg font-semibold"
          >
            Create Salary Slip
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalarySlipForm;

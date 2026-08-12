import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

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
  onCreate: (data: SalarySlipData) => void;
}

const SalarySlipForm = ({ onClose, onCreate }: SalarySlipFormProps) => {
  const [formData, setFormData] = useState<SalarySlipData>({
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
      {
        name: 'Basic Pay',
        amount: 0,
      },
      {
        name: 'Allowance',
        amount: 0,
      },
      {
        name: 'Overtime Pay',
        amount: 0,
      },
      {
        name: 'Bonus',
        amount: 0,
      },
    ],

    deductions: [
      {
        name: 'Professional Tax',
        amount: 0,
      },
      {
        name: 'Contribution',
        amount: 0,
      },
      {
        name: 'Other Deductions',
        amount: 0,
      },
    ],

    authorizedSignatory: 'Seema Srivastava',
    signatoryRole: '(Director)',

    hrNote: 'For any discrepancies, please contact the HR department within 3 working days.',
  });

  const updateField = (field: keyof SalarySlipData, value: string | number) => {
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

  const handleCreateSalarySlip = () => {
    if (!formData.employeeName.trim()) {
      alert('Please enter employee name.');
      return;
    }

    if (!formData.position.trim()) {
      alert('Please enter employee position.');
      return;
    }
    onCreate(formData);
  };

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
        <div className="flex items-center justify-between px-6 py-5 border-b bg-white">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Create Salary Slip</h1>

            <p className="text-sm text-gray-500 mt-1">
              Enter employee compensation and payroll details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">
            {/* SALARY DETAILS */}

            <section className="border border-gray-200 rounded-2xl p-5">
              <h2 className="text-lg font-bold mb-4">Salary Slip Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Month & Year"
                  value={formData.monthYear}
                  onChange={(e) => updateField('monthYear', e.target.value)}
                  placeholder="JUNE 2026"
                />

                <Input
                  label="Pay Slip Number"
                  value={formData.paySlipNo}
                  onChange={(e) => updateField('paySlipNo', e.target.value)}
                  placeholder="0626001"
                />

                <Input
                  label="Pay Period"
                  value={formData.payPeriod}
                  onChange={(e) => updateField('payPeriod', e.target.value)}
                  placeholder="01 June - 30 June"
                />
              </div>
            </section>

            {/* COMPANY */}

            <section className="border border-gray-200 rounded-2xl p-5">
              <h2 className="text-lg font-bold mb-4">Company Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  value={formData.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                />

                <Input
                  label="Company Address"
                  value={formData.companyAddress}
                  onChange={(e) => updateField('companyAddress', e.target.value)}
                />
              </div>
            </section>

            {/* EMPLOYEE */}

            <section className="border border-gray-200 rounded-2xl p-5">
              <h2 className="text-lg font-bold mb-4">Employee Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  label="Employee ID"
                  value={formData.employeeId}
                  onChange={(e) => updateField('employeeId', e.target.value)}
                  placeholder="X001"
                />

                <Input
                  label="Employee Name"
                  value={formData.employeeName}
                  onChange={(e) => updateField('employeeName', e.target.value)}
                  placeholder="Employee name"
                />

                <Input
                  label="Position"
                  value={formData.position}
                  onChange={(e) => updateField('position', e.target.value)}
                  placeholder="Director"
                />

                <Input
                  label="Account Number"
                  value={formData.accountNumber}
                  onChange={(e) => updateField('accountNumber', e.target.value)}
                  placeholder="Bank account number"
                />
              </div>
            </section>

            {/* ATTENDANCE */}

            <section className="border border-gray-200 rounded-2xl p-5">
              <h2 className="text-lg font-bold mb-4">Attendance & Payment</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Generated On"
                  type="date"
                  value={formData.generatedOn}
                  onChange={(e) => updateField('generatedOn', e.target.value)}
                />

                <Input
                  label="Paid Days"
                  type="number"
                  min="0"
                  value={formData.paidDays}
                  onChange={(e) => updateField('paidDays', Number(e.target.value))}
                />

                <Input
                  label="LOP Days"
                  type="number"
                  min="0"
                  value={formData.lopDays}
                  onChange={(e) => updateField('lopDays', Number(e.target.value))}
                />
              </div>
            </section>

            {/* EARNINGS + DEDUCTIONS */}

            <section>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* EARNINGS */}

                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="bg-gray-900 text-white px-5 py-4 flex justify-between items-center">
                    <h2 className="font-bold">Earnings</h2>

                    <button
                      type="button"
                      onClick={addEarning}
                      className="flex items-center gap-1 text-sm bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg"
                    >
                      <Plus size={15} />
                      Add
                    </button>
                  </div>

                  <div className="p-4 space-y-3">
                    {formData.earnings.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateEarning(index, 'name', e.target.value)}
                          placeholder="Earning name"
                          className="flex-1 border rounded-xl px-3 py-2.5 text-sm"
                        />

                        <input
                          type="number"
                          min="0"
                          value={item.amount}
                          onChange={(e) => updateEarning(index, 'amount', e.target.value)}
                          className="w-32 border rounded-xl px-3 py-2.5 text-sm"
                        />

                        <button
                          type="button"
                          onClick={() => removeEarning(index)}
                          className="w-10 flex items-center justify-center text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    ))}

                    <div className="border-t pt-4 flex justify-between font-bold">
                      <span>Total Earnings</span>

                      <span>₹{totalEarnings.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* DEDUCTIONS */}

                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="bg-gray-900 text-white px-5 py-4 flex justify-between items-center">
                    <h2 className="font-bold">Deductions</h2>

                    <button
                      type="button"
                      onClick={addDeduction}
                      className="flex items-center gap-1 text-sm bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg"
                    >
                      <Plus size={15} />
                      Add
                    </button>
                  </div>

                  <div className="p-4 space-y-3">
                    {formData.deductions.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateDeduction(index, 'name', e.target.value)}
                          placeholder="Deduction name"
                          className="flex-1 border rounded-xl px-3 py-2.5 text-sm"
                        />

                        <input
                          type="number"
                          min="0"
                          value={item.amount}
                          onChange={(e) => updateDeduction(index, 'amount', e.target.value)}
                          className="w-32 border rounded-xl px-3 py-2.5 text-sm"
                        />

                        <button
                          type="button"
                          onClick={() => removeDeduction(index)}
                          className="w-10 flex items-center justify-center text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    ))}

                    <div className="border-t pt-4 flex justify-between font-bold">
                      <span>Total Deductions</span>

                      <span>₹{totalDeductions.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* NET PAY */}

              <div className="mt-5 bg-black text-white rounded-2xl p-5 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400">Net Pay</p>

                  <p className="text-3xl font-bold">₹{netSalary.toLocaleString('en-IN')}</p>
                </div>

                <div className="text-right text-sm text-gray-400">
                  <p>Earnings: ₹{totalEarnings.toLocaleString('en-IN')}</p>

                  <p>Deductions: ₹{totalDeductions.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </section>

            {/* AUTHORIZATION */}

            <section className="border border-gray-200 rounded-2xl p-5">
              <h2 className="text-lg font-bold mb-4">Authorization & HR</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Authorized Signatory"
                  value={formData.authorizedSignatory}
                  onChange={(e) => updateField('authorizedSignatory', e.target.value)}
                />

                <Input
                  label="Signatory Role"
                  value={formData.signatoryRole}
                  onChange={(e) => updateField('signatoryRole', e.target.value)}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">HR Note</label>

                <textarea
                  rows={3}
                  value={formData.hrNote}
                  onChange={(e) => updateField('hrNote', e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 resize-none"
                />
              </div>
            </section>
          </div>
        </div>

        <div className="border-t bg-white px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCreateSalarySlip}
            className="px-6 py-2.5 rounded-xl bg-black text-white font-semibold hover:bg-gray-800"
          >
            Create Salary Slip
          </button>
        </div>
      </div>
    </div>
  );
};

function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      <input
        {...props}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-black focus:ring-1 focus:ring-black/10"
      />
    </div>
  );
}

export default SalarySlipForm;

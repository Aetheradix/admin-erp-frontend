// import { PageHeader } from '@/components/ui/composed/PageHeader';
// import { MoreHorizontal, User, Calendar } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { Table } from 'antd';
// import type { ColumnsType } from 'antd/es/table';

// interface PayrollRecord {
//   id: number;
//   name: string;
//   role: string;
//   base: number;
//   bonus: number;
//   total: number;
//   date: string;
// }

// const payroll: PayrollRecord[] = [
//   {
//     id: 1,
//     name: 'Sarah Chen',
//     role: 'Super Admin',
//     base: 12000,
//     bonus: 2000,
//     total: 14000,
//     date: 'June 2026',
//   },
//   {
//     id: 2,
//     name: 'James Wilson',
//     role: 'Admin',
//     base: 8500,
//     bonus: 500,
//     total: 9000,
//     date: 'June 2026',
//   },
//   {
//     id: 3,
//     name: 'Maya Johnson',
//     role: 'Manager',
//     base: 7200,
//     bonus: 800,
//     total: 8000,
//     date: 'June 2026',
//   },
//   {
//     id: 4,
//     name: 'David Kim',
//     role: 'Developer',
//     base: 6500,
//     bonus: 0,
//     total: 6500,
//     date: 'June 2026',
//   },
// ];

// export function PayrollPage() {
//   const columns: ColumnsType<PayrollRecord> = [
//     {
//       title: 'Employee',
//       key: 'employee',
//       render: (_, record) => (
//         <div className="flex items-center gap-4">
//           <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
//             <User size={18} />
//           </div>
//           <div className="flex flex-col">
//             <span className="text-sm font-bold text-foreground">{record.name}</span>
//             <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
//               {record.role}
//             </span>
//           </div>
//         </div>
//       ),
//     },
//     {
//       title: 'Base Pay',
//       dataIndex: 'base',
//       key: 'base',
//       render: (value) => (
//         <span className="text-sm font-medium text-muted">₹{value.toLocaleString()}</span>
//       ),
//     },
//     {
//       title: 'Bonus',
//       dataIndex: 'bonus',
//       key: 'bonus',
//       render: (value) => (
//         <span className="text-sm font-medium text-success">+₹{value.toLocaleString()}</span>
//       ),
//     },
//     {
//       title: 'Total Salary',
//       dataIndex: 'total',
//       key: 'total',
//       render: (value) => (
//         <span className="text-sm font-black text-foreground">₹{value.toLocaleString()}</span>
//       ),
//     },
//     {
//       title: 'Pay Date',
//       dataIndex: 'date',
//       key: 'date',
//       render: (text) => (
//         <div className="flex items-center gap-2 text-xs font-bold text-muted">
//           <Calendar size={14} />
//           {text}
//         </div>
//       ),
//     },
//     {
//       title: '',
//       key: 'action',
//       width: 80,
//       render: () => (
//         <button className="p-2 rounded-lg hover:bg-surface-subtle text-muted hover:text-foreground transition-colors">
//           <MoreHorizontal size={16} />
//         </button>
//       ),
//     },
//   ];

//   return (
//     <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
//       <PageHeader
//         title="Payroll"
//         description="Employee compensation and distribution history."
//         breadcrumbs={[
//           { label: 'Home', url: '/' },
//           { label: 'Finance', url: '/finance' },
//           { label: 'Payroll' },
//         ]}
//       />
//       <button onClick={()=>{
//          Navigate();
//       }}/>

//       <motion.div
//         initial={{ opacity: 0, scale: 0.98 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.5 }}
//         className="bg-white rounded-[40px] border border-border-subtle shadow-soft overflow-hidden"
//       >
//         <Table
//           columns={columns}
//           dataSource={payroll}
//           rowKey="id"
//           pagination={false}
//           className="premium-table"
//         />
//       </motion.div>
//     </div>
//   );
// }

import { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  FileText,
  User,
  Building2,
  CalendarDays,
  IndianRupee,
} from 'lucide-react';

interface SalaryItem {
  name: string;
  amount: number;
}

interface SalarySlipFormData {
  monthYear: string;
  paySlipNo: string;
  payPeriod: string;

  employeeId: string;
  employeeName: string;
  position: string;

  generatedOn: string;
  accountNumber: string;

  paidDays: number;
  lopDays: number;

  authorizedSignatory: string;
  signatoryRole: string;

  hrNote: string;

  earnings: SalaryItem[];
  deductions: SalaryItem[];
}

interface SalarySlipModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: SalarySlipFormData) => void;
}

const initialForm: SalarySlipFormData = {
  monthYear: 'JUNE 2026',
  paySlipNo: '0626001',
  payPeriod: '01 June - 30 June',

  employeeId: '',
  employeeName: '',
  position: '',

  generatedOn: '01 July, 2026',
  accountNumber: '',

  paidDays: 22,
  lopDays: 0,

  authorizedSignatory: 'Seema Srivastava',
  signatoryRole: '(Director)',

  hrNote: 'For any discrepancies, please contact the HR department within 3 working days.',

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
};

export default function SalarySlipModal({ open, onClose, onSubmit }: SalarySlipModalProps) {
  const [form, setForm] = useState<SalarySlipFormData>(initialForm);

  if (!open) return null;

  const updateField = <K extends keyof SalarySlipFormData>(
    field: K,
    value: SalarySlipFormData[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateEarning = (index: number, field: keyof SalaryItem, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      earnings: prev.earnings.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    }));
  };

  const updateDeduction = (index: number, field: keyof SalaryItem, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      deductions: prev.deductions.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    }));
  };

  const addEarning = () => {
    setForm((prev) => ({
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
    setForm((prev) => ({
      ...prev,
      earnings: prev.earnings.filter((_, i) => i !== index),
    }));
  };

  const addDeduction = () => {
    setForm((prev) => ({
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
    setForm((prev) => ({
      ...prev,
      deductions: prev.deductions.filter((_, i) => i !== index),
    }));
  };

  const totalEarnings = form.earnings.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const totalDeductions = form.deductions.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const netSalary = totalEarnings - totalDeductions;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit?.(form);
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
      <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* ================= HEADER ================= */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-black text-white flex items-center justify-center">
              <FileText size={20} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">Create Salary Slip</h2>

              <p className="text-sm text-gray-500">Enter employee compensation details.</p>
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

        {/* ================= FORM ================= */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-8">
            {/* ================= PAYROLL DETAILS ================= */}
            <section>
              <SectionTitle
                icon={<CalendarDays size={18} />}
                title="Payroll Details"
                description="Basic salary statement information."
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Input
                  label="Month / Year"
                  value={form.monthYear}
                  onChange={(e) => updateField('monthYear', e.target.value)}
                  placeholder="JUNE 2026"
                />

                <Input
                  label="Pay Slip Number"
                  value={form.paySlipNo}
                  onChange={(e) => updateField('paySlipNo', e.target.value)}
                  placeholder="0626001"
                />

                <Input
                  label="Pay Period"
                  value={form.payPeriod}
                  onChange={(e) => updateField('payPeriod', e.target.value)}
                  placeholder="01 June - 30 June"
                />
              </div>
            </section>

            {/* ================= EMPLOYEE DETAILS ================= */}
            <section>
              <SectionTitle
                icon={<User size={18} />}
                title="Employee Details"
                description="Information about the employee receiving payment."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <Input
                  label="Employee ID"
                  value={form.employeeId}
                  onChange={(e) => updateField('employeeId', e.target.value)}
                  placeholder="X001"
                  required
                />

                <Input
                  label="Employee Name"
                  value={form.employeeName}
                  onChange={(e) => updateField('employeeName', e.target.value)}
                  placeholder="Pratyush Srivastava"
                  required
                />

                <Input
                  label="Position"
                  value={form.position}
                  onChange={(e) => updateField('position', e.target.value)}
                  placeholder="Director"
                  required
                />

                <Input
                  label="Account Number"
                  value={form.accountNumber}
                  onChange={(e) => updateField('accountNumber', e.target.value)}
                  placeholder="005501040352"
                />
              </div>
            </section>

            {/* ================= EARNINGS / DEDUCTIONS ================= */}
            <section>
              <SectionTitle
                icon={<IndianRupee size={18} />}
                title="Salary Breakdown"
                description="Add earnings and deductions for this payroll."
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                {/* EARNINGS */}
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="bg-gray-900 text-white px-5 py-3 flex items-center justify-between">
                    <span className="font-semibold">Earnings</span>

                    <button
                      type="button"
                      onClick={addEarning}
                      className="text-xs flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
                    >
                      <Plus size={14} />
                      Add
                    </button>
                  </div>

                  <div className="p-4 space-y-3">
                    {form.earnings.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateEarning(index, 'name', e.target.value)}
                          placeholder="Earning name"
                          className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black"
                        />

                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => updateEarning(index, 'amount', Number(e.target.value))}
                          placeholder="Amount"
                          className="w-32 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black"
                        />

                        <button
                          type="button"
                          onClick={() => removeEarning(index)}
                          className="w-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
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
                  <div className="bg-gray-900 text-white px-5 py-3 flex items-center justify-between">
                    <span className="font-semibold">Deductions</span>

                    <button
                      type="button"
                      onClick={addDeduction}
                      className="text-xs flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
                    >
                      <Plus size={14} />
                      Add
                    </button>
                  </div>

                  <div className="p-4 space-y-3">
                    {form.deductions.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateDeduction(index, 'name', e.target.value)}
                          placeholder="Deduction name"
                          className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black"
                        />

                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => updateDeduction(index, 'amount', Number(e.target.value))}
                          placeholder="Amount"
                          className="w-32 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black"
                        />

                        <button
                          type="button"
                          onClick={() => removeDeduction(index)}
                          className="w-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
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
              <div className="mt-5 bg-black text-white rounded-2xl px-6 py-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Net Pay</p>

                  <p className="text-3xl font-bold mt-1">₹{netSalary.toLocaleString('en-IN')}</p>
                </div>

                <div className="text-right text-sm text-gray-400">
                  <p>Earnings: ₹{totalEarnings.toLocaleString('en-IN')}</p>

                  <p>Deductions: ₹{totalDeductions.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </section>

            {/* ================= ATTENDANCE ================= */}
            <section>
              <SectionTitle
                icon={<CalendarDays size={18} />}
                title="Attendance"
                description="Payroll attendance information."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input
                  label="Paid Days"
                  type="number"
                  value={form.paidDays}
                  onChange={(e) => updateField('paidDays', Number(e.target.value))}
                />

                <Input
                  label="LOP Days"
                  type="number"
                  value={form.lopDays}
                  onChange={(e) => updateField('lopDays', Number(e.target.value))}
                />
              </div>
            </section>

            {/* ================= SIGNATORY ================= */}
            <section>
              <SectionTitle
                icon={<Building2 size={18} />}
                title="Approval & Notes"
                description="Authorized signatory and HR information."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input
                  label="Authorized Signatory"
                  value={form.authorizedSignatory}
                  onChange={(e) => updateField('authorizedSignatory', e.target.value)}
                />

                <Input
                  label="Signatory Role"
                  value={form.signatoryRole}
                  onChange={(e) => updateField('signatoryRole', e.target.value)}
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">HR Note</label>

                  <textarea
                    value={form.hrNote}
                    onChange={(e) => updateField('hrNote', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black resize-none"
                    placeholder="Enter HR note..."
                  />
                </div>
              </div>
            </section>
          </div>

          {/* ================= FOOTER ================= */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
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
              Generate Salary Slip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= REUSABLE INPUT ================= */

function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>

      <input
        {...props}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition"
      />
    </div>
  );
}

/* ================= SECTION TITLE ================= */

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

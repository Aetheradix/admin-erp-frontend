import { useRef, useState, useEffect } from 'react';

import { Table, Dropdown, App, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import {
  MoreHorizontal,
  User,
  Calendar,
  Download,
  Eye,
  Plus,
  UserCheck,
  Clock,
  Briefcase,
  Edit3,
} from 'lucide-react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { PageHeader } from '@/components/ui/composed/PageHeader';
import SalarySlipForm from './components/SalarySlipForm';
import SalarySlipTemplate from './components/SalarySlipTemplate';

// Importing from financeApiSlice
import {
  useGetAllSalarySlipsQuery,
  useCreateSalarySlipMutation,
  useUpdateSalarySlipMutation,
} from '@/store/api/financeApiSlice';

import type { SalarySlipData } from './components/SalarySlipForm';

export interface PayrollRecord {
  id: number;
  userId: number;
  employeeCode: string;
  department: string;
  paymentStatus: string;
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
  createdBy: string;
  created_by_username?: string;
  earnings: Array<{ name: string; amount: number }>;
  deductions: Array<{ name: string; amount: number }>;
  authorizedSignatory: string;
  signatoryRole: string;
  hrNote: string;
  rawRecord?: Record<string, any>;
}

// Safe number parser for strings like "0.00", "30.0", or numbers
const parseNum = (val: any): number => {
  if (val === undefined || val === null) return 0;
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

// Month conversion map
const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

const formatApiRecord = (item: Record<string, any>): PayrollRecord => {
  // 1. Employee & Department Info
  const employeeName = String(
    item.username || item.employeeName || item.employee_name || 'Unnamed Employee'
  ).trim();

  const designation = item.designation || item.position || 'Employee';
  const department = item.department || 'N/A';
  const employeeCode = String(item.employee_code || item.user_id || item.userId || 'N/A');
  const userId = parseNum(item.user_id || item.userId || 0);

  // 2. Created By / Admin Author
  const rawCreatedBy = item.created_by_username || item.created_by || item.createdBy;
  const createdBy =
    rawCreatedBy && rawCreatedBy !== 'null' ? String(rawCreatedBy).trim() : 'System / HR';

  // 3. Monetary Fields
  const basicSalary = parseNum(item.basic_salary || item.basePay || item.base);
  const hra = parseNum(item.house_rent_allowance || item.hra);
  const specialAllowance = parseNum(item.special_allowance);
  const conveyance = parseNum(item.conveyance_allowance);
  const bonusPay = parseNum(item.bonus || item.bonusPay);
  const otherEarnings = parseNum(item.other_earnings);
  const grossSalary = parseNum(item.gross_salary || item.total_amount);

  const pf = parseNum(item.provident_fund);
  const profTax = parseNum(item.professional_tax);
  const tds = parseNum(item.income_tax_tds);
  const otherDeductions = parseNum(item.other_deductions);
  const netSalary = parseNum(item.net_salary || item.total);

  // 4. Construct Earnings & Deductions Arrays
  let earnings = Array.isArray(item.earnings) ? item.earnings : [];
  if (earnings.length === 0) {
    earnings = [
      { name: 'Basic Pay', amount: basicSalary },
      ...(hra > 0 ? [{ name: 'HRA', amount: hra }] : []),
      ...(specialAllowance > 0 ? [{ name: 'Special Allowance', amount: specialAllowance }] : []),
      ...(conveyance > 0 ? [{ name: 'Conveyance', amount: conveyance }] : []),
      ...(bonusPay > 0 ? [{ name: 'Bonus', amount: bonusPay }] : []),
      ...(otherEarnings > 0 ? [{ name: 'Other Earnings', amount: otherEarnings }] : []),
    ];
  }

  let deductions = Array.isArray(item.deductions) ? item.deductions : [];
  if (deductions.length === 0) {
    deductions = [
      ...(pf > 0 ? [{ name: 'Provident Fund (PF)', amount: pf }] : []),
      ...(profTax > 0 ? [{ name: 'Professional Tax (PT)', amount: profTax }] : []),
      ...(tds > 0 ? [{ name: 'TDS', amount: tds }] : []),
      ...(otherDeductions > 0 ? [{ name: 'Other Deductions', amount: otherDeductions }] : []),
    ];
  }

  // 5. Pay Period Formatting
  let monthYear = 'OCTOBER 2026';
  if (item.pay_period_month && item.pay_period_year) {
    const mIdx = parseNum(item.pay_period_month) - 1;
    if (mIdx >= 0 && mIdx < 12) {
      monthYear = `${MONTH_NAMES[mIdx]} ${item.pay_period_year}`;
    }
  } else if (item.monthYear || item.payPeriod) {
    monthYear = String(item.monthYear || item.payPeriod);
  }

  const calculatedTotal = earnings.reduce((acc: number, curr: any) => acc + parseNum(curr.amount), 0);
  const finalNet = netSalary || grossSalary || calculatedTotal;

  return {
    id: Number(item.id || Date.now()),
    userId: userId,
    employeeCode: employeeCode,
    department: department,
    paymentStatus: String(item.payment_status || 'paid'),
    base: basicSalary,
    bonus: bonusPay,
    total: finalNet,
    date: monthYear,
    monthYear: monthYear,
    paySlipNo: item.paySlipNo || item.pay_slip_no || `SLIP-${item.id || Date.now()}`,
    payPeriod: monthYear,
    companyName: item.companyName || 'AETHERADIX',
    companyAddress: item.companyAddress || 'F-N 507, Crystal Tower, IBD Kings Park, Bhopal, MP',
    employeeId: employeeCode,
    employeeName: employeeName,
    position: designation,
    accountNumber: item.bank_account_number || item.accountNumber || 'N/A',
    paidDays: parseNum(item.days_worked ?? item.paidDays ?? 30),
    lopDays: parseNum(item.leave_days ?? item.lopDays ?? 0),
    generatedOn: item.payment_date || item.created_at || new Date().toISOString().split('T')[0],
    createdBy: createdBy,
    created_by_username: createdBy,
    earnings: earnings,
    deductions: deductions,
    authorizedSignatory: item.authorizedSignatory || 'Seema Srivastava',
    signatoryRole: item.signatoryRole || '(Director)',
    hrNote: item.hrNote || 'For any discrepancies, please contact the HR department within 3 working days.',
    rawRecord: item,
  };
};

export function PayrollPage() {
  const { message } = App.useApp();

  const {
    data: rawData,
    isLoading: isFetching,
    isError,
  } = useGetAllSalarySlipsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [createSalarySlip, { isLoading: isCreating }] = useCreateSalarySlipMutation();
  const [updateSalarySlip, { isLoading: isUpdating }] = useUpdateSalarySlipMutation();

  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [showSalarySlipForm, setShowSalarySlipForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);
  const [selectedSlip, setSelectedSlip] = useState<PayrollRecord | null>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);

  const hiddenPdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rawData) {
      const itemsList = Array.isArray(rawData?.data)
        ? rawData.data
        : Array.isArray(rawData)
        ? rawData
        : [];

      const formattedRecords: PayrollRecord[] = itemsList.map((item: Record<string, any>) =>
        formatApiRecord(item)
      );

      setPayroll(formattedRecords);
    }
  }, [rawData]);

  const downloadSalarySlip = async (record: PayrollRecord) => {
    try {
      message.loading({ content: 'Preparing document...', key: 'dl' });
      setSelectedSlip(record);

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (!hiddenPdfRef.current) throw new Error('Template container not ready');

      const canvas = await html2canvas(hiddenPdfRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = 210;
      const imageHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imageHeight);
      pdf.save(`Salary-Slip-${record.employeeName.replace(/\s+/g, '_')}-${record.monthYear}.pdf`);

      message.success({ content: 'Salary slip downloaded!', key: 'dl' });
    } catch (err) {
      console.error('PDF error:', err);
      message.error({ content: 'Failed to download PDF.', key: 'dl' });
    }
  };

  const handleFormSubmit = async (data: SalarySlipData) => {
    const key = 'salary-slip-action';
    try {
      if (editingRecord) {
        message.loading({ content: 'Updating salary slip...', key });
        await updateSalarySlip({ id: editingRecord.id, ...data }).unwrap();
        message.success({ content: 'Salary slip updated successfully!', key });
      } else {
        message.loading({ content: 'Saving salary slip...', key });
        await createSalarySlip(data as any).unwrap();
        message.success({ content: 'Salary slip recorded successfully!', key });
      }

      setShowSalarySlipForm(false);
      setEditingRecord(null);
    } catch (error: any) {
      message.error({
        content: error?.data?.message || 'Failed to save salary slip.',
        key,
      });
    }
  };

  const handleEdit = (record: PayrollRecord) => {
    setEditingRecord(record);
    setShowSalarySlipForm(true);
  };

  const handleCreateNew = () => {
    setEditingRecord(null);
    setShowSalarySlipForm(true);
  };

  const columns: ColumnsType<PayrollRecord> = [
    {
      title: 'Employee Details',
      key: 'employee',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <User size={16} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">{record.employeeName}</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-semibold">
                ID: #{record.employeeCode}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {record.position}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Department',
      key: 'department',
      render: (_, record) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
          <Briefcase size={14} className="text-slate-400" />
          <span>{record.department}</span>
        </div>
      ),
    },
    {
      title: 'Pay Period',
      key: 'monthYear',
      render: (_, record) => (
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
          <Calendar size={14} className="text-indigo-500" />
          <span>{record.monthYear}</span>
        </div>
      ),
    },
    {
      title: 'Days Worked',
      key: 'paidDays',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-800">
            {record.paidDays} Days
          </span>
          {record.lopDays > 0 && (
            <span className="text-[10px] font-semibold text-rose-500">
              {record.lopDays} LOP
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag
          color={record.paymentStatus.toLowerCase() === 'paid' ? 'success' : 'warning'}
          className="uppercase font-bold text-[10px] rounded-md px-2 py-0.5"
        >
          {record.paymentStatus}
        </Tag>
      ),
    },
    {
      title: 'Net Salary',
      key: 'total',
      render: (_, record) => (
        <span className="text-sm font-black text-slate-900">
          ₹{Number(record.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Created By',
      key: 'createdBy',
      render: (_, record) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <UserCheck size={14} className="text-slate-400" />
          <span className="font-medium text-slate-800">{record.created_by_username}</span>
        </div>
      ),
    },
    {
      title: 'Payment Date',
      key: 'generatedOn',
      render: (_, record) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock size={13} className="text-slate-400" />
          <span>{record.generatedOn}</span>
        </div>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 70,
      render: (_, record) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              { key: 'view', label: 'View Salary Slip', icon: <Eye size={15} /> },
              { key: 'edit', label: 'Edit Salary Slip', icon: <Edit3 size={15} /> },
              { key: 'download', label: 'Download PDF', icon: <Download size={15} /> },
            ],
            onClick: ({ key }) => {
              if (key === 'view') {
                setSelectedSlip(record);
                setShowSlipModal(true);
              }
              if (key === 'edit') {
                handleEdit(record);
              }
              if (key === 'download') {
                downloadSalarySlip(record);
              }
            },
          }}
        >
          <button type="button" className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-500">
            <MoreHorizontal size={18} />
          </button>
        </Dropdown>
      ),
    },
  ];

  const isSubmitting = isCreating || isUpdating;

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-7xl mx-auto p-4 sm:p-6">
      <PageHeader
        title="All Payrolls"
        description="Company-wide employee compensation distribution history and generated slips."
      />

      <div className="flex justify-end -mt-4">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleCreateNew}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 transition disabled:opacity-50 shadow-sm active:scale-95"
        >
          <Plus size={16} />
          {isSubmitting ? 'Saving...' : 'Create Salary Slip'}
        </button>
      </div>

      <motion.div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={payroll}
          loading={isFetching}
          rowKey={(record) => String(record.id || record.paySlipNo)}
          locale={{ emptyText: isError ? 'Error fetching payroll data.' : 'No payroll records found.' }}
        />
      </motion.div>

      {/* Salary Slip Form Modal (Create or Edit) */}
      {showSalarySlipForm && (
        <SalarySlipForm
          initialValues={editingRecord?.rawRecord || editingRecord || undefined}
          isEditing={Boolean(editingRecord)}
          onClose={() => {
            setShowSalarySlipForm(false);
            setEditingRecord(null);
          }}
          onCreate={handleFormSubmit}
        />
      )}

      {/* View Salary Slip Modal */}
      {showSlipModal && selectedSlip && (
        <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[900px] max-h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="font-bold text-lg text-gray-900">
                Salary Slip ({selectedSlip.employeeName} - {selectedSlip.monthYear})
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => downloadSalarySlip(selectedSlip)}
                  className="bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-gray-800 transition"
                >
                  <Download size={16} /> Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => setShowSlipModal(false)}
                  className="border border-gray-300 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-100 transition"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="overflow-auto bg-gray-100 p-6">
              <SalarySlipTemplate data={selectedSlip} />
            </div>
          </div>
        </div>
      )}

      {/* Off-screen render for PDF download */}
      <div className="fixed top-[-9999px] left-[-9999px] pointer-events-none opacity-0">
        {selectedSlip && (
          <div ref={hiddenPdfRef} className="w-[800px] bg-white p-4">
            <SalarySlipTemplate data={selectedSlip} />
          </div>
        )}
      </div>
    </div>
  );
}

export default PayrollPage;
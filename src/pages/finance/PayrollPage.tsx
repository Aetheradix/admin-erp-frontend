import { Table,  Dropdown, App, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  User,
  Briefcase,
  Calendar,
  UserCheck,
  Clock,
  MoreHorizontal,
  Plus,
  Eye,
  Edit3,
  Download,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useRef, useState, useEffect } from 'react';
import {
  useGetAllSalarySlipsQuery,
  useCreateSalarySlipMutation,
  useDeleteSalarySlipMutation,
  useUpdateSalarySlipMutation,
  useGetAuditLogsQuery,
} from '@/store/api/financeApiSlice';
import SalarySlipTemplate from './components/SalarySlipTemplate';
import SalarySlipForm from './components/SalarySlipForm';
import type { SalarySlipData } from './components/SalarySlipTemplate';
import { PageHeader } from '@/components/ui/composed/PageHeader';

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
  payPeriodMonth?: number;
  payPeriodYear?: number;
  rawRecord?: Record<string, any>;
}

const formatApiRecord = (item: Record<string, any>): PayrollRecord => {
  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];
  
  const monthStr = monthNames[(item.pay_period_month || 1) - 1];
  const yearStr = item.pay_period_year || 2026;

  const actualSlipNo = item.paySlipNo || item.pay_slip_no;
 

  const basicSalary = Number(item.basic_salary || 0);
  const bonusVal = Number(item.bonus || 0);
  const netVal = Number(item.net_salary || 0);
  const monthYearStr = `${monthStr} ${yearStr}`;
   const fallbackSlipNo = `SLIP-${item.empCode}-${yearStr} ${monthStr} `;

  return {
    ...item,
    id: item.id,
    userId: item.user_id,
    base: basicSalary,
    bonus: bonusVal,
    total: netVal,
    date: monthYearStr,
    monthYear: monthYearStr,
    payPeriod: monthYearStr,
    companyName: 'AETHERADIX',
    companyAddress: 'F-N 507, Crystal Tower, IBD Kings Park, Bhopal, MP',
    employeeId: String(item.employee_code || item.user_id),
    employeeName: item.username || 'Unknown Employee',
    employeeCode: item.employee_code || String(item.user_id),
    position: item.designation || 'N/A',
    department: item.department || 'N/A',
    accountNumber: item.bank_account_number || 'N/A',
    authorizedSignatory: 'Seema Srivastava',
    signatoryRole: '(Director)',
    payPeriodMonth: item.pay_period_month,
    payPeriodYear: item.pay_period_year,
    paySlipNo: actualSlipNo && actualSlipNo !== 'null' ? actualSlipNo : fallbackSlipNo,
    paidDays: Number(item.days_worked || item.total_working_days || 0),
    lopDays: Number(item.leave_days || 0),
    paymentStatus: item.payment_status || 'paid',
    generatedOn: item.payment_date || item.created_at?.split('T')[0] || '',
    createdBy: item.created_by_username || 'System',
    created_by_username: item.created_by_username || 'System',
    earnings: [
      { name: 'Basic Salary', amount: Number(item.basic_salary || 0) },
      { name: 'House Rent Allowance (HRA)', amount: Number(item.house_rent_allowance || 0) },
      { name: 'Special Allowance', amount: Number(item.special_allowance || 0) },
      { name: 'Conveyance Allowance', amount: Number(item.conveyance_allowance || 0) },
      { name: 'Bonus', amount: Number(item.bonus || 0) },
      { name: 'Other Earnings', amount: Number(item.other_earnings || 0) },
    ],
    deductions: [
      { name: 'Provident Fund (PF)', amount: Number(item.provident_fund || 0) },
      { name: 'Professional Tax', amount: Number(item.professional_tax || 0) },
      { name: 'Income Tax (TDS)', amount: Number(item.income_tax_tds || 0) },
      { name: 'Other Deductions', amount: Number(item.other_deductions || 0) },
    ],
    hrNote: item.remarks || 'For any discrepancies, please contact the HR department within 3 working days.',
  };
};

export default function PayrollPage() {
  const { message } = App.useApp();

  const {
    data: rawData,
    isLoading: isFetching,
    isError,
    refetch: refetchSlips, // 👈 Destructure refetch
  } = useGetAllSalarySlipsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const { 
    data: auditLogsData, 
    isLoading: isLogsLoading,
    refetch: refetchLogs, // 👈 Destructure refetch
  } = useGetAuditLogsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [createSalarySlip, { isLoading: isCreating }] = useCreateSalarySlipMutation();
  const [updateSalarySlip, { isLoading: isUpdating }] = useUpdateSalarySlipMutation();
  const [deleteSalarySlip, { isLoading: isDeleting }] = useDeleteSalarySlipMutation();

  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [filteredPayroll, setFilteredPayroll] = useState<PayrollRecord[]>([]);
  const [searchText, setSearchText] = useState('');

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

      formattedRecords.sort((a: PayrollRecord, b: PayrollRecord) => {
        const yearDiff = Number(b.payPeriodYear || 0) - Number(a.payPeriodYear || 0);
        if (yearDiff !== 0) return yearDiff;
        return Number(b.payPeriodMonth || 0) - Number(a.payPeriodMonth || 0);
      });

      setPayroll(formattedRecords);
      setFilteredPayroll(formattedRecords);
    }
  }, [rawData]);

  useEffect(() => {
    let result = [...payroll];

    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      result = result.filter(
        (item) =>
          item.employeeName?.toLowerCase().includes(query) ||
          item.employeeCode?.toLowerCase().includes(query) ||
          item.department?.toLowerCase().includes(query) ||
          item.paySlipNo?.toLowerCase().includes(query)
      );
    }

    setFilteredPayroll(result);
  }, [searchText, payroll]);

  const downloadSalarySlip = async (record: PayrollRecord) => {
    try {
      message.loading({ content: 'Preparing document...', key: 'dl' });
      setSelectedSlip(record);

      // 1. Force browser to finish layout & font glyph calculations
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      if (document.fonts) {
        await document.fonts.ready;
      }
      await new Promise((resolve) => setTimeout(resolve, 400));

      if (!hiddenPdfRef.current) throw new Error('Template container not ready');

      const targetEl =
        (hiddenPdfRef.current.querySelector('.salary-statement-paper') as HTMLElement) ||
        hiddenPdfRef.current;

      // 2. Snapshot with letter rendering & clone bounds enforced
      const canvas = await html2canvas(targetEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1000,
        onclone: (clonedDoc) => {
          const clonedEl = clonedDoc.querySelector('.salary-statement-paper') as HTMLElement;
          if (clonedEl) {
            clonedEl.style.display = 'block';
            clonedEl.style.position = 'static';
            clonedEl.style.margin = '0 auto';
            clonedEl.style.overflow = 'visible';
            clonedEl.style.boxSizing = 'border-box';
          }
        },
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      if (imgHeight > pdfHeight) {
        const ratio = pdfHeight / imgHeight;
        const adjustedWidth = imgWidth * ratio;
        const adjustedHeight = pdfHeight;
        const xOffset = (pdfWidth - adjustedWidth) / 2;

        pdf.addImage(imgData, 'PNG', xOffset, 0, adjustedWidth, adjustedHeight);
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }

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
      await Promise.all([refetchSlips(), refetchLogs()]);

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

  const handleDelete = (record: PayrollRecord) => {
    Modal.confirm({
      title: 'Delete Salary Slip',
      content: `Are you sure you want to delete the salary slip for ${record.employeeName} (${record.monthYear})? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: async () => {
        const key = 'delete-salary-slip';
        try {
          message.loading({ content: 'Deleting salary slip...', key });
          await deleteSalarySlip(record.id).unwrap();
          message.success({ content: 'Salary slip deleted successfully!', key });
        } catch (error: any) {
          message.error({
            content: error?.data?.message || error?.message || 'Failed to delete salary slip.',
            key,
          });
        }
      },
    });
  };

  const handleCreateNew = () => {
    setEditingRecord(null);
    setShowSalarySlipForm(true);
  };

  const columns: ColumnsType<PayrollRecord> = [
    {
      title: 'Slip No',
      key: 'paySlipNo',
      render: (_, record) => (
        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
          {record.paySlipNo}
        </span>
      ),
    },
    {
      title: 'Employee Details',
      key: 'employee',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <User size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900">{record.employeeName}</span>
            <span className="text-[11px] text-slate-500 font-medium">{record.position}</span>
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
          <span className="text-xs font-semibold text-slate-800">{record.paidDays} Days</span>
          {record.lopDays > 0 && (
            <span className="text-[10px] font-semibold text-rose-500">{record.lopDays} LOP</span>
          )}
        </div>
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
      title: 'Generated On',
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
              { type: 'divider' },
              {
                key: 'delete',
                label: 'Delete Salary Slip',
                icon: <Trash2 size={15} className="text-rose-500" />,
                danger: true,
              },
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
              if (key === 'delete') {
                handleDelete(record);
              }
            },
          }}>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-500">
            <MoreHorizontal size={18} />
          </button>
        </Dropdown>
      ),
    },
  ];

  const logColumns: ColumnsType<any> = [
    {
      title: 'Timestamp',
      key: 'createdAt',
      render: (_, record) => (
        <span className="text-xs font-mono text-slate-600">
          {new Date(record.created_at || record.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => {
        const actionType = record.action || '';
        // const color = actionType.includes('CREATE')
        //   ? 'success'
        //   : actionType.includes('UPDATE')
        //   ? 'processing'
        //   : 'error';
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700`}>
            {actionType}
          </span>
        );
      },
    },
    {
      title: 'Description',
      key: 'description',
      render: (_, record) => (
        <span className="text-xs text-slate-800 font-medium">
          {record.description || 'Payroll action performed.'}
        </span>
      ),
    },
    {
      title: 'Admin / User',
      key: 'username',
      render: (_, record) => (
        <span className="text-xs text-slate-600 font-semibold">
          {record.username || 'System'}
        </span>
      ),
    },
  ];

  const isSubmitting = isCreating || isUpdating || isDeleting;
  const rawLogsList = Array.isArray(auditLogsData?.data)
    ? auditLogsData.data
    : Array.isArray(auditLogsData)
    ? auditLogsData
    : [];

  return (
    <div className="flex flex-col gap-6 pb-20 max-w-7xl mx-auto p-4 sm:p-6">
      <PageHeader
        title="All Payrolls"
        description="Company-wide employee compensation distribution history and generated slips."
      />

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search slip no, employee, ID, dept..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 w-72 shadow-sm"
          />
        </div>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleCreateNew}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 transition disabled:opacity-50 shadow-sm active:scale-95">
          <Plus size={16} />
          {isSubmitting ? 'Saving...' : 'Create Salary Slip'}
        </button>
      </div>

      <motion.div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredPayroll}
          loading={isFetching}
          rowKey={(record) => String(record.id || record.paySlipNo)}
          locale={{
            emptyText: isError ? 'Error fetching payroll data.' : 'No payroll records found.',
          }}
        />
      </motion.div>

      {/* 💡 Audit Logs Table at the Bottom */}
      <div className="flex flex-col gap-3 mt-6">
        <div>
          <h3 className="font-bold text-base text-slate-900">Audit Logs</h3>
          <p className="text-xs text-slate-500">History of salary slip updates, creations, and deletions</p>
        </div>
        <motion.div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <Table
            columns={logColumns}
            dataSource={rawLogsList}
            loading={isLogsLoading}
            rowKey={(record) => record.id || Math.random()}
            locale={{ emptyText: 'No audit logs recorded yet.' }}
            pagination={{ pageSize: 5 }}
          />
        </motion.div>
      </div>

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

      {showSlipModal && selectedSlip && (
        <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[900px] max-h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="font-bold text-lg text-gray-900">
                Salary Slip ({selectedSlip.employeeName} - {selectedSlip.monthYear})
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => downloadSalarySlip(selectedSlip)}
                  className="bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-gray-800 transition">
                  <Download size={16} /> Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => setShowSlipModal(false)}
                  className="border border-gray-300 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-100 transition">
                  Close
                </button>
              </div>
            </div>
            <div className="overflow-auto bg-gray-100 p-6 flex justify-center">
              <SalarySlipTemplate data={selectedSlip} />
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '794px',
          opacity: 1,
          pointerEvents: 'none',
          zIndex: -9999,
        }}>
        {selectedSlip && (
          <div ref={hiddenPdfRef} style={{ width: '794px', background: '#ffffff' }}>
            <SalarySlipTemplate data={selectedSlip} />
          </div>
        )}
      </div>
    </div>
  );
}
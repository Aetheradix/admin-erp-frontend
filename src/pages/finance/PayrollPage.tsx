import { useRef, useState, useEffect } from 'react';

import { Table, Dropdown, App } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { MoreHorizontal, User, Calendar, Download, Eye, Plus } from 'lucide-react';
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
  useLazyGetSalarySlipByIdQuery,
} from '@/store/api/financeApiSlice';

import type { SalarySlipData } from './components/SalarySlipForm';

export interface PayrollRecord {
  id: number;
  userId: number;
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
  earnings: Array<{ name: string; amount: number }>;
  deductions: Array<{ name: string; amount: number }>;
  authorizedSignatory: string;
  signatoryRole: string;
  hrNote: string;
}

export function PayrollPage() {
  // 1. Ant Design message instance hook
  const { message } = App.useApp();

  // 2. Query Hooks
  const {
    data: rawData,
    isLoading: isFetching,
    isError,
  } = useGetAllSalarySlipsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [triggerGetSalarySlip] = useLazyGetSalarySlipByIdQuery();
  const [createSalarySlip, { isLoading: isSubmitting }] = useCreateSalarySlipMutation();

  // 3. States
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [showSalarySlipForm, setShowSalarySlipForm] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<PayrollRecord | null>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);

  const hiddenPdfRef = useRef<HTMLDivElement>(null);

  const formatApiRecord = (item: Record<string, unknown>): PayrollRecord => {
  // Deep search helper to find a key inside deeply nested objects/wrappers
  const findDeepValue = (obj: any, keys: string[]): any => {
    if (!obj || typeof obj !== 'object') return undefined;
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') return obj[key];
    }
    for (const p in obj) {
      if (obj[p] && typeof obj[p] === 'object' && !Array.isArray(obj[p])) {
        const found = findDeepValue(obj[p], keys);
        if (found !== undefined && found !== null && found !== '') return found;
      }
    }
    return undefined;
  };

  // 1. Extract Arrays
  const rawEarnings = (findDeepValue(item, ['earnings']) as Array<{ name: string; amount: number }>) || [];
  const rawDeductions = (findDeepValue(item, ['deductions']) as Array<{ name: string; amount: number }>) || [];

  // 2. Extract Employee Name
  const nameKeys = ['employeeName', 'employee_name', 'employeeName', 'name', 'full_name', 'username'];
  const employeeName = String(findDeepValue(item, nameKeys) || 'Unnamed Employee').trim();

  // 3. Extract Base Salary
  const baseKeys = ['basePay', 'base_amount', 'base_pay', 'basicSalary', 'basic_salary', 'base_pay_amount', 'base'];
  const baseFromEarnings = rawEarnings.find((e) =>
    e.name?.toLowerCase().includes('basic') || e.name?.toLowerCase().includes('base')
  )?.amount;
  const basePay = Number(findDeepValue(item, baseKeys) ?? baseFromEarnings ?? 0);

  // 4. Extract Bonus
  const bonusKeys = ['bonusPay', 'bonus_amount', 'bonus_pay', 'bonus'];
  const bonusFromEarnings = rawEarnings.find((e) =>
    e.name?.toLowerCase().includes('bonus')
  )?.amount;
  const bonusPay = Number(findDeepValue(item, bonusKeys) ?? bonusFromEarnings ?? 0);

  // 5. Extract Total / Net Salary
  const totalKeys = ['netSalary', 'total_amount', 'net_salary', 'totalSalary', 'total_salary', 'totalEarnings', 'total'];
  const calculatedTotal = rawEarnings.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const netSalary = Number(findDeepValue(item, totalKeys) ?? (calculatedTotal > 0 ? calculatedTotal : basePay + bonusPay));

  // 6. Extract Pay Period / Date
  const dateKeys = ['monthYear', 'month_year', 'payPeriod', 'pay_period', 'date', 'created_at'];
  const monthYear = String(findDeepValue(item, dateKeys) || 'OCTOBER 2026');

  // 7. Extract Position
  const positionKeys = ['position', 'employee_position', 'designation', 'role'];
  const position = String(findDeepValue(item, positionKeys) || 'Employee');

  const userId = Number(findDeepValue(item, ['userId', 'user_id', 'employeeId', 'employee_id']) || 0);

  return {
    id: Number(item.id || findDeepValue(item, ['id']) || Date.now()),
    userId: userId,
    base: basePay,
    bonus: bonusPay,
    total: netSalary,
    date: monthYear,

    monthYear: monthYear,
    paySlipNo: String(findDeepValue(item, ['paySlipNo', 'pay_slip_no', 'slip_no']) || `SLIP-${Date.now()}`),
    payPeriod: String(findDeepValue(item, ['payPeriod', 'pay_period']) || monthYear),

    companyName: String(findDeepValue(item, ['companyName', 'company_name']) || 'AETHERADIX'),
    companyAddress: String(
      findDeepValue(item, ['companyAddress', 'company_address']) ||
      'F-N 507, Crystal Tower, IBD Kings Park, Bhopal, MP'
    ),

    employeeId: String(userId),
    employeeName: employeeName,
    position: position,
    accountNumber: String(findDeepValue(item, ['accountNumber', 'account_number']) || 'N/A'),

    paidDays: Number(findDeepValue(item, ['paidDays', 'paid_days']) || 22),
    lopDays: Number(findDeepValue(item, ['lopDays', 'lop_days']) || 0),

    generatedOn: String(
      findDeepValue(item, ['generatedOn', 'generated_on']) || new Date().toISOString().split('T')[0]
    ),

    earnings:
      rawEarnings.length > 0
        ? rawEarnings
        : [
            { name: 'Basic Pay', amount: basePay },
            ...(bonusPay > 0 ? [{ name: 'Bonus', amount: bonusPay }] : []),
          ],
    deductions: rawDeductions,

    authorizedSignatory: String(
      findDeepValue(item, ['authorizedSignatory', 'authorized_signatory']) || 'Seema Srivastava'
    ),
    signatoryRole: String(findDeepValue(item, ['signatoryRole', 'signatory_role']) || '(Director)'),
    hrNote: String(
      findDeepValue(item, ['hrNote', 'hr_note']) ||
      'For any discrepancies, please contact the HR department within 3 working days.'
    ),
  };
};

  // 4. Update local state when API data changes
  useEffect(() => {
    if (rawData) {
      const itemsList = Array.isArray(rawData?.data)
        ? rawData.data
        : Array.isArray(rawData)
          ? rawData
          : [];

      const formattedRecords: PayrollRecord[] = itemsList.map((item: Record<string, unknown>) =>
        formatApiRecord(item)
      );

      setPayroll(formattedRecords);
    }
  }, [rawData]);

  // PDF Generation Logic
  const generateSalarySlipPdf = async (record: PayrollRecord): Promise<Blob> => {
    setSelectedSlip(record);

    // Wait for state update and DOM target render
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!hiddenPdfRef.current) {
      throw new Error('Salary slip template render target not found.');
    }

    const canvas = await html2canvas(hiddenPdfRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

    const pdfWidth = 210;
    const pdfHeight = 297;
    const imageHeight = (canvas.height * pdfWidth) / canvas.width;

    if (imageHeight <= pdfHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imageHeight);
    } else {
      let remainingHeight = imageHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imageHeight);
      remainingHeight -= pdfHeight;

      while (remainingHeight > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imageHeight);
        remainingHeight -= pdfHeight;
      }
    }

    return pdf.output('blob');
  };

  const downloadSalarySlip = async (record: PayrollRecord) => {
    try {
      message.loading({ content: 'Fetching latest record from database...', key: 'dl' });

      let dbRecord = record;

      try {
        const result = await triggerGetSalarySlip(record.id).unwrap();
        const rawItem = (result as { data?: unknown })?.data ?? result;

        if (rawItem && typeof rawItem === 'object') {
          dbRecord = formatApiRecord(rawItem as Record<string, unknown>);
        }
      } catch (fetchErr) {
        console.warn('Single slip endpoint warning, using table state:', fetchErr);
      }

      message.loading({ content: 'Generating PDF...', key: 'dl' });
      const pdfBlob = await generateSalarySlipPdf(dbRecord);

      const url = window.URL.createObjectURL(pdfBlob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `Salary-Slip-${dbRecord.employeeName.replace(/\s+/g, '_')}-${dbRecord.monthYear}.pdf`;

      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      window.URL.revokeObjectURL(url);
      message.success({ content: 'Salary slip downloaded!', key: 'dl' });
    } catch (err: unknown) {
      console.error('Download error:', err);
      message.error({ content: 'Failed to generate salary slip PDF.', key: 'dl' });
    }
  };

  const handleCreateSalarySlip = async (data: SalarySlipData) => {
    try {
      const targetUserId = Number(
        data.employeeId || (data as any).userId || (data as any).user_id || (data as any).id
      );

      if (!targetUserId || isNaN(targetUserId) || targetUserId <= 0) {
        message.error('Please select a valid employee before submitting.');
        return;
      }

      message.loading({ content: 'Saving salary slip to database...', key: 'create-salary' });

      const earningsList = Array.isArray(data?.earnings) ? data.earnings : [];
      const deductionsList = Array.isArray(data?.deductions) ? data.deductions : [];

      const totalEarnings = earningsList.reduce((sum, item) => sum + Number(item?.amount || 0), 0);
      const totalDeductions = deductionsList.reduce(
        (sum, item) => sum + Number(item?.amount || 0),
        0
      );
      const netSalary = Math.max(0, totalEarnings - totalDeductions);

      const base =
        earningsList.find((i) => i?.name?.trim().toLowerCase().includes('basic'))?.amount || 0;
      const bonus =
        earningsList.find((i) => i?.name?.trim().toLowerCase().includes('bonus'))?.amount || 0;

      const payload = {
        user_id: targetUserId,
        userId: targetUserId,
        employee_id: targetUserId,
        employeeId: targetUserId,
        employeeName: data.employeeName || 'Unnamed Employee',
        position: data.position || 'Employee',
        monthYear: data.monthYear || 'OCTOBER 2026',
        month_year: data.monthYear || 'OCTOBER 2026',
        payPeriod: data.payPeriod || data.monthYear || 'OCTOBER 2026',
        pay_period: data.payPeriod || data.monthYear || 'OCTOBER 2026',
        paySlipNo: data.paySlipNo || `SLIP-${Date.now()}`,
        pay_slip_no: data.paySlipNo || `SLIP-${Date.now()}`,
        accountNumber: data.accountNumber || '',
        paidDays: Number(data.paidDays) || 22,
        paid_days: Number(data.paidDays) || 22,
        lopDays: Number(data.lopDays) || 0,
        lop_days: Number(data.lopDays) || 0,
        basePay: Number(base),
        base_amount: Number(base),
        bonusPay: Number(bonus),
        bonus_amount: Number(bonus),
        netSalary: netSalary,
        total_amount: netSalary,
        earnings: earningsList.map((e) => ({ name: e.name, amount: Number(e.amount) || 0 })),
        deductions: deductionsList.map((d) => ({ name: d.name, amount: Number(d.amount) || 0 })),
        authorizedSignatory: data.authorizedSignatory || 'Seema Srivastava',
        signatoryRole: data.signatoryRole || '(Director)',
        hrNote: data.hrNote || '',
      };

      await createSalarySlip(payload as any).unwrap();

      setShowSalarySlipForm(false);
      message.success({
        content: 'Salary slip recorded in database successfully!',
        key: 'create-salary',
      });
    } catch (error: any) {
      console.error('Database save error:', error);
      const backendMessage = error?.data?.message || 'Failed to save salary slip to database.';
      message.error({ content: backendMessage, key: 'create-salary' });
    }
  };

  const columns: ColumnsType<PayrollRecord> = [
    {
      title: 'Employee',
      key: 'employee',
      render: (_, record) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <User size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">
              {record.employeeName || 'Unnamed Employee'}
            </span>
            <span className="text-[10px] font-bold text-muted uppercase">
              {record.position || 'Employee'}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Base Pay',
      key: 'base',
      render: (_, record) =>
        `₹${Number(record.base || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    },
    {
      title: 'Bonus',
      key: 'bonus',
      render: (_, record) =>
        `+₹${Number(record.bonus || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    },
    {
      title: 'Total Salary',
      key: 'total',
      render: (_, record) => (
        <span className="font-black text-gray-900">
          ₹{Number(record.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Pay Period',
      key: 'date',
      render: (_, record) => (
        <div className="flex items-center gap-2 text-xs font-bold text-muted">
          <Calendar size={14} />
          {record.date || record.monthYear || 'N/A'}
        </div>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              { key: 'view', label: 'View Salary Slip', icon: <Eye size={15} /> },
              { key: 'download', label: 'Download Salary Slip PDF', icon: <Download size={15} /> },
            ],
            onClick: ({ key }) => {
              setSelectedSlip(record);
              if (key === 'view') setShowSlipModal(true);
              if (key === 'download') downloadSalarySlip(record);
            },
          }}>
          <button type="button" className="p-2 rounded-lg hover:bg-surface-subtle transition">
            <MoreHorizontal size={18} />
          </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-10 pb-20">
      <PageHeader
        title="All Payrolls"
        description="Company-wide employee compensation distribution history."
      />

      <div className="flex justify-end -mt-6">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => setShowSalarySlipForm(true)}
          className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50 shadow-md">
          <Plus size={18} />
          {isSubmitting ? 'Saving...' : 'Create Salary Slip'}
        </button>
      </div>

      <motion.div className="bg-white rounded-[40px] border border-border-subtle shadow-soft overflow-hidden">
        <Table
          columns={columns}
          dataSource={payroll}
          loading={isFetching}
          rowKey={(record) => String(record.paySlipNo || record.id || record.userId || Math.random())}
          locale={{
            emptyText: isError ? 'Error loading payroll records.' : 'No payroll records found.',
          }}
        />
      </motion.div>

      {/* Salary Slip Input Modal */}
      {showSalarySlipForm && (
        <SalarySlipForm
          onClose={() => setShowSalarySlipForm(false)}
          onCreate={handleCreateSalarySlip}
        />
      )}

      {/* Salary Slip Preview Modal */}
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
            <div className="overflow-auto bg-gray-100 p-6">
              <SalarySlipTemplate data={selectedSlip} />
            </div>
          </div>
        </div>
      )}

      {/* Off-screen rendering element for on-demand PDF downloads */}
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
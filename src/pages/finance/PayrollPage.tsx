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
} from '@/store/api/financeApiSlice';
// import type { CreateSalarySlipPayload } from '@/store/api/financeApiSlice';

import type { SalarySlipData } from './components/SalarySlipForm';

export interface PayrollRecord extends SalarySlipData {
  id: number;
  base: number;
  bonus: number;
  total: number;
  date: string;
}

export function PayrollPage() {
  // Fix 1: Use App.useApp() hook for message instance to resolve Ant Design context warning
  const { message } = App.useApp();

  // 1. Fetch salary slips from the database
  const {
    data: rawData,
    isLoading: isFetching,
    isError,
  } = useGetAllSalarySlipsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // 2. Mutation to insert new salary slip record into DB
  const [createSalarySlip, { isLoading: isSubmitting }] = useCreateSalarySlipMutation();

  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [showSalarySlipForm, setShowSalarySlipForm] = useState(false);

  // States for viewing and on-demand PDF generation
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

      const formattedRecords: PayrollRecord[] = itemsList.map((item: Record<string, unknown>) => {
        const rawEarnings = Array.isArray(item.earnings)
          ? (item.earnings as Array<{ name: string; amount: number }>)
          : [];
        const rawDeductions = Array.isArray(item.deductions)
          ? (item.deductions as Array<{ name: string; amount: number }>)
          : [];

        const basePay = Number(
          item.base_amount ||
            item.basePay ||
            item.base_pay ||
            rawEarnings.find((e) => e.name?.toLowerCase().includes('basic'))?.amount ||
            0
        );

        const bonusPay = Number(
          item.bonus_amount ||
            item.bonusPay ||
            item.bonus ||
            rawEarnings.find((e) => e.name?.toLowerCase().includes('bonus'))?.amount ||
            0
        );

        const netSalary = Number(item.total_amount || item.net_salary || item.netSalary || 0);
        const monthYear = String(
          item.month_year || item.monthYear || item.created_at || 'OCTOBER 2026'
        );
        const position = String(
          item.position || item.employee_position || item.designation || 'Employee'
        );

        return {
          id: Number(item.id || Date.now()),
          base: basePay,
          bonus: bonusPay,
          total: netSalary,
          date: monthYear,

          monthYear: monthYear,
          paySlipNo: String(item.pay_slip_no || item.paySlipNo || `SLIP-${item.id || Date.now()}`),
          payPeriod: String(item.pay_period || item.payPeriod || monthYear),

          companyName: String(item.company_name || item.companyName || 'AETHERADIX'),
          companyAddress: String(
            item.company_address ||
              item.companyAddress ||
              'F-N 507, Crystal Tower, IBD Kings Park, Bhopal, MP'
          ),

          employeeId: String(item.employee_id || item.employeeId || item.user_id || '0'),
          employeeName: String(item.employee_name || item.employeeName || 'Unnamed Employee'),
          position: position,
          accountNumber: String(item.account_number || item.accountNumber || 'N/A'),

          paidDays: Number(item.paid_days || item.paidDays || 22),
          lopDays: Number(item.lop_days || item.lopDays || 0),

          generatedOn: String(
            item.generated_on || item.generatedOn || new Date().toISOString().split('T')[0]
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
            item.authorized_signatory || item.authorizedSignatory || 'Seema Srivastava'
          ),
          signatoryRole: String(item.signatory_role || item.signatoryRole || '(Director)'),
          hrNote: String(
            item.hr_note ||
              item.hrNote ||
              'For any discrepancies, please contact the HR department within 3 working days.'
          ),
        };
      });

      setPayroll(formattedRecords);
    }
  }, [rawData]);

  const generateSalarySlipPdf = async (record: PayrollRecord): Promise<Blob> => {
    setSelectedSlip(record);

    // Wait for state update & off-screen DOM render
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    await new Promise((resolve) => setTimeout(resolve, 250));

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

  const handleCreateSalarySlip = async (data: SalarySlipData) => {
    try {
      // 1. Extract valid User ID
      const targetUserId = Number(
        data.employeeId || (data as any).userId || (data as any).user_id || (data as any).id
      );

      // Guard Clause: Prevent API call if User ID is invalid/missing
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

      // Construct backend payload (including both snake_case and camelCase keys for compatibility)
      const payload = {
        user_id: targetUserId, // 👈 Required by SQL / backend validator
        userId: targetUserId, // 👈 Dual key for ORMs
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

      // Execute mutation
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

  /**
   * DOWNLOAD ACTION (Generates PDF on the fly from database record)
   */
  const downloadSalarySlip = async (record: PayrollRecord) => {
    try {
      message.loading({ content: 'Generating PDF from database record...', key: 'dl' });
      const pdfBlob = await generateSalarySlipPdf(record);
      const url = window.URL.createObjectURL(pdfBlob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `Salary-Slip-${record.employeeName.replace(/\s+/g, '_')}-${record.monthYear}.pdf`;
      anchor.click();
      window.URL.revokeObjectURL(url);
      message.success({ content: 'Salary slip downloaded!', key: 'dl' });
    } catch (err: unknown) {
      console.error('Download error:', err);
      message.error({ content: 'Failed to generate and download salary slip PDF.', key: 'dl' });
    }
  };

  const columns: ColumnsType<PayrollRecord> = [
    {
      title: 'Employee',
      key: 'employee',
      render: (_, record) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <User size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">{record.employeeName}</span>
            <span className="text-[10px] font-bold text-muted uppercase">
              {record.position || 'Employee'}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Base Pay',
      dataIndex: 'base',
      key: 'base',
      render: (val: number) =>
        `₹${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    },
    {
      title: 'Bonus',
      dataIndex: 'bonus',
      key: 'bonus',
      render: (val: number) =>
        `+₹${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    },
    {
      title: 'Total Salary',
      dataIndex: 'total',
      key: 'total',
      render: (val: number) => (
        <span className="font-black text-gray-900">
          ₹{Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Pay Period',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => (
        <div className="flex items-center gap-2 text-xs font-bold text-muted">
          <Calendar size={14} />
          {text}
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
          rowKey="id"
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

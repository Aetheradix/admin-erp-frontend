import { useRef, useState, useEffect } from 'react';

import { Table, Dropdown, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { MoreHorizontal, User, Calendar, Download, Eye, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { PageHeader } from '@/components/ui/composed/PageHeader';
import SalarySlipForm from './components/SalarySlipForm';
import SalarySlipTemplate from './components/SalarySlipTemplate';

import { useGetAllSalarySlipsQuery, useUploadSalarySlipMutation } from '@/store/api/uploadSlice';
import type { SalarySlipItem } from '@/store/api/uploadSlice';
import type { SalarySlipData } from './components/SalarySlipForm';

export interface PayrollRecord extends Partial<SalarySlipData> {
  id: number;
  employeeId: string;
  employeeName: string;
  position: string;
  monthYear: string;
  paidDays: number;
  base: number;
  bonus: number;
  total: number;
  date: string;
  salarySlipUrl?: string;
  earnings: { name: string; amount: number }[];
  deductions: { name: string; amount: number }[];
}

export function PayrollPage() {
  // 1. Query ALL salary slips
  const { data: rawData, isLoading: isFetching, isError } = useGetAllSalarySlipsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [createSalarySlip, { isLoading: isUploadingPdf }] = useUploadSalarySlipMutation();

  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [showSalarySlipForm, setShowSalarySlipForm] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<PayrollRecord | null>(null);
  const [showSlip, setShowSlip] = useState(false);

  const slipRef = useRef<HTMLDivElement>(null);
  
  // Inside src/pages/finance/PayrollPage.tsx

useEffect(() => {
  if (rawData) {
    const itemsList: SalarySlipItem[] = rawData.data || (Array.isArray(rawData) ? rawData : []);
    
    const formattedRecords: PayrollRecord[] = itemsList.map((item) => {
      const rawItem = item as Record<string, any>;

      const basePay = Number(rawItem.base_amount || rawItem.base_pay || 0);
      const bonusPay = Number(rawItem.bonus_amount || rawItem.bonus || 0);
      const netSalary = Number(rawItem.total_amount || rawItem.net_salary || basePay + bonusPay);
      const formattedDate = String(rawItem.month_year || rawItem.created_at || 'N/A');
      const position = String(rawItem.employee_position || rawItem.position || 'Employee');

      return {
        // 1. PayrollRecord specific properties
        id: Number(rawItem.id || Date.now()),
        base: basePay,
        bonus: bonusPay,
        total: netSalary,
        date: formattedDate,
        salarySlipUrl: String(rawItem.salary_slip_url || ''),

        // 2. Inherited SalarySlipData properties
        employeeId: rawItem.user_id ? String(rawItem.user_id) : '0',
        employeeName: String(rawItem.employee_name || 'Unnamed Employee'),
        position: position,
        monthYear: formattedDate,
        paidDays: Number(rawItem.paid_days || 30),

        // Template Header & Details
        paySlipNo: `SLIP-${rawItem.id || Date.now()}`,
        payPeriod: formattedDate,
        companyName: 'Company Name',
        companyAddress: 'Company Address',
        department: 'General',
        bankName: 'N/A',
        accountNo: 'N/A',
        panNo: 'N/A',
        pfNo: 'N/A',
        designation: position,

        // 3. FIX: MISSING PROPERTIES REQUIRED BY YOUR INTERFACE
        accountNumber: 'N/A',
        lopDays: 0,
        generatedOn: new Date().toLocaleDateString(),
        authorizedSignatory: 'Authorized Signatory',
        netPayable: netSalary,
        netPayableInWords: '',

        // Explicitly typed arrays
        earnings: [
          { name: 'Basic Pay', amount: basePay },
          ...(bonusPay > 0 ? [{ name: 'Bonus', amount: bonusPay }] : []),
        ] as { name: string; amount: number }[],

        deductions: [] as { name: string; amount: number }[],
      };
    });

    setPayroll(formattedRecords);
  }
}, [rawData]);
   


  // PDF Generation Logic
  const generateSalarySlipPdf = async (record: PayrollRecord): Promise<Blob> => {
    setSelectedSlip(record);
    setShowSlip(true);

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!slipRef.current) throw new Error('Salary slip template not rendered.');

    const canvas = await html2canvas(slipRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png', 1);
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
      message.loading({ content: 'Generating salary slip...', key: 'salary-pdf' });

      const totalEarnings = data.earnings.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const totalDeductions = data.deductions.reduce((sum, item) => sum + Number(item.amount || 0), 0);

      const base = data.earnings.find((i) => i.name.trim().toLowerCase() === 'basic pay')?.amount || 0;
      const bonus = data.earnings.find((i) => i.name.trim().toLowerCase() === 'bonus')?.amount || 0;
      const netSalary = totalEarnings - totalDeductions;

      const newRecord: PayrollRecord = {
        ...data,
        id: Date.now(),
        base: Number(base),
        bonus: Number(bonus),
        total: Number(netSalary),
        date: data.monthYear,
      };

      const pdfBlob = await generateSalarySlipPdf(newRecord);

      message.loading({ content: 'Uploading to server...', key: 'salary-pdf' });
      await createSalarySlip({
        file: pdfBlob,
        userId: Number(data.employeeId),
        employeeId: Number(data.employeeId),
        employeeName: data.employeeName,
        monthYear: data.monthYear,
        netSalary,
        paidDays: Number(data.paidDays),
      }).unwrap();

      setShowSalarySlipForm(false);
      message.success({ content: 'Salary slip created successfully.', key: 'salary-pdf' });
    } catch (error) {
      console.error(error);
      message.error({ content: 'Failed to create salary slip.', key: 'salary-pdf' });
    }
  };

  const downloadSalarySlip = async (record: PayrollRecord) => {
    try {
      message.loading({ content: 'Downloading...', key: 'dl' });
      const pdfBlob = await generateSalarySlipPdf(record);
      const url = window.URL.createObjectURL(pdfBlob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `Salary-Slip-${record.employeeName}-${record.monthYear}.pdf`;
      anchor.click();
      window.URL.revokeObjectURL(url);
      message.success({ content: 'Downloaded!', key: 'dl' });
    } catch {
      message.error({ content: 'Download failed.', key: 'dl' });
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
            <span className="text-[10px] font-bold text-muted uppercase">{record.position || 'Employee'}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Base Pay',
      dataIndex: 'base',
      key: 'base',
      render: (val: number) => `₹${Number(val || 0).toLocaleString('en-IN')}`,
    },
    {
      title: 'Bonus',
      dataIndex: 'bonus',
      key: 'bonus',
      render: (val: number) => `+₹${Number(val || 0).toLocaleString('en-IN')}`,
    },
    {
      title: 'Total Salary',
      dataIndex: 'total',
      key: 'total',
      render: (val: number) => <span className="font-black">₹{Number(val || 0).toLocaleString('en-IN')}</span>,
    },
    {
      title: 'Pay Date',
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
              { key: 'download', label: 'Download Salary Slip', icon: <Download size={15} /> },
            ],
            onClick: ({ key }) => {
              if (key === 'view') {
                setSelectedSlip(record);
                setShowSlip(true);
              }
              if (key === 'download') downloadSalarySlip(record);
            },
          }}
        >
          <button type="button" className="p-2 rounded-lg hover:bg-surface-subtle">
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
          disabled={isUploadingPdf}
          onClick={() => setShowSalarySlipForm(true)}
          className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50"
        >
          <Plus size={18} />
          {isUploadingPdf ? 'Uploading...' : 'Create Salary Slip'}
        </button>
      </div>

      <motion.div className="bg-white rounded-[40px] border border-border-subtle shadow-soft overflow-hidden">
        <Table
          columns={columns}
          dataSource={payroll}
          loading={isFetching}
          rowKey="id"
          locale={{ emptyText: isError ? 'Error loading records.' : 'No records found.' }}
        />
      </motion.div>

      {showSalarySlipForm && (
        <SalarySlipForm onClose={() => setShowSalarySlipForm(false)} onCreate={handleCreateSalarySlip} />
      )}

      {showSlip && selectedSlip && (
        <div className="fixed inset-0 z-[10000] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[900px] max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-white border-b px-5 py-4 flex justify-between items-center">
              <h2 className="font-bold text-lg">Salary Slip ({selectedSlip.monthYear})</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => downloadSalarySlip(selectedSlip)}
                  className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Download size={16} /> Download
                </button>
                <button type="button" onClick={() => setShowSlip(false)} className="border px-4 py-2 rounded-lg">
                  Close
                </button>
              </div>
            </div>
            <div className="overflow-auto bg-gray-200 p-6">
              <SalarySlipTemplate ref={slipRef} data={selectedSlip} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PayrollPage;
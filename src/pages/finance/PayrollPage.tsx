import { useRef, useState } from 'react';
import { useUploadFileMutation } from '@/store/api/uploadSlice';

import { Table, Dropdown, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { MoreHorizontal, User, Calendar, Download, Eye, Plus } from 'lucide-react';

import { motion } from 'framer-motion';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { PageHeader } from '@/components/ui/composed/PageHeader';

import SalarySlipForm from './components/SalarySlipForm';
import SalarySlipTemplate from './components/SalarySlipTemplate';

import type { SalarySlipData } from './components/SalarySlipForm';

interface PayrollRecord extends SalarySlipData {
  id: number;
  base: number;
  bonus: number;
  total: number;
  date: string;
  salarySlipUrl?: string;
}

export function PayrollPage() {
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);

  const [uploadFile, { isLoading: isUploadingPdf }] = useUploadFileMutation();

  const [showSalarySlipForm, setShowSalarySlipForm] = useState(false);

  const [selectedSlip, setSelectedSlip] = useState<PayrollRecord | null>(null);

  const [showSlip, setShowSlip] = useState(false);

  const slipRef = useRef<HTMLDivElement>(null);

  // =========================================================
  // GENERATE SALARY SLIP PDF
  // =========================================================

  const generateSalarySlipPdf = async (record: PayrollRecord): Promise<Blob> => {
    setSelectedSlip(record);
    setShowSlip(true);

    // Wait for SalarySlipTemplate to render in DOM
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });

    // Small additional delay to ensure fonts/layout/images finish rendering
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!slipRef.current) {
      throw new Error('Salary slip template could not be found.');
    }

    const canvas = await html2canvas(slipRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 15000,
    });

    const imgData = canvas.toDataURL('image/png', 1);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 210;
    const pdfHeight = 297;

    const imageWidth = pdfWidth;
    const imageHeight = (canvas.height * imageWidth) / canvas.width;

    if (imageHeight <= pdfHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, imageWidth, imageHeight);
    } else {
      let remainingHeight = imageHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imageWidth, imageHeight);
      remainingHeight -= pdfHeight;

      while (remainingHeight > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imageWidth, imageHeight);
        remainingHeight -= pdfHeight;
      }
    }

    const blob = pdf.output('blob');

    if (!(blob instanceof Blob)) {
      throw new Error('Generated PDF is not a valid Blob.');
    }

    return blob;
  };

  // =========================================================
  // CREATE SALARY SLIP
  // =========================================================

  const handleCreateSalarySlip = async (data: SalarySlipData) => {
    try {
      message.loading({
        content: 'Generating salary slip...',
        key: 'salary-pdf',
      });

      const totalEarnings = data.earnings.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const totalDeductions = data.deductions.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      );

      const base =
        data.earnings.find((item) => item.name.trim().toLowerCase() === 'basic pay')?.amount || 0;
      const bonus =
        data.earnings.find((item) => item.name.trim().toLowerCase() === 'bonus')?.amount || 0;

      const netSalary = totalEarnings - totalDeductions;

      const newRecord: PayrollRecord = {
        ...data,
        id: Date.now(),
        base: Number(base),
        bonus: Number(bonus),
        total: Number(netSalary),
        date: data.monthYear,
      };

      setSelectedSlip(newRecord);
      setShowSlip(true);

      // Generate PDF in client memory
      const pdfBlob = await generateSalarySlipPdf(newRecord);

      let salarySlipUrl = '';
      let recordId = newRecord.id;

      // Try uploading to cloud (background attempt, non-blocking for downloads)
      try {
        message.loading({
          content: 'Uploading salary slip to cloud...',
          key: 'salary-pdf',
        });

        const uploadResponse = await uploadFile({ file: pdfBlob }).unwrap();
        console.log('Salary slip uploaded:', uploadResponse);

        if (uploadResponse?.data?.salarySlipUrl) {
          salarySlipUrl = uploadResponse.data.salarySlipUrl;
        }
        if (uploadResponse?.data?.id) {
          recordId = uploadResponse.data.id;
        }
      } catch (uploadError) {
        console.warn('Cloud upload failed, keeping client-generated record:', uploadError);
      }

      const savedRecord: PayrollRecord = {
        ...newRecord,
        id: recordId,
        salarySlipUrl,
      };

      setPayroll((previous) => [savedRecord, ...previous]);
      setSelectedSlip(savedRecord);
      setShowSalarySlipForm(false);

      message.success({
        content: 'Salary slip created successfully.',
        key: 'salary-pdf',
      });
    } catch (error) {
      console.error('Salary slip creation failed:', error);

      message.error({
        content: error instanceof Error ? error.message : 'Unable to create salary slip.',
        key: 'salary-pdf',
      });
    }
  };

  // =========================================================
  // DOWNLOAD SALARY SLIP (DIRECT CLIENT-SIDE GENERATION)
  // =========================================================

  const downloadSalarySlip = async (record: PayrollRecord) => {
    try {
      message.loading({
        content: 'Generating and downloading salary slip...',
        key: 'salary-download',
      });

      // Generate PDF directly from template in DOM (no cloud fetch)
      const pdfBlob = await generateSalarySlipPdf(record);

      const url = window.URL.createObjectURL(pdfBlob);

      const employeeName = record.employeeName?.trim().replace(/[^a-zA-Z0-9]/g, '-') || 'Employee';
      const month = record.monthYear?.trim().replace(/[^a-zA-Z0-9]/g, '-') || 'Salary';

      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `Salary-Slip-${employeeName}-${month}.pdf`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(url);

      message.success({
        content: 'Salary slip downloaded successfully.',
        key: 'salary-download',
      });
    } catch (error) {
      console.error('Salary slip download failed:', error);

      message.error({
        content: error instanceof Error ? error.message : 'Unable to download salary slip.',
        key: 'salary-download',
      });
    }
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

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
            <span className="text-sm font-bold text-foreground">
              {record.employeeName || 'Unnamed Employee'}
            </span>
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
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
      render: (value: number) => (
        <span className="text-sm font-medium text-muted">
          ₹{Number(value || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      title: 'Bonus',
      dataIndex: 'bonus',
      key: 'bonus',
      render: (value: number) => (
        <span className="text-sm font-medium text-success">
          +₹{Number(value || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      title: 'Total Salary',
      dataIndex: 'total',
      key: 'total',
      render: (value: number) => (
        <span className="text-sm font-black text-foreground">
          ₹{Number(value || 0).toLocaleString('en-IN')}
        </span>
      ),
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
              {
                key: 'view',
                label: 'View Salary Slip',
                icon: <Eye size={15} />,
              },
              {
                key: 'download',
                label: 'Download Salary Slip',
                icon: <Download size={15} />,
              },
            ],
            onClick: ({ key }) => {
              if (key === 'view') {
                setSelectedSlip(record);
                setShowSlip(true);
              }

              if (key === 'download') {
                downloadSalarySlip(record);
              }
            },
          }}>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-lg hover:bg-surface-subtle text-muted hover:text-foreground transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </Dropdown>
      ),
    },
  ];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <PageHeader
          title="Payroll"
          description="Employee compensation and distribution history."
          breadcrumbs={[
            { label: 'Home', url: '/' },
            { label: 'Finance', url: '/finance' },
            { label: 'Payroll' },
          ]}
        />

        {/* Create Salary Slip button */}
        <div className="flex justify-end -mt-6">
          <button
            type="button"
            disabled={isUploadingPdf}
            onClick={() => setShowSalarySlipForm(true)}
            className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50">
            <Plus size={18} />
            {isUploadingPdf ? 'Uploading...' : 'Create Salary Slip'}
          </button>
        </div>

        {/* Payroll table */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-[40px] border border-border-subtle shadow-soft overflow-hidden">
          <Table
            columns={columns}
            dataSource={payroll}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="premium-table"
            locale={{ emptyText: 'No salary slips created yet.' }}
          />
        </motion.div>
      </div>

      {/* Salary Slip Form */}
      {showSalarySlipForm && (
        <SalarySlipForm
          onClose={() => setShowSalarySlipForm(false)}
          onCreate={handleCreateSalarySlip}
        />
      )}

      {/* Salary Slip Preview */}
      {showSlip && selectedSlip && (
        <div className="fixed inset-0 z-[10000] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[900px] max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg text-gray-900">Salary Slip</h2>
                <p className="text-sm text-gray-500">
                  {selectedSlip.employeeName}
                  {' · '}
                  {selectedSlip.monthYear}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadSalarySlip(selectedSlip)}
                  className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition">
                  <Download size={16} />
                  Download PDF
                </button>

                <button
                  type="button"
                  onClick={() => setShowSlip(false)}
                  className="border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                  Close
                </button>
              </div>
            </div>

            {/* Salary slip view */}
            <div className="overflow-auto bg-gray-200 p-6">
              <SalarySlipTemplate ref={slipRef} data={selectedSlip} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PayrollPage;

import { useRef, useState } from 'react';

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

/* =========================================================
   PAYROLL RECORD
========================================================= */

interface PayrollRecord extends SalarySlipData {
  id: number;

  base: number;
  bonus: number;
  total: number;
  date: string;
}

/* =========================================================
   PAYROLL PAGE
========================================================= */

export function PayrollPage() {
  /* =======================================================
     PAYROLL DATA
  ======================================================= */

  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);

  /* =======================================================
     CREATE MODAL
  ======================================================= */

  const [showSalarySlipForm, setShowSalarySlipForm] = useState(false);

  /* =======================================================
     SELECTED SLIP
  ======================================================= */

  const [selectedSlip, setSelectedSlip] = useState<PayrollRecord | null>(null);

  /* =======================================================
     PREVIEW MODAL
  ======================================================= */

  const [showSlip, setShowSlip] = useState(false);

  /* =======================================================
     TEMPLATE REF
  ======================================================= */

  const slipRef = useRef<HTMLDivElement>(null);

  /* =========================================================
     CREATE SALARY SLIP
  ========================================================= */

  const handleCreateSalarySlip = (data: SalarySlipData) => {
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

    /* -------------------------------------------------------
       ADD RECORD TO TABLE
    ------------------------------------------------------- */

    setPayroll((previous) => [newRecord, ...previous]);

    /* -------------------------------------------------------
       CLOSE CREATE FORM
    ------------------------------------------------------- */

    setShowSalarySlipForm(false);

    /* -------------------------------------------------------
       SELECT NEW SLIP
    ------------------------------------------------------- */

    setSelectedSlip(newRecord);

    /* -------------------------------------------------------
       OPEN PREVIEW
    ------------------------------------------------------- */

    setShowSlip(true);

    message.success('Salary slip created successfully.');
  };

  /* =========================================================
     DOWNLOAD SALARY SLIP
  ========================================================= */

  const downloadSalarySlip = async (record: PayrollRecord) => {
    try {
      message.loading({
        content: 'Preparing salary slip...',
        key: 'salary-pdf',
      });

      // Make sure the correct slip is selected
      setSelectedSlip(record);
      setShowSlip(true);

      // Wait for React to render the modal/template
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
      });

      if (!slipRef.current) {
        message.error({
          content: 'Salary slip template could not be found.',
          key: 'salary-pdf',
        });

        return;
      }

      const element = slipRef.current;

      // Give browser a moment to finish layout/fonts
      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);

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

      /*
       * If the salary slip fits on one A4 page,
       * put it directly on the page.
       */
      if (imageHeight <= pdfHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imageWidth, imageHeight);
      } else {
        /*
         * Handle multiple pages.
         */
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

      const employeeName = record.employeeName?.trim().replace(/[^a-zA-Z0-9]/g, '-') || 'Employee';

      const month = record.monthYear?.trim().replace(/[^a-zA-Z0-9]/g, '-') || 'Salary';

      pdf.save(`Salary-Slip-${employeeName}-${month}.pdf`);

      message.success({
        content: 'Salary slip downloaded successfully.',
        key: 'salary-pdf',
      });
    } catch (error) {
      console.error('Salary slip PDF generation failed:', error);

      message.error({
        content: 'Unable to generate salary slip PDF.',
        key: 'salary-pdf',
      });
    }
  };

  /* =========================================================
     TABLE COLUMNS
  ========================================================= */

  const columns: ColumnsType<PayrollRecord> = [
    /* -------------------------------------------------------
       EMPLOYEE
    ------------------------------------------------------- */

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

    /* -------------------------------------------------------
       BASE PAY
    ------------------------------------------------------- */

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

    /* -------------------------------------------------------
       BONUS
    ------------------------------------------------------- */

    {
      title: 'Bonus',

      dataIndex: 'bonus',

      key: 'bonus',

      render: (value: number) => (
        <span className="text-sm font-medium text-success">
          +₹
          {Number(value || 0).toLocaleString('en-IN')}
        </span>
      ),
    },

    /* -------------------------------------------------------
       TOTAL SALARY
    ------------------------------------------------------- */

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

    /* -------------------------------------------------------
       PAY DATE
    ------------------------------------------------------- */

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

    /* -------------------------------------------------------
       THREE DOT MENU
    ------------------------------------------------------- */

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
              /* VIEW */

              if (key === 'view') {
                setSelectedSlip(record);

                setShowSlip(true);
              }

              /* DOWNLOAD */

              if (key === 'download') {
                downloadSalarySlip(record);
              }
            },
          }}
        >
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-lg hover:bg-surface-subtle text-muted hover:text-foreground transition-colors"
          >
            <MoreHorizontal size={18} />
          </button>
        </Dropdown>
      ),
    },
  ];

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* ===================================================
            HEADER
        =================================================== */}

        <PageHeader
          title="Payroll"
          description="Employee compensation and distribution history."
          breadcrumbs={[
            {
              label: 'Home',
              url: '/',
            },

            {
              label: 'Finance',
              url: '/finance',
            },

            {
              label: 'Payroll',
            },
          ]}
        />

        {/* ===================================================
            ACTION BAR
        =================================================== */}

        <div className="flex justify-end -mt-6">
          <button
            type="button"
            onClick={() => setShowSalarySlipForm(true)}
            className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
          >
            <Plus size={18} />
            Create Salary Slip
          </button>
        </div>

        {/* ===================================================
            PAYROLL TABLE
        =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.98,
          }}

          animate={{
            opacity: 1,
            scale: 1,
          }}

          transition={{
            duration: 0.5,
          }}

          className="bg-white rounded-[40px] border border-border-subtle shadow-soft overflow-hidden"
        >
          <Table
            columns={columns}

            dataSource={payroll}

            rowKey="id"

            pagination={{
              pageSize: 10,
            }}

            className="premium-table"

            locale={{
              emptyText: 'No salary slips created yet.',
            }}
          />
        </motion.div>
      </div>

      {/* =====================================================
          CREATE SALARY SLIP MODAL
      ===================================================== */}

      {showSalarySlipForm && (
        <SalarySlipForm
          onClose={() => setShowSalarySlipForm(false)}

          onCreate={handleCreateSalarySlip}
        />
      )}

      {/* =====================================================
          SALARY SLIP PREVIEW
      ===================================================== */}

      {showSlip && selectedSlip && (
        <div className="fixed inset-0 z-[10000] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[900px] max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* =================================================
                  PREVIEW HEADER
              ================================================= */}

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
                  className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800"
                >
                  <Download size={16} />
                  Download PDF
                </button>

                <button
                  type="button"
                  onClick={() => setShowSlip(false)}
                  className="border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>

            {/* =================================================
                  SALARY SLIP TEMPLATE
              ================================================= */}

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

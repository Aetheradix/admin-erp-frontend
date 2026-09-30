import { useState } from 'react';
import {
  FileText,
  Eye,
  Search,
  Calendar,
  IndianRupee,
  X,
  Printer,
  CheckCircle2,
} from 'lucide-react';

export interface Payslip {
  id: string;
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
  earnings: { name: string; amount: number }[];
  deductions: { name: string; amount: number }[];
  authorizedSignatory: string;
  signatoryRole: string;
  hrNote: string;
}

// Sample payslips data for a logged-in user (Rahul Sharma - X001)
const userPayslips: Payslip[] = [
  {
    id: 'ps-1',
    monthYear: 'JUNE 2026',
    paySlipNo: '0626001',
    payPeriod: '01 June - 30 June',
    companyName: 'AETHERADIX',
    companyAddress: 'F-N 507, Crystal Tower, IBD Kings Park, Bhopal, MP | 462039',
    employeeId: 'X001',
    employeeName: 'Rahul Sharma',
    position: 'Senior Software Engineer',
    accountNumber: '987654321012',
    paidDays: 22,
    lopDays: 0,
    generatedOn: '2026-06-30',
    earnings: [
      { name: 'Basic Pay', amount: 60000 },
      { name: 'HRA', amount: 20000 },
      { name: 'Special Allowance', amount: 15000 },
    ],
    deductions: [
      { name: 'Professional Tax', amount: 200 },
      { name: 'PF Contribution', amount: 1800 },
    ],
    authorizedSignatory: 'Seema Srivastava',
    signatoryRole: '(Director)',
    hrNote: 'For any discrepancies, contact HR within 3 working days.',
  },
  {
    id: 'ps-2',
    monthYear: 'MAY 2026',
    paySlipNo: '0526001',
    payPeriod: '01 May - 31 May',
    companyName: 'AETHERADIX',
    companyAddress: 'F-N 507, Crystal Tower, IBD Kings Park, Bhopal, MP | 462039',
    employeeId: 'X001',
    employeeName: 'Rahul Sharma',
    position: 'Senior Software Engineer',
    accountNumber: '987654321012',
    paidDays: 21,
    lopDays: 1,
    generatedOn: '2026-05-31',
    earnings: [
      { name: 'Basic Pay', amount: 60000 },
      { name: 'HRA', amount: 20000 },
      { name: 'Special Allowance', amount: 15000 },
    ],
    deductions: [
      { name: 'Professional Tax', amount: 200 },
      { name: 'PF Contribution', amount: 1800 },
    ],
    authorizedSignatory: 'Seema Srivastava',
    signatoryRole: '(Director)',
    hrNote: 'For any discrepancies, contact HR within 3 working days.',
  },
  {
    id: 'ps-3',
    monthYear: 'APRIL 2026',
    paySlipNo: '0426001',
    payPeriod: '01 April - 30 April',
    companyName: 'AETHERADIX',
    companyAddress: 'F-N 507, Crystal Tower, IBD Kings Park, Bhopal, MP | 462039',
    employeeId: 'X001',
    employeeName: 'Rahul Sharma',
    position: 'Senior Software Engineer',
    accountNumber: '987654321012',
    paidDays: 22,
    lopDays: 0,
    generatedOn: '2026-04-30',
    earnings: [
      { name: 'Basic Pay', amount: 55000 },
      { name: 'HRA', amount: 18000 },
      { name: 'Special Allowance', amount: 12000 },
    ],
    deductions: [
      { name: 'Professional Tax', amount: 200 },
      { name: 'PF Contribution', amount: 1800 },
    ],
    authorizedSignatory: 'Seema Srivastava',
    signatoryRole: '(Director)',
    hrNote: 'For any discrepancies, contact HR within 3 working days.',
  },
];

export default function MyPaySlipPage() {
  const [search, setSearch] = useState('');
  const [selectedSlip, setSelectedSlip] = useState<Payslip | null>(null);

  // Filter user payslips by month/year or payslip number
  const filteredSlips = userPayslips.filter(
    (slip) =>
      slip.monthYear.toLowerCase().includes(search.toLowerCase()) ||
      slip.paySlipNo.toLowerCase().includes(search.toLowerCase())
  );

  // Total earnings calculated across all available slips
  const totalNetEarnings = userPayslips.reduce((acc, slip) => {
    const gross = slip.earnings.reduce((s, e) => s + e.amount, 0);
    const ded = slip.deductions.reduce((s, d) => s + d.amount, 0);
    return acc + (gross - ded);
  }, 0);

  const currentUser = userPayslips[0];

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header & Employee Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-xl">
            {currentUser.employeeName.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{currentUser.employeeName}</h1>
            <p className="text-sm text-gray-500">
              {currentUser.position} • ID:{' '}
              <span className="font-semibold text-gray-800">{currentUser.employeeId}</span>
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search month or slip no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black transition"
          />
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase">Total Slips</p>
            <p className="text-xl font-bold text-gray-900">{userPayslips.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
            <IndianRupee size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase">Total Received</p>
            <p className="text-xl font-bold text-gray-900">
              ₹{totalNetEarnings.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase">Latest Period</p>
            <p className="text-xl font-bold text-gray-900">{currentUser.monthYear}</p>
          </div>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">My Salary Slips</h2>
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 size={12} /> Direct Deposit Active
          </span>
        </div>

        {filteredSlips.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <FileText size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No payslips found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">Month & Year</th>
                  <th className="px-6 py-3.5">Slip No</th>
                  <th className="px-6 py-3.5">Pay Period</th>
                  <th className="px-6 py-3.5">Net Amount</th>
                  <th className="px-6 py-3.5">Issued On</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSlips.map((slip) => {
                  const gross = slip.earnings.reduce((s, e) => s + e.amount, 0);
                  const ded = slip.deductions.reduce((s, d) => s + d.amount, 0);
                  const net = gross - ded;

                  return (
                    <tr key={slip.id} className="hover:bg-gray-50/70 transition">
                      <td className="px-6 py-4 font-bold text-gray-900">{slip.monthYear}</td>
                      <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                        {slip.paySlipNo}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{slip.payPeriod}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        ₹{net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{slip.generatedOn}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedSlip(slip)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-black hover:text-white transition font-medium text-xs">
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payslip Detail Modal */}
      {selectedSlip && <PayslipModal slip={selectedSlip} onClose={() => setSelectedSlip(null)} />}
    </div>
  );
}

// Modal component for viewing and printing a specific payslip
function PayslipModal({ slip, onClose }: { slip: Payslip; onClose: () => void }) {
  const gross = slip.earnings.reduce((s, e) => s + e.amount, 0);
  const deductions = slip.deductions.reduce((s, d) => s + d.amount, 0);
  const netPay = gross - deductions;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-6 print:shadow-none print:m-0 print:w-full">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 print:hidden">
          <span className="text-sm font-bold text-gray-700">Payslip - {slip.monthYear}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-800 transition">
              <Printer size={14} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 transition">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Payslip Card */}
        <div className="p-8 space-y-6 print:p-0">
          {/* Company Branding */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-5">
            <div>
              <h2 className="text-xl font-bold tracking-wider text-gray-900">{slip.companyName}</h2>
              <p className="text-xs text-gray-500 max-w-sm mt-0.5">{slip.companyAddress}</p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 bg-gray-100 text-gray-800 font-bold text-xs uppercase rounded">
                Payslip
              </span>
              <p className="text-xs font-semibold text-gray-600 mt-1">{slip.monthYear}</p>
            </div>
          </div>

          {/* Key Slip Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded-xl text-xs">
            <div>
              <p className="text-gray-400">Slip No</p>
              <p className="font-semibold text-gray-800">{slip.paySlipNo}</p>
            </div>
            <div>
              <p className="text-gray-400">Pay Period</p>
              <p className="font-semibold text-gray-800">{slip.payPeriod}</p>
            </div>
            <div>
              <p className="text-gray-400">Paid / LOP Days</p>
              <p className="font-semibold text-gray-800">
                {slip.paidDays} / {slip.lopDays}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Generated On</p>
              <p className="font-semibold text-gray-800">{slip.generatedOn}</p>
            </div>
          </div>

          {/* Employee Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-b border-gray-200 pb-5">
            <div>
              <p className="text-gray-400">Employee ID</p>
              <p className="font-bold text-gray-900">{slip.employeeId}</p>
            </div>
            <div>
              <p className="text-gray-400">Employee Name</p>
              <p className="font-bold text-gray-900">{slip.employeeName}</p>
            </div>
            <div>
              <p className="text-gray-400">Designation</p>
              <p className="font-bold text-gray-900">{slip.position}</p>
            </div>
            <div>
              <p className="text-gray-400">Bank Account</p>
              <p className="font-bold text-gray-900">{slip.accountNumber}</p>
            </div>
          </div>

          {/* Earnings & Deductions Breakup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Earnings Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-100 px-3 py-2 font-bold uppercase text-gray-700">
                Earnings
              </div>
              <div className="divide-y divide-gray-100">
                {slip.earnings.map((e, i) => (
                  <div key={i} className="flex justify-between px-3 py-2">
                    <span className="text-gray-600">{e.name}</span>
                    <span className="font-medium text-gray-900">
                      ₹{e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 border-t border-gray-200 px-3 py-2 flex justify-between font-bold">
                <span>Gross Earnings</span>
                <span>₹{gross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Deductions Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-100 px-3 py-2 font-bold uppercase text-gray-700">
                Deductions
              </div>
              <div className="divide-y divide-gray-100">
                {slip.deductions.map((d, i) => (
                  <div key={i} className="flex justify-between px-3 py-2">
                    <span className="text-gray-600">{d.name}</span>
                    <span className="font-medium text-gray-900">
                      ₹{d.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 border-t border-gray-200 px-3 py-2 flex justify-between font-bold">
                <span>Total Deductions</span>
                <span>₹{deductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Net Pay Banner */}
          <div className="bg-black text-white rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="text-xs uppercase text-gray-400 font-semibold">Net Salary Paid</p>
              <p className="text-xl font-bold">
                ₹{netPay.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right text-xs text-gray-400">
              <p>Account: ****{slip.accountNumber.slice(-4)}</p>
              <p className="text-green-400 font-semibold">Status: Credited</p>
            </div>
          </div>

          {/* Footer Note & Signature */}
          <div className="pt-2 flex justify-between items-end text-xs">
            <p className="text-gray-400 max-w-xs">{slip.hrNote}</p>
            <div className="text-center border-t border-gray-300 pt-1 px-4">
              <p className="font-bold text-gray-800">{slip.authorizedSignatory}</p>
              <p className="text-gray-400">{slip.signatoryRole}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
